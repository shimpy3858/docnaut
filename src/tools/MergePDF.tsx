import { useState } from 'react';
import { FilePlus, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function MergePDF() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length < newFiles.length) {
      show('Only PDF files can be merged', 'error');
    }
    const items = pdfFiles.map(file => ({ file, id: generateId() }));
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

  const merge = async () => {
    if (files.length < 2) {
      show('Add at least 2 PDFs to merge', 'error');
      return;
    }

    setProcessing(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedDoc = await PDFDocument.create();

      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedDoc.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedDoc.addPage(p));
      }

      const mergedBytes = await mergedDoc.save();
      downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), 'merged.pdf');
      saveRecentActivity('merge-pdf', 'Merge PDF', files.map(f => f.file.name).join(', '));
      show('PDFs merged successfully!', 'success');
    } catch (err) {
      console.error(err);
      show('Merge failed. A PDF might be encrypted or corrupted.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<FilePlus className="w-8 h-8 text-gold-400" />}
      title="Merge PDF"
      description="Combine multiple PDF files into one. Drag to reorder pages before merging."
    >
      <div className="space-y-6">
        <Dropzone
          accept="application/pdf"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          onReorder={reorder}
          hint="PDF files only • Drag to reorder before merging"
        />

        <button
          onClick={merge}
          disabled={processing || files.length < 2}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Merging...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Merge PDFs</>
          )}
        </button>
      </div>
    </ToolLayout>
  );
}
