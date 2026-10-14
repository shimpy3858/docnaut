import { useState } from 'react';
import { Compress, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId, loadImage, canvasToBlob, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function ImagesToPDF() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState(20);
  const [processing, setProcessing] = useState(false);
  const { show } = useToast();

  const handleFiles = async (newFiles: File[]) => {
    const images = newFiles.filter(f => f.type.startsWith('image/'));
    if (images.length < newFiles.length) show('Some files were not images and were skipped', 'info');
    const items: FileItem[] = await Promise.all(
      images.map(async (file) => {
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const reorder = (from: number, to: number) => {
    setFiles(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  const convert = async () => {
    if (files.length === 0) {
      show('Please add at least one image', 'error');
      return;
    }

    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');

      const sizes = {
        a4: { width: 595.28, height: 841.89 },
        letter: { width: 612, height: 792 },
        fit: { width: 0, height: 0 },
      };

      const pdfDoc = await PDFDocument.create();

      for (const item of files) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(item.file);
        });

        const img = await loadImage(dataUrl);

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(img, 0, 0);

        const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const embedded = await pdfDoc.embedJpg(jpegBytes);

        let pageWidth: number, pageHeight: number;
        if (pageSize === 'fit') {
          pageWidth = embedded.width + margin * 2;
          pageHeight = embedded.height + margin * 2;
        } else {
          const size = sizes[pageSize];
          if (orientation === 'landscape') {
            pageWidth = size.height;
            pageHeight = size.width;
          } else {
            pageWidth = size.width;
            pageHeight = size.height;
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const availW = pageWidth - margin * 2;
        const availH = pageHeight - margin * 2;
        const scale = Math.min(availW / embedded.width, availH / embedded.height);
        const drawW = embedded.width * scale;
        const drawH = embedded.height * scale;
        const x = (pageWidth - drawW) / 2;
        const y = (pageHeight - drawH) / 2;

        page.drawImage(embedded, { x, y, width: drawW, height: drawH });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'images-to-pdf.pdf');
      saveRecentActivity('images-to-pdf', 'Images to PDF', files.map(f => f.file.name).join(', '));
      show('PDF created successfully!', 'success');
    } catch (err) {
      console.error(err);
      show('Conversion failed. Please try different images.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<Compress className="w-8 h-8 text-gold-400" />}
      title="Images to PDF"
      description="Combine JPG, PNG, and WebP images into a PDF. Reorder pages, choose page size and margins."
    >
      <div className="space-y-6">
        <Dropzone
          accept="image/*"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          onReorder={reorder}
          hint="JPG, PNG, WebP • Drag to reorder pages"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50"
            >
              <option value="a4" className="bg-midnight-800">A4</option>
              <option value="letter" className="bg-midnight-800">Letter</option>
              <option value="fit" className="bg-midnight-800">Fit to image</option>
            </select>
          </div>

          {pageSize !== 'fit' && (
            <div>
              <label className="block text-sm text-ivory/60 mb-2 font-heading">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50"
              >
                <option value="portrait" className="bg-midnight-800">Portrait</option>
                <option value="landscape" className="bg-midnight-800">Landscape</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Margin: {margin}px</label>
            <input
              type="range"
              min="0"
              max="80"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-gold-400"
            />
          </div>
        </div>

        <button
          onClick={convert}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating PDF...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Create PDF</>
          )}
        </button>
      </div>
    </ToolLayout>
  );
}
