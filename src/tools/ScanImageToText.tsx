import { useState, useRef } from 'react';
import { ScanText, Copy, Download, FileText, Loader2, Sparkles } from 'lucide-react';
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

export function ScanImageToText() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [language, setLanguage] = useState('eng');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [result, setResult] = useState('');
  const [confidence, setConfidence] = useState(0);
  const { show } = useToast();
  const workerRef = useRef<any>(null);

  const handleFiles = async (newFiles: File[]) => {
    const items: FileItem[] = await Promise.all(
      newFiles.map(async (file) => {
        const preview = file.type.startsWith('image/') ? await getImagePreview(file) : '';
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
  };

  const getImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const runOCR = async () => {
    if (files.length === 0) {
      show('Please add at least one image', 'error');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setResult('');

    try {
      const { default: TesseractWorker } = await import('tesseract.js');
      const worker = await TesseractWorker.createWorker(language, 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      workerRef.current = worker;

      let allText = '';
      let totalConfidence = 0;

      for (let i = 0; i < files.length; i++) {
        if (!files[i].file.type.startsWith('image/')) continue;
        const { data } = await worker.recognize(files[i].file);
        allText += (i > 0 ? '\n\n--- Page ' + (i + 1) + ' ---\n\n' : '') + data.text;
        totalConfidence += data.confidence;
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setResult(allText.trim());
      setConfidence(Math.round(totalConfidence / files.length));
      setStatus('done');
      saveRecentActivity('scan-image-to-text', 'Scan Image to Text', files.map(f => f.file.name).join(', '));
      show('Text extracted successfully!', 'success');

      await worker.terminate();
    } catch (err) {
      console.error(err);
      show('OCR failed. Please try a clearer image.', 'error');
      setStatus('idle');
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(result);
    show('Copied to clipboard', 'success');
  };

  const downloadTxt = () => {
    downloadBlob(new Blob([result], { type: 'text/plain' }), 'extracted-text.txt');
  };

  const wordCount = result.trim() ? result.trim().split(/\s+/).length : 0;
  const charCount = result.length;

  return (
    <ToolLayout
      icon={<ScanText className="w-8 h-8 text-gold-400" />}
      title="Scan Image to Text"
      description="Extract text from images using on-device OCR. Supports 14+ languages. Printed text works best."
      badge="beta"
    >
      <div className="space-y-6">
        <Dropzone
          accept="image/*"
          onFiles={handleFiles}
          files={files}
          onRemove={removeFile}
          hint="PNG, JPG, WebP, BMP • Printed text works best"
        />

        {/* Language selector */}
        <div>
          <label className="block text-sm text-ivory/60 mb-2 font-heading">Recognition Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="glass-card rounded-xl px-4 py-3 text-ivory w-full focus:outline-none focus:border-gold/50"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-midnight-800 text-ivory">
                {lang.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ivory/30 mt-1">First scan with a language may take a few seconds to load language data.</p>
        </div>

        <button
          onClick={runOCR}
          disabled={status === 'processing' || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {status === 'processing' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Scanning... {progress}%
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Extract Text
            </>
          )}
        </button>

        {status === 'processing' && (
          <div className="w-full h-2 bg-midnight-700 rounded-full overflow-hidden">
            <div className="h-full progress-bar transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {status === 'done' && result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-sm text-ivory/50">
                <span>{wordCount} words</span>
                <span>{charCount} characters</span>
                <span className="text-gold-400">Confidence: {confidence}%</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyText} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button onClick={downloadTxt} className="px-3 py-1.5 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> .txt
                </button>
              </div>
            </div>

            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[200px] focus:outline-none focus:border-gold/50 resize-y"
              placeholder="Extracted text will appear here..."
            />

            <div className="text-xs text-ivory/30 bg-gold/5 border border-gold/10 rounded-lg p-3">
              Tip: Printed text gives the best results. For handwriting, results may vary.
              Download as .docx and searchable PDF options are available in the full scanner.
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
