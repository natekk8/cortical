import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";

export function BackgroundBubble() {
  const [inactive, setInactive] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      setInactive(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setInactive(true);
      }, 3000);
    };

    // Initial timer
    timeout = setTimeout(() => setInactive(true), 3000);

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  const bubbles = [
    { delay: 0, duration: 15, x: 0, y: 0, size: 'w-[40vw] h-[40vw]', opacity: 'rgba(255,255,255,0.05)' },
    { delay: 2, duration: 20, x: 200, y: -100, size: 'w-[30vw] h-[30vw]', opacity: 'rgba(255,255,255,0.03)' },
    { delay: 4, duration: 25, x: -150, y: 150, size: 'w-[35vw] h-[35vw]', opacity: 'rgba(255,255,255,0.04)' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <svg className="hidden">
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      <AnimatePresence>
        {inactive && (
          <>
            {bubbles.map((bubble, idx) => (
              <motion.div
                key={`bubble-${idx}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: bubble.delay * 0.2 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${bubble.size} rounded-full`}
                style={{
                  background: theme === 'dark' 
                    ? `radial-gradient(circle, ${bubble.opacity} 0%, rgba(255,255,255,0) 70%)`
                    : `radial-gradient(circle, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 70%)`,
                  filter: 'url(#noise) blur(50px)',
                }}
              >
                <motion.div
                  animate={{
                    x: [0, 100 + bubble.x, -80 + bubble.x, 0],
                    y: [0, -80 + bubble.y, 100 + bubble.y, 0],
                  }}
                  transition={{
                    duration: bubble.duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay: bubble.delay,
                  }}
                  className="w-full h-full rounded-full"
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
