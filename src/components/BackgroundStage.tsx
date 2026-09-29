import React, { Suspense } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { frameTimeline } from '@/lib/frames';

const Logo3D = React.lazy(() => import('@/components/three/LogoBackground'));

interface BackgroundStageProps {
  scrollYProgress: MotionValue<number>;
}

export function BackgroundStage({ scrollYProgress }: BackgroundStageProps) {
  // Use useTransform to map scroll progress to opacity for each scene
  const heroOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.hero);
  const servicesOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.services);
  const originOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.origin);
  const leadershipOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.leadership);
  const ctaOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.cta);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--obsidian)]">
      {/* Frame 1: Hero */}
      <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-wolf.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--obsidian)]/40 to-[var(--obsidian)]" />
        </div>
        <div className="absolute inset-0 z-10 opacity-40 mix-blend-screen hidden md:block">
          <Suspense fallback={null}>
            <Logo3D />
          </Suspense>
        </div>
      </motion.div>

      {/* Frame 2: Services */}
      <motion.div style={{ opacity: servicesOpacity }} className="absolute inset-0">
        {/* Placeholder for services background - could be a wireframe grid or similar */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,217,245,0.05)_0%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      </motion.div>

      {/* Frame 3: Origin */}
      <motion.div style={{ opacity: originOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,var(--violet)_0%,transparent_70%)] opacity-5" />
      </motion.div>

      {/* Frame 4: Leadership */}
      <motion.div style={{ opacity: leadershipOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />
      </motion.div>

      {/* Frame 5: CTA */}
      <motion.div style={{ opacity: ctaOpacity }} className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-[var(--cyan)]/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--cyan)_0%,transparent_60%)] opacity-[0.03]" />
      </motion.div>
    </div>
  );
}
