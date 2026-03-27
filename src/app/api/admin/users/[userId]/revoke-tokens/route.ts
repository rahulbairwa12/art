import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    // Get current token data to preserve expiration
    const currentTokenData = await kv.get(`user_tokens:${userId}`) || {
      tokens: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: [],
    };

    // Revoke: reset tokens and rewards
    await kv.set(`user_tokens:${userId}`, {
      tokens: 0,
      expiresAt: currentTokenData.expiresAt,
      unlockedRewards: [],
    });

    return NextResponse.json({ success: true, tokens: 0 });
  } catch (error: any) {
    console.error('Admin revoke tokens error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
