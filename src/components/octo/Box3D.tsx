import { motion } from "framer-motion";
import type { BoxGroup } from "@/data/mock";
import { copy } from "@/lib/copy";
import { eur } from "./charts";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

// Cardboard box drawn with CSS 3D transforms. Sizes in px via CSS var.
export function Box3D({ box, index, onOpen, opening, pulse }: { box: BoxGroup; index: number; onOpen: () => void; opening: boolean; pulse: boolean }) {
  const S = 132; // cube size
  const half = S / 2;
  const face = "absolute inset-0 rounded-[14px]";
  const up = box.trend >= 0;
  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.7 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 160, damping: 18 }}
      className="group relative flex flex-col items-center outline-none"
    >
      <div className="box-float" style={{ animationDelay: `${index * 0.4}s` }}>
        <motion.div
          className="relative"
          style={{ width: S, height: S, perspective: 700 }}
          whileHover={{ y: -14, rotate: -3 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <div
            className="relative size-full transition-transform duration-500 group-hover:[transform:rotateX(-22deg)_rotateY(-38deg)]"
            style={{ transformStyle: "preserve-3d", transform: "rotateX(-18deg) rotateY(-32deg)" }}
          >
            {/* front */}
            <div className={cn(face, "bg-cardboard")} style={{ transform: `translateZ(${half}px)`, boxShadow: "inset 0 -18px 30px -12px oklch(0.4 0.06 60 / 35%), inset 0 10px 20px -10px oklch(1 0 0 / 35%)" }}>
              <div className="absolute left-1/2 top-0 h-5 w-9 -translate-x-1/2 rounded-b bg-cardboard-light/70" />
              <div className="absolute inset-x-3 bottom-4 rounded-lg bg-card/95 px-2 py-1.5 text-left shadow-sm">
                <div className="flex items-center gap-1.5">
                  {box.accent ? (
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: box.accent }} />
                  ) : (
                    <span className="text-sm leading-none">{box.icon}</span>
                  )}
                  <span className="truncate text-[11px] font-semibold text-ink">{box.label}</span>
                </div>
              </div>
            </div>
            {/* right side */}
            <div className={cn(face, "bg-cardboard-dark")} style={{ transform: `rotateY(90deg) translateZ(${half}px)`, boxShadow: "inset 0 -20px 30px -10px oklch(0.3 0.05 60 / 35%)" }} />
            {/* left & back for depth */}
            <div className={cn(face, "bg-cardboard-dark")} style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }} />
            <div className={cn(face, "bg-cardboard-dark")} style={{ transform: `rotateY(180deg) translateZ(${half}px)` }} />
            {/* inside bottom */}
            <div className={cn(face, "bg-cardboard-dark")} style={{ transform: `rotateX(90deg) translateZ(${-half + 2}px)` }} />
            {/* lid: positioned as the top face, hinged on the back edge */}
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `rotateX(90deg) translateZ(${half}px)` }}>
              <motion.div
                className={cn(face, "bg-cardboard-light")}
                style={{ transformOrigin: "50% 0%" }}
                animate={{ rotateX: opening ? 115 : 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
              >
                <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-accent/40" />
              </motion.div>
            </div>
          </div>
          {/* floor shadow */}
          <div className="absolute -bottom-10 left-1/2 h-6 w-36 -translate-x-1/2 rounded-full bg-ink/15 blur-md transition-all group-hover:w-28 group-hover:bg-ink/10" />
        </motion.div>
      </div>
      <div className={cn("mt-12 rounded-2xl px-3 py-1.5 text-center", pulse && "pulse-ring")}>
        <div className="text-sm font-semibold">
          {box.items.length} {copy.items}
          {pulse && <span className="ml-1.5 rounded-full bg-accent px-1.5 text-xs text-accent-foreground">+1</span>}
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          {eur(box.value)}
          <span className={cn("inline-flex items-center gap-0.5 font-medium", up ? "text-success" : "text-destructive")}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {up ? "+" : ""}
            {box.trend}%
          </span>
        </div>
      </div>
    </motion.button>
  );
}
