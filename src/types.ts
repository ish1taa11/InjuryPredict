export type UserRole = "coach" | "athlete";

export interface User {
  id: string;
  role: UserRole;

  email: string;
  password: string;

  firstName: string;
  lastName: string;

  profileImage?: string;

  phone?: string;

  createdAt: string;
}

export interface Coach extends User {
  role: "coach";

  organization: string;
  designation: string;

  athleteIds: string[];
}

export interface Athlete extends User {
  role: "athlete";

  age: number;
  gender: "Male" | "Female" | "Other";

  sport: string;
  position: string;

  height: number;
  weight: number;

  dominantSide: "Left" | "Right";

  coachId?: string;

  medicalHistory: MedicalHistory;

  screenings: Screening[];
}

export interface MedicalHistory {
  previousInjuries: string[];
  surgeries: string[];
  allergies: string[];

  medications: string[];

  notes: string;
}

export interface Screening {

  id:string;

  athleteId:string;

  date:string;

  overallScore:number;

  kneeAsymmetry:number;

  shoulderAsymmetry:number;

  hipAsymmetry:number;

  riskIndicators:RiskIndicator[];

  reportUrl?:string;
}

export interface RiskIndicator{

  region:string;

  level:"Low"|"Moderate"|"High";

  detail:string;
}