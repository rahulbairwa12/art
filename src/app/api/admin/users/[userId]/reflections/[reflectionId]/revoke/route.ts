import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string; reflectionId: string }> }
) {
  try {
    const { userId, reflectionId } = await params;

    // Get the reflection data
    const reflection = await kv.get(`reflection:${reflectionId}`);
    if (!reflection) {
      return NextResponse.json({ error: 'Reflection not found' }, { status: 404 });
    }

    // Verify the reflection belongs to this user
    if (reflection.userId !== userId) {
      return NextResponse.json({ error: 'Reflection does not belong to this user' }, { status: 403 });
    }

    // If already revoked, do nothing
    if (reflection.revoked) {
      return NextResponse.json({ success: true, alreadyRevoked: true, tokens: 0 });
    }

    const tokensToDeduct = reflection.tokens ?? 0;

    // Mark reflection as revoked
    await kv.set(`reflection:${reflectionId}`, { ...reflection, revoked: true, tokens: 0 });

    // Deduct tokens from user
    const currentTokenData = await kv.get(`user_tokens:${userId}`) || {
      tokens: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: [],
    };

    const newTokens = Math.max(0, (currentTokenData.tokens ?? 0) - tokensToDeduct);
    await kv.set(`user_tokens:${userId}`, {
      ...currentTokenData,
      tokens: newTokens,
    });

    return NextResponse.json({ success: true, tokensDeducted: tokensToDeduct, newTokenTotal: newTokens });
  } catch (error: any) {
    console.error('Admin revoke reflection tokens error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
