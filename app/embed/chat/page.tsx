'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function EmbedChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    fetch('/api/knowledge-base')
      .then((res) => {
        if (res.status === 401) {
          // For embed, redirect to login in parent window or show message
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'AUTH_REQUIRED' }, '*');
          } else {
            router.push('/login');
          }
        }
      })
      .catch(() => {
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'AUTH_REQUIRED' }, '*');
        } else {
          router.push('/login');
        }
      });
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    } catch (err: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response. Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col" style={{ minHeight: '500px' }}>
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        <div className="flex-1 bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl p-4 mb-3 overflow-y-auto max-h-full min-h-0 border border-white/10">
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-gray-800/50 text-gray-200 border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 text-gray-300 rounded-xl px-3 py-2 text-sm border border-white/10">
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-3 py-2 text-sm bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 text-sm rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

