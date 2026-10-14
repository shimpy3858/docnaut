import { useState } from 'react';
import { Image as ImageIcon, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, downloadAsZip, generateId, loadImage, canvasToBlob, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

const FORMATS = [
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp' },
];

export function ImageConverter() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);
  const { show } = useToast();

  const handleFiles = async (newFiles: File[]) => {
    const items: FileItem[] = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith('image/') ? await getImagePreview(file) : '';
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
  };

  const getImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const convert = async () => {
    if (files.length === 0) {
      show('Please add at least one image', 'error');
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      const converted: { name: string; blob: Blob }[] = [];

      for (const item of files) {
        if (!item.file.type.startsWith('image/')) {
          show(`Skipping ${item.file.name} - not an image`, 'error');
          continue;
        }

        const dataUrl = await getImagePreview(item.file);
        const img = await loadImage(dataUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // White background for formats that don't support transparency
        if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const blob = await canvasToBlob(canvas, targetFormat, targetFormat === 'image/jpeg' || targetFormat === 'image/webp' ? quality / 100 : undefined);
        const ext = FORMATS.find(f => f.value === targetFormat)?.ext || 'png';
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        converted.push({ name: `${baseName}.${ext}`, blob });
      }

      setResults(converted);
      saveRecentActivity('image-converter', 'Image Converter', files.map(f => f.file.name).join(', '));
      show(`Converted ${converted.length} image${converted.length > 1 ? 's' : ''}!`, 'success');
    } catch (err) {
      console.error(err);
      show('Conversion failed. Please try different images.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<ImageIcon className="w-8 h-8 text-gold-400" />}
      title="Image Converter"
      description="Convert between JPG, PNG, WebP, and BMP formats. Batch convert multiple images at once."
    >
      <div className="space-y-6">
        <Dropzone
          accept="image/*"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          hint="JPG, PNG, WebP, BMP, GIF, SVG • Batch conversion supported"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Convert To</label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value} className="bg-midnight-800">{f.label}</option>
              ))}
            </select>
          </div>

          {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
            <div>
              <label className="block text-sm text-ivory/60 mb-2 font-heading">Quality: {quality}%</label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-gold-400"
              />
            </div>
          )}
        </div>

        <button
          onClick={convert}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Convert Images</>
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-ivory">Results ({results.length})</h3>
              {results.length > 1 && (
                <button
                  onClick={() => downloadAsZip(results, 'converted-images.zip')}
                  className="px-4 py-2 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download all as ZIP
                </button>
              )}
            </div>
            <div className="space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-ivory/70">{r.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ivory/40">{formatBytes(r.blob.size)}</span>
                    <button
                      onClick={() => downloadBlob(r.blob, r.name)}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
