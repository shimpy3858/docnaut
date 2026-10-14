import { useState } from 'react';
import { FileSearch, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'hin', label: 'Hindi' },
  { code: 'mar', label: 'Marathi' },
  { code: 'ben', label: 'Bengali' },
  { code: 'tam', label: 'Tamil' },
  { code: 'tel', label: 'Telugu' },
  { code: 'guj', label: 'Gujarati' },
  { code: 'urd', label: 'Urdu' },
  { code: 'pan', label: 'Punjabi' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'ara', label: 'Arabic' },
];

export function ScanPDFToText() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [language, setLanguage] = useState('eng');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [result, setResult] = useState('');
  const [confidence, setConfidence] = useState(0);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const runOCR = async () => {
    if (files.length === 0) { show('Please add a PDF', 'error'); return; }
    setStatus('processing'); setProgress(0); setResult('');

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      const { default: TesseractWorker } = await import('tesseract.js');

      const worker = await TesseractWorker.createWorker(language, 1, {
        logger: (m: any) => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); },
      });

      let allText = '';
      let totalConfidence = 0;
      let pageCount = 0;

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d'); if (!ctx) continue;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, background: '#FFFFFF' }).promise;

          const { data } = await worker.recognize(canvas);
          allText += `\n\n--- Page ${i} ---\n\n` + data.text;
          totalConfidence += data.confidence;
          pageCount++;
          setProgress(Math.round((pageCount / (pdf.numPages * files.length)) * 100));
        }
      }

      setResult(allText.trim());
      setConfidence(Math.round(totalConfidence / pageCount));
      setStatus('done');
      saveRecentActivity('scan-pdf-to-text', 'Scan PDF to Text', files.map(f => f.file.name).join(', '));
      show('Text extracted from PDF!', 'success');
      await worker.terminate();
    } catch (err) { console.error(err); show('OCR failed. Please try a clearer PDF.', 'error'); setStatus('idle'); }
  };

  const wordCount = result.trim() ? result.trim().split(/\s+/).length : 0;

  return (
    <ToolLayout icon={<FileSearch className="w-8 h-8 text-gold-400" />} title="Scan PDF to Text" description="OCR any PDF to extract searchable, editable text. Supports 14+ languages." badge="beta">
      <div className="space-y-6">
        <Dropzone accept="application/pdf" onFiles={handleFiles} files={files} onRemove={removeFile} hint="PDF files • Printed text works best" />
        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Recognition Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50">
            {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-midnight-800">{l.label}</option>)}
          </select>
        </div>
        <button onClick={runOCR} disabled={status === 'processing' || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {status === 'processing' ? <><Loader2 className="w-5 h-5 animate-spin" /> Scanning... {progress}%</> : <><Sparkles className="w-5 h-5" /> Extract Text</>}
        </button>
        {status === 'processing' && <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden"><div className="h-full progress-bar transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
        {status === 'done' && result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm text-ivory/50">
                <span>{wordCount} words</span>
                <span className="text-gold-400">Confidence: {confidence}%</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result); show('Copied!', 'success'); }} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" /> Copy</button>
                <button onClick={() => downloadBlob(new Blob([result], { type: 'text/plain' }), 'extracted-text.txt')} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Download className="w-4 h-4" /> .txt</button>
              </div>
            </div>
            <textarea value={result} onChange={e => setResult(e.target.value)} className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[200px] focus:outline-none focus:border-gold/50 resize-y" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
