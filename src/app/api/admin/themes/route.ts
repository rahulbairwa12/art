import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as kv from '@/lib/kv';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all theme:* keys from KV
    const { data, error } = await supabase
      .from('kv_store_0c0022a7')
      .select('key, value')
      .like('key', 'theme:%');

    if (error) throw error;

    const themes = (data ?? []).map((entry) => ({
      id: entry.key.replace('theme:', ''),
      ...entry.value,
    }));

    return NextResponse.json({ themes });
  } catch (error: any) {
    console.error('Admin themes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { themeId, updates } = await request.json();
    if (!themeId) return NextResponse.json({ error: 'themeId required' }, { status: 400 });

    const existing = await kv.get(`theme:${themeId}`);
    if (!existing) return NextResponse.json({ error: 'Theme not found' }, { status: 404 });

    const updated = { ...existing, ...updates };
    await kv.set(`theme:${themeId}`, updated);

    return NextResponse.json({ success: true, theme: updated });
  } catch (error: any) {
    console.error('Admin theme update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
