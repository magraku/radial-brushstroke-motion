import { useState } from "react";
import { motion } from "framer-motion";
import { Check, MailCheck } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { passwordChecks, isStrongPassword, PASSWORD_MIN } from "@/lib/password";
import { Mascot } from "./Mascot";
import { MonamiLogo } from "./MonamiLogo";
import { TreeBackground } from "./tree3d/TreeBackground";
import { cn } from "@/lib/utils";

const emailSchema = z.string().trim().email().max(255);

export function AuthScreen() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const checks = passwordChecks(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const mail = emailSchema.safeParse(email);
    if (!mail.success) return setError("Cette adresse e-mail n'a pas l'air valide.");
    if (mode === "signup" && !isStrongPassword(password)) return setError("Ton mot de passe ne respecte pas encore toutes les règles.");
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email: mail.data, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(error.message); else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: mail.data, password });
      if (error) setError(/confirm/i.test(error.message) ? "Valide d'abord ton e-mail grâce au lien reçu." : "E-mail ou mot de passe incorrect.");
    }
    setBusy(false);
  };

  const rules = [
    { ok: checks.length, label: `Plus de 10 caractères (${PASSWORD_MIN} min.)` },
    { ok: checks.upper, label: "Une majuscule" },
    { ok: checks.lower, label: "Une minuscule" },
    { ok: checks.special, label: "Un caractère spécial (!, @, #…)" },
  ];

  return (
    <div className="relative flex h-dvh flex-col items-center overflow-hidden px-4">
      <TreeBackground stage="roots" bloom="none" />
      <header className="relative z-10 flex h-16 w-full max-w-md items-center">
        <MonamiLogo className="h-5" />
      </header>
      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col justify-center gap-6 pb-16">
        <div className="flex items-end gap-4">
          <Mascot float className="w-20 shrink-0" />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl rounded-bl-md bg-card px-5 py-4 text-base font-medium shadow-sm">
            {sent ? "Je t'ai envoyé un lien : valide ton e-mail, puis reviens te connecter !" : mode === "signup" ? "Salut ! Crée ton compte avec ton e-mail pour qu'on fasse équipe." : "Content de te revoir ! Connecte-toi."}
          </motion.div>
        </div>

        {sent ? (
          <div className="surface space-y-4 rounded-3xl p-6 text-center">
            <MailCheck className="mx-auto size-10 text-primary" />
            <p className="text-sm">Lien envoyé à <b>{email}</b>. Pense à regarder tes spams.</p>
            <button onClick={() => { setSent(false); setMode("login"); setPassword(""); }} className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              J'ai validé, me connecter
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="surface space-y-3 rounded-3xl p-6">
            <input type="email" required autoComplete="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            <input type="password" required autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            {mode === "signup" && (
              <ul className="grid gap-1 text-xs sm:grid-cols-2">
                {rules.map((r) => (
                  <li key={r.label} className={cn("flex items-center gap-1.5", r.ok ? "text-success" : "text-muted-foreground")}>
                    <Check className={cn("size-3.5", !r.ok && "opacity-30")} /> {r.label}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50">
              {mode === "signup" ? "Créer mon compte" : "Me connecter"}
            </button>
            <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(undefined); }} className="w-full text-xs font-medium text-primary hover:underline">
              {mode === "signup" ? "J'ai déjà un compte" : "Pas encore de compte ? En créer un"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
