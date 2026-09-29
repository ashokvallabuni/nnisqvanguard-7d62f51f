export const frameTimeline = {
  // scrollYProgress values that define the boundaries of each frame
  // F1 Hero (0-20% scroll)
  // F2 Services (20-42%)
  // F3 Founder (42-62%)
  // F4 Leadership (62-82%)
  // F5 CTA (82-100%)
  
  // 8% overlap crossfade:
  // e.g. F1 to F2 crossfade happens from 0.16 to 0.24 (center at 0.20)
  
  inputRange: [0, 0.16, 0.24, 0.38, 0.46, 0.58, 0.66, 0.78, 0.86, 1],

  backgroundOpacity: {
    // 1 during F1, fades out 0.16 -> 0.24
    hero:       [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    
    // Fades in 0.16 -> 0.24, stays 1 during F2, fades out 0.38 -> 0.46
    services:   [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    
    // Fades in 0.38 -> 0.46, stays 1 during F3, fades out 0.58 -> 0.66
    founder:    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    
    // Fades in 0.58 -> 0.66, stays 1 during F4, fades out 0.78 -> 0.86
    leadership: [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
    
    // Fades in 0.78 -> 0.86, stays 1 during F5
    cta:        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  },
  
  // HUD text changes at exactly the 20%, 42%, 62%, 82% boundaries
  hudBoundaries: [
    { start: 0, end: 0.2, text: "FRAME 01/05 // HERO" },
    { start: 0.2, end: 0.42, text: "FRAME 02/05 // SERVICES" },
    { start: 0.42, end: 0.62, text: "FRAME 03/05 // FOUNDER" },
    { start: 0.62, end: 0.82, text: "FRAME 04/05 // LEADERSHIP" },
    { start: 0.82, end: 1.0, text: "FRAME 05/05 // CTA" },
  ]
};
