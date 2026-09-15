import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import {
  Badge,
  Button,
  Empty,
  ErrorNote,
  Field,
  Loading,
  Select,
  Sheet,
  SheetHeader,
} from "@/components/ui-kit";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  formatDateTime,
  personName,
  reasonLabels,
  statusLabels,
} from "@/lib/format";
import {
  useActiveTeamId,
  useAttendance,
  useFlaggers,
  useLineup,
  useMatch,
  useMatchStatistics,
} from "@/lib/hooks";
import type { AbsenceReason, AttendanceStatus } from "@/lib/types";

export const Route = createFileRoute("/wedstrijden/$matchId")({
  head: () => ({
    meta: [
      { title: "Wedstrijddetails — HVCHTeam" },
      {
        name: "description",
        content: "Aanwezigheid, opstelling, vlaggers en statistieken van deze wedstrijd.",
      },
      { property: "og:title", content: "Wedstrijddetails — HVCHTeam" },
      {
        property: "og:description",
        content: "Aanwezigheid, opstelling, vlaggers en statistieken van deze wedstrijd.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MatchDetail />
    </RequireAuth>
  ),
});

function MatchDetail() {
  const { matchId } = Route.useParams();
  const { teamId } = useActiveTeamId();
  const auth = useAuth();
  const qc = useQueryClient();

  const match = useMatch(teamId, matchId);
  const attendance = useAttendance(teamId, matchId, true);
  const lineup = useLineup(teamId, matchId);
  const flaggers = useFlaggers(teamId, matchId);
  const stats = useMatchStatistics(teamId, matchId);

  const [status, setStatus] = useState<AttendanceStatus>("Present");
  const [reason, setReason] = useState<AbsenceReason>("Other");

  const respond = useMutation({
    mutationFn: () =>
      api(`/api/teams/${teamId}/matches/${matchId}/attendance`, {
        method: "POST",
        body:
          status === "Present"
            ? { status: "Present" }
            : { status: "Absent", reason },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendance", teamId, matchId] });
    },
  });

  if (match.isLoading) return <Loading />;
  if (!match.data)
    return (
      <>
        <ErrorNote message={(match.error as Error | null)?.message ?? "Wedstrijd niet gevonden."} />
        <Link to="/wedstrijden" className="label-mono underline">
          Terug naar wedstrijden
        </Link>
      </>
    );

  const m = match.data;

  return (
    <>
      <Sheet>
        <SheetHeader
          title={`${m.homeAway === "Home" ? "Thuis" : "Uit"} tegen ${m.opponent}`}
          subtitle={`${formatDateTime(m.dateTime)} · ${m.location}`}
          right={<Badge tone="pitch">{statusLabels[m.status] ?? m.status}</Badge>}
        />
        {typeof m.scoreFor === "number" && typeof m.scoreAgainst === "number" ? (
          <div className="px-4 pb-4">
            <div className="sheet-inner p-4 text-center font-display text-3xl">
              {m.scoreFor} – {m.scoreAgainst}
            </div>
          </div>
        ) : null}
      </Sheet>

      <Sheet delay={60}>
        <SheetHeader
          title="Jouw aanwezigheid"
          subtitle={
            m.attendanceDeadline
              ? `Doorgeven vóór ${formatDateTime(m.attendanceDeadline)}`
              : "Geef door of je erbij bent"
          }
        />
        <div className="space-y-3 p-4 pt-0">
          <ErrorNote message={(respond.error as Error | null)?.message} />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={status === "Present" ? "pitch" : "ghost"}
              onClick={() => setStatus("Present")}
            >
              Aanwezig
            </Button>
            <Button
              variant={status === "Absent" ? "primary" : "ghost"}
              onClick={() => setStatus("Absent")}
            >
              Afwezig
            </Button>
          </div>
          {status === "Absent" ? (
            <Field label="Reden">
              <Select value={reason} onChange={(e) => setReason(e.target.value as AbsenceReason)}>
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
          <Button
            variant="primary"
            className="w-full"
            disabled={respond.isPending}
            onClick={() => respond.mutate()}
          >
            {respond.isPending ? "Bezig…" : "Doorgeven"}
          </Button>
        </div>
      </Sheet>

      {auth.canManage ? (
        <Sheet delay={100}>
          <SheetHeader title="Aanwezigheid team" subtitle="Overzicht van alle reacties" />
          <div className="space-y-2 p-3 pt-0">
            {attendance.isLoading ? (
              <Loading />
            ) : attendance.data ? (
              <>
                {attendance.data.responses.map((r) => (
                  <div
                    key={r.playerId}
                    className="sheet-inner flex items-center justify-between p-3"
                  >
                    <span className="truncate text-sm font-medium">{personName(r)}</span>
                    <Badge tone={r.status === "Present" ? "pitch" : "danger"}>
                      {r.status === "Present"
                        ? "Aanwezig"
                        : (reasonLabels[r.reason ?? "Other"] ?? "Afwezig")}
                    </Badge>
                  </div>
                ))}
                {attendance.data.unanswered.map((u) => (
                  <div
                    key={u.playerId}
                    className="sheet-inner flex items-center justify-between p-3"
                  >
                    <span className="truncate text-sm font-medium">{personName(u)}</span>
                    <Badge tone="amber">Geen reactie</Badge>
                  </div>
                ))}
              </>
            ) : (
              <Empty>Nog geen aanwezigheid beschikbaar.</Empty>
            )}
          </div>
        </Sheet>
      ) : null}

      <Sheet delay={140}>
        <SheetHeader title="Opstelling" />
        <div className="space-y-2 p-3 pt-0">
          {lineup.isLoading ? (
            <Loading />
          ) : lineup.data && lineup.data.entries.length > 0 ? (
            lineup.data.entries.map((e) => (
              <div key={e.playerId} className="sheet-inner flex items-center justify-between p-3">
                <span className="truncate text-sm font-medium">{personName(e)}</span>
                <Badge tone={e.role === "Starter" ? "pitch" : "neutral"}>
                  {e.role === "Starter" ? "Basis" : "Wissel"}
                  {e.position ? ` · ${e.position}` : ""}
                </Badge>
              </div>
            ))
          ) : (
            <Empty>De opstelling is nog niet gemaakt.</Empty>
          )}
        </div>
      </Sheet>

      <Sheet delay={180}>
        <SheetHeader title="Vlaggers" />
        <div className="space-y-2 p-3 pt-0">
          {flaggers.data && flaggers.data.length > 0 ? (
            flaggers.data.map((f) => (
              <div key={f.playerId} className="sheet-inner p-3 text-sm font-medium">
                {personName(f)}
              </div>
            ))
          ) : (
            <Empty>Nog geen vlaggers aangewezen.</Empty>
          )}
        </div>
      </Sheet>

      {stats.data && stats.data.playerStatistics.length > 0 ? (
        <Sheet delay={220}>
          <SheetHeader title="Statistieken" subtitle="Minuten · goals · assists" />
          <div className="space-y-2 p-3 pt-0">
            {stats.data.playerStatistics.map((p) => (
              <div key={p.playerId} className="sheet-inner flex items-center justify-between p-3">
                <span className="truncate text-sm font-medium">{personName(p)}</span>
                <span className="font-mono text-xs text-ink-soft">
                  {p.minutesPlayed}' · {p.goals}G · {p.assists}A
                </span>
              </div>
            ))}
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
