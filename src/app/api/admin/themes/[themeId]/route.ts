import { NextResponse } from 'next/server';
import * as kv from '@/lib/kv';
import { THEME_DEFAULTS } from '@/lib/theme-defaults';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;
    const theme = await kv.get(`theme:${themeId}`);
    
    // Merge with hardcoded defaults if missing in KV
    const defaults = THEME_DEFAULTS[themeId] || {};
    const merged = { 
      id: themeId,
      ...defaults,
      ...(theme || {}) 
    };

    return NextResponse.json({ theme: merged });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const { themeId } = await params;
    const { updates } = await request.json();
    const existing = await kv.get(`theme:${themeId}`);
    if (!existing) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    const updated = { ...existing, ...updates };
    await kv.set(`theme:${themeId}`, updated);
    return NextResponse.json({ success: true, theme: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
