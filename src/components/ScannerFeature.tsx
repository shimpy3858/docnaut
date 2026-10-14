import { motion } from 'framer-motion';
import { Scanner, ShieldCheck, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tools } from '@/config/tools';

export function ScannerFeature() {
  const navigate = useNavigate();
  const scannerTools = tools.filter((t) => t.category === 'scanner');

  return (
    <section id="scanner" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="glass-card gold-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 mb-4">
              <Scanner className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-ivory/70">Smart Scanner</span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl gold-text mb-4">
              Scan Anything, Anywhere
            </h2>
            <p className="text-ivory/60 mb-6 leading-relaxed">
              Turn your browser into a royal scanning chamber. Extract text from images and PDFs in 14+ languages,
              scan documents live with your camera, or decode QR codes — all privately, right on your device.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: Globe, text: '14+ languages: English, Hindi, Bengali, Tamil, Arabic, and more' },
                { icon: ShieldCheck, text: '100% client-side OCR via Tesseract.js — no cloud, no upload' },
                { icon: Scanner, text: 'Live camera scan with edge detection (Beta)' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gold-400" />
                    </div>
                    <span className="text-sm text-ivory/60">{item.text}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/tools/scan-image-to-text')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold/30 transition-all hover:scale-105"
            >
              Start Scanning
            </button>
          </div>

          <div className="space-y-3">
            {scannerTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(tool.route)}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-gold/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-gold-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-ivory font-heading text-sm">{tool.title}</h3>
                      {tool.badge === 'beta' && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-gold/20 text-gold-300 border border-gold/30">Beta</span>
                      )}
                    </div>
                    <p className="text-xs text-ivory/40 mt-0.5">{tool.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
