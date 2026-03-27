import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function POST(request: Request) {
  try {
    const { userId, themeId, youtubeVideoId, title } = await request.json();
    
    if (!userId || !themeId || !youtubeVideoId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Store in library
    const libraryKey = `library:${userId}:${themeId}`;
    await kv.set(libraryKey, {
      themeId,
      youtubeVideoId,
      title,
      addedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(`Error adding to library: ${error}`);
    return NextResponse.json({ error: "Server error while adding to library" }, { status: 500 });
  }
}
