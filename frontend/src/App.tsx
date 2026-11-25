import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import MediaUploader from './components/MediaUploader';
import DetectionResult from './components/DetectionResult';
import SecurityChatbot from './components/SecurityChatbot';
import SimulationPage from './components/SimulationPage';
import ErrorBoundary from './components/ErrorBoundary';
import { detectMedia } from './services/api';
import type { DetectionResult as DetectionResultType, MediaType } from './types';
import { RefreshCw, ArrowLeft, Image as ImageIcon, Mic } from 'lucide-react';

function App() {
  const [page, setPage] = useState<'landing' | 'detection' | 'simulation'>('landing');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);

  const changeMode = (mode: MediaType) => {
    setMediaType(mode);
    setFile(null);
    setResult(null);
    setError('');
    setResetKey((value) => value + 1);
  };

  const onFile = (nextFile: File) => {
    setFile(nextFile);
    setResult(null);
    setError('');
    setResetKey((value) => value + 1);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      setResult(await detectMedia(mediaType, file));
    } catch (caught) {
      const message = caught && typeof caught === 'object' && 'response' in caught
        ? (caught as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : null;
      setError(message || 'Media gagal dianalisis. Pastikan backend aktif dan file valid.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setResetKey((value) => value + 1);
  };

  const handleStartDetection = (type?: MediaType) => {
    if (type) {
      setMediaType(type);
    }
    setPage('detection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSimulation = () => {
    setPage('simulation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-parchment text-ink antialiased">
      <Navbar currentPage={page} onNavigate={(nextPage) => setPage(nextPage)} />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {page === 'landing' && (
          <LandingPage
            onStartDetection={handleStartDetection}
            onStartSimulation={handleStartSimulation}
          />
        )}

        {page === 'simulation' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-mist pb-3 sm:pb-4">
              <button
                type="button"
                onClick={() => setPage('landing')}
                className="flex items-center gap-1.5 text-xs font-semibold text-graphite transition hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </button>
              <span className="text-[11px] text-ash sm:text-xs">Edukasi Pembentukan Skor Keputusan</span>
            </div>
            <SimulationPage />
          </div>
        )}

        {page === 'detection' && (
          <div className="space-y-5 sm:space-y-6">
            {/* Top Workspace Controls: Responsive flex-wrap */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-warm-mist pb-3 sm:pb-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPage('landing')}
                  className="flex items-center gap-1 rounded-btn border border-warm-mist bg-soft-paper px-2.5 py-1.5 text-xs font-semibold text-graphite shadow-subtle transition hover:text-ink sm:px-3"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Beranda
                </button>

                <div className="inline-flex rounded-btn border border-warm-mist bg-soft-paper p-1 shadow-subtle">
                  {(['image', 'audio'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => changeMode(mode)}
                      className={`flex items-center gap-1 rounded-btn px-2.5 py-1 text-xs font-semibold transition sm:gap-1.5 sm:px-4 sm:py-1.5 ${
                        mediaType === mode
                          ? 'bg-deep-teal text-white shadow-sm'
                          : 'text-graphite hover:text-ink hover:bg-parchment'
                      }`}
                    >
                      {mode === 'image' ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <Mic className="h-3.5 w-3.5" />
                      )}
                      {mode === 'image' ? 'Deteksi Gambar' : 'Deteksi Audio'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 rounded-btn border border-warm-mist bg-soft-paper px-2.5 py-1.5 text-xs font-medium text-graphite shadow-subtle transition hover:border-graphite hover:text-ink sm:px-3"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset Form
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-card border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-800 shadow-subtle">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <section className="space-y-6">
                <div className="rounded-card border border-warm-mist bg-soft-paper p-4 shadow-card sm:p-6">
                  <MediaUploader
                    mediaType={mediaType}
                    file={file}
                    onFile={onFile}
                    onAnalyze={analyze}
                    loading={loading}
                  />
                </div>
                <div className="rounded-card border border-warm-mist bg-soft-paper p-4 shadow-card sm:p-6">
                  <DetectionResult result={result} />
                </div>
              </section>

              <aside>
                <div className="lg:sticky lg:top-20">
                  <ErrorBoundary fallbackTitle="Asisten Forensik AI Mengalami Gangguan">
                    <SecurityChatbot result={result} resetKey={resetKey} />
                  </ErrorBoundary>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
