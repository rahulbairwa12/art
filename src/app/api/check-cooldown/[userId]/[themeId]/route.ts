import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string, themeId: string }> }
) {
  try {
    const { userId, themeId } = await params;
    
    // Get theme data to check current prompt period
    const themeData = await kv.get(`theme:${themeId}`);
    
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
      const lastSubmissionTime = lastSubmissionDate.getTime();
      const now = Date.now();
      
      // Calculate which 2-week period we're in
      const startDate = themeData?.promptStartDate ? new Date(themeData.promptStartDate).getTime() : now;
      const currentPeriodIndex = Math.floor((now - startDate) / (14 * 24 * 60 * 60 * 1000));
      const lastPeriodIndex = Math.floor((lastSubmissionTime - startDate) / (14 * 24 * 60 * 60 * 1000));
      
      if (currentPeriodIndex === lastPeriodIndex) {
        // Same 2-week period - user is on cooldown
        const periodStartTime = startDate + (currentPeriodIndex * 14 * 24 * 60 * 60 * 1000);
        const nextAvailableDate = new Date(periodStartTime + 14 * 24 * 60 * 60 * 1000);
        
        return NextResponse.json({ 
          isOnCooldown: true,
          nextAvailableDate: nextAvailableDate.toISOString()
        });
      }
    }
    
    // User is not on cooldown
    return NextResponse.json({ 
      isOnCooldown: false,
      nextAvailableDate: null
    });
  } catch (error) {
    console.log(`Error checking cooldown status: ${error}`);
    return NextResponse.json({ error: "Server error while checking cooldown" }, { status: 500 });
  }
}
