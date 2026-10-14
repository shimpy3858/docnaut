import { useState, useEffect } from 'react';
import { Repeat, Download, Loader2, Sparkles } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob, generateId } from '@/utils/fileUtils';
import { saveRecentActivity } from '@/utils/recentActivity';

export function RotatePDF() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [angle, setAngle] = useState(90);
  const [processing, setProcessing] = useState(false);
  const { show } = useToast();

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    const items = pdfs.map(file => ({ file, id: generateId() }));
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const rotate = async () => {
    if (files.length === 0) { show('Please add a PDF', 'error'); return; }
    setProcessing(true);
    try {
      const { degrees } = await import('pdf-lib');
      const { PDFDocument } = await import('pdf-lib');
      const bytes = await files[0].file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      pages.forEach(page => {
        const current = page.getRotation().angle || 0;
        page.setRotation(degrees((current + angle) % 360));
      });
      const out = await doc.save();
      downloadBlob(new Blob([out], { type: 'application/pdf' }), 'rotated.pdf');
      saveRecentActivity('rotate-pdf', 'Rotate PDF', files[0].file.name);
      show('PDF rotated successfully!', 'success');
    } catch (err) {
      console.error(err);
      show('Rotation failed. The PDF might be encrypted.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      icon={<Repeat className="w-8 h-8 text-gold-400" />}
      title="Rotate PDF"
      description="Rotate all pages in a PDF by 90, 180, or 270 degrees."
    >
      <div className="space-y-6">
        <Dropzone accept="application/pdf" onFiles={handleFiles} files={files} onRemove={removeFile} multiple={false} hint="Upload one PDF to rotate" />
        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Rotation Angle</label>
          <div className="flex gap-3">
            {[90, 180, 270].map(a => (
              <button key={a} onClick={() => setAngle(a)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${angle === a ? 'bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900' : 'glass-card text-ivory/60'}`}>
                {a}°
              </button>
            ))}
          </div>
        </div>
        <button onClick={rotate} disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2">
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Rotating...</> : <><Sparkles className="w-5 h-5" /> Rotate PDF</>}
        </button>
      </div>
    </ToolLayout>
  );
}
