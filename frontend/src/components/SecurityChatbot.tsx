import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import type { ChatMessage, DetectionResult } from '../types';
import { sendChat } from '../services/api';

interface Props {
  result: DetectionResult | null;
  resetKey: number;
}

export default function SecurityChatbot({ result, resetKey }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
  }, [resetKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!result) return;
    let isMounted = true;
    setMessages([]);
    setLoading(true);
    sendChat(result, [{ role: 'user', content: 'Tolong jelaskan hasil deteksi ini dan apa yang harus saya lakukan.' }])
      .then((response) => {
        if (isMounted) setMessages([{ role: 'assistant', content: response.reply }]);
      })
      .catch(() => {
        if (isMounted) setMessages([{ role: 'assistant', content: 'Ringkasan asisten belum dapat dimuat, tetapi hasil deteksi tetap tersedia.' }]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [result]);

  const submit = async (text = input) => {
    const content = text.trim();
    if (!content || loading) return;
    if (content.length > 500) {
      setMessages((current) => [...current, { role: 'assistant', content: 'Pertanyaan terlalu panjang. Ringkas menjadi maksimal 500 karakter.' }]);
      return;
    }
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const response = await sendChat(result, next);
      setMessages([...next, { role: 'assistant', content: response.reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Tidak dapat menghubungi asisten. Silakan coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = ['Bagaimana cara verifikasi e-KYC aman?', 'Ciri penipuan voice cloning?', 'Kenapa hasil ini bisa keliru?'];

  return (
    <div className="flex h-[460px] sm:h-[540px] lg:h-[calc(100vh-7.5rem)] lg:max-h-[760px] lg:min-h-[560px] flex-col overflow-hidden rounded-card border border-warm-mist bg-soft-paper shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-warm-mist bg-parchment/60 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20">
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-ink">Asisten Forensik AI</p>
            <span className="flex items-center gap-1 rounded-full bg-soft-paper px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-deep-teal border border-warm-mist">
              <Sparkles className="h-3 w-3" /> Penasihat Keamanan
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-graphite">Analisis mitigasi risiko social engineering & e-KYC</p>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto p-3.5 sm:p-5">
        {!messages.length && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center text-graphite py-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-parchment border border-warm-mist mb-2.5">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-ash" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-ink">Siap Menganalisis Konteks</p>
            <p className="mt-1 max-w-xs text-[11px] sm:text-xs text-ash">
              Unggah media atau tanyakan langkah mitigasi penipuan rekayasa media di bawah ini.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-2 sm:gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="mt-0.5 flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-deep-teal-light border border-deep-teal/20 text-deep-teal">
                  <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              )}
              <div
                className={`max-w-[88%] sm:max-w-[85%] rounded-card px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm shadow-subtle ${
                  isUser
                    ? 'bg-deep-teal text-white rounded-br-none'
                    : 'bg-parchment border border-warm-mist text-ink rounded-bl-none'
                }`}
              >
                <div className={`prose prose-sm max-w-none break-words ${isUser ? 'text-white' : 'text-ink'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
              {isUser && (
                <div className="mt-0.5 flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-warm-mist/60 text-graphite">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-graphite">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
            <span>Sedang menyusun rekomendasi mitigasi...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input & Quick Prompts */}
      <div className="border-t border-warm-mist bg-parchment/60 p-3 sm:p-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => submit(prompt)}
              className="rounded-full border border-warm-mist bg-soft-paper px-2.5 py-0.5 text-[10px] sm:px-3 sm:py-1 sm:text-[11px] font-medium text-graphite shadow-subtle transition hover:border-deep-teal hover:text-deep-teal"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <input
            value={input}
            maxLength={500}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder="Tanyakan analisis risiko..."
            className="flex-1 rounded-input border border-warm-mist bg-soft-paper px-3 py-2 text-xs sm:text-sm text-ink placeholder-ash outline-none transition focus:border-deep-teal focus:ring-1 focus:ring-deep-teal shadow-subtle"
          />
          <button
            onClick={() => submit()}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center rounded-btn bg-deep-teal px-3.5 py-2 text-white transition hover:bg-deep-teal-hover disabled:cursor-not-allowed disabled:opacity-40 shadow-subtle sm:px-4 sm:py-2.5"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
