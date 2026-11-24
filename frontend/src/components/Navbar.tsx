import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar() {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    getHealth().then(() => setOnline(true)).catch(() => setOnline(false));
  }, []);

  return (
    <header className="border-b border-warm-mist bg-soft-paper shadow-subtle">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20">
            <ShieldCheck className="h-5 w-5 text-deep-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-base font-bold tracking-tight text-ink">SINTESA</h1>
              <span className="rounded-full bg-deep-teal-light px-2 py-0.5 text-[11px] font-medium text-deep-teal">
                Defensive AI
              </span>
            </div>
            <p className="text-[12px] text-graphite">Deepfake Forensics & Social Engineering Defense</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-warm-mist bg-parchment px-3 py-1 text-xs text-graphite">
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="text-[12px] font-medium text-ink">{online ? 'Sistem Aktif' : 'Backend Offline'}</span>
        </div>
      </div>
    </header>
  );
}
