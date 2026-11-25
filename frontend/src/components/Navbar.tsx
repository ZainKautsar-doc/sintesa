import { useEffect, useState } from 'react';
import { ShieldCheck, Home, Sparkles, Sliders } from 'lucide-react';
import { getHealth } from '../services/api';

interface NavbarProps {
  currentPage: 'landing' | 'detection' | 'simulation';
  onNavigate: (page: 'landing' | 'detection' | 'simulation') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-warm-mist bg-soft-paper/95 backdrop-blur shadow-subtle">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20">
            <ShieldCheck className="h-5 w-5 text-deep-teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-base font-bold tracking-tight text-ink">SINTESA</span>
              <span className="rounded-full bg-deep-teal-light px-2 py-0.5 text-[10px] font-semibold text-deep-teal">
                Defensive AI
              </span>
            </div>
            <p className="hidden text-[11px] text-graphite sm:block">
              Identifikasi Rekayasa Suara & Citra
            </p>
          </div>
        </button>

        {/* Central Nav Links */}
        <nav className="flex items-center gap-1 rounded-btn border border-warm-mist bg-parchment p-1 shadow-subtle">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-semibold transition ${
              currentPage === 'landing'
                ? 'bg-deep-teal text-white shadow-sm'
                : 'text-graphite hover:text-ink hover:bg-soft-paper'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('detection')}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-semibold transition ${
              currentPage === 'detection'
                ? 'bg-deep-teal text-white shadow-sm'
                : 'text-graphite hover:text-ink hover:bg-soft-paper'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deteksi Media</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('simulation')}
            className={`flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-semibold transition ${
              currentPage === 'simulation'
                ? 'bg-deep-teal text-white shadow-sm'
                : 'text-graphite hover:text-ink hover:bg-soft-paper'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Simulasi</span>
          </button>
        </nav>

        {/* Health status badge */}
        <div className="flex items-center gap-2 rounded-full border border-warm-mist bg-parchment px-3 py-1 text-xs text-graphite">
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="hidden text-[11px] font-medium text-ink sm:inline">
            {online ? 'Sistem Siap' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
}
