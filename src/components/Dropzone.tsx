import { useCallback, useRef, useState, type ReactNode } from 'react';
import { UploadCloud, X, FileText, ImageIcon, GripVertical } from 'lucide-react';

interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  files: FileItem[];
  onRemove: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  maxSizeLabel?: string;
  hint?: string;
}

export interface FileItem {
  file: File;
  id: string;
  preview?: string;
}

export function Dropzone({
  accept = '*',
  multiple = true,
  onFiles,
  files,
  onRemove,
  onReorder,
  maxSizeLabel = '100MB per file',
  hint,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) onFiles(dropped);
  }, [onFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleReorder = (from: number, to: number) => {
    if (onReorder) onReorder(from, to);
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300
          ${dragging ? 'drag-glow bg-gold/5' : 'border-gold/30 hover:border-gold/50 hover:bg-gold/5'}
          bg-midnight-800/50 backdrop-blur-sm`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload files by clicking or dragging"
        onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onFiles(Array.from(e.target.files));
            e.target.value = '';
          }}
        />
        <UploadCloud className="mx-auto w-14 h-14 text-gold-400 mb-4 animate-float" />
        <p className="font-heading text-lg text-ivory mb-1">Drop your files here</p>
        <p className="text-sm text-ivory/50">
          or <span className="text-gold-400 font-semibold">browse</span> to select
        </p>
        <p className="text-xs text-ivory/30 mt-2">
          {hint || `Max ${maxSizeLabel} • Your files never leave your device`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, idx) => (
            <div
              key={item.id}
              className="glass-card rounded-xl p-3 flex items-center gap-3 group"
              draggable
              onDragStart={() => { dragItem.current = idx; }}
              onDragEnter={() => { dragOverItem.current = idx; }}
              onDragEnd={() => {
                if (dragItem.current !== null && dragOverItem.current !== null) {
                  handleReorder(dragItem.current, dragOverItem.current);
                }
                dragItem.current = null;
                dragOverItem.current = null;
              }}
            >
              {onReorder && (
                <GripVertical className="w-4 h-4 text-gold-400/50 cursor-grab flex-shrink-0" />
              )}
              {item.preview ? (
                <img src={item.preview} alt={item.file.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  {item.file.type.startsWith('image/') ? (
                    <ImageIcon className="w-5 h-5 text-gold-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-gold-400" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ivory truncate">{item.file.name}</p>
                <p className="text-xs text-ivory/40">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                className="p-1.5 rounded-lg text-ivory/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
