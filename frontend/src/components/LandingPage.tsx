import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Image as ImageIcon,
  Mic,
  ArrowRight,
  Sliders,
  Sparkles,
  Layers,
  FileSearch,
  Bot,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { MediaType } from '../types';

interface LandingPageProps {
  onStartDetection: (type?: MediaType) => void;
  onStartSimulation: () => void;
}

export default function LandingPage({ onStartDetection, onStartSimulation }: LandingPageProps) {
  return (
    <div className="space-y-16 py-4 md:py-8">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-card border border-warm-mist bg-soft-paper p-8 shadow-card md:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-deep-teal/20 bg-deep-teal-light px-3.5 py-1 text-xs font-semibold text-deep-teal">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Platform Defensive AI • Keamanan Informasi</span>
            </div>

            <h1 className="font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Identifikasi Forensik Rekayasa Citra & Suara Sintetis
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-graphite sm:text-base">
              <strong className="text-ink">SINTESA</strong> menghadirkan deteksi manipulasi *deepfake* berbasis model *deep learning* lokal (Hugging Face) dipadukan dengan analisis visual forensik dan asisten mitigasi ancaman *social engineering* berbasis AI.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartDetection('image')}
                className="flex items-center gap-2 rounded-btn bg-deep-teal px-5 py-3 text-sm font-semibold text-white shadow-subtle transition hover:bg-deep-teal-hover"
              >
                <ImageIcon className="h-4 w-4" />
                Mulai Deteksi Gambar
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onStartDetection('audio')}
                className="flex items-center gap-2 rounded-btn border border-warm-mist bg-parchment px-5 py-3 text-sm font-semibold text-ink shadow-subtle transition hover:border-graphite hover:bg-soft-paper"
              >
                <Mic className="h-4 w-4 text-deep-teal" />
                Deteksi Audio
              </button>

              <button
                type="button"
                onClick={onStartSimulation}
                className="flex items-center gap-2 rounded-btn border border-transparent px-4 py-3 text-sm font-medium text-graphite transition hover:text-ink"
              >
                <Sliders className="h-4 w-4" />
                Mode Simulasi
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t border-warm-mist/60 pt-6 text-xs text-graphite">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Privasi Lokal (Tanpa upload cloud luar)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Analisis Forensik ELA & Spektrogram</span>
              </div>
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="relative">
            <div className="relative rounded-card border border-warm-mist bg-parchment p-6 shadow-subtle">
              <div className="mb-4 flex items-center justify-between border-b border-warm-mist/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-[11px] text-graphite">preview_inference.log</span>
                </div>
                <span className="rounded-full bg-deep-teal-light px-2 py-0.5 text-[10px] font-bold text-deep-teal">
                  LIVE STATUS
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-input border border-deep-teal/30 bg-deep-teal-light p-3.5 text-deep-teal">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Hasil Deteksi Visual</span>
                    <span className="rounded-full bg-soft-paper px-2 py-0.5 text-[10px]">DEEPFAKE 94.2%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-deep-teal/80">
                    Terdeteksi diskontinuitas rasio kompresi ELA pada bagian wajah.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] text-graphite">
                    <span>Distribusi Probabilitas</span>
                    <span className="font-semibold text-ink">94.2% vs 5.8%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-warm-mist/50">
                    <div className="h-full bg-deep-teal" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div className="rounded-input border border-warm-mist bg-soft-paper p-3 text-[11px] text-graphite">
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <Bot className="h-3.5 w-3.5 text-deep-teal" />
                    <span>Rekomendasi Mitigasi LLM:</span>
                  </div>
                  <p className="mt-1 leading-relaxed">
                    Jangan jadikan dokumen ini sebagai satu-satunya bukti verifikasi e-KYC. Mintalah panggilan video dengan tantangan gestur acak.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALUR KERJA FORENSIK 4-TAHAP */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-deep-teal">Tahapan Pipeline</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Bagaimana SINTESA Mengamankan & Menganalisis Media
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-graphite sm:text-sm">
            Arsitektur bertingkat yang memadukan komputasi neural network lokal dengan penalaran kontekstual LLM.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            step="01"
            icon={<Layers className="h-5 w-5" />}
            title="Unggah / Rekam Media"
            description="Menerima citra foto (JPEG/PNG/WEBP) atau rekaman audio mikrofon langsung (WAV/MP3/WEBM) dengan validasi ukuran ketat."
          />
          <WorkflowStep
            step="02"
            icon={<Cpu className="h-5 w-5" />}
            title="Inferensi Model Lokal"
            description="Model vision transformer & Wav2Vec2 Hugging Face mengekstraksi representasi latent dan menghitung probabilitas biner secara offline."
          />
          <WorkflowStep
            step="03"
            icon={<FileSearch className="h-5 w-5" />}
            title="Visualisasi Forensik"
            description="Menghasilkan Error Level Analysis (ELA) untuk pola kompresi JPEG dan Mel-Spectrogram untuk deteksi frekuensi sintetis audio."
          />
          <WorkflowStep
            step="04"
            icon={<Bot className="h-5 w-5" />}
            title="Mitigasi Risiko AI"
            description="LLM OpenRouter mengevaluasi indikasi rekayasa sosial, menyajikan langkah pencegahan penipuan, dan panduan tindak lanjut."
          />
        </div>
      </section>

      {/* 3. CAPABILITY SHOWCASE */}
      <section className="grid gap-6 md:grid-cols-3">
        <CapabilityCard
          icon={<ImageIcon className="h-6 w-6 text-deep-teal" />}
          title="Deteksi Gambar & ELA"
          badge="Vision Pipeline"
          points={[
            'Klasifikasi biner ORISINIL vs DEEPFAKE',
            'Ekstraksi anomali tekstur dan artefak pencahayaan',
            'Error Level Analysis (ELA) untuk bukti manipulasi kompresi',
          ]}
        />
        <CapabilityCard
          icon={<Mic className="h-6 w-6 text-deep-teal" />}
          title="Deteksi Audio & Spektrogram"
          badge="Acoustic Pipeline"
          points={[
            'Identifikasi manipulasi suara dan Voice Cloning TTS',
            'Rekam audio langsung dari browser via MediaRecorder',
            'Visualisasi Mel-Spectrogram untuk menganalisis kontinuitas vokal',
          ]}
        />
        <CapabilityCard
          icon={<Bot className="h-6 w-6 text-deep-teal" />}
          title="Asisten Keamanan & Chat"
          badge="LLM Defense"
          points={[
            'Analisis potensi ancaman manipulasi rekayasa sosial',
            'Fallback model gratis OpenRouter yang tangguh',
            'Saran SOP verifikasi identitas e-KYC independen',
          ]}
        />
      </section>

      {/* 4. EDUKASI KEWASPADAAN SOCIAL ENGINEERING */}
      <section className="rounded-card border border-warm-mist bg-soft-paper p-8 shadow-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-warm-mist pb-4">
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              Edukasi Kewaspadaan: Melawan Manipulasi Rekayasa Sosial
            </h2>
            <p className="mt-1 text-xs text-graphite sm:text-sm">
              Deepfake bukan hanya artefak visual, melainkan vektor serangan keamanan informasi yang berbahaya.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Zero-Trust Verification
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <ThreatCard
            title="Bypass e-KYC & Perbankan"
            threat="Pencuri identitas menggunakan foto deepfake atau video wajah sintetis untuk membuka rekening bank bodong atau pinjaman online."
            defense="Gunakan liveness detection berbasis gerakan aktif dan kombinasikan dengan verifikasi database kependudukan resmi."
          />
          <ThreatCard
            title="Voice Cloning Scam"
            threat="Penipu meniru suara kerabat atau pimpinan (CEO Fraud) meminta transfer dana mendesak melalui telepon berdurasi singkat."
            defense="Tutup panggilan, lalu hubungi kembali nomor resmi kerabat tersebut melalui kanal independen yang terverifikasi."
          />
          <ThreatCard
            title="Disinformasi & Pemerasan"
            threat="Rekayasa rekaman percakapan palsu untuk mencemarkan nama baik, menyebarkan hoaks, atau memeras korban."
            defense="Gunakan audit forensik spektrogram dan laporkan ke unit respon insiden siber (CSIRT) atau aparat penegak hukum."
          />
        </div>
      </section>

      {/* 5. METRIK EVALUASI & KINERJA */}
      <section className="grid gap-6 md:grid-cols-4">
        <StatCard
          number="< 500 ms"
          label="Latensi Inferensi Lokal"
          description="Pemrosesan citra cepat pada arsitektur CPU/CUDA lokal tanpa latensi transfer jaringan eksternal."
        />
        <StatCard
          number="100%"
          label="Privasi Terjaga"
          description="Media gambar & suara diolah pada backend mandiri, mencegah kebocoran data sensitif pengguna."
        />
        <StatCard
          number="2 Kanal"
          label="Forensik Multi-Modal"
          description="Dukungan terintegrasi untuk media citra visual dan rekaman spektrum akustik suara."
        />
        <StatCard
          number="0 IDR"
          label="Efisiensi Biaya"
          description="Memanfaatkan model Hugging Face terbuka dan model AI inferensi gratis dengan sistem fallback cerdas."
        />
      </section>

      {/* 6. PROFIL TUGAS AKHIR & DISCLAIMER */}
      <section className="rounded-card border border-warm-mist bg-parchment p-8 shadow-subtle">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-deep-teal" />
              <h3 className="text-base font-bold text-ink">
                Proyek Tugas Akhir: Mata Kuliah Keamanan Informasi
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-graphite sm:text-sm">
              SINTESA dikembangkan sebagai bagian dari Tugas Akhir Keamanan Informasi. Sistem ini bertujuan memberikan alat bantu pertahanan (*defensive AI tools*) bagi masyarakat dan praktisi teknologi dalam mengidentifikasi manipulasi media sintetis yang kian canggih.
            </p>
            <div className="rounded-input border border-warm-mist bg-soft-paper p-3 text-xs text-graphite">
              <p className="font-semibold text-ink">Catatan Tanggung Jawab (Disclaimer):</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Hasil prediksi sistem merupakan estimasi probabilitas statistik berbasis model deep learning, bukan pembuktian hukum mutlak. Selalu padukan hasil analisis dengan verifikasi identitas melalui kanal independen.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-card border border-warm-mist bg-soft-paper p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-deep-teal">Pusat Tindakan</p>
              <h4 className="mt-1 text-sm font-bold text-ink">Mulai Pengujian Sekarang</h4>
              <p className="mt-1 text-xs text-graphite">
                Unggah dokumen foto mencurigakan atau rekam percakapan audio untuk dianalisis secara instan.
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => onStartDetection()}
                className="flex w-full items-center justify-center gap-2 rounded-btn bg-deep-teal py-2.5 text-xs font-semibold text-white shadow-subtle transition hover:bg-deep-teal-hover"
              >
                Buka Workspace Deteksi
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onStartSimulation}
                className="flex w-full items-center justify-center gap-2 rounded-btn border border-warm-mist bg-parchment py-2.5 text-xs font-medium text-graphite transition hover:border-graphite hover:text-ink"
              >
                Pelajari Logika Probabilitas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-warm-mist pt-6 text-center text-xs text-ash">
        <p>© {new Date().getFullYear()} SINTESA • Sistem Identifikasi Rekayasa Suara dan Citra</p>
        <p className="mt-1">Defensive AI • Deepfake Forensics & Social Engineering Countermeasure</p>
      </footer>
    </div>
  );
}

