import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function POST(request: Request) {
  try {
    const { userId, themeId, rewardTier } = await request.json();
    
    if (!userId || !themeId || !rewardTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Get current redeemed rewards
    const redeemedRewardsKey = `redeemed_rewards:${userId}:${themeId}`;
    const redeemedRewards = await kv.get(redeemedRewardsKey) || [];
    
    // Check if already redeemed
    if (redeemedRewards.includes(rewardTier)) {
      return NextResponse.json({ error: "Reward already redeemed" }, { status: 400 });
    }
    
    // Get user's current token data
    const userTokenData = await kv.get(`user_tokens:${userId}`);
    
    if (!userTokenData) {
      return NextResponse.json({ error: "User token data not found" }, { status: 404 });
    }

    // Check if user has enough tokens
    if (userTokenData.tokens < rewardTier) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 });
    }

    // Deduct tokens
    const remainingTokens = userTokenData.tokens - rewardTier;
    
    // Update user token data
    await kv.set(`user_tokens:${userId}`, {
      ...userTokenData,
      tokens: remainingTokens,
    });
    
    // Add to redeemed rewards
    redeemedRewards.push(rewardTier);
    await kv.set(redeemedRewardsKey, redeemedRewards);
    
    return NextResponse.json({ 
      success: true, 
      redeemedRewards,
      remainingTokens,
      tokensDeducted: rewardTier
    });
  } catch (error) {
    console.log(`Error redeeming reward: ${error}`);
    return NextResponse.json({ error: "Server error while redeeming reward" }, { status: 500 });
  }
}
