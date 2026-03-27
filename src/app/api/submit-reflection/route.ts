import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';
import { validateReflectionQuality, getCurrentPrompt } from '@/lib/utils';
import { verifyReflectionWithAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { userId, themeId, content, promptId, reflectionType } = await request.json();
    
    if (!userId || !themeId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get theme data once
    const themeData = await kv.get(`theme:${themeId}`);

    // Check if user is trying to submit a main reflection
    if (reflectionType === 'main' || !reflectionType || reflectionType === 'primary') {
      // Get user's last main reflection submission for this theme
      const userProgressKey = `user_progress:${userId}:${themeId}`;
      const userProgress = await kv.get(userProgressKey) || { reflections: [] };
      
      // Find the most recent main reflection
      const mainReflections = userProgress.reflections.filter((r: any) => 
        r.type === 'main' || r.type === 'primary'
      );
      
      if (mainReflections.length > 0) {
        const lastMainReflection = mainReflections[mainReflections.length - 1];
        const lastSubmissionDate = new Date(lastMainReflection.timestamp);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        
        if (lastSubmissionDate > twoWeeksAgo) {
          // User submitted within the last 2 weeks - check if it's the same prompt period
          const lastSubmissionTime = lastSubmissionDate.getTime();
          const now = Date.now();
          
          // Calculate which 2-week period we're in
          const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
          const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
          const lastPeriodIndex = Math.floor((lastSubmissionTime - startDate) / (14 * 24 * 60 * 60 * 1000));
          
          if (currentPeriodIndex === lastPeriodIndex) {
            // Same 2-week period - reject
            const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
            const nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000);
            return NextResponse.json({ 
              error: "Already submitted reflection for this period",
              nextAvailableDate: nextAvailableDate.toISOString(),
              isOnCooldown: true
            }, { status: 429 });
          }
        }
      }
    }

    // Validate reflection quality
    const validationResult = validateReflectionQuality(content);
    if (!validationResult.isValid) {
      return NextResponse.json({ 
        error: validationResult.reason,
        isQualityIssue: true 
      }, { status: 400 });
    }

    // Gemini AI verification
    // Get current prompt for verification
    let currentPrompt = "";
    
    if (reflectionType === 'main' || !reflectionType || reflectionType === 'primary') {
      currentPrompt = getCurrentPrompt(themeData?.prompts || [], themeData?.promptStartDate || new Date().toISOString());
    } else {
      // For follow-ups or other types, we might want to get the specific prompt if provided, 
      // or just use the current main prompt as context.
      // If promptId is provided and it's not 'default', we could try to look it up, 
      // but for now let's use the current main prompt or the theme title.
      currentPrompt = themeData?.title || "Reflection";
    }

    const aiValidationResult = await verifyReflectionWithAI(currentPrompt, content);
    if (!aiValidationResult.isValid) {
      return NextResponse.json({ 
        error: aiValidationResult.reason,
        isAIQualityIssue: true 
      }, { status: 400 });
    }

    // Calculate tokens based on content length and reflection type
    const wordCount = content.trim().split(/\s+/).length;
    let tokensEarned = 0;
    
    // Base tokens by word count
    if (wordCount >= 100) {
      tokensEarned = 150;
    } else if (wordCount >= 50) {
      tokensEarned = 100;
    } else if (wordCount >= 20) {
      tokensEarned = 50;
    }
    
    // Bonus tokens based on reflection type
    if (reflectionType === 'follow-up') {
      tokensEarned = Math.max(tokensEarned, 100);
    } else if (reflectionType === 'deeper') {
      tokensEarned = Math.max(tokensEarned, 150);
    } else if (reflectionType === 'archive-response') {
      tokensEarned = Math.max(tokensEarned, 120);
    } else if (reflectionType === 'perspective') {
      tokensEarned = Math.max(tokensEarned, 80);
    } else if (reflectionType === 'time-shift') {
      tokensEarned = Math.max(tokensEarned, 150);
    }

    // Create reflection
    const reflectionId = `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reflection = {
      userId,
      themeId,
      content,
      promptId: promptId || 'default',
      reflectionType: reflectionType || 'primary',
      tokens: tokensEarned,
      timestamp: new Date().toISOString()
    };

    await kv.set(`reflection:${reflectionId}`, reflection);

    // Add to theme reflections
    const themeReflections = await kv.get(`theme_reflections:${themeId}`) || [];
    themeReflections.push(reflectionId);
    await kv.set(`theme_reflections:${themeId}`, themeReflections);
    
    // Track user's reflection progress for this theme
    const userProgressKey = `user_progress:${userId}:${themeId}`;
    const userProgress = await kv.get(userProgressKey) || { reflections: [] };
    userProgress.reflections.push({
      id: reflectionId,
      type: reflectionType || 'primary',
      timestamp: new Date().toISOString()
    });
    await kv.set(userProgressKey, userProgress);

    // Update user tokens
    const currentTokenData = await kv.get(`user_tokens:${userId}`) || {
      tokens: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unlockedRewards: []
    };
    
    const newTokens = currentTokenData.tokens + tokensEarned;
    
    // Extend expiration date on new activity
    const newExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get theme reward tiers for checking unlocked rewards
    const rewardTiers = themeData?.rewardTiers || [
      { tokens: 100, discount: 10, code: 'VIBE10' },
      { tokens: 250, discount: 20, code: 'VIBE20' },
      { tokens: 500, discount: 30, code: 'VIBE30' },
      { tokens: 750, discount: 40, code: 'VIBE40' },
      { tokens: 1000, discount: 50, code: 'VIBE50' },
    ];
    
    // Check for newly unlocked rewards
    const previousRewards = currentTokenData.unlockedRewards || [];
    const newlyUnlocked = [];
    
    for (const tier of rewardTiers) {
      if (newTokens >= tier.tokens && !previousRewards.includes(tier.tokens)) {
        newlyUnlocked.push(tier.tokens);
        previousRewards.push(tier.tokens);
      }
    }
    
    await kv.set(`user_tokens:${userId}`, {
      tokens: newTokens,
      expiresAt: newExpiresAt,
      unlockedRewards: previousRewards
    });

    // Calculate next available date for main reflections
    let nextAvailableDate = null;
    if (reflectionType === 'main' || reflectionType === 'primary') {
      const now = Date.now();
      const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
      const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
      const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
      nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000).toISOString();
    }

    return NextResponse.json({
      success: true,
      tokensEarned,
      totalTokens: newTokens,
      reflectionId,
      expiresAt: newExpiresAt,
      newlyUnlockedRewards: newlyUnlocked,
      nextAvailableDate
    });
  } catch (error) {
    console.log(`Error submitting reflection: ${error}`);
    return NextResponse.json({ error: "Server error while submitting reflection" }, { status: 500 });
  }
}
