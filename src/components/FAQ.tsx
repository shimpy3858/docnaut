import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Are my files safe?', a: 'Absolutely. All file processing happens entirely in your browser using WebAssembly and JavaScript. Your files never leave your device — they are never uploaded to any server.' },
  { q: 'Do I need to create an account?', a: 'No. DocNaut requires no signup, no email, and no personal information. Just open the site and start using any tool immediately.' },
  { q: 'Is it really free?', a: 'Yes, completely free with no limits. No daily quotas, no watermarks, no hidden fees. Every tool is available to everyone.' },
  { q: 'Does it work offline?', a: 'Yes! DocNaut is a PWA (Progressive Web App). You can install it on your device and use most tools without an internet connection.' },
  { q: 'What file types are supported?', a: 'We support PDF, JPG, PNG, WebP, GIF, BMP, TIFF, SVG, Word documents, CSV, Excel, JSON, and more. New formats are added regularly.' },
  { q: 'Is there a file size limit?', a: 'We recommend keeping files under 100MB for best performance. Since processing is client-side, your device\'s RAM is the main constraint.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 px-4 md:px-8 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-5xl gold-text mb-3">FAQ</h2>
        <p className="text-ivory/50">Questions answered with royal clarity.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-card rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              aria-expanded={open === idx}
            >
              <span className="font-heading text-base text-ivory">{faq.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-gold-400 flex-shrink-0 transition-transform duration-300 ${
                  open === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            <AnimatePresence>
              {open === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-5 pb-4 text-sm text-ivory/50 leading-relaxed">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
