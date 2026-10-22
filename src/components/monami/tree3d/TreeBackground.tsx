import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { TreeStage, Bloom } from "./TreeCanvas";

// The Canvas must never render on the server (WebGL is browser-only).
const TreeCanvas = lazy(() => import("./TreeCanvas").then((m) => ({ default: m.TreeCanvas })));

export type { TreeStage, Bloom };

export function TreeBackground({ stage, bloom = "none" }: { stage: TreeStage; bloom?: Bloom }) {
  return (
    <ClientOnly fallback={null}>
      <Suspense fallback={null}>
        <TreeCanvas stage={stage} bloom={bloom} />
      </Suspense>
    </ClientOnly>
  );
}
