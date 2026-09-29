export const frameTimeline = {
  // scrollYProgress values that define the start and end of each frame
  // Frame 1: Hero (0.0 to 0.2)
  // Frame 2: Services (0.2 to 0.4)
  // Frame 3: Origin (0.4 to 0.6)
  // Frame 4: Leadership (0.6 to 0.8)
  // Frame 5: CTA/Footer (0.8 to 1.0)
  
  // These represent the exact scrollYProgress at the exact center/active state of each frame
  stops: [0.1, 0.3, 0.5, 0.7, 0.9],
  
  // The actual scroll boundaries (for threshold detection)
  boundaries: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],

  // Background Opacity/Transition Arrays for useTransform
  // For each frame, we can define an array of values corresponding to boundaries
  // Example: Hero background should be opacity 1 between 0-0.2, then fade out
  backgroundOpacity: {
    hero:       [1, 1, 0, 0, 0, 0],
    services:   [0, 0.5, 1, 0.5, 0, 0],
    origin:     [0, 0, 0.5, 1, 0.5, 0],
    leadership: [0, 0, 0, 0.5, 1, 0.5],
    cta:        [0, 0, 0, 0, 0.5, 1],
  },
  
  // Corresponding input points matching the opacity array length
  inputRange: [0, 0.1, 0.3, 0.5, 0.7, 0.9]
};
