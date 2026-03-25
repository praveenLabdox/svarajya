import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { Prisma } from '@prisma/client';

const DEFAULT_CASH_WALLET = {
  cashInHand: 0,
  emergencyCash: 0,
  pettyCash: 0,
  updatedAt: '',
};

const DEFAULT_SETTINGS = {
  idleThresholdAmount: 150000,
  emergencyFundTargetMonths: 6,
  lowEmergencyFundAlertMonths: 3,
};

function toMonthlyAmount(amount: number, isRecurring: boolean, frequency?: string | null, date?: Date) {
  if (!isRecurring) {
    if (!date) return 0;
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() ? amount : 0;
  }

  switch ((frequency || 'monthly').toLowerCase()) {
    case 'weekly':
      return amount * 4.33;
    case 'biweekly':
      return amount * 2.17;
    case 'quarterly':
      return amount / 3;
    case 'annual':
    case 'yearly':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

function mapAccount(account: {
  id: string;
  bankName: string;
  accountType: string;
  nickname: string | null;
  accountLast4: string;
  status: string;
  openingBalance: number;
  latestBalance: number;
  latestBalanceAsOf: Date;
  createdAt: Date;
  updatedAt: Date;
  auditTrails: Array<{
    id: string;
    prevBalance: number;
    newBalance: number;
    delta: number;
    asOfDate: Date;
    recordedAt: Date;
    note: string | null;
    source: string;
  }>;
}) {
  return {
    id: account.id,
    bankName: account.bankName,
    accountType: account.accountType,
    nickname: account.nickname || undefined,
    accountLast4: account.accountLast4,
    status: account.status,
    openingBalance: account.openingBalance,
    latestBalance: account.latestBalance,
    latestBalanceAsOf: account.latestBalanceAsOf.toISOString().split('T')[0],
    auditTrail: account.auditTrails.map((trail) => ({
      id: trail.id,
      prevBalance: trail.prevBalance,
      newBalance: trail.newBalance,
      delta: trail.delta,
      asOfDate: trail.asOfDate.toISOString().split('T')[0],
      recordedAt: trail.recordedAt.toISOString(),
      note: trail.note || undefined,
      source: trail.source,
      createdAt: trail.recordedAt.toISOString(),
    })),
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

function buildBankMetrics(
  accounts: Array<{ latestBalance: number; latestBalanceAsOf: string; status: string; accountLast4: string; id: string; bankName: string; nickname?: string; accountType: string }>,
  cashWallet: { cashInHand: number; emergencyCash: number; pettyCash: number },
  settings: { idleThresholdAmount: number; emergencyFundTargetMonths: number; lowEmergencyFundAlertMonths: number },
  incomeEntries: Array<{ amount: number; isRecurring: boolean; frequency: string | null; date: Date }>,
  expenseEntries: Array<{ amount: number; isRecurring: boolean; frequency: string | null; date: Date }>
) {
  const inflow = incomeEntries.reduce((sum, entry) => sum + toMonthlyAmount(entry.amount, entry.isRecurring, entry.frequency, entry.date), 0);
  const outflow = expenseEntries.reduce((sum, entry) => sum + toMonthlyAmount(entry.amount, entry.isRecurring, entry.frequency, entry.date), 0);
  const activeAccounts = accounts.filter((account) => account.status === 'active');
  const activeBankBalance = activeAccounts.reduce((sum, account) => sum + account.latestBalance, 0);
  const totalLiquid = activeBankBalance + cashWallet.cashInHand;
  const emergencyPool = activeBankBalance + cashWallet.emergencyCash;
  const emergencyFundMonths = outflow > 0 ? emergencyPool / outflow : 0;
  const liquidityRatio = outflow > 0 ? totalLiquid / outflow : 0;

  let efStatus: 'critical' | 'low' | 'ok' | 'strong' = 'critical';
  if (emergencyFundMonths >= settings.emergencyFundTargetMonths) efStatus = 'strong';
  else if (emergencyFundMonths >= settings.lowEmergencyFundAlertMonths) efStatus = 'ok';
  else if (emergencyFundMonths >= 1) efStatus = 'low';

  let score = 0;
  score += Math.min(emergencyFundMonths / settings.emergencyFundTargetMonths, 1) * 50;

  const now = Date.now();
  const sixtyDaysAgo = new Date(now - 60 * 86400000);
  const thirtyDaysAgo = new Date(now - 30 * 86400000);

  if (activeAccounts.length > 0) {
    const allUpToDate = activeAccounts.every((account) => new Date(account.latestBalanceAsOf) >= thirtyDaysAgo);
    const someOutdated = activeAccounts.some((account) => new Date(account.latestBalanceAsOf) < sixtyDaysAgo);
    score += allUpToDate ? 20 : someOutdated ? 0 : 10;
  }

  score += cashWallet.emergencyCash > 0 || cashWallet.pettyCash > 0 ? 15 : 0;

  let idleAccounts: Array<typeof activeAccounts[number] & { excessIdle: number }> = [];
  const isEFMet = emergencyFundMonths >= settings.emergencyFundTargetMonths;
  if (isEFMet) {
    idleAccounts = activeAccounts
      .map((account) => ({
        ...account,
        excessIdle: Math.max(0, account.latestBalance - outflow * settings.emergencyFundTargetMonths),
      }))
      .filter((account) => account.excessIdle > settings.idleThresholdAmount);

    score += idleAccounts.length === 0 ? 15 : 0;
  } else {
    score += 15;
  }

  return {
    totalLiquid,
    flow: {
      inflow,
      outflow,
      surplus: inflow - outflow,
    },
    health: {
      emergencyFundMonths,
      liquidityRatio,
      efStatus,
      score: Math.round(score),
      idleAccounts,
      outflowIsZero: outflow === 0,
    },
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authId: user.id }
    });
    if (!profile) return NextResponse.json([]);

    const [accounts, cashWallet, settings, incomeEntries, expenseEntries] = await prisma.$transaction([
      prisma.bankAccount.findMany({
        where: { profileId: profile.id },
        include: {
          auditTrails: {
            orderBy: { asOfDate: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bankCashWallet.findUnique({ where: { profileId: profile.id } }),
      prisma.bankLiquiditySettings.findUnique({ where: { profileId: profile.id } }),
      prisma.incomeEntry.findMany({ where: { profileId: profile.id } }),
      prisma.expenseEntry.findMany({ where: { profileId: profile.id } }),
    ]);

    const mappedAccounts = accounts.map(mapAccount);
    const mappedCashWallet = cashWallet
      ? {
          cashInHand: cashWallet.cashInHand,
          emergencyCash: cashWallet.emergencyCash,
          pettyCash: cashWallet.pettyCash,
          updatedAt: cashWallet.updatedAt.toISOString(),
        }
      : DEFAULT_CASH_WALLET;
    const mappedSettings = settings
      ? {
          idleThresholdAmount: settings.idleThresholdAmount,
          emergencyFundTargetMonths: settings.emergencyFundTargetMonths,
          lowEmergencyFundAlertMonths: settings.lowEmergencyFundAlertMonths,
        }
      : DEFAULT_SETTINGS;

    const metrics = buildBankMetrics(mappedAccounts, mappedCashWallet, mappedSettings, incomeEntries, expenseEntries);

    return NextResponse.json({
      accounts: mappedAccounts,
      cashWallet: mappedCashWallet,
      settings: mappedSettings,
      metrics,
    });
  } catch (error) {
    console.error("GET Bank Error", error);
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // We assume the user profile exists
    const profile = await prisma.userProfile.findUnique({
      where: { authId: user.id }
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

    if (data.entity === 'cashWallet') {
      const savedCashWallet = await prisma.bankCashWallet.upsert({
        where: { profileId: profile.id },
        update: {
          cashInHand: data.cashInHand,
          emergencyCash: data.emergencyCash,
          pettyCash: data.pettyCash,
        },
        create: {
          profileId: profile.id,
          cashInHand: data.cashInHand,
          emergencyCash: data.emergencyCash,
          pettyCash: data.pettyCash,
        },
      });

      return NextResponse.json({
        cashInHand: savedCashWallet.cashInHand,
        emergencyCash: savedCashWallet.emergencyCash,
        pettyCash: savedCashWallet.pettyCash,
        updatedAt: savedCashWallet.updatedAt.toISOString(),
      });
    }

    if (data.entity === 'settings') {
      const savedSettings = await prisma.bankLiquiditySettings.upsert({
        where: { profileId: profile.id },
        update: {
          idleThresholdAmount: data.idleThresholdAmount,
          emergencyFundTargetMonths: data.emergencyFundTargetMonths,
          lowEmergencyFundAlertMonths: data.lowEmergencyFundAlertMonths,
        },
        create: {
          profileId: profile.id,
          idleThresholdAmount: data.idleThresholdAmount,
          emergencyFundTargetMonths: data.emergencyFundTargetMonths,
          lowEmergencyFundAlertMonths: data.lowEmergencyFundAlertMonths,
        },
      });

      return NextResponse.json(savedSettings);
    }

    if (data.id) {
        // Handle Balance Updates
        const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const current = await tx.bankAccount.findUnique({ where: { id: data.id }});
            if (!current) throw new Error("Account not found");
            if (current.profileId !== profile.id) throw new Error("Forbidden");

            const delta = data.latestBalance - current.latestBalance;

            const acct = await tx.bankAccount.update({
                where: { id: data.id },
                data: {
                    latestBalance: data.latestBalance,
                    latestBalanceAsOf: new Date(data.latestBalanceAsOf),
                    status: data.status || current.status
                }
            });

            if (delta !== 0) {
                await tx.balanceAudit.create({
                    data: {
                        accountId: acct.id,
                        prevBalance: current.latestBalance,
                        newBalance: data.latestBalance,
                        delta,
                        asOfDate: new Date(data.latestBalanceAsOf),
                        note: data.auditNote || "Manual update"
                    }
                });
            }

            return acct;
        });

        return NextResponse.json(mapAccount({ ...updated, auditTrails: [] }));

    } else {
        // Prevent duplicate checks
        const existing = await prisma.bankAccount.findFirst({
            where: {
                profileId: profile.id,
                bankName: data.bankName,
                accountType: data.accountType,
                accountLast4: data.accountLast4
            }
        });

        if (existing) {
            return NextResponse.json({ error: "DUPLICATE: Account already exists." }, { status: 409 });
        }

        // Create new
        const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const acct = await tx.bankAccount.create({
                data: {
                    profileId: profile.id,
                    bankName: data.bankName,
                    accountType: data.accountType,
                    nickname: data.nickname,
                    accountLast4: data.accountLast4,
                openingBalance: data.openingBalance,
                    latestBalance: data.latestBalance,
                    latestBalanceAsOf: new Date(data.latestBalanceAsOf),
                status: data.status || 'active',
                }
            });

            await tx.balanceAudit.create({
                data: {
                    accountId: acct.id,
                    prevBalance: data.openingBalance,
                    newBalance: data.latestBalance,
                    delta: data.latestBalance - data.openingBalance,
                    asOfDate: new Date(data.latestBalanceAsOf),
                    note: "Initial Account Setup"
                }
            });

            return acct;
        });

        return NextResponse.json({
          id: created.id,
          bankName: created.bankName,
          accountType: created.accountType,
          nickname: created.nickname || undefined,
          accountLast4: created.accountLast4,
          status: created.status,
          openingBalance: created.openingBalance,
          latestBalance: created.latestBalance,
          latestBalanceAsOf: created.latestBalanceAsOf.toISOString().split('T')[0],
          auditTrail: [],
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        });
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DUPLICATE: Account already exists.") {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("POST Bank Error", error);
    return NextResponse.json({ error: "Failed to save bank account" }, { status: 500 });
  }
}
