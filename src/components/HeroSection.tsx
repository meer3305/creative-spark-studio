import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 rounded-full opacity-20 blur-[120px]"
        style={{ background: "hsl(var(--primary))" }}
      />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full opacity-15 blur-[120px]"
        style={{ background: "hsl(var(--secondary))" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
        >
          <Sparkles className="h-4 w-4" />
          AI-Powered 3D Creation
        </motion.div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          <span className="gradient-text">Autonomous</span>
          <br />
          <span className="text-foreground">Creative Studio</span>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
          Transform text, images, and voice into stunning 3D assets with AI.
          Generate, render, and publish — all from one interface.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-8 py-4 text-lg font-semibold text-primary-foreground transition-all"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
          }}
        >
          <span className="relative z-10">Start Creating</span>
          <Sparkles className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-12" />
          <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: "linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))",
            }}
          />
        </motion.button>
      </motion.div>
    </section>
  );
};

export default HeroSection;
