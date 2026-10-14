import { Crown, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative pt-20 pb-8 px-4 md:px-8 mt-20">
      {/* Ornamental divider */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4">
          <div className="flex-1 ornament-divider" />
          <Crown className="w-8 h-8 text-gold-400 flex-shrink-0" />
          <div className="flex-1 ornament-divider" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-gold-400" />
            <span className="font-heading text-lg gold-text">RAJKOSH</span>
          </div>
          <p className="text-sm text-ivory/40 leading-relaxed">
            Every File. One Royal Court. Your private, browser-based file toolkit.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-sm text-gold-400 mb-3">Tools</h4>
          <ul className="space-y-2 text-sm text-ivory/40">
            <li><Link to="/tools/scan-image-to-text" className="hover:text-gold-400 transition-colors">Scan Image</Link></li>
            <li><Link to="/tools/pdf-to-jpg" className="hover:text-gold-400 transition-colors">PDF to JPG</Link></li>
            <li><Link to="/tools/merge-pdf" className="hover:text-gold-400 transition-colors">Merge PDF</Link></li>
            <li><Link to="/tools/image-converter" className="hover:text-gold-400 transition-colors">Image Converter</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm text-gold-400 mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-ivory/40">
            <li><a href="/#how" className="hover:text-gold-400 transition-colors">How it works</a></li>
            <li><a href="/#why" className="hover:text-gold-400 transition-colors">Why Rajkosh</a></li>
            <li><a href="/#faq" className="hover:text-gold-400 transition-colors">FAQ</a></li>
            <li><a href="/#pricing" className="hover:text-gold-400 transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-sm text-gold-400 mb-3">Connect</h4>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-gold/40 transition-all" aria-label="GitHub">
              <Github className="w-5 h-5 text-ivory/60" />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-gold/40 transition-all" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-ivory/60" />
            </a>
            <a href="#" className="w-10 h-10 rounded-lg glass-card flex items-center justify-center hover:border-gold/40 transition-all" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 text-ivory/60" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center">
        <div className="ornament-divider mb-6" />
        <p className="text-xs text-ivory/30">
          © 2026 Rajkosh. Crafted with royal precision. Your files never leave your device.
        </p>
      </div>
    </footer>
  );
}
