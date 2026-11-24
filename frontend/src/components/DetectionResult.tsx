import type { DetectionResult as Result } from '../types';
import { AlertTriangle, CheckCircle2, Clock, Cpu } from 'lucide-react';

export default function DetectionResult({ result }: { result: Result | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-input border border-dashed border-warm-mist bg-parchment py-12 text-center text-sm text-graphite">
        <Cpu className="mb-2 h-7 w-7 text-ash" />
        <p className="font-medium text-ink">Belum Ada Hasil Analisis</p>
        <p className="mt-1 text-xs text-ash">Unggah media di atas untuk memeriksa manipulasi.</p>
      </div>
    );
  }

  const isDeepfake = result.prediction === 'DEEPFAKE';
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink">Hasil Evaluasi Forensik</h2>
        <p className="mt-1 text-xs text-graphite">
          Ringkasan prediksi model dan visualisasi artefak representatif.
        </p>
      </div>

      {/* Main Prediction Banner */}
      <div
        className={`rounded-card border p-5 transition-all shadow-subtle ${
          isDeepfake
            ? 'border-deep-teal/40 bg-deep-teal-light text-deep-teal'
            : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {isDeepfake ? (
              <AlertTriangle className="mt-0.5 h-6 w-6 text-deep-teal" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite">
                Klasifikasi Model
              </p>
              <h3 className="mt-0.5 text-2xl font-bold tracking-tight">
                {result.prediction}
              </h3>
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              isDeepfake
                ? 'border-deep-teal/30 bg-soft-paper text-deep-teal'
                : 'border-emerald-600/30 bg-soft-paper text-emerald-700'
            }`}
          >
            Risiko: {result.risk_level}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-warm-mist/60 pt-3 text-xs text-graphite">
          <span>
            Tingkat Keyakinan (Confidence): <strong className="text-ink">{confidencePercent}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-ash" />
            Durasi Inferensi: <strong className="text-ink">{result.processing_time_ms} ms</strong>
          </span>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="grid grid-cols-2 gap-3">
        {(['ORISINIL', 'DEEPFAKE'] as const).map((label) => {
          const prob = (result.probabilities[label] || 0) * 100;
          const isTargetDeepfake = label === 'DEEPFAKE';
          return (
            <div
              key={label}
              className="rounded-input border border-warm-mist bg-parchment p-3.5 shadow-subtle"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-graphite">{label}</span>
                <span className="font-bold text-ink">{prob.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-warm-mist/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTargetDeepfake ? 'bg-deep-teal' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${prob}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Forensic Card (ELA / Spectrogram) */}
      <div className="overflow-hidden rounded-card border border-warm-mist bg-soft-paper shadow-subtle">
        <div className="border-b border-warm-mist bg-parchment/60 px-4 py-3">
          <p className="text-xs font-semibold text-ink">{result.forensic_visual_label}</p>
          <p className="text-[11px] text-ash">
            Analisis artefak kompresi atau representasi domain frekuensi audio.
          </p>
        </div>
        <div className="flex items-center justify-center bg-parchment p-4">
          <img
            src={result.forensic_visual_base64}
            alt={result.forensic_visual_label}
            className="max-h-80 w-auto rounded border border-warm-mist object-contain shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
