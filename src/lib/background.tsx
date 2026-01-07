import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="fixed inset-0 z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900" />

      {/* Noticeable particles */}
      {[...Array(18)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/55 blur-sm"
          style={{
            width: `${Math.random() * 6 + 6}px`,
            height: `${Math.random() * 6 + 6}px`,
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -120],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: Math.random() * 25 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
