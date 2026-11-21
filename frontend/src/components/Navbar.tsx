import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    getHealth().then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold tracking-[0.2em] text-slate-100">SINTESA</h1>
            <p className="text-xs text-slate-500">Defensive AI • Deepfake Forensics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          {online ? 'Backend terhubung' : 'Backend offline'}
        </div>
      </div>
    </header>
  );
}
