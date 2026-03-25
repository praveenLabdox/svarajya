import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.userProfile.findUnique({ where: { authId: user.id } });
    if (!profile) return NextResponse.json([]);

    const income = await prisma.incomeEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
      take: 100
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("GET Income Error", error);
    return NextResponse.json({ error: "Failed to fetch income entries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.userProfile.findUnique({ where: { authId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

    const data = await request.json();
    
    if (data.id) {
      const updated = await prisma.incomeEntry.update({
        where: { id: data.id, profileId: profile.id }, // Security enforcement
        data: {
          amount: data.amount,
          date: new Date(data.date),
          source: data.source,
          isRecurring: data.isRecurring,
          frequency: data.frequency,
          creditAccountId: data.creditAccountId,
          description: data.description,
        }
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.incomeEntry.create({
      data: {
        profileId: profile.id, // Enforce tenant isolation
        accountId: data.accountId,
        amount: data.amount,
        date: new Date(data.date),
        source: data.source,
        isRecurring: data.isRecurring || false,
        frequency: data.frequency,
        creditAccountId: data.creditAccountId,
        description: data.description,
      }
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST Income Error", error);
    return NextResponse.json({ error: "Failed to processing income entry" }, { status: 500 });
  }
}
