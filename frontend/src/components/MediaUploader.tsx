import { useRef, useState } from 'react';
import { Image, Mic, Upload, Square } from 'lucide-react';
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
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  const accept = mediaType === 'image' ? '.jpg,.jpeg,.png,.webp,image/*' : '.wav,.mp3,.ogg,.flac,.webm,audio/*';

  const toggleRecording = async () => {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      onFile(new File([blob], 'rekaman-mikrofon.webm', { type: blob.type }));
      stream.getTracks().forEach((track) => track.stop());
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const dropped = event.dataTransfer.files[0];
          if (dropped) onFile(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-10 text-center transition hover:border-emerald-500/60"
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])} />
        {mediaType === 'image' ? <Image className="mb-3 h-8 w-8 text-emerald-400" /> : <Mic className="mb-3 h-8 w-8 text-emerald-400" />}
        <p className="text-sm font-medium text-slate-200">Seret & jatuhkan atau pilih file</p>
        <p className="mt-1 text-xs text-slate-500">Maksimal 10 MB</p>
        {file && <p className="mt-3 max-w-full truncate rounded-md bg-slate-800 px-3 py-1 text-xs text-emerald-300">{file.name}</p>}
      </div>

      {file && (mediaType === 'image' ? (
        <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-72 w-full rounded-xl object-contain bg-slate-950" />
      ) : (
        <audio controls src={URL.createObjectURL(file)} className="w-full" />
      ))}

      {mediaType === 'audio' && (
        <button type="button" onClick={toggleRecording} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
          {recording ? <Square className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4" />}
          {recording ? 'Hentikan Rekaman' : 'Rekam Suara (Mikrofon)'}
        </button>
      )}

      <button type="button" disabled={!file || loading} onClick={onAnalyze} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" /> : <Upload className="h-5 w-5" />}
        {loading ? 'Menganalisis...' : 'Analisis Media'}
      </button>
    </div>
  );
}
