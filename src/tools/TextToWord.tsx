import { useState } from 'react';
import { FileType, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function TextToWord() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const txts = newFiles.filter(f => f.type === 'text/plain' || f.name.endsWith('.txt'));
    const items = txts.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const convert = async () => {
    if (files.length === 0) { show('Please add a text file', 'error'); return; }
    setProcessing(true);
    try {
      // Generate a minimal .docx using a simple HTML-to-blob approach
      // .docx is a zip format; we'll create a basic Word-compatible HTML file with .doc extension
      // which Word can open, or create a proper docx structure
      for (const item of files) {
        const text = await item.file.text();
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${item.file.name}</title></head>
<body style="font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5;">
${text.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
</body></html>`;
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        downloadBlob(new Blob([html], { type: 'application/msword' }), `${baseName}.doc`);
      }
      saveRecentActivity('text-to-word', 'Text to Word', files.map(f => f.file.name).join(', '));
      show('Word document created!', 'success');
    } catch (err) { console.error(err); show('Conversion failed', 'error'); }
    finally { setProcessing(false); }
  };

  return (
    <ToolLayout icon={<FileType className="w-8 h-8 text-gold-400" />} title="Text to Word" description="Convert plain text files to Word documents (.doc format).">
      <div className="space-y-6">
        <Dropzone accept=".txt,text/plain" onFiles={handleFiles} files={files} onRemove={removeFile} hint="Upload .txt files" />
        <button onClick={convert} disabled={processing || files.length === 0} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Sparkles className="w-5 h-5" /> Convert to Word</>}
        </button>
      </div>
    </ToolLayout>
  );
}
