import { lazy, Suspense, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScanText, FileCog, Crown, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSceneLazy = lazy(() => import('@/three/HeroSceneLazy').then(m => ({ default: m.HeroSceneLazy })));

export function Hero() {
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="3" />
                <circle cx="40" cy="40" r="35" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="60 220" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        }>
          <HeroSceneLazy onCrownClick={triggerConfetti} />
        </Suspense>
      </div>

      {/* Radial glow behind content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-midnight-900/60 to-midnight-900 z-[2] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card gold-border mb-6"
        >
          <Crown className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-ivory/70 font-body">Every File. One Royal Court.</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl mb-4"
        >
          <span className="gold-text">RAJKOSH</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-ivory/70 mb-8 font-body max-w-2xl mx-auto"
        >
          The royal file toolkit. Convert, scan, and transform your files — all in your browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <button
            onClick={() => navigate('/tools/scan-image-to-text')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold text-base hover:shadow-xl hover:shadow-gold/30 transition-all hover:scale-105 flex items-center gap-2"
          >
            <ScanText className="w-5 h-5" />
            Scan a Document
          </button>
          <button
            onClick={() => navigate('/#tools')}
            className="px-8 py-3.5 rounded-xl glass-card gold-border text-ivory font-semibold text-base hover:border-gold/50 transition-all hover:scale-105 flex items-center gap-2"
          >
            <FileCog className="w-5 h-5 text-gold-400" />
            Convert a File
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-ivory/40"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            Your files never leave your device
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-gold-400" />
            No signup required
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Always free
          </span>
        </motion.div>
      </div>

      {/* Confetti easter egg */}
      {confetti && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 800}px`,
                y: `${50 + (Math.random() - 0.5) * 800}px`,
                opacity: 0,
                rotate: Math.random() * 720,
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#D4AF37', '#F5D77A', '#FFF4D1'][i % 3],
                boxShadow: '0 0 6px rgba(212,175,55,0.8)',
              }}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 rounded-full border-2 border-gold/30 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-gold-400"
          />
        </div>
      </motion.div>
    </section>
  );
}
