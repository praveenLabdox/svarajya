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

    const docs = await prisma.identityDoc.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET Identity Error", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
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
      // Update existing doc
      const updated = await prisma.identityDoc.update({
        where: { id: data.id },
        data: {
          docNumber: data.docNumber,
          normalizedDocNumber: data.normalizedDocNumber,
          nameOnDoc: data.nameOnDoc,
          dobOnDoc: data.dobOnDoc ? new Date(data.dobOnDoc) : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          issueDate: data.issueDate ? new Date(data.issueDate) : null,
          placeOfIssue: data.placeOfIssue,
          notes: data.notes,
          vaultFileId: data.vaultFileId,
          verificationStatus: data.verificationStatus,
          verifiedDate: data.verifiedDate ? new Date(data.verifiedDate) : null,
          verifiedBy: data.verifiedBy
        }
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await prisma.identityDoc.create({
        data: {
          profileId: profile.id,
          docType: data.docType,
          docNumber: data.docNumber,
          normalizedDocNumber: data.normalizedDocNumber,
          nameOnDoc: data.nameOnDoc,
          notes: data.notes,
          vaultFileId: data.vaultFileId
        }
      });
      return NextResponse.json(created);
    }
  } catch (error: any) {
    console.error("POST Identity Error", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "DUPLICATE: This document already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
