import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';
import { THEME_DEFAULTS } from '@/lib/theme-defaults';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const themeId = await kv.get(`user_theme:${userId}`);
    
    if (!themeId) {
      return NextResponse.json({ hasTheme: false });
    }

    const themeData = await kv.get(`theme:${themeId}`);
    
    // Merge with hardcoded defaults if missing or incomplete in KV
    const defaults = THEME_DEFAULTS[themeId] || {};
    const mergedTheme = { 
      id: themeId,
      ...defaults,
      ...(themeData || {}) 
    };

    // Get user's token data
    const userTokens = await kv.get(`user_tokens:${userId}`) || { 
      tokens: 0, 
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: []
    };

    return NextResponse.json({
      hasTheme: true,
      themeId,
      theme: mergedTheme,
      tokens: userTokens.tokens,
      expiresAt: userTokens.expiresAt,
      unlockedRewards: userTokens.unlockedRewards || []
    });
  } catch (error) {
    console.error(`Error fetching user theme: ${error}`);
    return NextResponse.json({ error: "Server error while fetching user theme" }, { status: 500 });
  }
}
