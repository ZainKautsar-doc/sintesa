import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Send } from 'lucide-react';
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

  useEffect(() => setMessages([]), [resetKey]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading]);

  useEffect(() => {
    if (!result) return;
    setMessages([]);
    setLoading(true);
    sendChat(result, [{ role: 'user', content: 'Tolong jelaskan hasil deteksi ini dan apa yang harus saya lakukan.' }])
      .then((response) => setMessages([{ role: 'assistant', content: response.reply }]))
      .catch(() => setMessages([{ role: 'assistant', content: 'Ringkasan asisten belum dapat dimuat, tetapi hasil deteksi tetap tersedia.' }]))
      .finally(() => setLoading(false));
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
    <div className="flex h-[650px] flex-col rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <Bot className="h-5 w-5 text-emerald-400" />
        <div><p className="text-sm font-semibold">SINTESA Assistant</p><p className="text-xs text-slate-500">Konteks deepfake • maks. 500 karakter/pesan</p></div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!messages.length && !loading && <div className="mt-10 text-center text-sm text-slate-500">Unggah media untuk memulai analisis kontekstual.</div>}
        {messages.map((message, index) => (
          <div key={index} className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto bg-emerald-500/15 text-emerald-100' : 'bg-slate-800/80 text-slate-200'}`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="w-fit rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-400">Memproses...</div>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {prompts.map((prompt) => <button key={prompt} onClick={() => submit(prompt)} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-emerald-500/50 hover:text-emerald-300">{prompt}</button>)}
        </div>
        <div className="flex gap-2">
          <input value={input} maxLength={500} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submit()} placeholder="Tanyakan tentang hasil ini..." className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm outline-none focus:border-emerald-500" />
          <button onClick={() => submit()} className="rounded-lg bg-emerald-500 p-3 text-slate-950"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
