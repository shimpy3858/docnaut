import { useState, useEffect } from 'react';
import { FileImage, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, downloadAsZip, generateId, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

interface RenderedPage {
  pageNum: number;
  blob: Blob;
  name: string;
}

export function PDFToJPG() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [quality, setQuality] = useState(85);
  const [scale, setScale] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<RenderedPage[]>([]);
  const [progress, setProgress] = useState(0);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfs.length < newFiles.length) show('Only PDF files are accepted', 'info');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
    setResults([]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const convert = async () => {
    if (files.length === 0) {
      show('Please add a PDF', 'error');
      return;
    }

    setProcessing(true);
    setResults([]);
    setProgress(0);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;

      const allPages: RenderedPage[] = [];
      let totalPages = 0;

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        totalPages += pdf.numPages;
      }

      let rendered = 0;

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        const baseName = item.file.name.replace(/\.pdf$/i, '');

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport, background: '#FFFFFF', canvas } as any).promise;

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality / 100);
          });

          allPages.push({ pageNum: i, blob, name: `${baseName}_page_${i}.jpg` });
          rendered++;
          setProgress(Math.round((rendered / totalPages) * 100));
        }

        await pdf.cleanup();
      }

      setResults(allPages);
      saveRecentActivity('pdf-to-jpg', 'PDF to JPG', files.map(f => f.file.name).join(', '));
      show(`Converted ${allPages.length} pages to JPG!`, 'success');
    } catch (err) {
      console.error(err);
      show('Conversion failed. The PDF might be encrypted or corrupted.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<FileImage className="w-8 h-8 text-gold-400" />}
      title="PDF to JPG"
      description="Convert each PDF page to a JPG image. Adjust quality and DPI. Download individually or as ZIP."
    >
      <div className="space-y-6">
        <Dropzone
          accept="application/pdf"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          hint="PDF files • Each page becomes a separate JPG"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Quality: {quality}%</label>
            <input
              type="range"
              min="20"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-gold-400"
            />
          </div>
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">DPI Scale: {scale}x</label>
            <input
              type="range"
              min="1"
              max="4"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-gold-400"
            />
            <p className="text-xs text-ivory/30 mt-1">1x = 72 DPI, 2x = 144 DPI, 3x = 216 DPI</p>
          </div>
        </div>

        <button
          onClick={convert}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Converting... {progress}%</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Convert to JPG</>
          )}
        </button>

        {processing && (
          <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden">
            <div className="h-full progress-bar transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-ivory">Results ({results.length})</h3>
              <button
                onClick={() => downloadAsZip(results, 'pdf-to-jpg.zip')}
                className="px-4 py-2 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download all as ZIP
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {results.map((r, idx) => (
                <div key={idx} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-ivory/70">{r.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ivory/40">{formatBytes(r.blob.size)}</span>
                    <button
                      onClick={() => downloadBlob(r.blob, r.name)}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
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
