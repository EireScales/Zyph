import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const payload = {
      user_id: user.id,
      messages,
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      const { error } = await supabase
        .from('conversations')
        .update(payload)
        .eq('id', existing.id)
        .eq('user_id', user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, id: existing.id });
    }

    const { data: inserted, error } = await supabase
      .from('conversations')
      .insert({ ...payload, created_at: new Date().toISOString() })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: inserted?.id });
  } catch (err) {
    console.error('Conversations save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
