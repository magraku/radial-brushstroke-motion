import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { TreeStage } from "./TreeCanvas";

// The Canvas must never render on the server (WebGL is browser-only).
const TreeCanvas = lazy(() => import("./TreeCanvas").then((m) => ({ default: m.TreeCanvas })));

export type { TreeStage };

export function TreeBackground({ stage }: { stage: TreeStage }) {
  return (
    <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <TreeCanvas stage={stage} />
      </Suspense>
    </ClientOnly>
  );
}
