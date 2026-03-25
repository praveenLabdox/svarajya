import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.familyMember.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Family Error", error);
    return NextResponse.json({ error: "Failed to delete family member" }, { status: 500 });
  }
}
