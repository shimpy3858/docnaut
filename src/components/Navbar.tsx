import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Menu, X, Moon, Sun, Sparkles } from 'lucide-react';

const navLinks = [
  { label: 'Tools', href: '/#tools' },
  { label: 'Scanner', href: '/#scanner' },
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/#pricing' },
];

export function Navbar({ theme, toggleTheme }: { theme: 'dark' | 'light'; toggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.querySelector(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        document.querySelector(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-2' : 'py-4'
    }`}>
      <div className={`max-w-7xl mx-auto px-4 md:px-8 transition-all duration-500 ${
        scrolled ? 'glass-card rounded-2xl mx-4' : ''
      }`}>
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Crown className="w-7 h-7 text-gold-400 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 blur-md bg-gold-400/30 group-hover:bg-gold-400/50 transition-all" />
            </div>
            <span className="font-heading text-xl font-bold gold-text tracking-wider">DocNaut</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-ivory/70 hover:text-gold-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass-card hover:border-gold/40 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gold-400" />
              ) : (
                <Moon className="w-5 h-5 text-gold-400" />
              )}
            </button>
            <button
              onClick={() => navigate('/#tools')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold text-sm hover:shadow-lg hover:shadow-gold/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              Start Converting
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg glass-card"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5 text-gold-400" /> : <Menu className="w-5 h-5 text-gold-400" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-card rounded-2xl mx-4 mt-2 p-4"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left py-3 text-ivory/70 hover:text-gold-400 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { handleNavClick('/#tools'); }}
              className="mt-2 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Start Converting
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
