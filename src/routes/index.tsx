import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar, AlertCard } from "@/components/octo/TopBar";
import { InventoryView } from "@/components/octo/InventoryView";
import { AnalysisView } from "@/components/octo/AnalysisView";
import { ChatDock, type Msg } from "@/components/octo/ChatDock";
import { InkBurst } from "@/components/octo/InkBurst";
import { agentReplies, alerts, analysis, products as seed, type Product } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OctoHandy — L'agent IA des revendeurs" },
      { name: "description", content: "OctoHandy estime le vrai prix de vos objets, détecte bonnes affaires et arnaques, et vous aide à vendre au bon prix." },
      { property: "og:title", content: "OctoHandy — L'agent IA des revendeurs" },
      { property: "og:description", content: "Un agent qui connaît tout le marché de la seconde main : prix réel, alertes et ventes en une photo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [view, setView] = useState<"inventory" | "analysis">("inventory");
  const [items, setItems] = useState<Product[]>(seed);
  const [pulse, setPulse] = useState<string>();
  const [toast, setToast] = useState<(typeof alerts)[number]>();
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 0, role: "agent", text: "Bonjour Axel ! Votre inventaire vaut 2 571 € aujourd'hui. Que vendons-nous ?" },
  ]);
  const idRef = useRef(1);

  useEffect(() => {
    const t1 = setTimeout(() => setToast(alerts[0]), 2500);
    return () => clearTimeout(t1);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(undefined), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const reply = (text: string, after?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, role: "agent", text }]);
      after?.();
    }, 900);
  };

  const onSend = (text: string, photo?: string) => {
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text, photo }]);
    const t = text.toLowerCase();
    if (photo || /vendre|ajouter|add|sell/.test(t)) {
      if (!photo && /^ajouter un produit$/.test(t)) {
        reply(agentReplies.analysis, () => setView("analysis"));
      } else reply(agentReplies.analysis, () => setView("analysis"));
    } else if (/best|meilleur|vend le plus/.test(t)) {
      reply(agentReplies.bestSeller, () => setView("inventory"));
    } else if (/plan|deal|affaire|arnaque/.test(t)) {
      reply(agentReplies.deals, () => {
        setToast(alerts[1]);
        setTimeout(() => setToast(alerts[2]), 6500);
      });
    } else reply(agentReplies.fallback, () => setView("inventory"));
  };

  const confirm = () => {
    setItems((list) => [
      ...list,
      { id: `n${idRef.current}`, name: analysis.name, image: analysis.image, family: analysis.family, market: analysis.market, listedPrice: 48, marketPrice: 47, status: "listed" },
    ]);
    setView("inventory");
    setPulse(analysis.family);
    setTimeout(() => setPulse(undefined), 4500);
    reply(agentReplies.added);
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <InkBurst className="pointer-events-none absolute -right-40 -top-40 size-[34rem] text-primary/[0.04]" count={40} seed={3} />
      <InkBurst className="pointer-events-none absolute -bottom-52 -left-52 size-[30rem] text-accent/[0.06]" count={32} seed={19} />
      <TopBar />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pt-2 sm:px-6">
        <div className="mx-auto h-full max-w-6xl">
          <AnimatePresence mode="wait">
            {view === "inventory" ? (
              <InventoryView key="inv" items={items} pulseId={pulse} />
            ) : (
              <AnalysisView key="ana" onConfirm={confirm} onCancel={() => setView("inventory")} />
            )}
          </AnimatePresence>
        </div>
      </main>
      <div className="relative z-20">
        <ChatDock messages={messages} typing={typing} onSend={onSend} />
      </div>
      <div className="pointer-events-none fixed right-4 top-16 z-40 w-[min(22rem,calc(100vw-2rem))]">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="pointer-events-auto rounded-2xl bg-card shadow-xl">
              <AlertCard a={toast} onClose={() => setToast(undefined)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
