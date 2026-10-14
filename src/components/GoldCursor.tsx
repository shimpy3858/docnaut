import { useEffect, useRef } from 'react';

export function GoldCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;
    let raf = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mouseX}px`;
        cursorRef.current.style.top = `${mouseY}px`;
      }
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      if (trailRef.current) {
        trailRef.current.style.left = `${trailX}px`;
        trailRef.current.style.top = `${trailY}px`;
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(animate);

    document.body.classList.add('cursor-gold');

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      document.body.classList.remove('cursor-gold');
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null;
  }

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] w-3 h-3 rounded-full bg-gold-400 mix-blend-difference"
        style={{ transform: 'translate(-50%, -50%)', transition: 'opacity 0.2s' }}
      />
      <div
        ref={trailRef}
        className="fixed pointer-events-none z-[9998] w-8 h-8 rounded-full border border-gold-400/50"
        style={{ transform: 'translate(-50%, -50%)', transition: 'opacity 0.3s' }}
      />
    </>
  );
}
