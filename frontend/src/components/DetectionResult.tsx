import type { DetectionResult as Result } from '../types';
import { AlertTriangle, CheckCircle2, Clock, Cpu } from 'lucide-react';

export default function DetectionResult({ result }: { result: Result | null }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-input border border-dashed border-warm-mist bg-parchment py-8 sm:py-12 text-center text-sm text-graphite">
        <Cpu className="mb-2 h-6 w-6 sm:h-7 sm:w-7 text-ash" />
        <p className="font-medium text-ink text-xs sm:text-sm">Belum Ada Hasil Analisis</p>
        <p className="mt-1 text-[11px] sm:text-xs text-ash">Unggah media di atas untuk memeriksa manipulasi.</p>
      </div>
    );
  }

  const isDeepfake = result.prediction === 'DEEPFAKE';
  const confidencePercent = (result.confidence * 100).toFixed(1);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-ink sm:text-base">Hasil Evaluasi Forensik</h2>
        <p className="mt-0.5 text-[11px] sm:text-xs text-graphite">
          Ringkasan prediksi model dan visualisasi artefak representatif.
        </p>
      </div>

      {/* Main Prediction Banner */}
      <div
        className={`rounded-card border p-4 sm:p-5 transition-all shadow-subtle ${
          isDeepfake
            ? 'border-deep-teal/40 bg-deep-teal-light text-deep-teal'
            : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
        }`}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex items-start gap-2.5 sm:gap-3">
            {isDeepfake ? (
              <AlertTriangle className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 text-deep-teal shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            )}
            <div>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-graphite">
                Klasifikasi Model
              </p>
              <h3 className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight">
                {result.prediction}
              </h3>
            </div>
          </div>
          <span
            className={`w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
              isDeepfake
                ? 'border-deep-teal/30 bg-soft-paper text-deep-teal'
                : 'border-emerald-600/30 bg-soft-paper text-emerald-700'
            }`}
          >
            Risiko: {result.risk_level}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-warm-mist/60 pt-2.5 text-[11px] text-graphite sm:mt-4 sm:gap-4 sm:pt-3 sm:text-xs">
          <span>
            Tingkat Keyakinan: <strong className="text-ink">{confidencePercent}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-ash" />
            Durasi Inferensi: <strong className="text-ink">{result.processing_time_ms} ms</strong>
          </span>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
        {(['ORISINIL', 'DEEPFAKE'] as const).map((label) => {
          const prob = (result.probabilities[label] || 0) * 100;
          const isTargetDeepfake = label === 'DEEPFAKE';
          return (
            <div
              key={label}
              className="rounded-input border border-warm-mist bg-parchment p-3 sm:p-3.5 shadow-subtle"
            >
              <div className="mb-1.5 flex items-center justify-between text-xs">
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
        <div className="border-b border-warm-mist bg-parchment/60 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <p className="text-xs font-semibold text-ink">{result.forensic_visual_label}</p>
          <p className="text-[10px] sm:text-[11px] text-ash">
            Analisis artefak kompresi atau representasi domain frekuensi audio.
          </p>
        </div>
        <div className="flex items-center justify-center bg-parchment p-3 sm:p-4">
          <img
            src={result.forensic_visual_base64}
            alt={result.forensic_visual_label}
            className="max-h-64 sm:max-h-80 w-auto rounded border border-warm-mist object-contain shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
