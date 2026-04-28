import { cn } from "@/lib/utils";

export function GradientBlob({
  className,
  variant = "emerald",
}: {
  className?: string;
  variant?: "emerald" | "cyan" | "violet";
}) {
  const palette: Record<string, string> = {
    emerald: "from-brand-300 via-teal-300 to-cyan-300",
    cyan: "from-cyan-300 via-sky-300 to-blue-300",
    violet: "from-violet-300 via-fuchsia-300 to-pink-300",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute rounded-full opacity-60 blur-3xl",
        "bg-gradient-to-br",
        palette[variant],
        "animate-blob",
        className
      )}
    />
  );
}
