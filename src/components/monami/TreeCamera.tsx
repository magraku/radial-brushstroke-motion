import { motion } from "framer-motion";

/*
 * TreeCamera — a large hand-drawn tree that fills the background while a
 * virtual "camera" pans and zooms across it as the user progresses:
 *   roots/base  -> account question
 *   trunk       -> niche picker (the tree "grows" as we climb)
 *   branch      -> buy/sell intent
 *   canopy      -> market study (leaves)
 *   fruit       -> product added / analysis (the fruit of the process)
 *   full        -> the app (inventory)
 */

export type TreeStage = "roots" | "trunk" | "branch" | "canopy" | "fruit" | "full";

const STAGES: Record<TreeStage, { scale: number; x: string; y: string }> = {
  roots: { scale: 1.9, x: "0%", y: "34%" },
  trunk: { scale: 1.45, x: "0%", y: "10%" },
  branch: { scale: 1.8, x: "-18%", y: "-10%" },
  canopy: { scale: 1.5, x: "6%", y: "-30%" },
  fruit: { scale: 2.1, x: "14%", y: "-34%" },
  full: { scale: 1, x: "0%", y: "0%" },
};

const BARK = "var(--ink)";
const LEAF = "var(--accent)";
const FRUIT = "var(--primary)";

function TreeScene() {
  return (
    <svg viewBox="0 0 1600 2000" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      {/* soft sky glow behind the canopy */}
      <circle cx="820" cy="430" r="560" fill={LEAF} opacity={0.1} />

      {/* root flare */}
      <g fill="none" stroke={BARK} strokeLinecap="round" opacity={0.55}>
        <path d="M760 1640 C 700 1720, 560 1740, 430 1780" strokeWidth={34} />
        <path d="M840 1650 C 900 1730, 1040 1750, 1180 1790" strokeWidth={30} />
        <path d="M800 1660 C 790 1740, 760 1810, 700 1870" strokeWidth={24} />
        <path d="M820 1660 C 850 1750, 900 1820, 980 1870" strokeWidth={20} />
      </g>

      {/* trunk — winding, tapering */}
      <g fill="none" stroke={BARK} strokeLinecap="round" opacity={0.55}>
        <path d="M800 1660 C 760 1500, 860 1400, 810 1260 C 770 1150, 830 1060, 800 950" strokeWidth={58} />
        <path d="M800 950 C 770 840, 840 760, 810 650" strokeWidth={38} />
        <path d="M810 650 C 790 560, 830 500, 815 430" strokeWidth={22} />
        {/* bark texture strokes */}
        <path d="M782 1600 C 760 1480, 830 1400, 795 1280" strokeWidth={6} opacity={0.5} />
        <path d="M822 1580 C 800 1460, 860 1380, 822 1260" strokeWidth={5} opacity={0.4} />
      </g>

      {/* left branch */}
      <g fill="none" stroke={BARK} strokeLinecap="round" opacity={0.55}>
        <path d="M805 1080 C 680 1020, 540 1020, 420 940 C 340 888, 280 830, 240 760" strokeWidth={26} />
        <path d="M420 940 C 360 900, 330 840, 330 780" strokeWidth={12} />
        <path d="M560 1000 C 500 950, 470 890, 480 830" strokeWidth={10} />
      </g>

      {/* right branch */}
      <g fill="none" stroke={BARK} strokeLinecap="round" opacity={0.55}>
        <path d="M812 900 C 940 840, 1080 830, 1200 750 C 1290 690, 1340 620, 1370 540" strokeWidth={24} />
        <path d="M1200 750 C 1260 720, 1300 670, 1310 610" strokeWidth={11} />
        <path d="M1040 830 C 1100 780, 1120 720, 1110 660" strokeWidth={9} />
      </g>

      {/* top twigs */}
      <g fill="none" stroke={BARK} strokeLinecap="round" opacity={0.45}>
        <path d="M815 430 C 780 360, 720 330, 660 300" strokeWidth={9} />
        <path d="M815 430 C 860 350, 930 320, 1000 290" strokeWidth={9} />
        <path d="M815 430 C 810 350, 830 300, 820 240" strokeWidth={7} />
      </g>

      {/* leaf clusters — soft rounded canopies */}
      <g fill={LEAF} opacity={0.32}>
        <circle cx="300" cy="700" r="130" />
        <circle cx="430" cy="600" r="105" />
        <circle cx="220" cy="560" r="90" />
        <circle cx="1310" cy="500" r="125" />
        <circle cx="1180" cy="420" r="95" />
        <circle cx="1420" cy="400" r="85" />
        <circle cx="820" cy="220" r="150" />
        <circle cx="660" cy="260" r="95" />
        <circle cx="990" cy="250" r="100" />
      </g>
      <g fill={LEAF} opacity={0.18}>
        <circle cx="360" cy="780" r="70" />
        <circle cx="1250" cy="590" r="65" />
        <circle cx="900" cy="330" r="70" />
        <circle cx="730" cy="150" r="60" />
      </g>

      {/* fruits — bordeaux dots hanging in the canopy */}
      <g fill={FRUIT} opacity={0.75}>
        <circle cx="980" cy="330" r="16" />
        <circle cx="700" cy="300" r="13" />
        <circle cx="1240" cy="480" r="14" />
        <circle cx="380" cy="660" r="12" />
        <circle cx="850" cy="180" r="11" />
      </g>
      <g fill="none" stroke={FRUIT} strokeWidth={3} opacity={0.5}>
        <path d="M980 314 C 978 300, 984 292, 992 286" />
        <path d="M1240 466 C 1238 452, 1244 444, 1252 438" />
      </g>

      {/* ground line */}
      <path d="M0 1880 C 400 1850, 1200 1850, 1600 1880" fill="none" stroke={BARK} strokeWidth={4} opacity={0.25} />
    </svg>
  );
}

export function TreeCamera({ stage }: { stage: TreeStage }) {
  const s = STAGES[stage];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ scale: s.scale, x: s.x, y: s.y }}
        transition={{ type: "spring", stiffness: 32, damping: 16, mass: 1.1 }}
        style={{ transformOrigin: "50% 50%" }}
      >
        <TreeScene />
      </motion.div>
      {/* readability veil */}
      <div className="absolute inset-0 bg-background/35" />
    </div>
  );
}
