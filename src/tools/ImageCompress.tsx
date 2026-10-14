import { useState } from 'react';
import { Shrink, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId, loadImage, canvasToBlob, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function ImageCompress() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(60);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob; originalSize: number }[]>([]);
  const { show } = useToast();

  const handleFiles = async (newFiles: File[]) => {
    const items: FileItem[] = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith('image/') ? await getImagePreview(file) : '';
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
    setResults([]);
  };

  const getImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const compress = async () => {
    if (files.length === 0) {
      show('Please add at least one image', 'error');
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      const compressed: { name: string; blob: Blob; originalSize: number }[] = [];

      for (const item of files) {
        if (!item.file.type.startsWith('image/')) continue;

        const dataUrl = await getImagePreview(item.file);
        const img = await loadImage(dataUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const blob = await canvasToBlob(canvas, 'image/jpeg', quality / 100);
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        compressed.push({ name: `${baseName}_compressed.jpg`, blob, originalSize: item.file.size });
      }

      setResults(compressed);
      saveRecentActivity('image-compress', 'Compress Image', files.map(f => f.file.name).join(', '));
      show(`Compressed ${compressed.length} image${compressed.length > 1 ? 's' : ''}!`, 'success');
    } catch (err) {
      console.error(err);
      show('Compression failed.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<Shrink className="w-8 h-8 text-gold-400" />}
      title="Compress Image"
      description="Reduce image file size with adjustable quality. See before/after size comparison."
    >
      <div className="space-y-6">
        <Dropzone
          accept="image/*"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          hint="JPG, PNG, WebP • Output is always JPG for best compression"
        />

        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Quality: {quality}%</label>
          <input
            type="range"
            min="10"
            max="95"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-gold-400"
          />
          <div className="flex justify-between text-xs text-ivory/30 mt-1">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>

        <button
          onClick={compress}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Compressing...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Compress Images</>
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-heading text-ivory">Results</h3>
            {results.map((r, idx) => {
              const savings = ((1 - r.blob.size / r.originalSize) * 100).toFixed(0);
              return (
                <div key={idx} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ivory/70">{r.name}</p>
                    <p className="text-xs text-ivory/40 mt-1">
                      {formatBytes(r.originalSize)} → <span className="text-gold-400">{formatBytes(r.blob.size)}</span>
                      <span className="text-emerald-400 ml-2">-{savings}%</span>
                    </p>
                  </div>
                  <button
                    onClick={() => downloadBlob(r.blob, r.name)}
                    className="px-4 py-2 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
