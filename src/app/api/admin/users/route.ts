import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as kv from '@/lib/kv';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all auth users via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (authError) throw authError;

    const users = authData?.users ?? [];

    // Also pick up dev_ users from KV
    const allKvEntries: { key: string; value: any }[] = await (async () => {
      const { data } = await supabase
        .from('kv_store_0c0022a7')
        .select('key, value')
        .like('key', 'user_theme:%');
      return data ?? [];
    })();

    // Build map of userId -> themeId from KV
    const kvUserThemeMap: Record<string, string> = {};
    for (const entry of allKvEntries) {
      const userId = entry.key.replace('user_theme:', '');
      kvUserThemeMap[userId] = entry.value as string;
    }

    // Collect all unique userIds (auth + kv-only)
    const authUserIds = new Set(users.map((u) => u.id));
    const kvOnlyUserIds = Object.keys(kvUserThemeMap).filter((id) => !authUserIds.has(id));

    // Build combined user list
    const results = [];

    for (const user of users) {
      const themeId = kvUserThemeMap[user.id] || null;
      const tokenData = await kv.get(`user_tokens:${user.id}`);
      const progressData = themeId ? await kv.get(`user_progress:${user.id}:${themeId}`) : null;

      results.push({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || null,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at,
        themeId,
        tokens: tokenData?.tokens ?? 0,
        expiresAt: tokenData?.expiresAt ?? null,
        unlockedRewards: tokenData?.unlockedRewards ?? [],
        reflectionCount: progressData?.reflectionHistory?.length ?? 0,
        isDev: false,
      });
    }

    for (const userId of kvOnlyUserIds) {
      const themeId = kvUserThemeMap[userId];
      const tokenData = await kv.get(`user_tokens:${userId}`);
      const progressData = themeId ? await kv.get(`user_progress:${userId}:${themeId}`) : null;

      results.push({
        id: userId,
        email: userId.startsWith('dev_') ? atob(userId.replace('dev_', '')) : userId,
        name: null,
        createdAt: null,
        lastSignIn: null,
        themeId,
        tokens: tokenData?.tokens ?? 0,
        expiresAt: tokenData?.expiresAt ?? null,
        unlockedRewards: tokenData?.unlockedRewards ?? [],
        reflectionCount: progressData?.reflectionHistory?.length ?? 0,
        isDev: userId.startsWith('dev_'),
      });
    }

    return NextResponse.json({ users: results });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
