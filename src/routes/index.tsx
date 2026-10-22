import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar, AlertCard } from "@/components/monami/TopBar";
import { ProductGrid } from "@/components/monami/ProductGrid";
import { AnalysisView } from "@/components/monami/AnalysisView";
import { ChatDock, type Msg } from "@/components/monami/ChatDock";
import { Onboarding, type Profile } from "@/components/monami/Onboarding";
import { ProfileView } from "@/components/monami/ProfileView";
import { TreeBackground, type TreeStage } from "@/components/monami/tree3d/TreeBackground";
import { agentReplies, alerts, analysis, products as seed, type Product } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "monami — Ton copain pour la seconde main" },
      { name: "description", content: "monami estime le vrai prix de tes objets, détecte bonnes affaires et arnaques, et t'aide à vendre au bon prix." },
      { property: "og:title", content: "monami — Ton copain pour la seconde main" },
      { property: "og:description", content: "Un compagnon qui connaît tout le marché de la seconde main : prix réel, alertes et ventes en une photo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "inventory" | "analysis" | "profile";

const TREE_BY_VIEW: Record<View, TreeStage> = {
  inventory: "full",
  analysis: "fruit",
  profile: "roots",
};

function Index() {
  const [profile, setProfile] = useState<Profile>();
  const [view, setView] = useState<View>("inventory");
  const [items, setItems] = useState<Product[]>(seed);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pulse, setPulse] = useState<string>();
  const [toast, setToast] = useState<(typeof alerts)[number]>();
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const idRef = useRef(1);

  useEffect(() => {
    if (!profile) return;
    const t1 = setTimeout(() => setToast(alerts[0]), 2500);
    return () => clearTimeout(t1);
  }, [profile]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(undefined), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const toggleFav = (id: string) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const reply = (text: string, after?: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idRef.current++, role: "agent", text }]);
      after?.();
    }, 900);
  };

  const onDone = (p: Profile) => {
    setProfile(p);
    const total = seed.reduce((a, x) => a + x.marketPrice, 0).toLocaleString("fr-FR");
    const intentLine = p.intent === "sell" ? "Que vendons-nous ?" : "Je te préviens dès qu'une bonne occasion passe.";
    setMessages([{ id: 0, role: "agent", text: `Ravi de te connaître ! Ton inventaire ${p.niche.emoji} vaut ${total} € aujourd'hui. ${intentLine}` }]);
  };

  const onSend = (text: string, photo?: string) => {
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text, photo }]);
    const t = text.toLowerCase();
    if (photo || /vendre|ajouter|add|sell/.test(t)) {
      reply(agentReplies.analysis, () => setView("analysis"));
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

  if (!profile) return <Onboarding onDone={onDone} />;

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <TreeBackground stage={TREE_BY_VIEW[view]} />
      <TopBar onProfile={() => setView("profile")} />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pt-2 sm:px-6">
        <div className="mx-auto h-full max-w-6xl">
          <AnimatePresence mode="wait">
            {view === "inventory" ? (
              <ProductGrid key="inv" items={items} pulseId={pulse} favorites={favorites} onToggleFav={toggleFav} />
            ) : view === "analysis" ? (
              <AnalysisView key="ana" onConfirm={confirm} onCancel={() => setView("inventory")} />
            ) : (
              <ProfileView key="prof" items={items} favorites={favorites} onToggleFav={toggleFav} onBack={() => setView("inventory")} />
            )}
          </AnimatePresence>
        </div>
      </main>
      <div className="relative z-20">
        <ChatDock messages={messages} typing={typing} onSend={onSend} />
      </div>
      <div className="pointer-events-none fixed bottom-36 right-4 z-40 w-[min(22rem,calc(100vw-2rem))]">
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