function WorkflowStep({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-card border border-warm-mist bg-soft-paper p-6 shadow-subtle transition hover:border-deep-teal">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-deep-teal-light text-deep-teal border border-deep-teal/20">
          {icon}
        </div>
        <span className="font-mono text-xs font-bold text-ash">{step}</span>
      </div>
      <h3 className="mt-4 text-sm font-bold text-ink">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-graphite">{description}</p>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  badge,
  points,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  points: string[];
}) {
  return (
    <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-parchment border border-warm-mist">
          {icon}
        </div>
        <span className="rounded-full bg-deep-teal-light px-2.5 py-0.5 text-[10px] font-semibold text-deep-teal">
          {badge}
        </span>
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-xs text-graphite">
        {points.map((pt, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-deep-teal" />
            <span>{pt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThreatCard({
  title,
  threat,
  defense,
}: {
  title: string;
  threat: string;
  defense: string;
}) {
  return (
    <div className="rounded-input border border-warm-mist bg-parchment p-5 shadow-subtle">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <div className="mt-3 space-y-2 text-xs">
        <div>
          <span className="font-semibold text-rose-800">Vektor Ancaman:</span>
          <p className="mt-0.5 text-graphite leading-relaxed">{threat}</p>
        </div>
        <div className="border-t border-warm-mist/60 pt-2">
          <span className="font-semibold text-deep-teal">Protokol Mitigasi:</span>
          <p className="mt-0.5 text-graphite leading-relaxed">{defense}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  number,
  label,
  description,
}: {
  number: string;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-card border border-warm-mist bg-soft-paper p-6 shadow-subtle">
      <p className="font-sans text-2xl font-black text-deep-teal sm:text-3xl">{number}</p>
      <p className="mt-1 text-xs font-bold text-ink">{label}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-graphite">{description}</p>
    </div>
  );
}
