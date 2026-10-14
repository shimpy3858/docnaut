import { motion } from 'framer-motion';
import { Upload, Wand2, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload',
    description: 'Drop your files into the golden dropzone. Drag and drop, or browse. Everything stays in your browser.',
    color: 'from-gold-400 to-gold-200',
  },
  {
    icon: Wand2,
    title: 'Transform',
    description: 'Choose your options and let the royal forge work its magic. All processing happens client-side, instantly.',
    color: 'from-gold-300 to-gold-500',
  },
  {
    icon: Download,
    title: 'Download',
    description: 'Get your converted files with a single click. Download individually or as a ZIP. No watermarks, no limits.',
    color: 'from-gold-500 to-gold-300',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-5xl gold-text mb-3">How It Works</h2>
        <p className="text-ivory/50 max-w-2xl mx-auto">Three simple steps to transform your files like royalty.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative glass-card gold-border rounded-2xl p-8 text-center group"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-midnight-900 border border-gold/50 flex items-center justify-center text-gold-400 text-sm font-bold font-heading z-10">
                {idx + 1}
              </div>

              {/* Animated icon */}
              <div className="relative mb-6 mt-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-gold/20`}>
                  <Icon className="w-10 h-10 text-midnight-900" />
                </div>
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              </div>

              <h3 className="font-heading text-xl text-ivory mb-2">{step.title}</h3>
              <p className="text-sm text-ivory/50 leading-relaxed">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
