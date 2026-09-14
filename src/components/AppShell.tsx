import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { roleLabels } from "@/lib/format";

function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="glow-blob absolute -top-24 -left-16 size-[420px] rounded-full bg-ice/70 blur-3xl" />
      <div className="glow-blob absolute top-40 -right-24 size-[460px] rounded-full bg-pitch/25 blur-3xl" />
      <div className="glow-blob absolute bottom-0 left-1/3 size-[380px] rounded-full bg-amber/20 blur-3xl" />
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-frost-2 text-ink">
      <Blobs />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-5 text-center rise">
          <div className="font-display text-3xl tracking-wide">
            HVCH<span className="text-pitch">Team</span>
          </div>
          <div className="label-mono mt-1">Teammanagement</div>
        </div>
        {children}
      </div>
    </div>
  );
}

const navItems = [
  { to: "/wedstrijden", label: "Wedstrijden", key: "W" },
  { to: "/statistieken", label: "Stand", key: "S" },
  { to: "/team", label: "Spelers", key: "P" },
  { to: "/profiel", label: "Jij", key: "J" },
] as const;

export function AppShell({
  children,
  teamName,
}: {
  children: ReactNode;
  teamName?: string;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const roleLabel = auth.isAdmin
    ? roleLabels["Administrator"]
    : auth.isTrainer
      ? roleLabels["Trainer"]
      : roleLabels["Player"];

  const displayName = auth.name ?? auth.email ?? "Ingelogd";
  const avatar = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen overflow-hidden bg-frost-2 text-ink">
      <Blobs />
      <div className="relative mx-auto max-w-md px-4 pt-4 pb-32 md:max-w-3xl">
        <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/40 px-4 py-3 ring-1 ring-white/40 backdrop-blur-xl rise">
          <Link to="/wedstrijden" className="min-w-0">
            <div className="font-display text-lg leading-none tracking-wide">
              HVCH<span className="text-pitch">Team</span>
            </div>
            <div className="label-mono mt-1 truncate">{teamName ?? "Teammanagement"}</div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="max-w-[9rem] truncate text-xs font-semibold leading-tight">
                {displayName}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber">
                {roleLabel}
              </div>
            </div>
            <button
              onClick={() => {
                auth.signOut();
                navigate({ to: "/inloggen" });
              }}
              title="Uitloggen"
              className="grid size-9 place-items-center rounded-full bg-ink font-mono text-xs text-frost"
            >
              {avatar}
            </button>
          </div>
        </header>

        <main className="mt-3 space-y-3">{children}</main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/60 bg-white/55 px-2 py-2 ring-1 ring-white/50 backdrop-blur-2xl">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 ${
                active ? "text-ink" : "text-ink-soft"
              }`}
            >
              <span
                className={`grid size-5 place-items-center rounded-md font-mono text-[9px] ${
                  active ? "bg-ink text-frost" : "bg-frost-2 ring-1 ring-line"
                }`}
              >
                {item.key}
              </span>
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
