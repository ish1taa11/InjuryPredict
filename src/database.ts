import { Athlete, Coach } from "./types";

const ATHLETES_KEY = "injurypredict-athletes";
const COACHES_KEY = "injurypredict-coaches";

export function getAthletes(): Athlete[] {
  const data = localStorage.getItem(ATHLETES_KEY);

  return data ? JSON.parse(data) : [];
}

export function saveAthletes(data: Athlete[]) {
  localStorage.setItem(
    ATHLETES_KEY,
    JSON.stringify(data)
  );
}

export function getCoaches(): Coach[] {
  const data = localStorage.getItem(COACHES_KEY);

  return data ? JSON.parse(data) : [];
}

export function saveCoaches(data: Coach[]) {
  localStorage.setItem(
    COACHES_KEY,
    JSON.stringify(data)
  );
}