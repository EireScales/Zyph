'use client';

import { useRef, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTIONS = [
  'Help me write an email',
  'What have you learned about me?',
  'Summarise my week',
];

const supabase = createClient();

export default function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Chat error response:', errorData);
        throw new Error('Chat request failed');
      }

      const text = await response.text();
      console.log('Got response:', text?.slice(0, 100));

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: text,
        },
      ]);
    } catch (error) {
      console.error('Chat fetch error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0008]">
      {/* Chat header */}
      <header
        className="flex h-14 shrink-0 items-center justify-between border-b px-8"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">Zyph</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[0.75rem]" style={{ color: 'rgba(134,239,172,0.7)' }}>
            online
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-[0.78rem] transition"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
          onClick={() => { setMessages([]); setInput(''); }}
        >
          New chat
        </button>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="dashboard-chat-scroll flex-1 overflow-y-auto px-10 py-8"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <h2
                className="text-[2rem] font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Zyph
              </h2>
              <p className="mt-2 text-[0.95rem]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Start a conversation. Zyph already knows you.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="cursor-pointer rounded-full px-4 py-2 text-[0.82rem] transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(232,131,122,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(232,131,122,0.25)';
                      e.currentTarget.style.color = 'rgba(255,190,180,0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                    }}
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, i) => {
            const isUser = message.role === 'user';
            const isStreamingEmpty = isLoading && !isUser && i === messages.length - 1 && message.content === '';
            return (
              <div
                key={i}
                className="flex"
                style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
              >
                <div
                  className="max-w-[65%] px-4 py-3"
                  style={
                    isUser
                      ? {
                          background: 'linear-gradient(135deg, rgba(232,131,122,0.25), rgba(124,58,237,0.2))',
                          border: '1px solid rgba(232,131,122,0.35)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '18px 18px 4px 18px',
                          boxShadow: '0 4px 20px rgba(232,131,122,0.1)',
                          fontSize: '0.92rem',
                          lineHeight: 1.6,
                          color: 'rgba(255,255,255,0.9)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '18px 18px 18px 4px',
                          fontSize: '0.92rem',
                          lineHeight: 1.7,
                          color: 'rgba(255,255,255,0.75)',
                        }
                  }
                >
                  {isStreamingEmpty ? (
                    <span className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e8837a]" style={{ animation: 'dashboard-bounce 0.6s ease-in-out infinite' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e8837a]" style={{ animation: 'dashboard-bounce 0.6s ease-in-out 0.15s infinite' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e8837a]" style={{ animation: 'dashboard-bounce 0.6s ease-in-out 0.3s infinite' }} />
                    </span>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 border-t px-10 pb-5 pt-4"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(30px)',
        }}
      >
        <form
          className="mx-auto max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl border px-5 py-1 transition-all duration-200 focus-within:border-[rgba(232,131,122,0.4)] focus-within:shadow-[0_0_0_3px_rgba(232,131,122,0.1)]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Zyph..."
              disabled={isLoading}
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.92rem] text-white outline-none placeholder:text-white/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 hover:scale-105 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #e8837a, #c9626b)',
                boxShadow: '0 4px 12px rgba(232,131,122,0.4)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[0.72rem] tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Zyph knows you
          </p>
        </form>
      </div>
    </div>
  );
}
