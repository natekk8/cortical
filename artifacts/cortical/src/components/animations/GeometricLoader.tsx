import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GeometricLoaderProps {
  model: "lite" | "max";
}

const MAX_TEXTS = [
  "Myślę...", "Buduję...", "Analizuję...", "Przetwarzam...",
  "Szukam...", "Obliczam...", "Rozumiem...", "Formułuję..."
];

function PulsingDots() {
  return (
    <span className="flex items-center gap-[5px] h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/70"
          animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </span>
  );
}

function SpinningShape({ index }: { index: number }) {
  const shapes = [
    <circle key="circle" cx="12" cy="12" r="9" />,
    <rect key="square" x="3" y="3" width="18" height="18" rx="2" />,
    <polygon key="tri" points="12,3 21,21 3,21" />,
    <polygon key="diamond" points="12,2 22,12 12,22 2,12" />,
    <polygon key="hex" points="12,2 20,6 20,18 12,22 4,18 4,6" />,
  ];

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-6 h-6 text-primary"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full drop-shadow">
        {shapes[index % shapes.length]}
      </svg>
    </motion.div>
  );
}

export function GeometricLoader({ model }: GeometricLoaderProps) {
  const [shapeIndex, setShapeIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const shapeInterval = setInterval(() => {
      setShapeIndex((prev) => (prev + 1) % 5);
    }, 1400);
    return () => clearInterval(shapeInterval);
  }, []);

  useEffect(() => {
    if (model !== "max") return;

    let startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (elapsed >= duration) {
        setTextIndex((prev) => (prev + 1) % MAX_TEXTS.length);
        startTime = Date.now();
        setProgress(0);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [model]);

  return (
    <div className="flex items-center gap-3 py-1">
      <AnimatePresence mode="wait">
        <SpinningShape key={shapeIndex} index={shapeIndex} />
      </AnimatePresence>

      {model === "lite" ? (
        <PulsingDots />
      ) : (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <AnimatePresence mode="wait">
            <motion.span
              key={textIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-muted-foreground"
            >
              {MAX_TEXTS[textIndex]}
            </motion.span>
          </AnimatePresence>
          <div className="h-[3px] w-full bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
