import { useState } from 'react';
import { FileMinus, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, downloadAsZip, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

type SplitMode = 'each' | 'ranges';

export function SplitPDF() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [mode, setMode] = useState<SplitMode>('each');
  const [ranges, setRanges] = useState('1-2, 3-5');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const parseRanges = (str: string): { start: number; end: number }[] => {
    return str.split(',').map(part => {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [s, e] = trimmed.split('-').map(n => parseInt(n.trim()));
        return { start: s, end: e };
      }
      const n = parseInt(trimmed);
      return { start: n, end: n };
    }).filter(r => !isNaN(r.start) && !isNaN(r.end) && r.start > 0 && r.end >= r.start);
  };

  const split = async () => {
    if (files.length !== 1) {
      show('Please add exactly one PDF to split', 'error');
      return;
    }

    setProcessing(true);
    setResults([]);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await files[0].file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      const parts: { name: string; blob: Blob }[] = [];

      if (mode === 'each') {
        for (let i = 0; i < totalPages; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const out = await newDoc.save();
          parts.push({ name: `page_${i + 1}.pdf`, blob: new Blob([out], { type: 'application/pdf' }) });
        }
      } else {
        const parsed = parseRanges(ranges);
        if (parsed.length === 0) {
          show('Invalid range format. Example: 1-3, 5, 7-9', 'error');
          setProcessing(false);
          return;
        }

        for (let i = 0; i < parsed.length; i++) {
          const { start, end } = parsed[i];
          const pageIndices = [];
          for (let p = start - 1; p < Math.min(end, totalPages); p++) {
            pageIndices.push(p);
          }
          if (pageIndices.length === 0) continue;
          const newDoc = await PDFDocument.create();
          const pages = await newDoc.copyPages(srcDoc, pageIndices);
          pages.forEach(p => newDoc.addPage(p));
          const out = await newDoc.save();
          const label = start === end ? `page_${start}` : `pages_${start}-${end}`;
          parts.push({ name: `${label}.pdf`, blob: new Blob([out], { type: 'application/pdf' }) });
        }
      }

      setResults(parts);
      saveRecentActivity('split-pdf', 'Split PDF', files[0].file.name);
      show(`Split into ${parts.length} files!`, 'success');
    } catch (err) {
      console.error(err);
      show('Split failed. The PDF might be encrypted.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<FileMinus className="w-8 h-8 text-gold-400" />}
      title="Split PDF"
      description="Split a PDF by individual pages or custom page ranges."
    >
      <div className="space-y-6">
        <Dropzone
          accept="application/pdf"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          multiple={false}
          hint="Upload one PDF to split"
        />

        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Split Mode</label>
          <div className="flex gap-3">
            <button
              onClick={() => setMode('each')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'each'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900'
                  : 'glass-card text-ivory/60'
              }`}
            >
              Every page
            </button>
            <button
              onClick={() => setMode('ranges')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'ranges'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900'
                  : 'glass-card text-ivory/60'
              }`}
            >
              By ranges
            </button>
          </div>
        </div>

        {mode === 'ranges' && (
          <div>
            <label className="block text-sm text-ivory/60 mb-2 font-heading">Page Ranges</label>
            <input
              type="text"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-3, 5, 7-9"
              className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50"
            />
            <p className="text-xs text-ivory/30 mt-1">Use commas to separate ranges. Example: 1-3, 5, 7-9</p>
          </div>
        )}

        <button
          onClick={split}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Splitting...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Split PDF</>
          )}
        </button>

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-ivory">Results ({results.length})</h3>
              {results.length > 1 && (
                <button
                  onClick={() => downloadAsZip(results, 'split-pdf.zip')}
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
                  <button
                    onClick={() => downloadBlob(r.blob, r.name)}
                    className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
