import { useState } from 'react';
import Navbar from './components/Navbar';
import MediaUploader from './components/MediaUploader';
import DetectionResult from './components/DetectionResult';
import SecurityChatbot from './components/SecurityChatbot';
import SimulationPage from './components/SimulationPage';
import { detectMedia } from './services/api';
import type { DetectionResult as DetectionResultType, MediaType } from './types';

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button onClick={() => setPage('detection')} className={`rounded-md px-4 py-2 text-sm ${page === 'detection' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400'}`}>Deteksi Media</button>
            <button onClick={() => setPage('simulation')} className={`rounded-md px-4 py-2 text-sm ${page === 'simulation' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'}`}>Simulasi Probabilitas</button>
          </div>
          {page === 'detection' && <button onClick={reset} className="text-sm text-slate-400 hover:text-slate-100">Reset</button>}
        </div>

        {page === 'simulation' ? (
          <SimulationPage />
        ) : (
          <>
            <div className="mb-4 flex rounded-lg border border-slate-800 bg-slate-900 p-1 w-fit">
              {(['image', 'audio'] as const).map((mode) => (
                <button key={mode} onClick={() => changeMode(mode)} className={`rounded-md px-4 py-2 text-sm ${mediaType === mode ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400'}`}>
                  {mode === 'image' ? 'Deteksi Gambar' : 'Deteksi Audio'}
                </button>
              ))}
            </div>
            {error && <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}
            <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <section className="space-y-5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur"><MediaUploader mediaType={mediaType} file={file} onFile={onFile} onAnalyze={analyze} loading={loading} /></div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur"><DetectionResult result={result} /></div>
              </section>
              <aside><SecurityChatbot result={result} resetKey={resetKey} /></aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
