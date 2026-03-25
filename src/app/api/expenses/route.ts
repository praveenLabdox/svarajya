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

    const expenses = await prisma.expenseEntry.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
      take: 100 // V1 pagination limits
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET Expense Error", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
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
      const updated = await prisma.expenseEntry.update({
        where: { id: data.id, profileId: profile.id },
        data: {
          amount: data.amount,
          date: new Date(data.date),
          categoryId: data.categoryId,
          paymentMode: data.paymentMode,
          isRecurring: data.isRecurring,
          frequency: data.frequency,
          description: data.description,
          linkedFamilyMemberId: data.linkedFamilyMemberId,
          paidFromAccountId: data.paidFromAccountId
        }
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.expenseEntry.create({
      data: {
        profileId: profile.id,
        amount: data.amount,
        date: new Date(data.date),
        categoryId: data.categoryId,
        paymentMode: data.paymentMode,
        isRecurring: data.isRecurring || false,
        frequency: data.frequency,
        description: data.description,
        linkedFamilyMemberId: data.linkedFamilyMemberId,
        paidFromAccountId: data.paidFromAccountId
      }
    });
    return NextResponse.json(created);
  } catch (error) {
    console.error("POST Expense Error", error);
    return NextResponse.json({ error: "Failed to process expense" }, { status: 500 });
  }
}
