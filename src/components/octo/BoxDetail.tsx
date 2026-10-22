import { useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Lightbulb, MessageCircle } from "lucide-react";
import { type BoxGroup, type Product, type Range, priceHint, series, marketplaces } from "@/data/mock";
import { copy } from "@/lib/copy";
import { Card, ChartTip, RangeToggle, eur } from "./charts";
import { cn } from "@/lib/utils";

const statusStyle = {
  listed: { label: copy.listed, cls: "bg-secondary text-secondary-foreground" },
  sold: { label: copy.sold, cls: "bg-success-soft text-success" },
  messages: { label: copy.messages, cls: "bg-accent/15 text-warning" },
};

export function ProductThumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  return err ? (
    <div className={cn("grid place-items-center bg-muted text-lg", className)}>📦</div>
  ) : (
    <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={cn("object-cover", className)} />
  );
}

function Spark({ p }: { p: Product }) {
  const data = series(p.id, p.marketPrice, "1M");
  const up = data[data.length - 1]!.value >= data[0]!.value;
  const c = up ? "var(--success)" : "var(--destructive)";
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`sp-${p.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity={0.35} />
              <stop offset="100%" stopColor={c} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="value" stroke={c} strokeWidth={1.5} fill={`url(#sp-${p.id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BoxDetail({ box, onBack }: { box: BoxGroup; onBack: () => void }) {
  const [tab, setTab] = useState<"micro" | "macro">("micro");
  const [range, setRange] = useState<Range>("6M");
  const [sel, setSel] = useState<Product>(box.items[0]!);
  const macro = series(box.id + "box", box.value, range, 0.2);
  const prod = series(sel.id, sel.marketPrice, range).map((d) => ({ ...d, band: [d.min, d.max] }));
  const hint = priceHint(sel);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-muted">
          <ArrowLeft className="size-4" /> {copy.back}
        </button>
        <h2 className="text-xl font-semibold sm:text-2xl">
          <span className="mr-2">{box.accent ? "📦" : box.icon}</span>
          {box.label}
        </h2>
        <span className="text-sm text-muted-foreground">
          {box.items.length} {copy.items} · {eur(box.value)}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-full bg-muted p-1 text-xs font-medium">
            {(["micro", "macro"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-3 py-1 transition", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                {t === "micro" ? copy.micro : copy.macro}
              </button>
            ))}
          </div>
          <RangeToggle value={range} onChange={setRange} />
        </div>
      </div>

      {tab === "macro" ? (
        <Card title={`${copy.totalValue} & ${copy.salesVolume}`} className="flex-1">
          <div className="h-[calc(100%-2rem)] min-h-64">
            <ResponsiveContainer>
              <ComposedChart data={macro}>
                <defs>
                  <linearGradient id="mac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis yAxisId="v" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" width={50} />
                <YAxis yAxisId="n" orientation="right" hide />
                <Tooltip content={<ChartTip />} />
                <Bar yAxisId="n" dataKey="volume" name={copy.salesVolume} fill="var(--accent)" fillOpacity={0.5} radius={[6, 6, 0, 0]} barSize={10} />
                <Area yAxisId="v" type="monotone" dataKey="value" name={copy.totalValue} stroke="var(--primary)" strokeWidth={2.5} fill="url(#mac)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="surface min-h-0 overflow-y-auto p-2">
            {box.items.map((p, i) => {
              const s = statusStyle[p.status];
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSel(p)}
                  className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", sel.id === p.id ? "bg-secondary" : "hover:bg-muted")}
                >
                  <ProductThumb src={p.image} alt={p.name} className="size-12 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5", s.cls)}>
                        {p.status === "messages" && <MessageCircle className="size-3" />}
                        {s.label}
                      </span>
                      <span className="text-muted-foreground">{marketplaces[p.market]?.name}</span>
                    </div>
                  </div>
                  <Spark p={p} />
                  <div className="w-20 text-right">
                    <div className="text-sm font-semibold">{eur(p.listedPrice)}</div>
                    <div className="text-xs text-muted-foreground">
                      {copy.market} {eur(p.marketPrice)}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          <Card title={`${copy.priceOverTime} · ${sel.name}`} className="flex min-h-72 flex-col">
            <div className="min-h-48 flex-1">
              <ResponsiveContainer>
                <ComposedChart data={prod}>
                  <defs>
                    <linearGradient id="pband" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary-glow)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--primary-glow)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                  <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" width={40} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTip />} />
                  <Area dataKey="band" stroke="none" fill="url(#pband)" />
                  <Line type="monotone" dataKey="value" name={copy.median} stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                  <ReferenceLine y={sel.listedPrice} stroke="var(--accent)" strokeDasharray="6 4" label={{ value: copy.yourPrice, fill: "var(--accent)", fontSize: 11, position: "insideTopRight" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className={cn("mt-3 flex items-start gap-2 rounded-xl p-3 text-sm", hint.tone === "warn" ? "bg-accent/15" : hint.tone === "good" ? "bg-success-soft" : "bg-muted")}>
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
              {hint.text}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
