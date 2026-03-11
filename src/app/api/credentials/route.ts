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

    const portals = await prisma.portalCredential.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(portals);
  } catch (error) {
    console.error("GET Portals Error", error);
    return NextResponse.json({ error: "Failed to fetch portals" }, { status: 500 });
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
      const updated = await prisma.portalCredential.update({
        where: { id: data.id, profileId: profile.id },
        data: {
            platformName: data.platformName,
            category: data.category,
            subcategory: data.subcategory,
            websiteUrl: data.websiteUrl,
            appLink: data.appLink,
            loginId: data.loginId,
            registeredMobileId: data.registeredMobileId,
            registeredEmailId: data.registeredEmailId,
            registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
            linkedFamilyMemberId: data.linkedFamilyMemberId,
            passwordStorageMode: data.passwordStorageMode,
            encryptedPassword: data.encryptedPassword,
            twoFAStatus: data.twoFAStatus,
            twoFAType: data.twoFAType,
            notes: data.notes,
            lastReviewedDate: data.lastReviewedDate ? new Date(data.lastReviewedDate) : null,
            bankName: data.bankName,
            linkedBusinessEntity: data.linkedBusinessEntity,
            linkedCA: data.linkedCA,
            nomineeAwareness: data.nomineeAwareness,
            renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
            linkedAutoDebitBank: data.linkedAutoDebitBank
        }
      });
      return NextResponse.json(updated);
    }

    const created = await prisma.portalCredential.create({
      data: {
        profileId: profile.id,
        platformName: data.platformName,
        category: data.category,
        subcategory: data.subcategory,
        websiteUrl: data.websiteUrl,
        appLink: data.appLink,
        loginId: data.loginId,
        registeredMobileId: data.registeredMobileId,
        registeredEmailId: data.registeredEmailId,
        registrationDate: data.registrationDate ? new Date(data.registrationDate) : null,
        linkedFamilyMemberId: data.linkedFamilyMemberId,
        passwordStorageMode: data.passwordStorageMode,
        encryptedPassword: data.encryptedPassword,
        twoFAStatus: data.twoFAStatus,
        twoFAType: data.twoFAType,
        notes: data.notes,
        lastReviewedDate: data.lastReviewedDate ? new Date(data.lastReviewedDate) : null,
        bankName: data.bankName,
        linkedBusinessEntity: data.linkedBusinessEntity,
        linkedCA: data.linkedCA,
        nomineeAwareness: data.nomineeAwareness,
        renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
        linkedAutoDebitBank: data.linkedAutoDebitBank
      }
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("POST Portals Error", error);
    return NextResponse.json({ error: "Failed to process portal credential" }, { status: 500 });
  }
}
