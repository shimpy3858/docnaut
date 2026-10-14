import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Tool } from '@/config/tools';

export function TiltCard({ tool, index }: { tool: Tool; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const navigate = useNavigate();
  const Icon = tool.icon;

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={{ perspective: 1000 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(tool.route)}
        className="glass-card gold-border rounded-2xl p-6 cursor-pointer transition-transform duration-200 group relative overflow-hidden"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate(tool.route); }}
        aria-label={`Open ${tool.title}`}
      >
        {/* Glare overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(245,215,122,0.15), transparent 50%)`,
          }}
        />

        {/* Icon */}
        <div className="relative mb-4" style={{ transform: 'translateZ(40px)' }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center group-hover:from-gold/30 group-hover:to-gold/10 transition-all">
            <Icon className="w-7 h-7 text-gold-400 group-hover:scale-110 transition-transform" />
          </div>
          {tool.badge === 'beta' && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-gold/20 text-gold-300 border border-gold/30">
              Beta
            </span>
          )}
        </div>

        <h3 className="font-heading text-lg text-ivory mb-1 group-hover:gold-text transition-all" style={{ transform: 'translateZ(30px)' }}>
          {tool.title}
        </h3>
        <p className="text-sm text-ivory/50 leading-relaxed" style={{ transform: 'translateZ(20px)' }}>
          {tool.description}
        </p>

        {/* Hover glow */}
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}
