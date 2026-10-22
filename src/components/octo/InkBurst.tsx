import { cn } from "@/lib/utils";

// Radial brushstroke mark, inspired by ink burst studies. 8 arms = 8 marketplaces.
function strokes(count: number, seed: number) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (r() - 0.5) * 0.35;
    const inner = 6 + r() * 8;
    const outer = 34 + r() * 14;
    const w = 2.5 + r() * 4.5;
    return { a, inner, outer, w, o: 0.45 + r() * 0.55 };
  });
}

export function InkBurst({
  className,
  count = 8,
  seed = 7,
  animate = false,
}: {
  className?: string;
  count?: number;
  seed?: number;
  animate?: boolean;
}) {
  const list = strokes(count, seed);
  return (
    <svg viewBox="-50 -50 100 100" className={cn(animate && "ink-burst-spin", className)} aria-hidden>
      {list.map((st, i) => {
        const x1 = Math.cos(st.a) * st.inner;
        const y1 = Math.sin(st.a) * st.inner;
        const x2 = Math.cos(st.a) * st.outer;
        const y2 = Math.sin(st.a) * st.outer;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity={st.o}
            strokeWidth={st.w}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
