import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "./AppShell";
import { Loading } from "./ui-kit";
import { useActiveTeamId, useTeam, useTeams } from "@/lib/hooks";

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { teamId, setTeamId, ready } = useActiveTeamId();
  const teams = useTeams(auth.isAuthenticated && ready && !teamId);
  const team = useTeam(teamId);

  useEffect(() => {
    if (auth.ready && !auth.isAuthenticated) {
      navigate({ to: "/inloggen" });
    }
  }, [auth.ready, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (!teamId && teams.data && teams.data.length > 0) {
      setTeamId(teams.data[0]!.id);
    }
  }, [teamId, teams.data, setTeamId]);

  if (!auth.ready || !auth.isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center bg-frost-2">
        <Loading />
      </div>
    );
  }

  return <AppShell teamName={team.data?.name}>{children}</AppShell>;
}
