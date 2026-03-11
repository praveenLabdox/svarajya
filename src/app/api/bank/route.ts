import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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

    const accounts = await prisma.bankAccount.findMany({
      where: { profileId: profile.id, status: 'active' },
      include: {
        auditTrails: {
          orderBy: { asOfDate: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(accounts);
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

    if (data.id) {
        // Handle Balance Updates
        const updated = await prisma.$transaction(async (tx: any) => {
            const current = await tx.bankAccount.findUnique({ where: { id: data.id }});
            if (!current) throw new Error("Account not found");

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

        return NextResponse.json(updated);

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
        const created = await prisma.$transaction(async (tx: any) => {
            const acct = await tx.bankAccount.create({
                data: {
                    profileId: profile.id,
                    bankName: data.bankName,
                    accountType: data.accountType,
                    nickname: data.nickname,
                    accountLast4: data.accountLast4,
                    openingBalance: data.latestBalance,
                    latestBalance: data.latestBalance,
                    latestBalanceAsOf: new Date(data.latestBalanceAsOf),
                }
            });

            await tx.balanceAudit.create({
                data: {
                    accountId: acct.id,
                    prevBalance: 0,
                    newBalance: data.latestBalance,
                    delta: data.latestBalance,
                    asOfDate: new Date(data.latestBalanceAsOf),
                    note: "Initial Account Setup"
                }
            });

            return acct;
        });

        return NextResponse.json(created);
    }
  } catch (error: any) {
    if (error.message === "DUPLICATE: Account already exists.") {
        return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("POST Bank Error", error);
    return NextResponse.json({ error: "Failed to save bank account" }, { status: 500 });
  }
}
