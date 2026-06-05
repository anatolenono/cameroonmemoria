import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/core/infrastructure/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const VALID_ACTIONS = ['suspend', 'ban', 'activate', 'promote_moderator'] as const;
type UserAction = typeof VALID_ACTIONS[number];

// PATCH /api/admin/users/[id]/action - Perform admin action on a user
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent effectuer cette action' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await req.json();
    const action = body.action as UserAction;

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json(
        { error: `Action invalide. Actions possibles : ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Prevent self-action
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas effectuer cette action sur votre propre compte' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Prevent actions on other admins
    if (targetUser.role === 'ADMIN' && action !== 'activate') {
      return NextResponse.json(
        { error: 'Impossible d\'effectuer cette action sur un administrateur' },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};

    switch (action) {
      case 'suspend':
        updateData.status = 'SUSPENDED';
        break;
      case 'ban':
        updateData.status = 'BANNED';
        break;
      case 'activate':
        updateData.status = 'ACTIVE';
        break;
      case 'promote_moderator':
        updateData.role = 'MODERATOR';
        break;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, role: true, status: true },
    });

    return NextResponse.json({
      message: 'Action effectuée avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de l\'action utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
