import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a personal AI analyst. Your job is to analyse raw screen text captured from a user's computer and extract meaningful insights.

From the text provided, extract:
- A 1-2 sentence summary of what the user was doing
- The category (one of: work, communication, entertainment, learning, shopping, social, other)
- Any notable interests, habits or communication patterns you observe
- Confidence score 0-1 for your analysis

Respond only in JSON:
{
  "summary": string,
  "category": string,
  "insights": [{ "type": string, "value": string, "confidence": number }]
}`;

type ClaudeInsight = { type: string; value: string; confidence: number };
type ClaudeResponse = {
  summary: string;
  category: string;
  insights: ClaudeInsight[];
};

function parseClaudeJson(text: string): ClaudeResponse | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as ClaudeResponse;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    if (!anthropicKey) {
      return NextResponse.json({ error: 'Claude API not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const rawText =
      typeof body?.raw_text === 'string'
        ? body.raw_text
        : typeof body?.rawText === 'string'
          ? body.rawText
          : '';
    const appName =
      typeof body?.app_name === 'string'
        ? body.app_name
        : typeof body?.appName === 'string'
          ? body.appName
          : null;
    const capturedAt =
      typeof body?.captured_at === 'string' ? body.captured_at : new Date().toISOString();

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: rawText || '(No text captured)',
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const responseText = textBlock && 'text' in textBlock ? textBlock.text : '';
    const analysis = parseClaudeJson(responseText);

    const summary = analysis?.summary ?? '';
    const category = analysis?.category ?? 'other';
    const insights = Array.isArray(analysis?.insights) ? analysis.insights : [];

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: insertError } = await admin.from('observations').insert({
      user_id: user.id,
      captured_at: capturedAt,
      screen_summary: summary || null,
      app_name: appName,
      category: category || null,
      raw_text: rawText || null,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    for (const insight of insights) {
      const type = typeof insight.type === 'string' ? insight.type : 'unknown';
      const value = typeof insight.value === 'string' ? insight.value : String(insight.value);
      const confidence = typeof insight.confidence === 'number' ? insight.confidence : 0.5;
      await admin.from('user_profile_insights').upsert(
        {
          user_id: user.id,
          insight_type: type,
          insight_value: value,
          confidence_score: confidence,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,insight_type',
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Analyse error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
