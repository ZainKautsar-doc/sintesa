import type { DetectionResult as Result } from '../types';

export default function DetectionResult({ result }: { result: Result | null }) {
  if (!result) return <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-500">Hasil analisis akan tampil di sini.</div>;

  const deepfake = result.prediction === 'DEEPFAKE';
  const accent = deepfake ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-5 ${accent}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Hasil Klasifikasi</p>
            <h2 className="mt-1 text-3xl font-black">{result.prediction}</h2>
          </div>
          <span className="rounded-full border border-current px-3 py-1 text-xs font-bold">{result.risk_level}</span>
        </div>
        <p className="mt-3 text-sm opacity-80">Confidence: {(result.confidence * 100).toFixed(2)}% • {result.processing_time_ms} ms</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(['ORISINIL', 'DEEPFAKE'] as const).map((label) => (
          <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="mb-2 flex justify-between text-xs"><span>{label}</span><span>{((result.probabilities[label] || 0) * 100).toFixed(1)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full ${label === 'DEEPFAKE' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(result.probabilities[label] || 0) * 100}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
        <p className="border-b border-slate-800 px-4 py-3 text-xs font-medium text-slate-400">{result.forensic_visual_label}</p>
        <img src={result.forensic_visual_base64} alt={result.forensic_visual_label} className="max-h-80 w-full object-contain" />
      </div>
    </div>
  );
}
