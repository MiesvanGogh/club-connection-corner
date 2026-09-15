import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge, Empty, ErrorNote, Loading, Sheet } from "@/components/ui-kit";
import { useActiveTeamId, useMatches } from "@/lib/hooks";
import { countdown, formatShort, formatTime, isPast, statusLabels } from "@/lib/format";
import type { Match } from "@/lib/types";

export const Route = createFileRoute("/wedstrijden/")({
  head: () => ({
    meta: [
      { title: "Wedstrijden — HVCHTeam" },
      {
        name: "description",
        content: "Alle wedstrijden van je team met datum, locatie en aanwezigheid.",
      },
      { property: "og:title", content: "Wedstrijden — HVCHTeam" },
      {
        property: "og:description",
        content: "Alle wedstrijden van je team met datum, locatie en aanwezigheid.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MatchesPage />
    </RequireAuth>
  ),
});

function MatchCard({ match }: { match: Match }) {
  const left = countdown(match.attendanceDeadline);
  return (
    <Link
      to="/wedstrijden/$matchId"
      params={{ matchId: match.id }}
      className="sheet-inner block p-4 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label-mono">{formatShort(match.dateTime)} · {formatTime(match.dateTime)}</div>
          <div className="mt-1 truncate text-sm font-semibold">
            {match.homeAway === "Home" ? "Thuis" : "Uit"} tegen {match.opponent}
          </div>
          <div className="mt-0.5 truncate text-xs text-ink-soft">{match.location}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={match.status === "Geannuleerd" ? "danger" : "pitch"}>
            {statusLabels[match.status] ?? match.status}
          </Badge>
          {typeof match.scoreFor === "number" && typeof match.scoreAgainst === "number" ? (
            <div className="font-mono text-sm font-semibold">
              {match.scoreFor}–{match.scoreAgainst}
            </div>
          ) : left ? (
            <div className="font-mono text-[10px] text-amber">nog {left}</div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function MatchesPage() {
  const { teamId } = useActiveTeamId();
  const matches = useMatches(teamId);

  const { upcoming, past } = useMemo(() => {
    const all = [...(matches.data ?? [])].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
    return {
      upcoming: all.filter((m) => !isPast(m.dateTime)),
      past: all.filter((m) => isPast(m.dateTime)).reverse(),
    };
  }, [matches.data]);

  if (matches.isLoading) return <Loading />;

  return (
    <>
      <ErrorNote message={(matches.error as Error | null)?.message} />
      <Sheet>
        <div className="space-y-2 p-3">
          <div className="label-mono px-1">Komende wedstrijden</div>
          {upcoming.length === 0 ? (
            <Empty>Geen geplande wedstrijden.</Empty>
          ) : (
            upcoming.map((m) => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      </Sheet>
      <Sheet delay={80}>
        <div className="space-y-2 p-3">
          <div className="label-mono px-1">Gespeeld</div>
          {past.length === 0 ? (
            <Empty>Nog geen gespeelde wedstrijden.</Empty>
          ) : (
            past.map((m) => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      </Sheet>
    </>
  );
}
