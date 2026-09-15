import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Button, Empty, Field, Input, Sheet, SheetHeader } from "@/components/ui-kit";
import { getApiBase, setApiBase } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { personName, roleLabels } from "@/lib/format";
import { useActiveTeamId, useSeasonStatistics, useSeasons } from "@/lib/hooks";

export const Route = createFileRoute("/profiel")({
  head: () => ({
    meta: [
      { title: "Jouw profiel — HVCHTeam" },
      { name: "description", content: "Je eigen gegevens, rol en seizoensstatistieken." },
      { property: "og:title", content: "Jouw profiel — HVCHTeam" },
      {
        property: "og:description",
        content: "Je eigen gegevens, rol en seizoensstatistieken.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { teamId } = useActiveTeamId();
  const seasons = useSeasons(teamId);
  const active = seasons.data?.find((s) => s.isActive) ?? seasons.data?.[0] ?? null;
  const stats = useSeasonStatistics(active?.id ?? null);
  const [base, setBase] = useState("");

  useEffect(() => {
    setBase(getApiBase());
  }, []);

  const mine = stats.data?.find(
    (s) => s.playerId === auth.userId || personName(s) === auth.name,
  );

  const roleLabel = auth.isAdmin
    ? roleLabels["Administrator"]
    : auth.isTrainer
      ? roleLabels["Trainer"]
      : roleLabels["Player"];

  return (
    <>
      <Sheet>
        <SheetHeader
          title={auth.name ?? auth.email ?? "Jouw profiel"}
          subtitle={`${roleLabel}${auth.email ? ` · ${auth.email}` : ""}`}
        />
      </Sheet>

      <Sheet delay={60}>
        <SheetHeader title="Jouw seizoen" subtitle={active?.name ?? "Geen seizoen"} />
        <div className="p-3 pt-0">
          {mine ? (
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Wedstrijden", mine.matchesPlayed],
                ["Minuten", mine.minutesPlayed],
                ["Goals", mine.goals],
                ["Assists", mine.assists],
                ["Geel", mine.yellowCards],
                ["Vlaggen", mine.flaggingCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="sheet-inner p-3">
                  <div className="label-mono">{label}</div>
                  <div className="font-display text-2xl">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Nog geen statistieken voor dit seizoen.</Empty>
          )}
        </div>
      </Sheet>

      <Sheet delay={100}>
        <SheetHeader title="Serverinstellingen" />
        <div className="space-y-3 p-4 pt-0">
          <Field label="API-adres" hint="Het webadres van jouw server.">
            <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://…" />
          </Field>
          <Button onClick={() => setApiBase(base)}>Opslaan</Button>
        </div>
      </Sheet>

      <Sheet delay={140}>
        <div className="p-4">
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              auth.signOut();
              navigate({ to: "/inloggen" });
            }}
          >
            Uitloggen
          </Button>
        </div>
      </Sheet>
    </>
  );
}
