import { useEffect, useState } from 'react';
import { HeroScene } from './HeroScene';
import { Loader2 } from 'lucide-react';

export function HeroSceneLazy({ onCrownClick }: { onCrownClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as any).deviceMemory || 4;
    setIsLowEnd(isMobile || cores <= 4 || mem <= 4);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="3" />
            <circle cx="40" cy="40" r="35" fill="none" stroke="#D4AF37" strokeWidth="3" strokeDasharray="60 220" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </div>
    );
  }

  return <HeroScene onCrownClick={onCrownClick} isLowEnd={isLowEnd} />;
}
