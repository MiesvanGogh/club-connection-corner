import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AppShell";
import { Button, ErrorNote, Field, Input, Sheet } from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuthResult } from "@/lib/types";

export const Route = createFileRoute("/registreren")({
  head: () => ({
    meta: [
      { title: "Account aanmaken — HVCHTeam" },
      {
        name: "description",
        content: "Maak een HVCHTeam-account en geef je aanwezigheid door.",
      },
      { property: "og:title", content: "Account aanmaken — HVCHTeam" },
      {
        property: "og:description",
        content: "Maak een HVCHTeam-account en geef je aanwezigheid door.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api<AuthResult>("/api/auth/register", {
        method: "POST",
        body: form,
        auth: false,
      });
      if (!res.succeeded || !res.token) {
        setError(res.errors?.join(", ") || "Registreren mislukt.");
        return;
      }
      auth.signIn(res.token);
      navigate({ to: "/wedstrijden" });
    } catch (err: any) {
      setError(err?.message ?? "Registreren mislukt.");
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
              Account aanmaken
            </h1>
            <p className="label-mono mt-1">Je start altijd als speler</p>
          </div>
          <ErrorNote message={error} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Voornaam">
              <Input
                value={form.firstName}
                required
                onChange={(e) => update("firstName", e.target.value)}
              />
            </Field>
            <Field label="Achternaam">
              <Input
                value={form.lastName}
                required
                onChange={(e) => update("lastName", e.target.value)}
              />
            </Field>
          </div>
          <Field label="E-mailadres">
            <Input
              type="email"
              value={form.email}
              required
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Wachtwoord">
            <Input
              type="password"
              value={form.password}
              required
              autoComplete="new-password"
              onChange={(e) => update("password", e.target.value)}
            />
          </Field>
          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? "Bezig…" : "Account aanmaken"}
          </Button>
          <div className="pt-1 text-center text-xs">
            <Link to="/inloggen" className="font-semibold text-pitch">
              Ik heb al een account
            </Link>
          </div>
        </form>
      </Sheet>
    </AuthLayout>
  );
}
