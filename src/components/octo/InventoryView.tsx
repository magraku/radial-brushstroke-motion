import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { groupBoxes, type BoxGroup, type Product } from "@/data/mock";
import { copy } from "@/lib/copy";
import { Box3D } from "./Box3D";
import { BoxDetail } from "./BoxDetail";
import { cn } from "@/lib/utils";

export function InventoryView({ items, pulseId }: { items: Product[]; pulseId?: string }) {
  const [mode, setMode] = useState<"family" | "market">("family");
  const [opening, setOpening] = useState<string>();
  const [open, setOpen] = useState<BoxGroup>();
  const boxes = groupBoxes(items, mode);

  if (open) return <BoxDetail box={open} onBack={() => setOpen(undefined)} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 40 }} className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">{copy.inventory}</h1>
        <div className="inline-flex rounded-full bg-muted p-1 text-sm font-medium">
          {(["family", "market"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cn("relative rounded-full px-4 py-1.5 transition-colors", mode === m ? "text-foreground" : "text-muted-foreground")}>
              {mode === m && <motion.span layoutId="mode" className="absolute inset-0 rounded-full bg-card shadow-sm" />}
              <span className="relative">{m === "family" ? copy.byFamily : copy.byMarket}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-end justify-center pb-4 pt-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          <AnimatePresence mode="popLayout">
            {boxes.map((b, i) => (
              <Box3D
                key={mode + b.id}
                box={b}
                index={i}
                opening={opening === b.id}
                pulse={pulseId === b.id}
                onOpen={() => {
                  setOpening(b.id);
                  setTimeout(() => {
                    setOpen(b);
                    setOpening(undefined);
                  }, 550);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
