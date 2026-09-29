import React, { useState, useEffect } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { frameTimeline } from '@/lib/frames';

interface HUDOverlayProps {
  scrollYProgress: MotionValue<number>;
}

export function HUDOverlay({ scrollYProgress }: HUDOverlayProps) {
  const [activeFrame, setActiveFrame] = useState(0);
  
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      let current = 0;
      for (let i = 0; i < frameTimeline.hudBoundaries.length; i++) {
        if (latest >= frameTimeline.hudBoundaries[i].start && latest <= frameTimeline.hudBoundaries[i].end) {
          current = i;
          break;
        }
      }
      setActiveFrame(current);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const frameText = frameTimeline.hudBoundaries[activeFrame]?.text || "FRAME 01/05 // HERO";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Top Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--cyan)] origin-left shadow-[0_0_10px_var(--cyan)]"
        style={{ scaleX }}
      />


      {/* Cyan corner brackets HUD style */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--cyan)]/40" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--cyan)]/40" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--cyan)]/40" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--cyan)]/40" />

      {/* Right Edge Dot Nav */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
        {frameTimeline.hudBoundaries.map((frame, i) => (
          <div key={i} className="relative group">
            <button 
              aria-label={`Scroll to ${frame.text.split('//')[1]?.trim() || frame.text}`}
              onClick={() => {
                const target = i === 0 ? 0 : 
                               i === 1 ? 0.22 : 
                               i === 2 ? 0.44 : 
                               i === 3 ? 0.64 : 1.0;
                window.scrollTo({ top: document.body.scrollHeight * target, behavior: 'smooth' });
              }}
              className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === activeFrame 
                  ? 'bg-[var(--cyan)] scale-150 shadow-[0_0_8px_var(--cyan)]' 
                  : 'bg-[var(--line)] group-hover:bg-[var(--chrome)]'
              }`} 
            />
            {/* Tooltip */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-2 py-1 bg-[var(--obsidian)]/80 backdrop-blur border border-[var(--line)] text-[var(--chrome)] font-mono text-[10px] tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded">
              {frame.text.split('//')[1]?.trim() || frame.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
