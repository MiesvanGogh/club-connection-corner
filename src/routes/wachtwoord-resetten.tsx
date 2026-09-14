import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AppShell";
import { Button, ErrorNote, Field, Input, Sheet } from "@/components/ui-kit";
import { api } from "@/lib/api";

export const Route = createFileRoute("/wachtwoord-resetten")({
  head: () => ({
    meta: [
      { title: "Wachtwoord resetten — HVCHTeam" },
      { name: "description", content: "Stel een nieuw wachtwoord in voor HVCHTeam." },
      { property: "og:title", content: "Wachtwoord resetten — HVCHTeam" },
      {
        property: "og:description",
        content: "Stel een nieuw wachtwoord in voor HVCHTeam.",
      },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", token: "", newPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api("/api/auth/reset-password", { method: "POST", body: form, auth: false });
      setDone(true);
      setTimeout(() => navigate({ to: "/inloggen" }), 1500);
    } catch (err: any) {
      setError(err?.message ?? "Resetten mislukt.");
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
              Nieuw wachtwoord
            </h1>
            <p className="label-mono mt-1">Gebruik de code uit je e-mail</p>
          </div>
          <ErrorNote message={error} />
          {done ? (
            <div className="sheet-inner p-4 text-xs text-ink-soft">
              Gelukt. Je gaat door naar het inlogscherm…
            </div>
          ) : (
            <>
              <Field label="E-mailadres">
                <Input
                  type="email"
                  value={form.email}
                  required
                  onChange={(e) => update("email", e.target.value)}
                />
              </Field>
              <Field label="Resetcode">
                <Input
                  value={form.token}
                  required
                  onChange={(e) => update("token", e.target.value)}
                />
              </Field>
              <Field label="Nieuw wachtwoord">
                <Input
                  type="password"
                  value={form.newPassword}
                  required
                  autoComplete="new-password"
                  onChange={(e) => update("newPassword", e.target.value)}
                />
              </Field>
              <Button type="submit" variant="primary" className="w-full" disabled={busy}>
                {busy ? "Bezig…" : "Wachtwoord opslaan"}
              </Button>
            </>
          )}
          <div className="pt-1 text-center text-xs">
            <Link to="/inloggen" className="font-semibold text-pitch">
              Terug naar inloggen
            </Link>
          </div>
        </form>
      </Sheet>
    </AuthLayout>
  );
}
