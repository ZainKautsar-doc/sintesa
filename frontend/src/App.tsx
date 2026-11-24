import { useState } from 'react';
import Navbar from './components/Navbar';
import MediaUploader from './components/MediaUploader';
import DetectionResult from './components/DetectionResult';
import SecurityChatbot from './components/SecurityChatbot';
import SimulationPage from './components/SimulationPage';
import { detectMedia } from './services/api';
import type { DetectionResult as DetectionResultType, MediaType } from './types';
import { RefreshCw, Sparkles, Sliders } from 'lucide-react';

function App() {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DetectionResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [page, setPage] = useState<'detection' | 'simulation'>('detection');

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

  return (
    <div className="min-h-screen bg-parchment text-ink antialiased">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top Navigation Bar / Page Switcher */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-warm-mist pb-4">
          <div className="inline-flex rounded-btn border border-warm-mist bg-soft-paper p-1 shadow-subtle">
            <button
              onClick={() => setPage('detection')}
              className={`flex items-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-all ${
                page === 'detection'
                  ? 'bg-deep-teal text-white shadow-sm'
                  : 'text-graphite hover:text-ink hover:bg-parchment'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Deteksi Media
            </button>
            <button
              onClick={() => setPage('simulation')}
              className={`flex items-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-all ${
                page === 'simulation'
                  ? 'bg-deep-teal text-white shadow-sm'
                  : 'text-graphite hover:text-ink hover:bg-parchment'
              }`}
            >
              <Sliders className="h-4 w-4" />
              Simulasi Probabilitas
            </button>
          </div>

          {page === 'detection' && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-btn border border-warm-mist bg-soft-paper px-3 py-1.5 text-xs font-medium text-graphite shadow-subtle transition hover:border-graphite hover:text-ink"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Form
            </button>
          )}
        </div>

        {page === 'simulation' ? (
          <SimulationPage />
        ) : (
          <>
            {/* Mode Selector for Detection */}
            <div className="mb-6 flex items-center justify-between">
              <div className="inline-flex rounded-btn border border-warm-mist bg-soft-paper p-1 shadow-subtle">
                {(['image', 'audio'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => changeMode(mode)}
                    className={`rounded-btn px-4 py-2 text-sm font-medium transition-all ${
                      mediaType === mode
                        ? 'bg-deep-teal text-white shadow-sm'
                        : 'text-graphite hover:text-ink hover:bg-parchment'
                    }`}
                  >
                    {mode === 'image' ? 'Deteksi Gambar' : 'Deteksi Audio'}
                  </button>
                ))}
              </div>
              <p className="hidden text-xs text-ash sm:block">
                Format didukung: {mediaType === 'image' ? 'JPG, PNG, WEBP' : 'WAV, MP3, WEBM, FLAC'}
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-card border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-subtle">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <section className="space-y-6">
                <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
                  <MediaUploader
                    mediaType={mediaType}
                    file={file}
                    onFile={onFile}
                    onAnalyze={analyze}
                    loading={loading}
                  />
                </div>
                <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
                  <DetectionResult result={result} />
                </div>
              </section>

              <aside>
                <div className="sticky top-6">
                  <SecurityChatbot result={result} resetKey={resetKey} />
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
