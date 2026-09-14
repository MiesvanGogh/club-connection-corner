const dateFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortFmt = new Intl.DateTimeFormat("nl-NL", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateFmt.format(d);
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFmt.format(d).replace(",", ",");
}

export function formatShort(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return shortFmt.format(d).toUpperCase();
}

export function formatTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export function countdown(value?: string | null) {
  if (!value) return null;
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return null;
  const diff = d - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}u`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}u ${minutes}m`;
}

export function isPast(value?: string | null) {
  if (!value) return false;
  const d = new Date(value).getTime();
  return !Number.isNaN(d) && d < Date.now();
}

export function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toInputDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const statusLabels: Record<string, string> = {
  Gepland: "Gepland",
  OpstellingGemaakt: "Opstelling gemaakt",
  Gespeeld: "Gespeeld",
  Afgerond: "Afgerond",
  Geannuleerd: "Geannuleerd",
};

export const reasonLabels: Record<string, string> = {
  Injury: "Blessure",
  Vacation: "Vakantie",
  Sick: "Ziek",
  Other: "Overig",
};

export const roleLabels: Record<string, string> = {
  Player: "Speler",
  Trainer: "Trainer",
  Administrator: "Administrator",
};

export function initials(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim().charAt(0);
  const b = (last ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}

export function personName(p: {
  playerName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) {
  if (p.playerName) return p.playerName;
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "Onbekend";
}
