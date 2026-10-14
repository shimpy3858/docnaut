import { type ReactNode } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dropzone, type FileItem } from '@/components/Dropzone';
import { useToast } from '@/components/ToastProvider';
import { generateId } from '@/utils/fileUtils';

interface GenericToolProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: 'new' | 'beta';
  accept?: string;
  actionLabel?: string;
  onProcess?: (files: FileItem[]) => Promise<void>;
  children?: ReactNode;
}

export function GenericTool({
  icon, title, description, badge, accept = '*', actionLabel = 'Process Files', onProcess, children,
}: GenericToolProps) {
  const navigate = useNavigate();
  const { show } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = async (newFiles: File[]) => {
    const items: FileItem[] = await Promise.all(
      newFiles.map(async (file) => {
        let preview = '';
        if (file.type.startsWith('image/')) {
          preview = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
        return { file, id: generateId(), preview };
      })
    );
    setFiles((prev) => [...prev, ...items]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleProcess = async () => {
    if (files.length === 0) { show('Please add files first', 'error'); return; }
    if (onProcess) {
      setProcessing(true);
      try { await onProcess(files); } catch { show('Processing failed', 'error'); }
      finally { setProcessing(false); }
    } else {
      show('This tool is coming soon', 'info');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-ivory/60 hover:text-gold-400 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-4">{icon}</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="font-heading text-2xl md:text-3xl gold-text">{title}</h1>
          {badge === 'beta' && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gold/20 text-gold-300 border border-gold/30">Beta</span>}
        </div>
        <p className="text-ivory/50 text-sm md:text-base max-w-2xl mx-auto">{description}</p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" /> Your files never leave your device
        </div>
      </div>

      <div className="glass-card gold-border rounded-2xl p-6 md:p-8 space-y-6">
        <Dropzone accept={accept} onFiles={handleFiles} files={files} onRemove={removeFile} />
        {children}
        <button
          onClick={handleProcess}
          disabled={processing || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2"
        >
          {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Sparkles className="w-5 h-5" /> {actionLabel}</>}
        </button>
      </div>
    </div>
  );
}
