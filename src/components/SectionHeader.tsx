import { motion } from "motion/react";
import { cn } from "../utils/cn";

interface Props {
  index: string;
  label: string;
  className?: string;
}

/** Section marker with a scan line that draws itself when it enters view. */
export default function SectionHeader({ index, label, className }: Props) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mono-label"
      >
        {index}
        <span className="mx-2 text-ice/30">/</span>
        {label}
      </motion.span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
        style={{ originX: 0 }}
        className="relative h-px w-24 bg-gradient-to-r from-ice/60 to-transparent sm:w-44"
      >
        <span className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-ice shadow-[0_0_10px_2px_rgba(167,236,255,0.6)]" />
      </motion.span>
    </div>
  );
}
