import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as kv from '@/lib/kv';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: list all reflections for a theme with full details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;
    const reflectionIds: string[] = await kv.get(`theme_reflections:${themeId}`) || [];

    const reflections = [];
    for (const id of reflectionIds) {
      const r = await kv.get(`reflection:${id}`);
      if (r) {
        reflections.push({ id, ...r });
      }
    }

    // Sort newest first
    reflections.sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());

    return NextResponse.json({ themeId, reflections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: remove a reflection by id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;
    const { reflectionId } = await request.json();
    if (!reflectionId) return NextResponse.json({ error: 'reflectionId required' }, { status: 400 });

    // Remove from archive list
    const reflectionIds: string[] = await kv.get(`theme_reflections:${themeId}`) || [];
    const updated = reflectionIds.filter(id => id !== reflectionId);
    await kv.set(`theme_reflections:${themeId}`, updated);

    // Delete the reflection data itself
    await kv.del(`reflection:${reflectionId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
