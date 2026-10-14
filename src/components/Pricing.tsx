import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';

const tiers = [
  {
    name: 'Citizen',
    price: 'Free',
    tagline: 'For everyone, always.',
    features: ['All tools included', 'Unlimited conversions', 'No signup required', 'Works offline (PWA)', 'No watermarks', '100% private'],
    highlighted: true,
  },
  {
    name: 'Royal',
    price: 'Free',
    tagline: 'Same as Citizen. Everything is free.',
    features: ['Priority processing queue (soon)', 'Early access to new tools', 'Royal badge (soon)', 'Cloud sync (soon)'],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-5xl gold-text mb-3">Pricing</h2>
        <p className="text-ivory/50">Everything is free. Always. No hidden costs.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {tiers.map((tier, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`relative rounded-2xl p-8 ${
              tier.highlighted
                ? 'glass-card gold-border gold-glow'
                : 'glass-card'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 text-xs font-bold">
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-gold-400" />
              <h3 className="font-heading text-xl text-ivory">{tier.name}</h3>
            </div>
            <p className="text-sm text-ivory/40 mb-4">{tier.tagline}</p>
            <p className="font-heading text-4xl gold-text mb-6">{tier.price}</p>

            <ul className="space-y-3">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ivory/60">
                  <Check className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
