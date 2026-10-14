import { useState } from 'react';
import { FileText, Copy, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function PDFToText() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('');
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const extract = async () => {
    if (files.length === 0) { show('Please add a PDF', 'error'); return; }
    setProcessing(true);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      let allText = '';
      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => item.str).join(' ');
          allText += text + '\n\n';
        }
      }
      setResult(allText.trim());
      saveRecentActivity('pdf-to-text', 'PDF to Text', files.map(f => f.file.name).join(', '));
      show('Text extracted!', 'success');
    } catch (err) { console.error(err); show('Extraction failed. The PDF might be scanned (no text layer).', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <ToolLayout icon={<FileText className="w-8 h-8 text-gold-400" />} title="PDF to Text" description="Extract text content from any PDF with a text layer.">
      <div className="space-y-6">
        <Dropzone accept="application/pdf" onFiles={handleFiles} files={files} onRemove={removeFile} hint="PDF files • Scanned PDFs need the OCR scanner" />
        <button onClick={extract} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</> : <><Sparkles className="w-5 h-5" /> Extract Text</>}
        </button>
        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(result); show('Copied!', 'success'); }} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={() => downloadBlob(new Blob([result], { type: 'text/plain' }), 'extracted-text.txt')} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Download className="w-4 h-4" /> .txt</button>
            </div>
            <textarea value={result} onChange={e => setResult(e.target.value)} className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[200px] focus:outline-none focus:border-gold/50 resize-y" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
