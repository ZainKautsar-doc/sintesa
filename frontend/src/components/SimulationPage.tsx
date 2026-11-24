import { useState } from 'react';
import { BarChart3, BookOpen, BrainCircuit, Image, Info, RotateCcw, Volume2, HelpCircle } from 'lucide-react';

const cases = [
  { label: 'Prediksi kuat', deepfake: 92, description: 'Nilai Deepfake jauh lebih tinggi daripada Orisinil. Model cukup yakin, tetapi hasil tetap perlu diverifikasi.' },
  { label: 'Prediksi sedang', deepfake: 68, description: 'Salah satu probabilitas lebih dominan, tetapi selisihnya belum sepenuhnya meyakinkan.' },
  { label: 'Prediksi tidak pasti', deepfake: 51, description: 'Nilai hampir seimbang sehingga hasil sangat dekat dengan batas 50/50 dan sebaiknya ditinjau ulang.' },
  { label: 'Orisinil kuat', deepfake: 12, description: 'Probabilitas Orisinil 88%, sehingga model condong menyebut media orisinil.' },
];

export default function SimulationPage() {
  const [deepfake, setDeepfake] = useState(51);
  const original = 100 - deepfake;
  const winner = deepfake >= original ? 'DEEPFAKE' : 'ORISINIL';
  const confidence = Math.max(deepfake, original);
  const certainty = confidence >= 80 ? 'Sangat kuat' : confidence >= 60 ? 'Cukup kuat' : 'Hampir seimbang';

  return (
    <div className="space-y-6">
      {/* Simulation Workspace Card */}
      <section className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card md:p-8">
        <div className="mb-6 flex items-start gap-3 border-b border-warm-mist pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-deep-teal-light px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-deep-teal">
                Mode Pembelajaran Interaktif
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-ink">Simulasi Probabilitas Keputusan Deepfake</h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-graphite">
              Geser nilai untuk mempelajari bagaimana model membandingkan probabilitas dua kemungkinan. Model selalu mengklasifikasikan kelas dengan probabilitas tertinggi.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Slider input */}
          <div className="rounded-card border border-warm-mist bg-parchment p-6 shadow-subtle">
            <div className="mb-4 flex items-center justify-between">
              <label htmlFor="deepfake" className="text-sm font-semibold text-ink">
                Probabilitas Deepfake
              </label>
              <button
                type="button"
                onClick={() => setDeepfake(50)}
                className="flex items-center gap-1 rounded-btn border border-warm-mist bg-soft-paper px-2.5 py-1 text-xs font-medium text-graphite shadow-subtle transition hover:border-graphite hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset 50/50
              </button>
            </div>

            <div className="my-6">
              <input
                id="deepfake"
                type="range"
                min="0"
                max="100"
                value={deepfake}
                onChange={(event) => setDeepfake(Number(event.target.value))}
                className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-warm-mist accent-deep-teal"
              />
              <div className="mt-2 flex justify-between text-[11px] text-ash">
                <span>0% (Pasti Orisinil)</span>
                <span>50% (Ambang Batas)</span>
                <span>100% (Pasti Deepfake)</span>
              </div>
            </div>

            <div className="space-y-4">
              <ProbabilityBar label="DEEPFAKE" value={deepfake} isDeepfake={true} />
              <ProbabilityBar label="ORISINIL" value={original} isDeepfake={false} />
            </div>
          </div>

          {/* Outcome card */}
          <div className="flex flex-col justify-between rounded-card border border-warm-mist bg-parchment p-6 shadow-subtle">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite">
                Keputusan Klasifikasi Model
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p
                  className={`text-3xl font-extrabold tracking-tight ${
                    winner === 'DEEPFAKE' ? 'text-deep-teal' : 'text-emerald-600'
                  }`}
                >
                  {winner}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    winner === 'DEEPFAKE'
                      ? 'border border-deep-teal/30 bg-deep-teal-light text-deep-teal'
                      : 'border border-emerald-500/30 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Keyakinan: {certainty}
                </span>
              </div>
              <p className="mt-3 text-xs text-graphite">
                Confidence Score:{' '}
                <strong className="text-base font-bold text-ink">{confidence}%</strong>
              </p>
            </div>

            <div className="mt-6 rounded-input border border-warm-mist bg-soft-paper p-4 shadow-subtle">
              <div className="flex items-start gap-2">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                <div>
                  <p className="text-xs font-semibold text-ink">Catatan Forensik:</p>
                  <p className="mt-1 text-xs leading-5 text-graphite">
                    {deepfake === 50
                      ? 'Kedua kelas tepat seimbang (50/50). Keputusan berada di batas ambang dan wajib diverifikasi manual.'
                      : `Model menentukan ${winner} karena nilainya ${confidence}%, melebihi ambang 50%. Tingkat kepastian digolongkan "${certainty}".`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Concept Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <InfoCard
          icon={<BrainCircuit className="h-5 w-5" />}
          title="1. Media Diproses"
          text="Gambar diekstraksi fitur visualnya (tekstur, tepi, artefak kompresi). Audio dinormalisasi dan diubah ke spectrogram untuk memeriksa pola vokal dan spektral sintetis."
        />
        <InfoCard
          icon={<BarChart3 className="h-5 w-5" />}
          title="2. Model Menghitung Skor"
          text="Setelah representasi ciri diekstraksi, neural network menghitung distribusi probabilitas antara dua kelas (DEEPFAKE & ORISINIL) dengan total kumulatif 100%."
        />
        <InfoCard
          icon={<Info className="h-5 w-5" />}
          title="3. Label Ditentukan"
          text="Nilai tertinggi menentukan hasil akhir. Nilai yang mendekati 50/50 menunjukkan ambiguitas data dan memerlukan konfirmasi melalui saluran independen."
        />
      </section>

      {/* Case Studies & Details */}
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal">
              <Image className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Pipeline Evaluasi Gambar</h3>
              <p className="text-[11px] text-graphite">Visual Vision Transformer & ELA</p>
            </div>
          </div>
          <div className="space-y-3 text-xs leading-5 text-graphite">
            <p>
              <strong className="text-ink">Alur Proses:</strong> Resize citra → Normalisasi piksel → Ekstraksi representasi latent → Perhitungan logit → Softmax probabilitas.
            </p>
            <p>
              Error Level Analysis (ELA) membantu mendeteksi ketidakseragaman rasio kompresi JPEG pada bagian wajah atau area yang dimodifikasi.
            </p>
            <div className="rounded-input border border-warm-mist bg-parchment p-3 text-[11px] text-graphite">
              💡 <span className="font-medium text-ink">Contoh Kasus:</span> 72% Orisinil vs 28% Deepfake berarti model tidak menemukan anomali kompresi signifikan.
            </div>
          </div>
        </article>

        <article className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Pipeline Evaluasi Audio</h3>
              <p className="text-[11px] text-graphite">Wav2Vec2 / Acoustic Architecture</p>
            </div>
          </div>
          <div className="space-y-3 text-xs leading-5 text-graphite">
            <p>
              <strong className="text-ink">Alur Proses:</strong> Resample ke 16 kHz → Ekstraksi frame waveform → Konversi log-mel spectrogram → Deteksi ketidakteraturan sinyal vokal.
            </p>
            <p>
              Voice cloning AI sering kali meninggalkan jejak frekuensi tinggi yang datar atau transisi fonem yang tidak natural.
            </p>
            <div className="rounded-input border border-warm-mist bg-parchment p-3 text-[11px] text-graphite">
              💡 <span className="font-medium text-ink">Contoh Kasus:</span> 85% Deepfake menandakan adanya diskontinuitas fase atau spektrum sintetis khas model TTS/SVC.
            </div>
          </div>
        </article>
      </section>

      {/* Preset Scenarios */}
      <section className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-ink">Skenario Latihan Probabilitas</h3>
        <p className="mb-4 text-xs text-graphite">Pilih salah satu kondisi di bawah untuk melihat interpretasi langsung:</p>
        <div className="grid gap-3 md:grid-cols-2">
          {cases.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setDeepfake(item.deepfake)}
              className="rounded-input border border-warm-mist bg-parchment p-4 text-left transition hover:border-deep-teal hover:bg-soft-paper shadow-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">{item.label}</span>
                <span className="rounded-full bg-soft-paper border border-warm-mist px-2 py-0.5 text-[11px] font-semibold text-deep-teal">
                  Deepfake: {item.deepfake}% / Orisinil: {100 - item.deepfake}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-graphite">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Summary Terms & Guidelines */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
          <h3 className="text-sm font-bold text-ink">Glosarium Metrik</h3>
          <dl className="mt-3 space-y-3 text-xs">
            <Term term="Probabilitas" text="Nilai estimasi peluang dari setiap kelas (0 - 100%) yang dihasilkan fungsi Softmax." />
            <Term term="Confidence" text="Nilai probabilitas kelas pemenang yang dijadikan tolok ukur keyakinan model." />
            <Term term="Margin 50/50" text="Kondisi ambiguitas di mana model tidak memiliki bukti konklusif untuk satu kelas." />
          </dl>
        </div>

        <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
          <h3 className="text-sm font-bold text-ink">Prinsip Keamanan Informasi</h3>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-5 text-graphite">
            <li>Hasil deteksi AI merupakan indikator awal, bukan bukti legalitas mutlak.</li>
            <li>Hasil dengan confidence rendah (&lt; 70%) wajib diverifikasi melalui jalur komunikasi alternatif.</li>
            <li>Jangan mengunggah data identitas (KTP/Paspor) tanpa enkripsi atau izin yang sah.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function ProbabilityBar({ label, value, isDeepfake }: { label: string; value: number; isDeepfake: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-semibold text-graphite">{label}</span>
        <strong className="text-ink">{value}%</strong>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-warm-mist/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isDeepfake ? 'bg-deep-teal' : 'bg-emerald-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
      <div className="mb-3 flex items-center gap-2.5 text-deep-teal">
        <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-deep-teal-light border border-deep-teal/20">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <p className="text-xs leading-5 text-graphite">{text}</p>
    </article>
  );
}

function Term({ term, text }: { term: string; text: string }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{term}</dt>
      <dd className="mt-0.5 text-graphite leading-relaxed">{text}</dd>
    </div>
  );
}
