export type HomeAway = "Home" | "Away";
export type CompetitionType =
  | "Competitie"
  | "Beker"
  | "Oefenwedstrijd"
  | "Toernooi"
  | "Overig";
export type MatchStatus =
  | "Gepland"
  | "OpstellingGemaakt"
  | "Gespeeld"
  | "Afgerond"
  | "Geannuleerd";
export type AttendanceStatus = "Present" | "Absent";
export type AbsenceReason = "Injury" | "Vacation" | "Sick" | "Other";
export type LineupRole = "Starter" | "Substitute";
export type TeamRole = "Player" | "Trainer" | "Administrator";
export type RankingType = "Goals" | "Assists" | "MinutesPlayed" | "FlaggingCount";

export interface AuthResult {
  succeeded: boolean;
  token?: string | null;
  errors?: string[] | null;
}

export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  applicationUserId?: string | null;
  playerId?: string | null;
  firstName: string;
  lastName: string;
  role: TeamRole;
}

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Match {
  id: string;
  opponent: string;
  dateTime: string;
  location: string;
  homeAway: HomeAway;
  competitionType: CompetitionType;
  status: MatchStatus;
  attendanceDeadline?: string | null;
  scoreFor?: number | null;
  scoreAgainst?: number | null;
  seasonId?: string | null;
}

export interface AttendanceResponse {
  playerId: string;
  playerName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: AttendanceStatus;
  reason?: AbsenceReason | null;
  explanation?: string | null;
}

export interface AttendanceOverview {
  responses: AttendanceResponse[];
  unanswered: Array<{
    playerId: string;
    playerName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }>;
}

export interface LineupEntry {
  playerId: string;
  playerName?: string | null;
  role: LineupRole;
  position?: string | null;
}

export interface Lineup {
  entries: LineupEntry[];
}

export interface PlayerStatistic {
  playerId: string;
  playerName?: string | null;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface MatchStatistics {
  playerStatistics: PlayerStatistic[];
}

export interface FlaggerAssignment {
  playerId: string;
  playerName?: string | null;
}

export interface FlaggerHistoryItem {
  matchId: string;
  opponent?: string | null;
  dateTime?: string | null;
}

export interface SeasonPlayerStatistics {
  playerId: string;
  playerName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  matchesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  flaggingCount: number;
}

export interface RankingEntry {
  playerId: string;
  playerName?: string | null;
  value: number;
}

export interface PlayerProfile {
  playerId: string;
  firstName?: string | null;
  lastName?: string | null;
  playerName?: string | null;
  statistics?: SeasonPlayerStatistics | null;
  matchHistory?: Array<{
    matchId: string;
    opponent?: string | null;
    dateTime?: string | null;
    minutesPlayed?: number;
    goals?: number;
    assists?: number;
  }> | null;
}
