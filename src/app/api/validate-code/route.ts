import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';
import { getCurrentPrompt, getCurrentFollowUpQuestions } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { code: rawCode, userId: incomingUserId } = await request.json();
    
    if (!rawCode) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const input = (rawCode as string).trim();
    
    // Try different case variations to match existing data
    let codeData = await kv.get(`artifact_code:${input}`);
    let code = input;

    if (!codeData) {
      codeData = await kv.get(`artifact_code:${input.toLowerCase()}`);
      code = input.toLowerCase();
    }
    
    if (!codeData) {
      codeData = await kv.get(`artifact_code:${input.toUpperCase()}`);
      code = input.toUpperCase();
    }
    
    if (!codeData) {
      return NextResponse.json({ error: "Invalid artifact code" }, { status: 404 });
    }

    // Check if user already has a theme unlocked
    if (incomingUserId) {
      const existingThemeId = await kv.get(`user_theme:${incomingUserId}`);
      if (existingThemeId) {
        // Fetch existing theme data to return it
        const themeData = await kv.get(`theme:${existingThemeId}`);
        if (themeData) {
          const userTokens = await kv.get(`user_tokens:${incomingUserId}`) || { 
            tokens: 0, 
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            unlockedRewards: []
          };

          return NextResponse.json({
            alreadyUnlocked: true,
            themeId: existingThemeId,
            theme: themeData,
            tokens: userTokens.tokens,
            expiresAt: userTokens.expiresAt,
            unlockedRewards: userTokens.unlockedRewards || []
          });
        }
      }
    }

    // Note: Code usage limits have been removed, multiple users can use the same code.

    // Get theme data
    const themeData = await kv.get(`theme:${codeData.themeId}`);
    
    if (!themeData) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Calculate current prompt based on rotation
    let currentPrompt = themeData.currentPrompt || "";
    if (themeData.prompts && themeData.prompts.length > 0 && themeData.promptStartDate) {
      currentPrompt = getCurrentPrompt(themeData.prompts, themeData.promptStartDate);
    }

    // Get current follow-up questions based on rotation
    let currentFollowUpQuestions = themeData.followUpQuestions?.[0] || {};
    if (themeData.followUpQuestions && themeData.followUpQuestions.length > 0 && themeData.promptStartDate) {
      currentFollowUpQuestions = getCurrentFollowUpQuestions(themeData.followUpQuestions, themeData.promptStartDate);
    }

    // Get reward tiers (use default if not specified)
    const rewardTiers = themeData.rewardTiers || [
      { tokens: 100, discount: 10, code: 'VIBE10' },
      { tokens: 250, discount: 20, code: 'VIBE20' },
      { tokens: 500, discount: 30, code: 'VIBE30' },
      { tokens: 750, discount: 40, code: 'VIBE40' },
      { tokens: 1000, discount: 50, code: 'VIBE50' },
    ];
    
    // Generate or retrieve user ID
    const userId = incomingUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Note: We no longer assign a userId to the code itself, as codes can be used by multiple users.

    // Mark theme as unlocked for this user if they are logged in
    if (incomingUserId) {
      await kv.set(`user_theme:${incomingUserId}`, codeData.themeId);
    }

    // Get user's token data
    const userTokenData = await kv.get(`user_tokens:${userId}`) || { 
      tokens: 0, 
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: []
    };
    
    // Check if tokens have expired
    const now = new Date();
    const expiresAt = new Date(userTokenData.expiresAt);
    
    if (now > expiresAt) {
      // Reset tokens if expired
      userTokenData.tokens = 0;
      userTokenData.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      userTokenData.unlockedRewards = [];
      await kv.set(`user_tokens:${userId}`, userTokenData);
    }

    return NextResponse.json({
      userId,
      themeId: codeData.themeId,
      theme: {
        ...themeData,
        currentPrompt,
        currentFollowUpQuestions,
        rewardTiers
      },
      tokens: userTokenData.tokens,
      expiresAt: userTokenData.expiresAt,
      unlockedRewards: userTokenData.unlockedRewards || [],
      promptStartDate: themeData.promptStartDate
    });
  } catch (error) {
    console.log(`Error validating artifact code: ${error}`);
    return NextResponse.json({ error: "Server error while validating code" }, { status: 500 });
  }
}
