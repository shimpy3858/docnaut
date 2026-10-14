import { motion } from 'framer-motion';
import { ShieldCheck, UserX, Infinity as InfinityIcon, Zap, WifiOff, Crown } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: '100% Private', description: 'All processing happens in your browser. Your files never leave your device.' },
  { icon: UserX, title: 'No Signup', description: 'No account needed. No email. No tracking. Just open and use.' },
  { icon: InfinityIcon, title: 'Unlimited', description: 'Convert as many files as you want. No daily limits, no quotas, no watermarks.' },
  { icon: Zap, title: 'Lightning Fast', description: 'WebAssembly-powered processing means instant results without server round-trips.' },
  { icon: WifiOff, title: 'Works Offline', description: 'Install as a PWA and use it without internet. Your royal toolkit, anywhere.' },
  { icon: Crown, title: 'Award-Worthy Design', description: 'Crafted with obsessive attention to detail. A premium experience, completely free.' },
];

export function WhyRajkosh() {
  return (
    <section id="why" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-5xl gold-text mb-3">Why Rajkosh</h2>
        <p className="text-ivory/50 max-w-2xl mx-auto">Built for those who demand both power and privacy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-card rounded-2xl p-6 hover:border-gold/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-all">
                  <Icon className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-ivory mb-1">{feature.title}</h3>
                  <p className="text-sm text-ivory/50 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
