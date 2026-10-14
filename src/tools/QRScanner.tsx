import { useState } from 'react';
import { QrCode, Copy, Download, Loader2, Sparkles, Camera, CameraOff } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { generateId } from '@/utils/fileUtils';
import { useRef, useEffect } from 'react';

export function QRScanner() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [result, setResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { show } = useToast();

  const handleFiles = async (newFiles: File[]) => {
    const items: FileItem[] = await Promise.all(
      newFiles.filter(f => f.type.startsWith('image/')).map(async (file) => {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const scanFromImage = async () => {
    if (files.length === 0) { show('Please add an image with a QR code', 'error'); return; }
    setProcessing(true);
    try {
      const jsQR = (await import('jsqr')).default;
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => { reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(files[0].file); });
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) { setResult(code.data); show('QR code scanned!', 'success'); }
      else { show('No QR code found in image', 'error'); }
    } catch (err) { console.error(err); show('Scan failed', 'error'); }
    finally { setProcessing(false); }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
      scanLoop();
    } catch { show('Camera access denied', 'error'); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const scanLoop = async () => {
    if (!videoRef.current || !streamRef.current) return;
    try {
      const jsQR = (await import('jsqr')).default;
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const tick = () => {
        if (!streamRef.current) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) { setResult(code.data); show('QR code detected!', 'success'); stopCamera(); return; }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (err) { console.error(err); }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <ToolLayout icon={<QrCode className="w-8 h-8 text-gold-400" />} title="QR / Barcode Scanner" description="Scan QR codes from images or using your camera. Results appear instantly." badge="beta">
      <div className="space-y-6">
        <Dropzone accept="image/*" onFiles={handleFiles} files={files} onRemove={removeFile} multiple={false} hint="Upload an image containing a QR code" />

        {cameraActive && (
          <div className="relative rounded-2xl overflow-hidden glass-card">
            <video ref={videoRef} className="w-full" playsInline muted />
            <div className="absolute inset-0 border-2 border-gold/50 rounded-2xl pointer-events-none" style={{ margin: '20%' }} />
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={scanFromImage} disabled={processing || files.length === 0} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
            {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</> : <><Sparkles className="w-5 h-5" /> Scan Image</>}
          </button>
          {!cameraActive ? (
            <button onClick={startCamera} className="px-4 py-3.5 rounded-xl glass-card text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"><Camera className="w-5 h-5" /> Camera</button>
          ) : (
            <button onClick={stopCamera} className="px-4 py-3.5 rounded-xl glass-card text-red-400 hover:border-red-500/40 transition-all flex items-center gap-2"><CameraOff className="w-5 h-5" /> Stop</button>
          )}
        </div>

        {result && (
          <div className="glass-card rounded-xl p-4 space-y-3">
            <h3 className="font-heading text-sm text-gold-400">Scan Result</h3>
            <p className="text-ivory break-all">{result}</p>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(result); show('Copied!', 'success'); }} className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" /> Copy</button>
              {result.startsWith('http') && <a href={result} target="_blank" rel="noopener" className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all">Open Link</a>}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
