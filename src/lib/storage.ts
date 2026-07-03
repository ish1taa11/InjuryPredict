// ============================================================
// InjuryPredict — Data Layer
// ============================================================

export type UserRole = 'coach' | 'athlete';

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  experience: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface Athlete {
  id: string;
  coachId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  sport: string;
  position: string;
  height: string;
  weight: string;
  dominantHand: 'Left' | 'Right';
  dominantLeg: 'Left' | 'Right';
  experience: string;
  trainingHours: string;
  previousInjuries: string;
  currentPain: string;
  emergencyContact: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface Screening {
  id: string;
  athleteId: string;
  coachId: string;
  date: string;
  sport: string;
  overallScore: number;
  riskIndicators: { region: string; level: string }[];
  findings: { observation: string; severity: string; area: string }[];
  exercises: { name: string; description: string; difficulty: string; sets: string; targetArea: string }[];
  kneeAsymmetry: number;
  shoulderAsymmetry: number;
  hipAsymmetry: number;
  skeletonImageUrl: string | null;
  poseDetected: boolean;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  name: string;
}

// ─── Storage Keys ─────────────────────────────────────────────
const KEYS = {
  coaches:         'ip_coaches',
  athletes:        'ip_athletes',
  screenings:      'ip_screenings',
  session:         'ip_session',
  athleteAccounts: 'ip_athlete_accounts',
} as const;

// ─── Helpers ──────────────────────────────────────────────────
function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Password Storage ─────────────────────────────────────────
// Stored as plain text for localStorage demo.
// Replace with Supabase auth when migrating.

export function storePassword(userId: string, password: string): void {
  localStorage.setItem(`ip_pwd_${userId}`, password);
}

export function checkPassword(userId: string, password: string): boolean {
  const stored = localStorage.getItem(`ip_pwd_${userId}`);
  return stored === password;
}

// ─── Session ──────────────────────────────────────────────────
export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(KEYS.session, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.session);
}

// ─── Coaches ──────────────────────────────────────────────────
export function getCoaches(): Coach[] {
  return read<Coach>(KEYS.coaches);
}

export function getCoachById(id: string): Coach | null {
  return getCoaches().find(c => c.id === id) ?? null;
}

export function getCoachByEmail(email: string): Coach | null {
  return getCoaches().find(
    c => c.email.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

export function saveCoach(coach: Coach): void {
  const rest = getCoaches().filter(c => c.id !== coach.id);
  write(KEYS.coaches, [...rest, coach]);
}

// ─── Athletes ─────────────────────────────────────────────────
export function getAthletes(coachId: string): Athlete[] {
  return read<Athlete>(KEYS.athletes).filter(a => a.coachId === coachId);
}

export function getAthleteById(id: string): Athlete | null {
  return read<Athlete>(KEYS.athletes).find(a => a.id === id) ?? null;
}

export function saveAthlete(athlete: Athlete): void {
  const rest = read<Athlete>(KEYS.athletes).filter(a => a.id !== athlete.id);
  write(KEYS.athletes, [...rest, athlete]);
}

export function deleteAthlete(id: string): void {
  write(KEYS.athletes,   read<Athlete>(KEYS.athletes).filter(a => a.id !== id));
  write(KEYS.screenings, read<Screening>(KEYS.screenings).filter(s => s.athleteId !== id));
}

// ─── Athlete Accounts (for athlete self-login) ────────────────
export interface AthleteAccount {
  id: string;
  email: string;
}

export function getAthleteAccounts(): AthleteAccount[] {
  return read<AthleteAccount>(KEYS.athleteAccounts);
}

export function saveAthleteAccount(account: AthleteAccount): void {
  const rest = getAthleteAccounts().filter(a => a.id !== account.id);
  write(KEYS.athleteAccounts, [...rest, account]);
}

export function getAthleteAccountByEmail(email: string): AthleteAccount | null {
  return getAthleteAccounts().find(
    a => a.email.toLowerCase() === email.toLowerCase()
  ) ?? null;
}

// ─── Screenings ───────────────────────────────────────────────
export function getScreenings(athleteId: string): Screening[] {
  return read<Screening>(KEYS.screenings)
    .filter(s => s.athleteId === athleteId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllScreeningsByCoach(coachId: string): Screening[] {
  return read<Screening>(KEYS.screenings)
    .filter(s => s.coachId === coachId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveScreening(screening: Screening): void {
  const rest = read<Screening>(KEYS.screenings).filter(s => s.id !== screening.id);
  write(KEYS.screenings, [...rest, screening]);
}