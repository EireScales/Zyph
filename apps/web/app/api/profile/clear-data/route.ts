import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: obsError } = await supabase
      .from('observations')
      .delete()
      .eq('user_id', user.id);
    if (obsError) {
      return NextResponse.json({ error: obsError.message }, { status: 400 });
    }

    const { error: insightsError } = await supabase
      .from('user_profile_insights')
      .delete()
      .eq('user_id', user.id);
    if (insightsError) {
      return NextResponse.json({ error: insightsError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Clear data error:', err);
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
  }
}
