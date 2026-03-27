import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string, themeId: string }> }
) {
  try {
    const { userId, themeId } = await params;
    
    const userProgressKey = `user_progress:${userId}:${themeId}`;
    const userProgress = await kv.get(userProgressKey) || { reflections: [] };
    
    // Check if user has added this theme's song to their library
    const libraryKey = `library:${userId}:${themeId}`;
    const hasAddedToLibrary = (await kv.get(libraryKey)) !== null;
    
    // Get redeemed rewards
    const redeemedRewardsKey = `redeemed_rewards:${userId}:${themeId}`;
    const redeemedRewards = await kv.get(redeemedRewardsKey) || [];
    
    return NextResponse.json({ ...userProgress, hasAddedToLibrary, redeemedRewards });
  } catch (error) {
    console.log(`Error fetching user progress: ${error}`);
    return NextResponse.json({ error: "Server error while fetching progress" }, { status: 500 });
  }
}
