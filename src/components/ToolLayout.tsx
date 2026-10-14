import { type ReactNode } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToolLayoutProps {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: 'new' | 'beta';
  children: ReactNode;
}

export function ToolLayout({ icon, title, description, badge, children }: ToolLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-ivory/60 hover:text-gold-400 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all tools
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 mb-4">
          {icon}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="font-heading text-2xl md:text-3xl gold-text">{title}</h1>
          {badge === 'beta' && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gold/20 text-gold-300 border border-gold/30">
              Beta
            </span>
          )}
        </div>
        <p className="text-ivory/50 text-sm md:text-base max-w-2xl mx-auto">{description}</p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          Your files never leave your device
        </div>
      </div>

      <div className="glass-card gold-border rounded-2xl p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
