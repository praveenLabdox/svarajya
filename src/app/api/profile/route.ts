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
      where: { authId: user.id },
      include: {
        familyMembers: true
      }
    });

    if (!profile) {
      return NextResponse.json(null);
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET Profile Error", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
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
    
    // Check if profile exists for this auth user
    const existing = await prisma.userProfile.findUnique({
      where: { authId: user.id }
    });
    
    if (existing) {
      const updated = await prisma.userProfile.update({
        where: { id: existing.id },
        data: {
          fullName: data.fullName,
          dob: data.dob ? new Date(data.dob) : null,
          lifePhase: data.lifePhase,
          maritalStatus: data.maritalStatus,
          occupationType: data.occupationType,
          occupationOther: data.occupationOther,
          email: data.email,
          mobile: data.mobile,
          priority: data.priority,
        }
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.userProfile.create({
        data: {
          authId: user.id, // Link to Supabase Auth UUID
          fullName: data.fullName,
          dob: data.dob ? new Date(data.dob) : null,
          lifePhase: data.lifePhase,
          maritalStatus: data.maritalStatus,
          occupationType: data.occupationType,
          occupationOther: data.occupationOther,
          email: data.email,
          mobile: data.mobile,
          priority: data.priority,
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("POST Profile Error", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
