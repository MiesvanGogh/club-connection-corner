import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { Badge, Empty, ErrorNote, Loading, Select, Sheet, SheetHeader } from "@/components/ui-kit";
import { initials, roleLabels } from "@/lib/format";
import { useActiveTeamId, useMembers, useTeams } from "@/lib/hooks";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Spelers — HVCHTeam" },
      { name: "description", content: "Bekijk alle spelers, trainers en beheerders van je team." },
      { property: "og:title", content: "Spelers — HVCHTeam" },
      {
        property: "og:description",
        content: "Bekijk alle spelers, trainers en beheerders van je team.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TeamPage />
    </RequireAuth>
  ),
});

function TeamPage() {
  const { teamId, setTeamId } = useActiveTeamId();
  const teams = useTeams();
  const members = useMembers(teamId);

  return (
    <>
      {(teams.data?.length ?? 0) > 1 ? (
        <Sheet>
          <div className="p-4">
            <Select value={teamId ?? ""} onChange={(e) => setTeamId(e.target.value)}>
              {(teams.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </Sheet>
      ) : null}

      <Sheet delay={60}>
        <SheetHeader title="Spelers" subtitle={`${members.data?.length ?? 0} teamleden`} />
        <div className="space-y-2 p-3 pt-0">
          <ErrorNote message={(members.error as Error | null)?.message} />
          {members.isLoading ? (
            <Loading />
          ) : (members.data?.length ?? 0) === 0 ? (
            <Empty>Nog geen teamleden.</Empty>
          ) : (
            (members.data ?? []).map((m) => (
              <div key={m.id} className="sheet-inner flex items-center gap-3 p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-mono text-[11px] text-frost">
                  {initials(m.firstName, m.lastName)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {m.firstName} {m.lastName}
                </span>
                <Badge tone={m.role === "Player" ? "neutral" : "amber"}>
                  {roleLabels[m.role] ?? m.role}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Sheet>
    </>
  );
}
