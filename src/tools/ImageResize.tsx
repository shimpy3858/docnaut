import { useState } from 'react';
import { Expand, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId, loadImage, canvasToBlob, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function ImageResize() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [keepAspect, setKeepAspect] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);
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

  const resize = async () => {
    if (files.length === 0) { show('Please add images', 'error'); return; }
    setProcessing(true);
    try {
      const out: { name: string; blob: Blob }[] = [];
      for (const item of files) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => { reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(item.file); });
        const img = await loadImage(dataUrl);
        const canvas = document.createElement('canvas');
        let w = width, h = height;
        if (keepAspect) {
          const ratio = img.naturalWidth / img.naturalHeight;
          if (width / height > ratio) { w = Math.round(height * ratio); } else { h = Math.round(width / ratio); }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); if (!ctx) continue;
        ctx.drawImage(img, 0, 0, w, h);
        const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        out.push({ name: `${baseName}_${w}x${h}.jpg`, blob });
      }
      setResults(out);
      saveRecentActivity('image-resize', 'Resize Image', files.map(f => f.file.name).join(', '));
      show(`Resized ${out.length} image${out.length > 1 ? 's' : ''}!`, 'success');
    } catch (err) { console.error(err); show('Resize failed', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <ToolLayout icon={<Expand className="w-8 h-8 text-gold-400" />} title="Resize Image" description="Resize images to custom dimensions. Option to maintain aspect ratio.">
      <div className="space-y-6">
        <Dropzone accept="image/*" onFiles={handleFiles} files={files} onRemove={removeFile} hint="JPG, PNG, WebP" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm text-ivory/60 mb-2 font-heading">Width (px)</label><input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50" /></div>
          <div><label className="block text-sm text-ivory/60 mb-2 font-heading">Height (px)</label><input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50" /></div>
          <div className="flex items-end"><label className="flex items-center gap-2 text-sm text-ivory/60 cursor-pointer"><input type="checkbox" checked={keepAspect} onChange={e => setKeepAspect(e.target.checked)} className="accent-gold-400 w-4 h-4" /> Maintain aspect ratio</label></div>
        </div>
        <button onClick={resize} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Resizing...</> : <><Sparkles className="w-5 h-5" /> Resize Images</>}
        </button>
        {results.length > 0 && (
          <div className="space-y-2">{results.map((r, idx) => (
            <div key={idx} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-ivory/70">{r.name}</span>
              <button onClick={() => downloadBlob(r.blob, r.name)} className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Download</button>
            </div>
          ))}</div>
        )}
      </div>
    </ToolLayout>
  );
}
