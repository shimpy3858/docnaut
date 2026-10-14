import { useState, useRef, useEffect } from 'react';
import { ScanText, Camera, CameraOff, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function CameraScan() {
  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [filter, setFilter] = useState<'none' | 'bw' | 'contrast'>('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { show } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraActive(true);
    } catch { show('Camera access denied or not available', 'error'); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    if (filter === 'bw') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (filter === 'contrast') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const contrast = 1.5;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128));
        data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128));
        data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128));
      }
      ctx.putImageData(imageData, 0, 0);
    }
    setCaptured(canvas.toDataURL('image/jpeg', 0.9));
    show('Photo captured!', 'success');
  };

  const runOCR = async () => {
    if (!captured) { show('Capture a photo first', 'error'); return; }
    setProcessing(true);
    try {
      const { default: TesseractWorker } = await import('tesseract.js');
      const worker = await TesseractWorker.createWorker('eng', 1);
      const { data } = await worker.recognize(captured);
      setResult(data.text);
      saveRecentActivity('camera-scan', 'Live Camera Scan', 'camera_capture.jpg');
      show('Text extracted!', 'success');
      await worker.terminate();
    } catch (err) { console.error(err); show('OCR failed', 'error'); }
    finally { setProcessing(false); }
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <ToolLayout icon={<ScanText className="w-8 h-8 text-gold-400" />} title="Live Camera Scan" description="Use your camera to scan documents in real-time. Apply filters and extract text with OCR." badge="beta">
      <div className="space-y-6">
        <div className="relative rounded-2xl overflow-hidden glass-card min-h-[300px] flex items-center justify-center">
          {!captured && cameraActive && (
            <>
              <video ref={videoRef} className="w-full" playsInline muted />
              <div className="absolute inset-0 border-2 border-gold/40 rounded-2xl pointer-events-none" style={{ margin: '15%' }} />
            </>
          )}
          {captured && <img src={captured} alt="Captured" className="w-full" />}
          {!cameraActive && !captured && (
            <div className="text-center text-ivory/30 py-20"><Camera className="w-16 h-16 mx-auto mb-3" /><p>Camera preview will appear here</p></div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 flex-wrap">
          {!cameraActive ? (
            <button onClick={startCamera} className="px-4 py-3 rounded-xl glass-card text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"><Camera className="w-5 h-5" /> Start Camera</button>
          ) : (
            <button onClick={stopCamera} className="px-4 py-3 rounded-xl glass-card text-red-400 hover:border-red-500/40 transition-all flex items-center gap-2"><CameraOff className="w-5 h-5" /> Stop Camera</button>
          )}
          {cameraActive && <button onClick={capture} className="px-4 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold flex items-center gap-2"><Camera className="w-5 h-5" /> Capture</button>}
          {captured && <button onClick={() => setCaptured(null)} className="px-4 py-3 rounded-xl glass-card text-ivory hover:text-gold-400 transition-all">Retake</button>}
        </div>

        {captured && (
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Scanner Filter</label>
            <div className="flex gap-2">
              {[{ v: 'none', l: 'Original' }, { v: 'bw', l: 'B&W' }, { v: 'contrast', l: 'High Contrast' }].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-4 py-2 rounded-xl text-sm ${filter === f.v ? 'bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900' : 'glass-card text-ivory/60'}`}>{f.l}</button>
              ))}
            </div>
          </div>
        )}

        {captured && (
          <button onClick={runOCR} disabled={processing} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning...</> : <><Sparkles className="w-5 h-5" /> Extract Text</>}
          </button>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(result); show('Copied!', 'success'); }} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={() => downloadBlob(new Blob([result], { type: 'text/plain' }), 'scan-result.txt')} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Download className="w-4 h-4" /> .txt</button>
            </div>
            <textarea value={result} onChange={e => setResult(e.target.value)} className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[150px] focus:outline-none focus:border-gold/50 resize-y" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
