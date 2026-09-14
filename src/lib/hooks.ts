import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type {
  AttendanceOverview,
  FlaggerAssignment,
  Lineup,
  Match,
  MatchStatistics,
  RankingEntry,
  Season,
  SeasonPlayerStatistics,
  Team,
  TeamMember,
} from "./types";

const TEAM_KEY = "hvch_team";

export function useActiveTeamId() {
  const [teamId, setTeamIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTeamIdState(window.localStorage.getItem(TEAM_KEY));
    setReady(true);
  }, []);

  const setTeamId = useCallback((id: string | null) => {
    if (id) window.localStorage.setItem(TEAM_KEY, id);
    else window.localStorage.removeItem(TEAM_KEY);
    setTeamIdState(id);
  }, []);

  return { teamId, setTeamId, ready };
}

export function useTeams(enabled = true) {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => api<Team[]>("/api/teams"),
    enabled,
  });
}

export function useTeam(teamId: string | null) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api<Team>(`/api/teams/${teamId}`),
    enabled: Boolean(teamId),
  });
}

export function useMembers(teamId: string | null) {
  return useQuery({
    queryKey: ["members", teamId],
    queryFn: () => api<TeamMember[]>(`/api/teams/${teamId}/members`),
    enabled: Boolean(teamId),
  });
}

export function useSeasons(teamId: string | null) {
  return useQuery({
    queryKey: ["seasons", teamId],
    queryFn: () => api<Season[]>(`/api/teams/${teamId}/seasons`),
    enabled: Boolean(teamId),
  });
}

export function useMatches(teamId: string | null) {
  return useQuery({
    queryKey: ["matches", teamId],
    queryFn: () => api<Match[]>(`/api/teams/${teamId}/matches`),
    enabled: Boolean(teamId),
  });
}

export function useMatch(teamId: string | null, matchId: string) {
  return useQuery({
    queryKey: ["match", teamId, matchId],
    queryFn: () => api<Match>(`/api/teams/${teamId}/matches/${matchId}`),
    enabled: Boolean(teamId && matchId),
  });
}

export function useAttendance(teamId: string | null, matchId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["attendance", teamId, matchId],
    queryFn: () =>
      api<AttendanceOverview>(`/api/teams/${teamId}/matches/${matchId}/attendance`),
    enabled: Boolean(teamId && matchId) && enabled,
    retry: false,
  });
}

export function useLineup(teamId: string | null, matchId: string) {
  return useQuery({
    queryKey: ["lineup", teamId, matchId],
    queryFn: () => api<Lineup>(`/api/teams/${teamId}/matches/${matchId}/lineup`),
    enabled: Boolean(teamId && matchId),
    retry: false,
  });
}

export function useFlaggers(teamId: string | null, matchId: string) {
  return useQuery({
    queryKey: ["flaggers", teamId, matchId],
    queryFn: () =>
      api<FlaggerAssignment[]>(`/api/teams/${teamId}/matches/${matchId}/flaggers`),
    enabled: Boolean(teamId && matchId),
    retry: false,
  });
}

export function useMatchStatistics(teamId: string | null, matchId: string) {
  return useQuery({
    queryKey: ["match-stats", teamId, matchId],
    queryFn: () =>
      api<MatchStatistics>(`/api/teams/${teamId}/matches/${matchId}/statistics`),
    enabled: Boolean(teamId && matchId),
    retry: false,
  });
}

export function useSeasonStatistics(seasonId: string | null) {
  return useQuery({
    queryKey: ["season-stats", seasonId],
    queryFn: () => api<SeasonPlayerStatistics[]>(`/api/seasons/${seasonId}/statistics`),
    enabled: Boolean(seasonId),
  });
}

export function useRankings(seasonId: string | null, type: string) {
  return useQuery({
    queryKey: ["rankings", seasonId, type],
    queryFn: () => api<RankingEntry[]>(`/api/seasons/${seasonId}/rankings/${type}`),
    enabled: Boolean(seasonId),
  });
}
