import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AppShell";
import { Button, ErrorNote, Field, Input, Sheet } from "@/components/ui-kit";
import { api, getApiBase, setApiBase } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthResult } from "@/lib/types";

export const Route = createFileRoute("/inloggen")({
  head: () => ({
    meta: [
      { title: "Inloggen — HVCHTeam" },
      { name: "description", content: "Log in op HVCHTeam en beheer je wedstrijden." },
      { property: "og:title", content: "Inloggen — HVCHTeam" },
      {
        property: "og:description",
        content: "Log in op HVCHTeam en beheer je wedstrijden.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [base, setBase] = useState(() =>
    typeof window === "undefined" ? "" : getApiBase(),
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<AuthResult>("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      if (!res.succeeded || !res.token) {
        setError(res.errors?.join(", ") || "Inloggen mislukt. Controleer je gegevens.");
        return;
      }
      auth.signIn(res.token);
      navigate({ to: "/wedstrijden" });
    } catch (err: any) {
      setError(err?.message ?? "Inloggen mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Sheet delay={60}>
        <form onSubmit={submit} className="space-y-3 p-5">
          <div>
            <h1 className="font-display text-2xl leading-none tracking-wide">Inloggen</h1>
            <p className="label-mono mt-1">Welkom terug</p>
          </div>
          <ErrorNote message={error} />
          <Field label="E-mailadres">
            <Input
              type="email"
              value={email}
              required
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@club.nl"
            />
          </Field>
          <Field label="Wachtwoord">
            <Input
              type="password"
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? "Bezig…" : "Inloggen"}
          </Button>
          <div className="flex items-center justify-between pt-1 text-xs">
            <Link to="/wachtwoord-vergeten" className="font-semibold text-pitch">
              Wachtwoord vergeten?
            </Link>
            <Link to="/registreren" className="font-semibold text-ink">
              Account aanmaken
            </Link>
          </div>
        </form>
      </Sheet>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="label-mono underline-offset-2 hover:underline"
        >
          Serverinstellingen
        </button>
      </div>

      {showSettings ? (
        <Sheet className="mt-2">
          <div className="space-y-3 p-4">
            <Field
              label="API-adres"
              hint="Bijvoorbeeld https://api.hvchteam.nl — laat leeg als de API op hetzelfde adres draait."
            >
              <Input
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <Button
              type="button"
              onClick={() => {
                setApiBase(base);
                setShowSettings(false);
              }}
            >
              Opslaan
            </Button>
          </div>
        </Sheet>
      ) : null}
    </AuthLayout>
  );
}
