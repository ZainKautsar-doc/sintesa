import { useEffect, useState } from 'react';
import { ShieldCheck, Home, Sparkles, Sliders, Menu, X } from 'lucide-react';
import { getHealth } from '../services/api';

interface NavbarProps {
  currentPage: 'landing' | 'detection' | 'simulation';
  onNavigate: (page: 'landing' | 'detection' | 'simulation') => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [online, setOnline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const handleNav = (page: 'landing' | 'detection' | 'simulation') => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-warm-mist bg-soft-paper/95 backdrop-blur shadow-subtle">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 text-left transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20 sm:h-10 sm:w-10">
            <ShieldCheck className="h-4 w-4 text-deep-teal sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">SINTESA</span>
              <span className="rounded-full bg-deep-teal-light px-2 py-0.5 text-[9px] font-semibold text-deep-teal sm:text-[10px]">
                Defensive AI
              </span>
            </div>
            <p className="hidden text-[11px] text-graphite md:block">
              Identifikasi Rekayasa Suara & Citra
            </p>
          </div>
        </button>

        {/* Desktop Central Nav Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-btn border border-warm-mist bg-parchment p-1 shadow-subtle">
          <button
            type="button"
            onClick={() => handleNav('landing')}
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
            onClick={() => handleNav('detection')}
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
            onClick={() => handleNav('simulation')}
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

        {/* Right Section: Status badge & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-warm-mist bg-parchment px-2.5 py-1 text-xs text-graphite sm:px-3">
            <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-medium text-ink sm:text-[11px]">
              {online ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-btn border border-warm-mist bg-parchment text-graphite hover:text-ink md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-warm-mist bg-soft-paper px-4 py-3 shadow-lg md:hidden">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNav('landing')}
              className={`flex w-full items-center gap-2.5 rounded-btn px-3.5 py-2.5 text-xs font-semibold transition ${
                currentPage === 'landing'
                  ? 'bg-deep-teal text-white'
                  : 'text-graphite hover:bg-parchment hover:text-ink'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('detection')}
              className={`flex w-full items-center gap-2.5 rounded-btn px-3.5 py-2.5 text-xs font-semibold transition ${
                currentPage === 'detection'
                  ? 'bg-deep-teal text-white'
                  : 'text-graphite hover:bg-parchment hover:text-ink'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Deteksi Media</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('simulation')}
              className={`flex w-full items-center gap-2.5 rounded-btn px-3.5 py-2.5 text-xs font-semibold transition ${
                currentPage === 'simulation'
                  ? 'bg-deep-teal text-white'
                  : 'text-graphite hover:bg-parchment hover:text-ink'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Simulasi Probabilitas</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
