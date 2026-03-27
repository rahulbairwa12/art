import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;
    
    const reflectionIds = await kv.get(`theme_reflections:${themeId}`) || [];
    
    // Get up to 10 random reflections
    const shuffled = [...reflectionIds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    const reflections = [];
    for (const id of selected) {
      const reflection = await kv.get(`reflection:${id}`);
      if (reflection) {
        // Return anonymous version
        reflections.push({
          content: reflection.content,
          timestamp: reflection.timestamp
        });
      }
    }

    return NextResponse.json({ reflections });
  } catch (error) {
    console.log(`Error fetching archive reflections: ${error}`);
    return NextResponse.json({ error: "Server error while fetching reflections" }, { status: 500 });
  }
}
