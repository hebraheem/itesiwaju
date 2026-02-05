import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MediaCarousel({ media }: { media: { url: string }[] }) {
  const [index, setIndex] = useState(0);
  const total = media.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // Preload neighbors
  useEffect(() => {
    const nextImg = new Image();
    nextImg.src = media[(index + 1) % total]?.url;

    const prevImg = new Image();
    prevImg.src = media[(index - 1 + total) % total]?.url;
  }, [index, total, media]);

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={media[index].url}
          alt="Event media"
          className="w-full h-80 object-cover rounded-lg"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {media.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
