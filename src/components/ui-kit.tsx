import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Sheet({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={cn("sheet rise", className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </section>
  );
}

export function SheetHeader({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        {subtitle ? <div className="label-mono mt-1">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

type Variant = "primary" | "ghost" | "danger" | "pitch";

export function Button({
  variant = "ghost",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    primary: "bg-ink text-frost hover:bg-ink/90",
    pitch: "bg-pitch text-white hover:bg-pitch/90",
    ghost: "border border-line bg-white/50 text-ink hover:bg-white/80",
    danger: "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <div className="mt-1 font-mono text-[10px] text-ink-soft">{hint}</div> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-line bg-white/70 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-pitch/40",
        className,
      )}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full appearance-none rounded-xl border border-line bg-white/70 px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-pitch/40",
        className,
      )}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "pitch" | "amber" | "ink" | "danger";
}) {
  const tones = {
    neutral: "bg-frost-2 text-ink-soft ring-line",
    pitch: "bg-pitch/15 text-pitch ring-pitch/30",
    amber: "bg-amber/15 text-amber ring-amber/30",
    ink: "bg-ink/10 text-ink ring-ink/20",
    danger: "bg-destructive/10 text-destructive ring-destructive/25",
  } as const;
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ring-1",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Loading({ label = "Laden…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-5 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
      <span className="size-2 animate-pulse rounded-full bg-pitch" />
      {label}
    </div>
  );
}

export function ErrorNote({ message }: { message?: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive">
      {message}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="sheet-inner p-5 text-center text-xs text-ink-soft">{children}</div>
  );
}
