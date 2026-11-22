import { useState } from 'react';
import { BarChart3, BookOpen, BrainCircuit, Image, Info, RotateCcw, Volume2 } from 'lucide-react';

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
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2"><BookOpen className="h-5 w-5 text-cyan-400" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Mode Pembelajaran</p>
            <h2 className="mt-1 text-xl font-bold text-slate-100">Simulasi Probabilitas Deepfake</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Geser nilai untuk melihat bagaimana model membandingkan probabilitas dua kemungkinan. Model selalu memilih kemungkinan dengan skor tertinggi.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-5">
            <div className="mb-5 flex items-center justify-between">
              <label htmlFor="deepfake" className="text-sm font-semibold text-slate-300">Probabilitas Deepfake</label>
              <button type="button" onClick={() => setDeepfake(50)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200"><RotateCcw className="h-3.5 w-3.5" />Reset 50/50</button>
            </div>
            <input id="deepfake" type="range" min="0" max="100" value={deepfake} onChange={(event) => setDeepfake(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-emerald-400" />

            <div className="mt-6 space-y-4">
              <ProbabilityBar label="DEEPFAKE" value={deepfake} color="rose" />
              <ProbabilityBar label="ORISINIL" value={original} color="emerald" />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Hasil Simulasi</p>
              <p className={`mt-3 text-3xl font-black ${winner === 'DEEPFAKE' ? 'text-rose-400' : 'text-emerald-400'}`}>{winner}</p>
              <p className="mt-2 text-sm text-slate-400">Confidence: <strong className="text-slate-200">{confidence}%</strong></p>
            </div>
            <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm font-semibold text-slate-200">Tingkat keyakinan: {certainty}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{deepfake === 50 ? 'Nilai persis seimbang. Dalam praktik, prediksi seperti ini memerlukan verifikasi tambahan.' : 'Skor lebih tinggi menentukan label prediksi, bukan jaminan bahwa hasil benar.'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={<BrainCircuit />}
          title="1. Media Diproses"
          text="Gambar disiapkan dan dipelajari berdasarkan fitur visual, seperti tekstur, tepi, pola kompresi, serta ketidakteraturan yang mencurigakan. Sementara itu, audio dinormalisasi dan diperiksa melalui pola spektral dan suara, termasuk ritme, frekuensi, transisi, serta karakter vokal. Perbedaan ini dapat membantu model mengenali pola yang sering muncul pada media hasil manipulasi."
        />
        <InfoCard
          icon={<BarChart3 />}
          title="2. Model Membuat Skor"
          text="Setelah ciri media diekstraksi, model menghitung dua nilai kemungkinan: satu untuk DEEPFAKE dan satu untuk ORISINIL. Kedua nilai dinyatakan dalam persen dan selalu berjumlah 100%. Misalnya, skor 51% Deepfake berarti model memberi nilai 49% untuk Orisinil. Nilai ini menunjukkan tingkat kecenderungan, bukan kepastian mutlak."
        />
        <InfoCard
          icon={<Info />}
          title="3. Label Dipilih"
          text="Nilai tertinggi menentukan label hasil. Jika 51% masuk sebagai Deepfake dan 49% sebagai Orisinil, hasilnya adalah DEEPFAKE karena selisihnya kecil. Jika 82% Orisinil dan 18% Deepfake, hasilnya adalah ORISINIL dengan kecenderungan yang lebih kuat. Semakin mendekati 50/50, hasil semakin perlu verifikasi tambahan."
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-2"><Image className="h-5 w-5 text-violet-400" /><h3 className="font-semibold">Simulasi Gambar</h3></div>
          <div className="space-y-3 text-sm leading-6 text-slate-400"><p><strong className="text-slate-200">Tahapan:</strong> Resize → normalisasi → ekstraksi ciri visual → klasifikasi → dua probabilitas.</p><p>Fitur visual dapat mencakup tekstur, tepi, pola kompresi, dan ketidakselarasan artefak gambar.</p><div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-xs">Contoh: 72% Orisinil dan 28% Deepfake berarti model lebih condong pada Orisinil.</div></div>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-2"><Volume2 className="h-5 w-5 text-cyan-400" /><h3 className="font-semibold">Simulasi Audio</h3></div>
          <div className="space-y-3 text-sm leading-6 text-slate-400"><p><strong className="text-slate-200">Tahapan:</strong> Normalisasi audio → ekstraksi pola suara → klasifikasi → dua probabilitas.</p><p>Pola audio dapat mencakup ritme, frekuensi, transisi suara, dan karakter vokal sintetis.</p><div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs">Contoh: 65% Deepfake dan 35% Orisinil berarti model lebih condong pada Deepfake.</div></div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="mb-4 font-semibold">Contoh Kasus Pemahaman</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {cases.map((item) => (
            <button key={item.label} type="button" onClick={() => setDeepfake(item.deepfake)} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-slate-600">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-200">{item.label}</span><span className="text-xs text-slate-500">{item.deepfake}% / {100 - item.deepfake}%</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5"><h3 className="font-semibold text-amber-300">Istilah Penting</h3><dl className="mt-3 space-y-3 text-sm"><Term term="Probabilitas" text="Nilai kemungkinan untuk setiap kelas, biasanya dalam persen." /><Term term="Confidence" text="Probabilitas dari label yang dipilih sebagai hasil prediksi." /><Term term="50/50" text="Kondisi kedua kemungkinan seimbang dan hasil kurang pasti." /></dl></div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5"><h3 className="font-semibold text-emerald-300">Hal yang Perlu Diingat</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-400"><li>Probabilitas bukan kepastian mutlak.</li><li>Nilai mendekati 50/50 membutuhkan verifikasi lebih lanjut.</li><li>Hasil sebaiknya dikombinasikan dengan konteks dan bukti independen.</li></ul></div>
      </section>
    </div>
  );
}

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: 'rose' | 'emerald' }) {
  const textColor = color === 'rose' ? 'text-rose-300' : 'text-emerald-300';
  const gradient = color === 'rose' ? 'from-rose-600 to-rose-400' : 'from-emerald-600 to-emerald-400';
  return <div><div className="mb-2 flex justify-between text-sm"><span className={textColor}>{label}</span><strong>{value}%</strong></div><div className="h-4 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all`} style={{ width: `${value}%` }} /></div></div>;
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="mb-3 flex items-center gap-2 text-emerald-400">{icon}<h3 className="text-sm font-semibold text-slate-200">{title}</h3></div><p className="text-sm leading-6 text-slate-400">{text}</p></article>;
}

function Term({ term, text }: { term: string; text: string }) {
  return <div><dt className="font-semibold text-slate-200">{term}</dt><dd className="mt-0.5 text-slate-400">{text}</dd></div>;
}
