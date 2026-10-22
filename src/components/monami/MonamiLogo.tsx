import { cn } from "@/lib/utils";
import logo from "@/assets/monami-logo-silver.webp.asset.json";

// The monami silver wordmark supplied by the brand.
export function MonamiLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="monami" className={cn("w-auto object-contain", className)} />;
}
