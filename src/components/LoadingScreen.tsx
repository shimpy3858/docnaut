import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-midnight-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <Crown className="w-16 h-16 text-gold-400 animate-float" />
            <div className="absolute inset-0 blur-xl bg-gold-400/40" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-3xl gold-text mb-2 tracking-wider"
        >
          DocNaut
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-ivory/40 mb-8"
        >
          Every File. One Place.
        </motion.p>

        <div className="relative w-16 h-16 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="50 175" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
}
