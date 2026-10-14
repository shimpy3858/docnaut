import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tools, categories, type ToolCategory } from '@/config/tools';
import { TiltCard } from '@/components/TiltCard';

export function ToolsGrid() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const catMatch = activeCategory === 'all' || t.category === activeCategory;
      const searchMatch = t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.description.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [activeCategory, search]);

  return (
    <section id="tools" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-5xl gold-text mb-3">The Royal Arsenal</h2>
        <p className="text-ivory/50 max-w-2xl mx-auto">
          Every tool you need to transform your files — all running privately in your browser.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-400/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full glass-card rounded-xl pl-12 pr-4 py-3 text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold/50 transition-all"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-gold-500 to-gold-300 text-midnight-900 shadow-lg shadow-gold/20'
                : 'glass-card text-ivory/60 hover:text-gold-400 hover:border-gold/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeCategory + search}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((tool, idx) => (
            <TiltCard key={tool.id} tool={tool} index={idx} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="text-center text-ivory/40 py-12">No tools found. Try a different search.</p>
      )}
    </section>
  );
}
