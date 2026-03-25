import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // Find the profile linked to this authenticated user
    const profile = await prisma.userProfile.findUnique({
      where: { authId: user.id }
    });
    
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const member = await prisma.familyMember.create({
      data: {
        profileId: profile.id,
        name: data.name,
        relationship: data.relationship,
        dob: data.dob ? new Date(data.dob) : null,
        dependent: data.dependent || false,
        nomineeEligible: data.nomineeEligible || false,
        accessRole: data.accessRole || "None"
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("POST Family Error", error);
    return NextResponse.json({ error: "Failed to add family member" }, { status: 500 });
  }
}
