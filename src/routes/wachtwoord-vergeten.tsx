import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AppShell";
import { Button, ErrorNote, Field, Input, Sheet } from "@/components/ui-kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/wachtwoord-vergeten")({
  head: () => ({
    meta: [
      { title: "Wachtwoord vergeten — HVCHTeam" },
      { name: "description", content: "Vraag een resetlink aan voor je HVCHTeam-account." },
      { property: "og:title", content: "Wachtwoord vergeten — HVCHTeam" },
      {
        property: "og:description",
        content: "Vraag een resetlink aan voor je HVCHTeam-account.",
      },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: { email },
        auth: false,
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? "Aanvraag mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Sheet delay={60}>
        <form onSubmit={submit} className="space-y-3 p-5">
          <div>
            <h1 className="font-display text-2xl leading-none tracking-wide">
              Wachtwoord vergeten
            </h1>
            <p className="label-mono mt-1">We sturen je een resetcode</p>
          </div>
          <ErrorNote message={error} />
          {done ? (
            <div className="sheet-inner p-4 text-xs text-ink-soft">
              Als dit e-mailadres bekend is, ontvang je een resetcode. Ga daarna verder op
              de resetpagina.
            </div>
          ) : (
            <Field label="E-mailadres">
              <Input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          )}
          {!done ? (
            <Button type="submit" variant="primary" className="w-full" disabled={busy}>
              {busy ? "Bezig…" : "Resetcode aanvragen"}
            </Button>
          ) : null}
          <div className="flex items-center justify-between pt-1 text-xs">
            <Link to="/wachtwoord-resetten" className="font-semibold text-pitch">
              Ik heb een code
            </Link>
            <Link to="/inloggen" className="font-semibold text-ink">
              Terug naar inloggen
            </Link>
          </div>
        </form>
      </Sheet>
    </AuthLayout>
  );
}
