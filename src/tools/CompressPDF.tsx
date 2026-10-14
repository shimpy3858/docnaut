import { useState } from 'react';
import { Shrink, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId, loadImage, canvasToBlob, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function CompressPDF() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(60);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
    setResultBlob(null);
    if (pdfs[0]) setOriginalSize(pdfs[0].size);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const compress = async () => {
    if (files.length === 0) { show('Please add a PDF', 'error'); return; }
    setProcessing(true);
    setProgress(0);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      const { PDFDocument } = await import('pdf-lib');

      const bytes = await files[0].file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const newDoc = await PDFDocument.create();
      const scale = quality < 40 ? 1.0 : quality < 70 ? 1.5 : 2.0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d'); if (!ctx) continue;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport, background: '#FFFFFF', canvas } as any).promise;
        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality / 100);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await newDoc.embedJpg(jpegBytes);
        const p = newDoc.addPage([viewport.width, viewport.height]);
        p.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const out = await newDoc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      setResultBlob(blob);
      saveRecentActivity('compress-pdf', 'Compress PDF', files[0].file.name);
      show('PDF compressed!', 'success');
    } catch (err) { console.error(err); show('Compression failed. PDF might be encrypted.', 'error'); }
    finally { setProcessing(false); }
  };

  const savings = resultBlob && originalSize ? Math.round((1 - resultBlob.size / originalSize) * 100) : 0;

  return (
    <ToolLayout icon={<Shrink className="w-8 h-8 text-gold-400" />} title="Compress PDF" description="Reduce PDF file size by re-rendering pages as compressed images.">
      <div className="space-y-6">
        <Dropzone accept="application/pdf" onFiles={handleFiles} files={files} onRemove={removeFile} multiple={false} hint="Upload one PDF to compress" />
        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Compression Level: {quality}%</label>
          <input type="range" min="20" max="90" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-gold-400" />
          <div className="flex justify-between text-xs text-ivory/30 mt-1"><span>Smaller file</span><span>Better quality</span></div>
        </div>
        <button onClick={compress} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Compressing... {progress}%</> : <><Sparkles className="w-5 h-5" /> Compress PDF</>}
        </button>
        {processing && <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden"><div className="h-full progress-bar transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
        {resultBlob && (
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-ivory/70">compressed.pdf</p>
              <p className="text-xs text-ivory/40 mt-1">{formatBytes(originalSize)} → <span className="text-gold-400">{formatBytes(resultBlob.size)}</span> <span className="text-emerald-400 ml-2">-{savings}%</span></p>
            </div>
            <button onClick={() => downloadBlob(resultBlob, 'compressed.pdf')} className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
