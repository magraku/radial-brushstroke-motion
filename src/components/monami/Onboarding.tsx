import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Search, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import { customNiche, marketplaces, niches, type Niche } from "@/data/mock";
import { copy } from "@/lib/copy";
import { Mascot } from "./Mascot";
import { MonamiLogo } from "./MonamiLogo";
import { eur } from "./charts";
import { cn } from "@/lib/utils";

export type Profile = { hasAccount: boolean; niche: Niche; intent: "buy" | "sell" };

type Step = "account" | "niche" | "study" | "intent";

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl rounded-bl-md bg-card px-5 py-4 text-base font-medium shadow-sm sm:text-lg">
      {children}
    </div>
  );
}

function MascotRow({ children, big }: { children: React.ReactNode; big?: boolean }) {
  return (
    <div className="flex items-end gap-4">
      <Mascot float className={cn("shrink-0 text-ink", big ? "w-24 sm:w-28" : "w-16 sm:w-20")} />
      <motion.div
        key={String(big)}
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Bubble>{children}</Bubble>
      </motion.div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState<Step>("account");
  const [hasAccount, setHasAccount] = useState(false);
  const [niche, setNiche] = useState<Niche>();
  const [custom, setCustom] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    if (step !== "study") return;
    setAnalyzing(true);
    const t = setTimeout(() => setAnalyzing(false), 1800);
    return () => clearTimeout(t);
  }, [step]);

  const pickNiche = (n: Niche) => {
    setNiche(n);
    setStep("study");
  };

  const steps: Step[] = ["account", "niche", "study", "intent"];
  const stepIdx = steps.indexOf(step);

  return (
    <div className="relative flex h-dvh flex-col items-center overflow-hidden px-4">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-accent/[0.08] blur-3xl" />

      <header className="flex h-16 w-full max-w-2xl items-center">
        <MonamiLogo className="h-5 text-ink" />
        <div className="ml-auto flex gap-1.5">
          {steps.map((s, i) => (
            <span key={s} className={cn("h-1.5 rounded-full transition-all", i <= stepIdx ? "w-6 bg-primary" : "w-1.5 bg-border")} />
          ))}
        </div>
      </header>

      <div className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 pb-16">
        <AnimatePresence mode="wait">
          {step === "account" && (
            <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} className="space-y-8">
              <MascotRow big>
                <div>
                  {copy.obHello}
                  <div className="mt-2 text-muted-foreground">{copy.obAccount}</div>
                </div>
              </MascotRow>
              <div className="grid gap-3 pl-20 sm:grid-cols-2 sm:pl-28">
                {[
                  { label: copy.obLogin, v: true },
                  { label: copy.obSignup, v: false },
                ].map((o, i) => (
                  <motion.button
                    key={o.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    onClick={() => {
                      setHasAccount(o.v);
                      setStep("niche");
                    }}
                    className="surface rounded-2xl px-5 py-4 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    {o.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "niche" && (
            <motion.div key="niche" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} className="space-y-8">
              <MascotRow>{copy.obNiche}</MascotRow>
              <div className="grid gap-3 pl-20 sm:grid-cols-2 sm:pl-28">
                {niches.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    onClick={() => pickNiche(n)}
                    className="surface flex items-center gap-3 rounded-2xl px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-primary"
                  >
                    <span className="text-2xl">{n.emoji}</span>
                    <span className="text-sm font-semibold">{n.name}</span>
                    <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                  </motion.button>
                ))}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className={cn("surface rounded-2xl px-5 py-4", customMode && "border-primary")}>
                  {customMode ? (
                    <form
                      className="flex items-center gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (custom.trim()) pickNiche(customNiche(custom.trim()));
                      }}
                    >
                      <input
                        autoFocus
                        value={custom}
                        onChange={(e) => setCustom(e.target.value)}
                        placeholder={copy.obNicheCustomPlaceholder}
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      <button type="submit" disabled={!custom.trim()} className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105 disabled:opacity-40" aria-label={copy.obContinue}>
                        <ArrowRight className="size-4" />
                      </button>
                    </form>
                  ) : (
                    <button onClick={() => setCustomMode(true)} className="flex w-full items-center gap-3 text-left">
                      <span className="text-2xl">✨</span>
                      <span className="text-sm font-semibold">{copy.obNicheCustom}</span>
                      <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "study" && niche && (
            <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} className="space-y-8">
              <MascotRow>
                {analyzing ? (
                  <span className="inline-flex items-center gap-2">
                    {copy.obStudy}
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="size-1.5 rounded-full bg-primary" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
                      ))}
                    </span>
                  </span>
                ) : (
                  copy.obStudyDone
                )}
              </MascotRow>

              <AnimatePresence>
                {!analyzing && (
                  <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} className="surface ml-20 space-y-4 rounded-3xl p-5 sm:ml-28">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{niche.emoji}</span>
                      <div>
                        <div className="font-semibold">{niche.name}</div>
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-success">
                          <TrendingUp className="size-3" /> +{niche.study.trend}% ce mois
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-3xl font-semibold text-primary">{niche.study.demandScore}</div>
                        <div className="text-[10px] text-muted-foreground">{copy.demandScore} /100</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: Search, label: copy.searches, value: niche.study.searches.toLocaleString("fr-FR") },
                        { icon: ShoppingBag, label: copy.salesPeriod, value: String(niche.study.sales) },
                        { icon: Clock, label: copy.sellThrough, value: `~${niche.study.sellThroughDays} ${copy.days}` },
                      ].map((k, i) => (
                        <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="rounded-2xl bg-muted p-3">
                          <k.icon className="size-4 text-primary" />
                          <div className="mt-1.5 text-sm font-semibold">{k.value}</div>
                          <div className="text-[10px] leading-tight text-muted-foreground">{k.label}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-2.5 text-sm">
                      <span className="text-muted-foreground">{copy.obBestPlatform}</span>
                      <span className="inline-flex items-center gap-2 font-semibold">
                        <span className="size-2.5 rounded-full" style={{ background: marketplaces[niche.study.bestPlatform]?.color }} />
                        {marketplaces[niche.study.bestPlatform]?.name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{niche.study.note}</p>
                    <div className="text-xs text-muted-foreground">
                      {copy.median} : <b className="text-foreground">{eur(niche.study.median)}</b>
                    </div>
                    <button onClick={() => setStep("intent")} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110">
                      {copy.obContinue} <ArrowRight className="size-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === "intent" && niche && (
            <motion.div key="intent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} className="space-y-8">
              <MascotRow>{copy.obIntent}</MascotRow>
              <div className="grid gap-3 pl-20 sm:grid-cols-2 sm:pl-28">
                {(
                  [
                    { v: "sell" as const, label: copy.obSell, sub: copy.obSellSub, emoji: "📸" },
                    { v: "buy" as const, label: copy.obBuy, sub: copy.obBuySub, emoji: "🔍" },
                  ] as const
                ).map((o, i) => (
                  <motion.button
                    key={o.v}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => onDone({ hasAccount, niche, intent: o.v })}
                    className="surface group rounded-3xl p-5 text-left transition hover:-translate-y-1 hover:border-primary"
                  >
                    <span className="text-3xl">{o.emoji}</span>
                    <div className="mt-3 font-semibold">{o.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{o.sub}</div>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      {copy.obStart} <Check className="size-3.5 transition group-hover:scale-125" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
