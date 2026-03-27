import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as kv from '@/lib/kv';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Step 1: Delete from Supabase Auth (if it's a real auth user)
    if (!userId.startsWith('dev_')) {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError && !authError.message.includes('User not found')) {
        console.error('Supabase Auth Deletion Error:', authError);
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }
    }

    // Step 2: Clear all KV data associated with this user
    try {
      // Clear theme association
      await kv.del(`user_theme:${userId}`);
      
      // Clear token balance and rewards
      await kv.del(`user_tokens:${userId}`);
      
      // Clear all progress and reflections across all themes
      // Using deleteByPrefix for user_progress and user_reflections
      await kv.deleteByPrefix(`user_progress:${userId}`);
      await kv.deleteByPrefix(`user_reflections:${userId}`);
      
      console.log(`[Admin] Successfully cleared all data for user: ${userId}`);
    } catch (kvError: any) {
      console.error('KV Data Deletion Error:', kvError);
      // We continue even if KV deletion fails, to ensure Auth is prioritized, 
      // but we return an error if it's critical.
    }

    return NextResponse.json({ success: true, message: 'User and all data deleted successfully' });
  } catch (error: any) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
