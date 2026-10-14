import { useState, useMemo } from 'react';
import { BookOpen, Copy, Download } from 'lucide-react';
import { ToolLayout } from '@/components/ToolLayout';
import { useToast } from '@/components/ToastProvider';
import { downloadBlob } from '@/utils/fileUtils';

export function WordCounter() {
  const [text, setText] = useState('');
  const { show } = useToast();

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0;
    const readingTime = Math.ceil(words / 200);
    return { words, chars, charsNoSpace, sentences, paragraphs, readingTime };
  }, [text]);

  const statCards = [
    { label: 'Words', value: stats.words },
    { label: 'Characters', value: stats.chars },
    { label: 'Characters (no spaces)', value: stats.charsNoSpace },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Reading time', value: `${stats.readingTime} min` },
  ];

  return (
    <ToolLayout icon={<BookOpen className="w-8 h-8 text-gold-400" />} title="Word Counter" description="Count words, characters, sentences, paragraphs, and estimated reading time.">
      <div className="space-y-6">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full glass-card rounded-xl p-4 text-ivory text-sm leading-relaxed min-h-[200px] focus:outline-none focus:border-gold/50 resize-y"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map((stat, idx) => (
            <div key={idx} className="glass-card rounded-xl p-4 text-center">
              <p className="font-heading text-2xl gold-text">{stat.value}</p>
              <p className="text-xs text-ivory/40 mt-1">{stat.label}</p>
            </div>
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
