import { useState } from 'react';
import { CaseSensitive, Copy, Download } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob } from '@/utils/fileUtils';

export function CaseConverter() {
  const [text, setText] = useState('');
  const { show } = useToast();

  const conversions = [
    { label: 'UPPERCASE', fn: (t: string) => t.toUpperCase() },
    { label: 'lowercase', fn: (t: string) => t.toLowerCase() },
    { label: 'Title Case', fn: (t: string) => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
    { label: 'Sentence case', fn: (t: string) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) },
    { label: 'camelCase', fn: (t: string) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { label: 'snake_case', fn: (t: string) => t.trim().toLowerCase().replace(/\s+/g, '_') },
    { label: 'kebab-case', fn: (t: string) => t.trim().toLowerCase().replace(/\s+/g, '-') },
    { label: 'InVeRsE', fn: (t: string) => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  ];

  return (
    <ToolLayout icon={<CaseSensitive className="w-8 h-8 text-gold-400" />} title="Case Converter" description="Convert text between uppercase, lowercase, title case, camelCase, snake_case, and more.">
      <div className="space-y-6">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste text to convert..."
          className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[150px] focus:outline-none focus:border-gold/50 resize-y"
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {conversions.map((conv, idx) => (
            <button key={idx} onClick={() => { setText(conv.fn(text)); show(`Converted to ${conv.label}`, 'success'); }}
              className="px-3 py-2.5 rounded-xl glass-card text-sm text-ivory/70 hover:text-gold-400 hover:border-gold/40 transition-all">
              {conv.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(text); show('Copied!', 'success'); }} className="px-4 py-2 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"><Copy className="w-4 h-4" /> Copy</button>
          <button onClick={() => downloadBlob(new Blob([text], { type: 'text/plain' }), 'text.txt')} className="px-4 py-2 rounded-lg glass-card text-sm text-ivory hover:text-gold-400 hover:border-gold/40 transition-all flex items-center gap-2"><Download className="w-4 h-4" /> Download</button>
        </div>
      </div>
    </ToolLayout>
  );
}
