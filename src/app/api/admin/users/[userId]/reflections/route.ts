import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;

    // Get user's theme
    const themeId = await kv.get(`user_theme:${userId}`);
    if (!themeId) {
      return NextResponse.json({ reflections: [] });
    }

    // Get user's progress to find reflection IDs
    const userProgress = await kv.get(`user_progress:${userId}:${themeId}`);
    const reflectionRefs: { id: string; type: string; timestamp: string }[] =
      userProgress?.reflections || [];

    if (reflectionRefs.length === 0) {
      return NextResponse.json({ reflections: [] });
    }

    // Fetch each reflection's full data
    const reflections = await Promise.all(
      reflectionRefs.map(async (ref) => {
        const data = await kv.get(`reflection:${ref.id}`);
        if (!data) return null;
        return {
          id: ref.id,
          content: data.content,
          reflectionType: data.reflectionType || ref.type,
          tokens: data.tokens ?? 0,
          timestamp: data.timestamp || ref.timestamp,
          promptId: data.promptId || 'default',
          themeId: data.themeId || themeId,
          revoked: data.revoked || false,
        };
      })
    );

    // Filter nulls and sort newest first
    const sorted = reflections
      .filter(Boolean)
      .sort((a, b) => new Date(b!.timestamp).getTime() - new Date(a!.timestamp).getTime());

    return NextResponse.json({ reflections: sorted, themeId });
  } catch (error: any) {
    console.error('Admin reflections error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
