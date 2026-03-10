import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    console.log('API KEY EXISTS:', !!process.env.ANTHROPIC_API_KEY);

    const { messages, userId } = await req.json();
    console.log('Received messages:', messages?.length, 'userId:', userId);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Fetch insights if userId provided
    let systemPrompt = `You are Zyph, a personal AI assistant that knows the user deeply. Be direct, smart and personal. If you don't have insights yet, be helpful and friendly.`;

    if (userId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: insights } = await supabase
          .from('user_profile_insights')
          .select('*')
          .eq('user_id', userId)
          .limit(20);

        if (insights && insights.length > 0) {
          const insightText = insights
            .map((i) => `${i.insight_type}: ${i.insight_value}`)
            .join('\n');
          systemPrompt = `You are Zyph, a personal AI assistant. You know this user deeply. Here is what you know:\n${insightText}\n\nUse this knowledge naturally. Be direct, smart and personal.`;
        }
      } catch (e) {
        console.log('Could not fetch insights:', e);
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    console.log('Got response from Claude');
    const firstBlock = response.content?.[0];
    const text =
      firstBlock && firstBlock.type === 'text' ? firstBlock.text : '';

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chat API error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
