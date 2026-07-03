import { Athlete, Coach, UserRole } from "./types";

const CURRENT_USER = "injurypredict-current-user";

export function login(email: string, password: string) {
  const coaches: Coach[] = JSON.parse(localStorage.getItem("injurypredict-coaches") || "[]");
  const athletes: Athlete[] = JSON.parse(localStorage.getItem("injurypredict-athletes") || "[]");

  const user =
    coaches.find(c => c.email === email && c.password === password) ||
    athletes.find(a => a.email === email && a.password === password);

  if (!user) return null;

  localStorage.setItem(CURRENT_USER, JSON.stringify(user));

  return user;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER);

  if (!raw) return null;

  return JSON.parse(raw);
}