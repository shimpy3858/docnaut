import { useState } from 'react';
import { FileJson, Download, Loader2, Sparkles, Copy } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function JSONtoCSV() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState('');
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const jsons = newFiles.filter(f => f.name.endsWith('.json') || f.type === 'application/json');
    const items = jsons.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const jsonToCSV = (json: any): string => {
    const data = Array.isArray(json) ? json : [json];
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
        return str;
      }).join(',')),
    ];
    return csvRows.join('\n');
  };

  const convert = async () => {
    if (files.length === 0) { show('Please add a JSON file', 'error'); return; }
    setProcessing(true);
    try {
      let csv = '';
      for (const item of files) {
        const text = await item.file.text();
        const json = JSON.parse(text);
        csv += jsonToCSV(json) + '\n';
      }
      setResult(csv.trim());
      saveRecentActivity('json-to-csv', 'JSON to CSV', files.map(f => f.file.name).join(', '));
      show('Converted to CSV!', 'success');
    } catch (err) { console.error(err); show('Invalid JSON or conversion failed', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <ToolLayout icon={<FileJson className="w-8 h-8 text-gold-400" />} title="JSON to CSV" description="Convert JSON data to CSV format. Arrays of objects are converted to rows.">
      <div className="space-y-6">
        <Dropzone accept=".json,application/json" onFiles={handleFiles} files={files} onRemove={removeFile} hint="Upload .json files" />
        <button onClick={convert} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Sparkles className="w-5 h-5" /> Convert to CSV</>}
        </button>
        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(result); show('Copied!', 'success'); }} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={() => downloadBlob(new Blob([result], { type: 'text/csv' }), 'output.csv')} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5"><Download className="w-4 h-4" /> Download CSV</button>
            </div>
            <textarea value={result} readOnly className="w-full glass-card rounded-xl p-4 text-ivory text-xs font-mono leading-relaxed min-h-[150px] focus:outline-none resize-y" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
