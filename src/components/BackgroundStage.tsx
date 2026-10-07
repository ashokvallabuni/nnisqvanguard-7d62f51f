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
 const originOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.founder);
 const leadershipOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.leadership);
 const ctaOpacity = useTransform(scrollYProgress, frameTimeline.inputRange, frameTimeline.backgroundOpacity.cta);

 // Parallax transforms
 const yFar = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
 const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

 return (
 <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--obsidian)]">
 {/* Frame 1: Hero */}
 <motion.div style={{ opacity: heroOpacity, y: yFar }} className="absolute inset-0">
 <div className="absolute inset-0 z-0">
 <div className="w-full h-full animate-[slowScale_20s_ease-in-out_infinite_alternate] origin-center">
 <img 
 src="/hero-wolf.png" 
 alt="Hero Background" 
 className="w-full h-full object-cover object-[80%_center] opacity-90 mix-blend-lighten contrast-125"
 />
 </div>
 {/* Pulsing Eye Glow (aligned approximately to where the wolf eye is) */}
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(32,217,245,0.25)_0%,transparent_40%)] animate-[pulse_4s_ease-in-out_infinite]" />
 
 {/* Left- gradient */}
 <div className="absolute inset-0 from-[var(--obsidian)] via-[var(--obsidian)]/70 " />
 </div>
 
 {/* Subtle Cyan Particles */}
 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
 <div className="absolute w-2 h-2 rounded-full bg-[var(--cyan)] top-[20%] left-[60%] blur-[2px] animate-[float_10s_ease-in-out_infinite]" />
 <div className="absolute w-1 h-1 rounded-full bg-[var(--cyan)] top-[40%] left-[80%] blur-[1px] animate-[float_15s_ease-in-out_infinite_reverse]" />
 <div className="absolute w-3 h-3 rounded-full bg-[var(--cyan)] top-[70%] left-[70%] blur-[3px] animate-[float_12s_ease-in-out_infinite_1s]" />
 </div>

 <div className="absolute inset-0 z-10 hidden md:block">
 <Suspense fallback={null}>
 <Logo3D />
 </Suspense>
 </div>
 </motion.div>

 {/* Frame 2: Services */}
 <motion.div style={{ opacity: servicesOpacity, y: yMid }} className="absolute inset-0">
 {/* Receding perspective grid floor */}
 <div className="absolute inset-0 bg-[var(--obsidian)]">
 <div className="absolute inset-0 bottom-0 top-[40%] bg-[linear-gradient(to_right,rgba(32,217,245,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(32,217,245,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(500px)_rotateX(60deg)] [transform-origin:top] opacity-50 shadow-[inset_0_100px_100px_var(--obsidian)]" />
 <div className="absolute left-0 right-0 top-[40%] h-[1px] bg-[var(--cyan)] opacity-20 shadow-[0_0_15px_var(--cyan)]" />
 </div>
 </motion.div>

 {/* Frame 3: Founder */}
 <motion.div style={{ opacity: originOpacity }} className="absolute inset-0">
 <div className="absolute inset-0 bg-nisq-navy2">
 {/* Faint scan lines */}
 <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
 {/* Slow vertical data-stream columns (violet-tinted navy) */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
 <div className="absolute top-0 bottom-0 left-[20%] w-[1px] via-[var(--violet)]/20 " />
 <div className="absolute top-0 bottom-0 left-[80%] w-[1px] via-[var(--violet)]/20 " />
 </div>
 </motion.div>

 {/* Frame 4: Leadership */}
 <motion.div style={{ opacity: leadershipOpacity, y: yFar }} className="absolute inset-0">
 <div className="absolute inset-0 bg-[var(--obsidian)]">
 {/* Subtle drifting node-and-line network graph */}
 <div className="absolute inset-0 bg-[url('/nodes-bg.svg')] bg-cover bg-center opacity-[0.03]" />
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(32,217,245,0.03)_0%,transparent_60%)]" />
 </div>
 </motion.div>

 {/* Frame 5: CTA */}
 <motion.div style={{ opacity: ctaOpacity }} className="absolute inset-0">
 <div className="absolute inset-0 bg-[var(--obsidian)] flex items-center justify-center">
 {/* Expanding radial pulse rings */}
 <div className="absolute w-[600px] h-[600px] border border-[var(--cyan)]/5 rounded-full animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite]" />
 <div className="absolute w-[800px] h-[800px] border border-[var(--cyan)]/3 rounded-full animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
 <div className="absolute w-[1000px] h-[1000px] border border-[var(--cyan)]/2 rounded-full animate-[ping_8s_cubic-bezier(0,0,0.2,1)_infinite_4s]" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,217,245,0.05)_0%,transparent_50%)]" />
 </div>
 </motion.div>
 
 {/* 160-240px gradient bridges with faint cyan seam glow (to avoid hard borders) */}
 <div className="absolute inset-x-0 bottom-0 h-40 from-[var(--obsidian)] pointer-events-none" />
 </div>
 );
}
