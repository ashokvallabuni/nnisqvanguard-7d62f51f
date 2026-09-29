import React, { useState, useEffect } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface HUDOverlayProps {
  scrollYProgress: MotionValue<number>;
}

const frames = [
  { id: '01', name: 'HERO', boundary: 0 },
  { id: '02', name: 'SERVICES', boundary: 0.2 },
  { id: '03', name: 'ORIGIN', boundary: 0.4 },
  { id: '04', name: 'LEADERSHIP', boundary: 0.6 },
  { id: '05', name: 'CTA', boundary: 0.8 },
];

export function HUDOverlay({ scrollYProgress }: HUDOverlayProps) {
  const [activeFrame, setActiveFrame] = useState(0);
  
  // Create a spring configuration for smoother progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      let current = 0;
      for (let i = frames.length - 1; i >= 0; i--) {
        if (latest >= frames[i].boundary - 0.05) {
          current = i;
          break;
        }
      }
      setActiveFrame(current);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Top Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--cyan)] origin-left shadow-[0_0_10px_var(--cyan)]"
        style={{ scaleX }}
      />

      {/* Top Left Readout */}
      <div className="absolute top-6 left-6 font-mono text-xs tracking-widest uppercase">
        <span className="text-[var(--chrome)]/50">SYS.OP.{frames[activeFrame].id} // </span>
        <span className="text-[var(--cyan)] font-bold">{frames[activeFrame].name}</span>
      </div>

      {/* Right Edge Dot Nav */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {frames.map((frame, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === activeFrame 
                ? 'bg-[var(--cyan)] scale-150 shadow-[0_0_8px_var(--cyan)]' 
                : 'bg-[var(--line)]'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
