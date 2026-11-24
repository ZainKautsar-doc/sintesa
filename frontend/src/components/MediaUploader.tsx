import { useRef, useState } from 'react';
import { Image, Mic, Upload, Square, FileCheck, AlertCircle } from 'lucide-react';
import type { MediaType } from '../types';

interface Props {
  mediaType: MediaType;
  file: File | null;
  onFile: (file: File) => void;
  onAnalyze: () => void;
  loading: boolean;
}

export default function MediaUploader({ mediaType, file, onFile, onAnalyze, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');

  const accept = mediaType === 'image' ? '.jpg,.jpeg,.png,.webp,image/*' : '.wav,.mp3,.ogg,.flac,.webm,audio/*';

  const toggleRecording = async () => {
    setRecordingError('');

    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError('Perekaman mikrofon tidak didukung oleh browser ini.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const supportedType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setRecordingError('Perekaman gagal. Coba lagi atau gunakan file audio.');
        setRecording(false);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size > 0) {
          const extension = type.includes('ogg') ? 'ogg' : 'webm';
          onFile(new File([blob], `rekaman-mikrofon.${extension}`, { type: blob.type }));
        } else {
          setRecordingError('Tidak ada audio yang direkam. Coba bicara lebih lama.');
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError') {
        setRecordingError('Izin mikrofon ditolak. Aktifkan izin mikrofon pada browser.');
      } else if (name === 'NotFoundError') {
        setRecordingError('Mikrofon tidak ditemukan.');
      } else {
        setRecordingError('Mikrofon tidak dapat digunakan. Pastikan perangkat aktif.');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-ink">
          {mediaType === 'image' ? 'Unggah Citra / Foto' : 'Unggah atau Rekam Audio'}
        </h2>
        <p className="mt-1 text-xs text-graphite">
          Pilih sampel media untuk diuji keasliannya menggunakan model forensik AI.
        </p>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const dropped = event.dataTransfer.files[0];
          if (dropped) onFile(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-input border border-dashed border-warm-mist bg-parchment px-6 py-10 text-center transition hover:border-deep-teal hover:bg-soft-paper"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])}
        />
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-soft-paper border border-warm-mist text-graphite group-hover:border-deep-teal/40 group-hover:text-deep-teal">
          {mediaType === 'image' ? <Image className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </div>
        <p className="text-sm font-medium text-ink">
          Seret & letakkan file di sini, atau <span className="text-deep-teal underline decoration-deep-teal/40 underline-offset-2">pilih dokumen</span>
        </p>
        <p className="mt-1.5 text-xs text-ash">
          Ukuran maksimal 10 MB ({mediaType === 'image' ? 'PNG, JPG, WEBP' : 'WAV, MP3, WEBM, FLAC'})
        </p>

        {file && (
          <div className="mt-4 flex items-center gap-2 rounded-btn border border-deep-teal/30 bg-deep-teal-light px-3 py-1.5 text-xs text-deep-teal">
            <FileCheck className="h-4 w-4" />
            <span className="max-w-[280px] truncate font-medium">{file.name}</span>
            <span className="text-ash">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      {file && (
        <div className="rounded-input border border-warm-mist bg-parchment p-3">
          <p className="mb-2 text-xs font-medium text-graphite">Pratinjau Media</p>
          {mediaType === 'image' ? (
            <div className="flex justify-center overflow-hidden rounded-btn bg-soft-paper p-2">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="max-h-64 w-auto rounded object-contain"
              />
            </div>
          ) : (
            <div className="rounded-btn bg-soft-paper p-3">
              <audio controls src={URL.createObjectURL(file)} className="w-full" />
            </div>
          )}
        </div>
      )}

      {mediaType === 'audio' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex w-full items-center justify-center gap-2 rounded-btn border py-2.5 text-sm font-medium transition ${
              recording
                ? 'border-rose-400 bg-rose-50 text-rose-700 animate-pulse'
                : 'border-warm-mist bg-soft-paper text-ink hover:border-graphite shadow-subtle'
            }`}
          >
            {recording ? <Square className="h-4 w-4 text-rose-600" /> : <Mic className="h-4 w-4 text-graphite" />}
            {recording ? 'Hentikan Perekaman Suara' : 'Rekam Suara Langsung (Mikrofon)'}
          </button>
          {recordingError && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{recordingError}</span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!file || loading}
        onClick={onAnalyze}
        className="flex w-full items-center justify-center gap-2 rounded-btn bg-deep-teal px-4 py-3 text-sm font-medium text-white shadow-subtle transition hover:bg-deep-teal-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {loading ? 'Sedang Memeriksa Sampel...' : 'Jalankan Analisis Forensik'}
      </button>
    </div>
  );
}
