import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function isDatabaseUnavailable(error: unknown) {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'P1001';
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await prisma.userProfile.findUnique({
      where: { authId: user.id },
      include: {
        familyMembers: true
      }
    });
    
    // Fallback: If no profile by Auth UUID, check for a record with the same email
    // This handles users who were created in the DB but not yet linked to Supabase Auth
    if (!profile && user.email) {
      profile = await prisma.userProfile.findUnique({
        where: { email: user.email },
        include: {
          familyMembers: true
        }
      });
      
      // Auto-link the accounts if found
      if (profile && !profile.authId) {
        await prisma.userProfile.update({
          where: { id: profile.id },
          data: { authId: user.id }
        });
        console.log(`[API] Auto-linked existing profile ${profile.id} to authId ${user.id} via email ${user.email}`);
      }
    }

    if (!profile) {
      return NextResponse.json(null);
    }
    return NextResponse.json(profile);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.warn("GET Profile Warning: database temporarily unavailable");
      return NextResponse.json(null);
    }
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
    
    // Check if profile exists by Auth UUID or Email (linker)
    let existing = await prisma.userProfile.findUnique({
      where: { authId: user.id }
    });

    if (!existing && (data.email || user.email)) {
        existing = await prisma.userProfile.findUnique({
            where: { email: data.email || user.email }
        });
    }
    
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
