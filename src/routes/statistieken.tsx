import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Empty, ErrorNote, Field, Loading, Select, Sheet, SheetHeader } from "@/components/ui-kit";
import { personName } from "@/lib/format";
import { useActiveTeamId, useSeasonStatistics, useSeasons } from "@/lib/hooks";

export const Route = createFileRoute("/statistieken")({
  head: () => ({
    meta: [
      { title: "Statistieken — HVCHTeam" },
      {
        name: "description",
        content: "Seizoensstatistieken van je team: goals, assists, minuten en vlaggen.",
      },
      { property: "og:title", content: "Statistieken — HVCHTeam" },
      {
        property: "og:description",
        content: "Seizoensstatistieken van je team: goals, assists, minuten en vlaggen.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <StatsPage />
    </RequireAuth>
  ),
});

const columns = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "minutesPlayed", label: "Minuten" },
  { key: "flaggingCount", label: "Vlaggen" },
] as const;

function StatsPage() {
  const { teamId } = useActiveTeamId();
  const seasons = useSeasons(teamId);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<(typeof columns)[number]["key"]>("goals");
  const stats = useSeasonStatistics(seasonId);

  useEffect(() => {
    if (!seasonId && seasons.data && seasons.data.length > 0) {
      const active = seasons.data.find((s) => s.isActive) ?? seasons.data[0]!;
      setSeasonId(active.id);
    }
  }, [seasonId, seasons.data]);

  const rows = [...(stats.data ?? [])].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <>
      <Sheet>
        <div className="grid grid-cols-2 gap-3 p-4">
          <Field label="Seizoen">
            <Select value={seasonId ?? ""} onChange={(e) => setSeasonId(e.target.value)}>
              {(seasons.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sorteer op">
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as typeof sortKey)}>
              {columns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Sheet>

      <Sheet delay={80}>
        <SheetHeader title="Stand" subtitle="Minuten · goals · assists · vlaggen" />
        <div className="space-y-2 p-3 pt-0">
          <ErrorNote message={(stats.error as Error | null)?.message} />
          {stats.isLoading ? (
            <Loading />
          ) : rows.length === 0 ? (
            <Empty>Nog geen statistieken voor dit seizoen.</Empty>
          ) : (
            rows.map((p, i) => (
              <div key={p.playerId} className="sheet-inner flex items-center gap-3 p-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-ink font-mono text-[10px] text-frost">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {personName(p)}
                </span>
                <span className="font-mono text-xs text-ink-soft">
                  {p.minutesPlayed}' · {p.goals}G · {p.assists}A · {p.flaggingCount}V
                </span>
              </div>
            ))
          )}
        </div>
      </Sheet>
    </>
  );
}
