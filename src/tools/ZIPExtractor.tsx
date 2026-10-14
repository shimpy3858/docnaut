import { useState } from 'react';
import { FileArchive, Download, Loader2, Sparkles, File as FileIcon } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId, formatBytes } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function ZIPExtractor() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [extracted, setExtracted] = useState<{ name: string; blob: Blob }[]>([]);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const zips = newFiles.filter(f => f.name.endsWith('.zip') || f.type === 'application/zip');
    const items = zips.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const extract = async () => {
    if (files.length === 0) { show('Please add a ZIP file', 'error'); return; }
    setProcessing(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(files[0].file);
      const out: { name: string; blob: Blob }[] = [];
      const entries = Object.values(zip.files);
      for (const entry of entries) {
        if (entry.dir) continue;
        const blob = await entry.async('blob');
        out.push({ name: entry.name, blob });
      }
      setExtracted(out);
      saveRecentActivity('zip-extractor', 'ZIP Extractor', files[0].file.name);
      show(`Extracted ${out.length} files!`, 'success');
    } catch (err) { console.error(err); show('Extraction failed', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <ToolLayout icon={<FileArchive className="w-8 h-8 text-gold-400" />} title="ZIP Extractor" description="Extract files from ZIP archives. View and download individual files.">
      <div className="space-y-6">
        <Dropzone accept=".zip,application/zip" onFiles={handleFiles} files={files} onRemove={removeFile} multiple={false} hint="Upload one ZIP file" />
        <button onClick={extract} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Extracting...</> : <><Sparkles className="w-5 h-5" /> Extract Files</>}
        </button>
        {extracted.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-heading text-ivory">Extracted Files ({extracted.length})</h3>
            {extracted.map((f, idx) => (
              <div key={idx} className="glass-card rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileIcon className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span className="text-sm text-ivory/70 truncate">{f.name}</span>
                  <span className="text-xs text-ivory/30 flex-shrink-0">{formatBytes(f.blob.size)}</span>
                </div>
                <button onClick={() => downloadBlob(f.blob, f.name.split('/').pop() || 'file')} className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-sm text-gold-400 hover:bg-gold/20 transition-all flex items-center gap-1.5 flex-shrink-0"><Download className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
