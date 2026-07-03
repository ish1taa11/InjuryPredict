import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Shield, Activity, Smartphone, ChevronRight, ArrowLeft, Dumbbell,
  CircleDot, Footprints, Timer, Search, Upload, Sun, User,
  Ruler, Clock, Film, X, AlertTriangle, Trophy, Download, Share2,
  RotateCcw, LogOut
} from 'lucide-react';
import { TrendGraph } from './TrendGraph';
import { generatePDFReport } from './generateReport';
import {
  getSession, clearSession,
  getAthletes, getAthleteById, getScreenings, saveScreening,
  type Athlete, type Screening, type Coach
} from './lib/storage';
import {
  RoleSelectionScreen,
  CoachLoginScreen,
  CoachRegisterScreen,
  AthleteLoginScreen,
  AthleteRegisterScreen,
} from './AuthScreens';
import { getCoachById } from './lib/storage';

// ─── Types ────────────────────────────────────────────────────

type Sport = 'Cricket' | 'Kabaddi' | 'Football' | 'Athletics' | 'General Screening';
type RiskLevel = 'Low' | 'Moderate' | 'High';

type Screen =
  | 'role-selection'
  | 'coach-login' | 'coach-register'
  | 'athlete-login' | 'athlete-register'
  | 'coach-dashboard'
  | 'athlete-dashboard'
  | 'athlete-profile'
  | 'sport-selection'
  | 'video-upload'
  | 'analysis'
  | 'results'
  | 'report';

interface RiskIndicator {
  region: string;
  level: RiskLevel;
  detail: string;
}

interface Finding {
  observation: string;
  severity: RiskLevel;
  area: string;
}

interface Exercise {
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: string;
  targetArea: string;
}

interface AnalysisResult {
  athleteName: string;
  date: string;
  sport: Sport;
  riskIndicators: RiskIndicator[];
  findings: Finding[];
  exercises: Exercise[];
  overallScore: number;
}

// ─── Mock Data Generator ──────────────────────────────────────

function generateMockResult(sport: Sport, athleteName: string): AnalysisResult {
  const sportRisks: Record<string, RiskIndicator[]> = {
    Cricket: [
      { region: 'Knee',     level: 'High',     detail: 'Medial knee valgus angle exceeds safe threshold' },
      { region: 'Shoulder', level: 'Moderate', detail: 'Rotational imbalance in bowling shoulder' },
      { region: 'Hip',      level: 'Low',      detail: 'Hip flexor range within normal limits' },
      { region: 'Spine',    level: 'Moderate', detail: 'Lumbar flexion pattern asymmetry' },
      { region: 'Ankle',    level: 'Low',      detail: 'Ankle dorsiflexion adequate' },
    ],
    Kabaddi: [
      { region: 'Knee',     level: 'High',     detail: 'Lateral knee instability during lunges' },
      { region: 'Shoulder', level: 'High',     detail: 'Repetitive strain indicators in rotator cuff' },
      { region: 'Hip',      level: 'Moderate', detail: 'Hip adductor tightness detected' },
      { region: 'Spine',    level: 'Moderate', detail: 'Cervical extension stress pattern' },
      { region: 'Ankle',    level: 'Moderate', detail: 'Eversion range limitation' },
    ],
    Football: [
      { region: 'Knee',     level: 'Moderate', detail: 'ACL strain risk from cutting movements' },
      { region: 'Shoulder', level: 'Low',      detail: 'Shoulder girdle stable' },
      { region: 'Hip',      level: 'Moderate', detail: 'Hip flexor-extensor imbalance' },
      { region: 'Spine',    level: 'Low',      detail: 'Core stability adequate' },
      { region: 'Ankle',    level: 'High',     detail: 'Inversion sprain susceptibility elevated' },
    ],
    Athletics: [
      { region: 'Knee',     level: 'Moderate', detail: 'Patellar tracking asymmetry' },
      { region: 'Shoulder', level: 'Low',      detail: 'Bilateral shoulder symmetry good' },
      { region: 'Hip',      level: 'High',     detail: 'Reduced hip rotation range' },
      { region: 'Spine',    level: 'Low',      detail: 'Sagittal alignment normal' },
      { region: 'Ankle',    level: 'Moderate', detail: 'Calf-Achilles complex tightness' },
    ],
    'General Screening': [
      { region: 'Knee',     level: 'Moderate', detail: 'Knee valgus detected during squat' },
      { region: 'Shoulder', level: 'Low',      detail: 'Bilateral shoulder range symmetrical' },
      { region: 'Hip',      level: 'Moderate', detail: 'Left-right asymmetry observed' },
      { region: 'Spine',    level: 'Low',      detail: 'Neutral spinal alignment maintained' },
      { region: 'Ankle',    level: 'Moderate', detail: 'Reduced dorsiflexion on left side' },
    ],
  };

  const sportFindings: Record<string, Finding[]> = {
    Cricket: [
      { observation: 'Knee valgus collapse detected during bowling delivery stride', severity: 'High',     area: 'Knee'     },
      { observation: 'Left-right shoulder asymmetry in follow-through',              severity: 'Moderate', area: 'Shoulder' },
      { observation: 'Lumbar spine hyperextension during delivery',                  severity: 'Moderate', area: 'Spine'    },
      { observation: 'Reduced hip stability on landing leg',                         severity: 'Low',      area: 'Hip'      },
    ],
    Kabaddi: [
      { observation: 'Knee valgus detected during raid lunges',                      severity: 'High',     area: 'Knee'     },
      { observation: 'Shoulder imbalance from repetitive arm extensions',            severity: 'High',     area: 'Shoulder' },
      { observation: 'Hip adductor tightness limits lateral movement',              severity: 'Moderate', area: 'Hip'      },
      { observation: 'Ankle instability on uneven surfaces',                         severity: 'Moderate', area: 'Ankle'    },
    ],
    Football: [
      { observation: 'ACL strain pattern during cutting maneuvers',                  severity: 'Moderate', area: 'Knee'     },
      { observation: 'Ankle inversion susceptibility on plant foot',                 severity: 'High',     area: 'Ankle'    },
      { observation: 'Hip flexor tightness limits stride length',                    severity: 'Moderate', area: 'Hip'      },
      { observation: 'Left-right asymmetry observed in gait cycle',                  severity: 'Low',      area: 'Spine'    },
    ],
    Athletics: [
      { observation: 'Reduced hip rotation range affects sprint mechanics',          severity: 'High',     area: 'Hip'      },
      { observation: 'Patellar tracking asymmetry in sprinting gait',               severity: 'Moderate', area: 'Knee'     },
      { observation: 'Calf-Achilles complex shows tightness patterns',              severity: 'Moderate', area: 'Ankle'    },
      { observation: 'Mild trunk rotation asymmetry in running',                    severity: 'Low',      area: 'Spine'    },
    ],
    'General Screening': [
      { observation: 'Knee valgus detected during bodyweight squat',                severity: 'Moderate', area: 'Knee'     },
      { observation: 'Left-right asymmetry observed in single-leg stance',          severity: 'Moderate', area: 'Hip'      },
      { observation: 'Reduced hip stability during dynamic movements',              severity: 'Moderate', area: 'Hip'      },
      { observation: 'Shoulder imbalance in overhead reach',                        severity: 'Low',      area: 'Shoulder' },
    ],
  };

  const sportExercises: Record<string, Exercise[]> = {
    Cricket: [
      { name: 'Clamshell',             description: 'Lie on your side with knees bent. Slowly raise your top knee while keeping feet together, then lower. Strengthens gluteus medius to reduce knee valgus.',        difficulty: 'Beginner',     sets: '3 x 15 each side', targetArea: 'Hip'     },
      { name: 'Bulgarian Split Squat', description: 'Rear foot elevated on bench. Lower into a deep squat, keeping front knee tracking over toes. Improves unilateral leg strength and stability.',                  difficulty: 'Intermediate', sets: '3 x 10 each leg',  targetArea: 'Knee'    },
      { name: 'Pallof Press',          description: 'Stand perpendicular to a resistance band anchored at chest height. Press band outward resisting rotation. Builds anti-rotation core stability for bowling.',     difficulty: 'Advanced',     sets: '3 x 12 each side', targetArea: 'Spine'   },
    ],
    Kabaddi: [
      { name: 'Glute Bridge',                      description: 'Lie on your back, knees bent. Drive hips up squeezing glutes at the top. Improves hip extension power and pelvic stability for raid movements.',      difficulty: 'Beginner',     sets: '3 x 20',           targetArea: 'Hip'      },
      { name: 'Single Leg Squat',                  description: 'Stand on one leg, lower into a partial squat keeping knee aligned over foot. Develops proprioception and knee stability for lunges.',                  difficulty: 'Intermediate', sets: '3 x 8 each leg',   targetArea: 'Knee'     },
      { name: 'Face Pull with External Rotation',  description: 'Using a cable or band at face height, pull toward forehead while rotating hands outward. Strengthens rotator cuff and rear deltoids.',               difficulty: 'Advanced',     sets: '3 x 15',           targetArea: 'Shoulder' },
    ],
    Football: [
      { name: 'Nordic Hamstring Curl', description: 'Kneel with partner holding ankles. Slowly lower torso forward using hamstrings to control descent. Prevents hamstring and ACL injuries.',                         difficulty: 'Intermediate', sets: '3 x 6',                targetArea: 'Knee'  },
      { name: 'Ankle Alphabet',        description: 'Lift one foot and trace each letter of the alphabet in the air using only your ankle. Restores full ankle mobility and proprioception.',                          difficulty: 'Beginner',     sets: '1 x A-Z each foot',    targetArea: 'Ankle' },
      { name: 'Lateral Band Walk',     description: 'Place resistance band around ankles. Maintain quarter squat and walk sideways keeping tension on band. Builds hip abductor endurance for cutting.',               difficulty: 'Beginner',     sets: '3 x 20 each direction', targetArea: 'Hip'  },
    ],
    Athletics: [
      { name: '90/90 Hip Rotation Drill', description: 'Sit with front leg at 90-degree hip flexion and back leg at 90-degree extension. Rotate to switch leg positions. Restores hip internal and external rotation.', difficulty: 'Beginner',     sets: '3 x 10 each direction', targetArea: 'Hip'   },
      { name: 'Eccentric Calf Raise',     description: 'Rise onto toes with both feet, then slowly lower using only one foot over 3-4 seconds. Strengthens Achilles tendon and calf complex.',                         difficulty: 'Intermediate', sets: '3 x 15 each foot',      targetArea: 'Ankle' },
      { name: 'Single Leg Deadlift',      description: 'Hold a light weight, hinge forward on one leg while extending the other back. Keep hips level. Develops hamstring power and balance.',                         difficulty: 'Advanced',     sets: '3 x 8 each leg',        targetArea: 'Knee'  },
    ],
    'General Screening': [
      { name: 'Clamshell',        description: 'Lie on your side with knees bent. Slowly raise your top knee while keeping feet together, then lower. Strengthens gluteus medius to reduce knee valgus.', difficulty: 'Beginner',     sets: '3 x 15 each side', targetArea: 'Hip'  },
      { name: 'Glute Bridge',     description: 'Lie on your back, knees bent. Drive hips up squeezing glutes at the top. Improves hip extension and pelvic stability.',                                   difficulty: 'Beginner',     sets: '3 x 20',           targetArea: 'Hip'  },
      { name: 'Single Leg Squat', description: 'Stand on one leg, lower into a partial squat keeping knee aligned over foot. Develops proprioception and unilateral stability.',                          difficulty: 'Intermediate', sets: '3 x 8 each leg',   targetArea: 'Knee' },
    ],
  };

  const risks     = sportRisks[sport]     || sportRisks['General Screening'];
  const findings  = sportFindings[sport]  || sportFindings['General Screening'];
  const exercises = sportExercises[sport] || sportExercises['General Screening'];

  const riskScore: Record<RiskLevel, number> = { Low: 10, Moderate: 50, High: 90 };
  const totalRisk    = risks.reduce((sum, r) => sum + riskScore[r.level], 0);
  const overallScore = Math.round(100 - totalRisk / risks.length);

  return {
    athleteName: athleteName || 'Athlete',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    sport,
    riskIndicators: risks,
    findings,
    exercises,
    overallScore,
  };
}

// ─── Risk Badge Styles ────────────────────────────────────────

const riskBadge: Record<RiskLevel, { bg: string; text: string; dot: string; border: string }> = {
  Low:      { bg: 'bg-green-50',  text: 'text-risk-low',      dot: 'bg-risk-low',      border: 'border-green-200'  },
  Moderate: { bg: 'bg-yellow-50', text: 'text-risk-moderate', dot: 'bg-risk-moderate', border: 'border-yellow-200' },
  High:     { bg: 'bg-red-50',    text: 'text-risk-high',     dot: 'bg-risk-high',     border: 'border-red-200'    },
};

// ─── Body Silhouette ──────────────────────────────────────────

function BodySilhouette({ riskIndicators }: { riskIndicators: RiskIndicator[] }) {
  const positions: Record<string, { cx: number; cy: number }> = {
    Shoulder: { cx: 100, cy: 55  },
    Spine:    { cx: 100, cy: 100 },
    Hip:      { cx: 100, cy: 145 },
    Knee:     { cx: 100, cy: 190 },
    Ankle:    { cx: 100, cy: 235 },
  };
  const riskColors: Record<RiskLevel, string> = {
    Low: '#22c55e', Moderate: '#eab308', High: '#ef4444',
  };

  return (
    <svg viewBox="0 0 200 280" className="w-full max-w-[200px] mx-auto" fill="none">
      <g stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
        <circle cx="100" cy="20" r="14" />
        <line x1="100" y1="34"  x2="100" y2="48"  />
        <line x1="65"  y1="55"  x2="135" y2="55"  />
        <line x1="65"  y1="55"  x2="50"  y2="95"  />
        <line x1="50"  y1="95"  x2="42"  y2="130" />
        <line x1="135" y1="55"  x2="150" y2="95"  />
        <line x1="150" y1="95"  x2="158" y2="130" />
        <line x1="85"  y1="55"  x2="85"  y2="140" />
        <line x1="115" y1="55"  x2="115" y2="140" />
        <line x1="85"  y1="140" x2="115" y2="140" />
        <line x1="85"  y1="140" x2="78"  y2="190" />
        <line x1="78"  y1="190" x2="75"  y2="235" />
        <line x1="115" y1="140" x2="122" y2="190" />
        <line x1="122" y1="190" x2="125" y2="235" />
      </g>
      {riskIndicators.map((ri) => {
        const pos   = positions[ri.region];
        if (!pos) return null;
        const color = riskColors[ri.level];
        return (
          <g key={ri.region}>
            <circle cx={pos.cx} cy={pos.cy} r="8" fill={color} opacity="0.15">
              <animate attributeName="r"       values="8;14;8"         dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={pos.cx} cy={pos.cy} r="5" fill={color} />
            <circle cx={pos.cx} cy={pos.cy} r="5" fill="white" opacity="0.3" />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Coach Dashboard ──────────────────────────────────────────

function CoachDashboardScreen({
  coach,
  onSelectAthlete,
  onNewAthlete,
  onLogout,
}: {
  coach: Coach;
  onSelectAthlete: (a: Athlete) => void;
  onNewAthlete: () => void;
  onLogout: () => void;
}) {
  const [search, setSearch] = useState('');

  // Always read fresh from storage on every mount — this is what fixes the count
  const athletes      = getAthletes(coach.id);
  const allScreenings = athletes.flatMap(a => getScreenings(a.id));
  const highRiskCount = athletes.filter(a => {
    const s    = getScreenings(a.id);
    const last = s[s.length - 1];
    return last && last.overallScore < 50;
  }).length;

  const filtered = athletes.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sport.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskColor = (score: number) =>
    score >= 75 ? 'text-risk-low bg-green-50 border-green-200' :
    score >= 50 ? 'text-risk-moderate bg-yellow-50 border-yellow-200' :
                  'text-risk-high bg-red-50 border-red-200';

  return (
    <div className="screen-container bg-slate-50">
      <header className="bg-white px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center shadow-md shadow-brand-500/20">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Coach Portal</p>
              <p className="text-sm font-bold text-slate-900">{coach.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search athletes or sports..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
          />
        </div>
      </header>

      <div className="screen-content gap-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Athletes',   value: athletes.length,      color: 'text-brand-600' },
            { label: 'High Risk',  value: highRiskCount,        color: 'text-risk-high' },
            { label: 'Screenings', value: allScreenings.length, color: 'text-teal-600'  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-3 ring-1 ring-slate-100 text-center">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {highRiskCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
            <AlertTriangle className="h-4 w-4 text-risk-high shrink-0" />
            <p className="text-xs text-red-700 font-medium">
              {highRiskCount} athlete{highRiskCount > 1 ? 's' : ''} in high-risk zone — review recommended
            </p>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {search ? `Results for "${search}"` : 'All Athletes'}
          </h3>
          <button
            onClick={onNewAthlete}
            className="text-xs font-bold text-white bg-brand-600 px-3 py-1.5 rounded-xl hover:bg-brand-700 transition-colors"
          >
            + New Scan
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <User className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {search ? 'No athletes match your search' : 'No athletes yet'}
            </p>
            {!search && (
              <button onClick={onNewAthlete} className="text-xs text-brand-600 font-semibold">
                Run your first screening →
              </button>
            )}
          </div>
        )}

        {filtered.map((athlete) => {
          const screenings = getScreenings(athlete.id);
          const last       = screenings[screenings.length - 1];
          const prev       = screenings[screenings.length - 2];
          const score      = last?.overallScore ?? null;
          const trend      = last && prev ? last.overallScore - prev.overallScore : null;

          return (
            <button
              key={athlete.id}
              onClick={() => onSelectAthlete(athlete)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm text-left hover:ring-brand-300 transition-all"
            >
              {athlete.photoUrl ? (
                <img src={athlete.photoUrl} alt={athlete.name} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-black text-sm">
                  {athlete.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{athlete.name}</p>
                <p className="text-[11px] text-slate-400">
                  {athlete.sport} · Age {athlete.age} · {screenings.length} screening{screenings.length !== 1 ? 's' : ''}
                </p>
              </div>
              {score !== null && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg border ${getRiskColor(score)}`}>
                    {score}
                  </span>
                  {trend !== null && (
                    <span className={`text-[10px] font-bold ${trend < 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                      {trend < 0 ? '↓' : '↑'} {Math.abs(trend)}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Athlete Profile Screen ───────────────────────────────────

function AthleteProfileScreen({
  athlete,
  onBack,
  onNewScan,
}: {
  athlete: Athlete;
  onBack: () => void;
  onNewScan: () => void;
}) {
  const screenings = getScreenings(athlete.id);
  const trendData  = screenings.map(s => ({ date: s.date, score: s.overallScore }));
  const last       = screenings[screenings.length - 1];

  const riskBadgeColor = (level: string) =>
    level === 'High'     ? 'text-risk-high bg-red-50 border-red-200' :
    level === 'Moderate' ? 'text-risk-moderate bg-yellow-50 border-yellow-200' :
                           'text-risk-low bg-green-50 border-green-200';

  return (
    <div className="screen-container bg-slate-50">
      <header className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost -ml-2 px-2">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">{athlete.name}</h1>
            <p className="text-[11px] text-slate-400">{athlete.sport} · Age {athlete.age}</p>
          </div>
        </div>
        <button onClick={onNewScan} className="text-xs font-bold text-white bg-brand-600 px-3 py-1.5 rounded-xl">
          New Scan
        </button>
      </header>

      <div className="screen-content gap-4 py-4">

        {/* Athlete info card */}
        <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm flex items-center gap-3">
          {athlete.photoUrl ? (
            <img src={athlete.photoUrl} alt={athlete.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-black text-lg">
              {athlete.name.split(' ').map(n => n[0]).join('')}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">{athlete.name}</p>
            <p className="text-xs text-slate-500">{athlete.sport} · {athlete.position || 'No position set'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {athlete.height && athlete.weight ? `${athlete.height} · ${athlete.weight}` : ''}
              {athlete.experience ? ` · ${athlete.experience} exp.` : ''}
            </p>
          </div>
        </div>

        {/* Athlete details */}
        <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Athlete Information</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Gender',          value: athlete.gender           },
              { label: 'Dominant Hand',   value: athlete.dominantHand     },
              { label: 'Dominant Leg',    value: athlete.dominantLeg      },
              { label: 'Training Hours',  value: athlete.trainingHours ? `${athlete.trainingHours}/week` : '—' },
              { label: 'Experience',      value: athlete.experience || '—'       },
              { label: 'Current Pain',    value: athlete.currentPain || 'None'   },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          {athlete.previousInjuries && (
            <div className="mt-2 bg-amber-50 rounded-xl p-2.5">
              <p className="text-[10px] text-amber-600 uppercase tracking-wide font-semibold">Previous Injuries</p>
              <p className="text-xs text-slate-700 mt-0.5">{athlete.previousInjuries}</p>
            </div>
          )}
        </div>

        {/* Trend Graph */}
        <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score Trend</h3>
            <span className="text-[10px] text-slate-400">{screenings.length} screenings</span>
          </div>
          {trendData.length >= 2 ? (
            <>
              <TrendGraph data={trendData} />
              {(() => {
                const first  = trendData[0].score;
                const latest = trendData[trendData.length - 1].score;
                const change = latest - first;
                return (
                  <p className={`text-xs font-semibold mt-3 text-center ${change < 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                    {change < 0
                      ? `⚠️ Risk score dropped ${Math.abs(change)} points — intervention recommended`
                      : `✅ Risk score improved ${change} points since first screening`}
                  </p>
                );
              })()}
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">
              {screenings.length === 0
                ? 'No screenings yet — tap New Scan to begin'
                : 'Need at least 2 screenings to show trend'}
            </p>
          )}
        </div>

        {/* Latest Screening */}
        {last && (
          <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Latest Screening — {last.date}
            </h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-black text-brand-600">{last.overallScore}</p>
                <p className="text-xs text-slate-400">Movement Score</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2">
                  <p className="text-sm font-black text-slate-900">{last.kneeAsymmetry.toFixed(1)}°</p>
                  <p className="text-[9px] text-slate-400 uppercase">Knee</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <p className="text-sm font-black text-slate-900">{last.shoulderAsymmetry.toFixed(1)}%</p>
                  <p className="text-[9px] text-slate-400 uppercase">Shoulder</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <p className="text-sm font-black text-slate-900">{last.hipAsymmetry.toFixed(1)}%</p>
                  <p className="text-[9px] text-slate-400 uppercase">Hip</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {last.riskIndicators.map((ri) => (
                <div key={ri.region} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{ri.region}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeColor(ri.level)}`}>
                    {ri.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening History */}
        {screenings.length > 0 && (
          <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Screening History ({screenings.length})
            </h3>
            <div className="flex flex-col gap-2">
              {[...screenings].reverse().map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{s.date} · {s.sport}</p>
                    <p className="text-[10px] text-slate-400">
                      Knee {s.kneeAsymmetry.toFixed(1)}° · Hip {s.hipAsymmetry.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Latest</span>
                    )}
                    <span className={`text-xs font-black px-2 py-1 rounded-lg border ${
                      s.overallScore >= 75 ? 'text-risk-low bg-green-50 border-green-200' :
                      s.overallScore >= 50 ? 'text-risk-moderate bg-yellow-50 border-yellow-200' :
                                             'text-risk-high bg-red-50 border-red-200'
                    }`}>{s.overallScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Athlete Self-Service Dashboard ──────────────────────────

function AthleteDashboardScreen({
  athlete,
  onLogout,
}: {
  athlete: Athlete;
  onLogout: () => void;
}) {
  const screenings = getScreenings(athlete.id);
  const last       = screenings[screenings.length - 1];
  const trendData  = screenings.map(s => ({ date: s.date, score: s.overallScore }));

  const riskBadgeColor = (level: string) =>
    level === 'High'     ? 'text-risk-high bg-red-50 border-red-200' :
    level === 'Moderate' ? 'text-risk-moderate bg-yellow-50 border-yellow-200' :
                           'text-risk-low bg-green-50 border-green-200';

  return (
    <div className="screen-container bg-slate-50">
      <header className="bg-white px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {athlete.photoUrl ? (
              <img src={athlete.photoUrl} alt={athlete.name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-black text-sm">
                {athlete.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Athlete Portal</p>
              <p className="text-sm font-bold text-slate-900">{athlete.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="screen-content gap-4 py-4">
        {last ? (
          <div className={`rounded-2xl p-4 shadow-sm ${
            last.overallScore >= 75 ? 'bg-green-50 ring-1 ring-green-200' :
            last.overallScore >= 50 ? 'bg-yellow-50 ring-1 ring-yellow-200' :
                                       'bg-red-50 ring-1 ring-red-200'
          }`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Latest Risk Score</p>
            <div className="flex items-end justify-between">
              <span className={`text-4xl font-black ${
                last.overallScore >= 75 ? 'text-risk-low' :
                last.overallScore >= 50 ? 'text-risk-moderate' : 'text-risk-high'
              }`}>{last.overallScore}<span className="text-lg font-normal text-slate-400">/100</span></span>
              <span className="text-xs text-slate-400">{last.date}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {last.overallScore >= 75 ? 'Movement profile looks good.' :
               last.overallScore >= 50 ? 'Some risk factors detected. Follow exercises.' :
                                          'Significant risk detected. Consult your coach.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-brand-50 ring-1 ring-brand-200 p-4 text-center">
            <p className="text-sm font-bold text-brand-700">No screenings yet</p>
            <p className="text-xs text-brand-500 mt-1">Ask your coach to run a screening for you</p>
          </div>
        )}

        {trendData.length >= 2 && (
          <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Trend</h3>
            <TrendGraph data={trendData} />
          </div>
        )}

        {last && (
          <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Joint Risk — Latest Scan</h3>
            <div className="flex flex-col gap-2">
              {last.riskIndicators.map((ri) => (
                <div key={ri.region} className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{ri.region}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadgeColor(ri.level)}`}>
                    {ri.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {screenings.length > 0 && (
          <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              All Screenings ({screenings.length})
            </h3>
            <div className="flex flex-col gap-2">
              {[...screenings].reverse().map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{s.date} · {s.sport}</p>
                    <p className="text-[10px] text-slate-400">
                      Knee {s.kneeAsymmetry.toFixed(1)}° · Hip {s.hipAsymmetry.toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Latest</span>
                    )}
                    <span className={`text-xs font-black px-2 py-1 rounded-lg border ${
                      s.overallScore >= 75 ? 'text-risk-low bg-green-50 border-green-200' :
                      s.overallScore >= 50 ? 'text-risk-moderate bg-yellow-50 border-yellow-200' :
                                             'text-risk-high bg-red-50 border-red-200'
                    }`}>{s.overallScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sport Selection ──────────────────────────────────────────

function SportSelectionScreen({
  onBack, onSelect, selected,
}: {
  onBack: () => void;
  onSelect: (sport: Sport) => void;
  selected: Sport | null;
}) {
  const sports: { name: Sport; icon: typeof Activity; desc: string; gradient: string }[] = [
    { name: 'Cricket',           icon: Dumbbell,   desc: 'Bowling & batting mechanics', gradient: 'from-blue-500 to-blue-600'     },
    { name: 'Kabaddi',           icon: CircleDot,  desc: 'Raid & defense movements',    gradient: 'from-orange-500 to-red-500'    },
    { name: 'Football',          icon: Footprints, desc: 'Running & cutting patterns',  gradient: 'from-green-500 to-emerald-600' },
    { name: 'Athletics',         icon: Timer,      desc: 'Sprint & jump analysis',      gradient: 'from-violet-500 to-purple-600' },
    { name: 'General Screening', icon: Search,     desc: 'Overall movement assessment', gradient: 'from-teal-500 to-cyan-600'     },
  ];

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Select Sport</h1>
          <p className="text-xs text-slate-400">Choose the athlete's primary sport</p>
        </div>
      </header>

      <div className="screen-content gap-3 pt-2">
        {sports.map(({ name, icon: Icon, desc, gradient }, i) => {
          const isSelected = selected === name;
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 animate-slide-up ${
                isSelected
                  ? 'bg-brand-50 ring-2 ring-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-white ring-1 ring-slate-100 hover:ring-slate-200 hover:shadow-sm'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-400 truncate">{desc}</p>
              </div>
              <div className={`h-5 w-5 shrink-0 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300'}`}>
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
        <div className="mt-4">
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Upload ─────────────────────────────────────────────

function VideoUploadScreen({
  onBack, onAnalyze, sport, error,
}: {
  onBack: () => void;
  onAnalyze: (file: File) => void;
  sport: Sport;
  error?: string | null;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile]             = useState<File | null>(null);
  const inputRef                    = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type.startsWith('video/')) setFile(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const guidelines = [
    { icon: Sun,   label: 'Good lighting',    detail: 'Natural or bright indoor light' },
    { icon: User,  label: 'Full body visible', detail: 'Head to toes in frame'          },
    { icon: Ruler, label: '3-5 meters away',  detail: 'Maintain proper distance'        },
    { icon: Clock, label: '10-30 seconds',    detail: 'Capture full movement cycle'     },
  ];

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Upload Video</h1>
          <p className="text-xs text-slate-400">Sport: {sport}</p>
        </div>
      </header>

      <div className="screen-content gap-5 pt-2">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-3.5 animate-slide-up">
            <AlertTriangle className="h-4 w-4 text-risk-high shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer ${
            isDragging ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
            : file     ? 'border-green-400 bg-green-50/30'
                       : 'border-slate-200 bg-white/60 hover:border-brand-400 hover:bg-brand-50/20'
          }`}
        >
          <input
            type="file" ref={inputRef} accept="video/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ${file ? 'from-green-500 to-emerald-600' : 'from-brand-500 to-teal-500'}`}>
            {file ? <Film className="h-6 w-6 text-white" /> : <Upload className="h-6 w-6 text-white" />}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">{file ? file.name : 'Choose video or drag here'}</p>
            <p className="text-xs text-slate-400 mt-1">{file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'MP4, MOV up to 100MB'}</p>
          </div>
          {file && (
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Recording Guidelines</h3>
          <div className="grid grid-cols-2 gap-2">
            {guidelines.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-100">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => file && onAnalyze(file)}
            disabled={!file}
            className="btn-primary w-full disabled:opacity-40"
          >
            Run Bio-Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analysis Loading ─────────────────────────────────────────

function AnalysisScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage]       = useState(0);

  const stages = [
    'Decoding video frames...',
    'Initializing MediaPipe tracking engine...',
    'Extracting biomechanical joint nodes...',
    'Calculating left/right joint symmetry parameters...',
    'Generating predictive injury risk model...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(timer); setTimeout(onComplete, 600); return 100; }
        const next = prev + Math.floor(Math.random() * 12) + 4;
        return next > 100 ? 100 : next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    setStage(Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1));
  }, [progress]);

  return (
    <div className="screen-container bg-slate-900 text-white">
      <div className="screen-content justify-center items-center gap-8 px-8 text-center">
        <div className="relative flex items-center justify-center w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="6" fill="transparent" />
            <circle cx="56" cy="56" r="48" stroke="#06b6d4" strokeWidth="6" fill="transparent"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <span className="absolute text-xl font-black tabular-nums tracking-tight">{progress}%</span>
        </div>
        <div className="flex flex-col gap-2 max-w-xs min-h-[4rem]">
          <h2 className="text-base font-bold text-slate-100 tracking-tight animate-pulse">Processing Biomechanics</h2>
          <p className="text-xs text-slate-400 leading-normal transition-all duration-300">{stages[stage]}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────

function ResultsScreen({
  result, skeletonImage, onBack, onViewReport,
}: {
  result: AnalysisResult;
  skeletonImage: string | null;
  onBack: () => void;
  onViewReport: () => void;
}) {
  return (
    <div className="screen-container bg-slate-50">
      <header className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost -ml-2 px-2 text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-slate-900">Analysis Summary</h1>
            <p className="text-[11px] text-slate-400">{result.sport} · {result.date}</p>
          </div>
        </div>
        <button onClick={onViewReport}
          className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors">
          Full Report
        </button>
      </header>

      <div className="screen-content gap-4 py-4 overflow-y-auto">
        <div className="card flex items-center justify-between p-4 bg-white ring-1 ring-slate-100 shadow-sm animate-slide-up">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Movement Score</span>
            <span className="text-2xl font-black text-slate-900">
              {result.overallScore}<span className="text-slate-300 text-lg font-normal">/100</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {result.overallScore >= 80 ? 'Optimal coordination profile.' :
               result.overallScore >= 50 ? 'Mild asymmetry risk flags identified.' :
                                            'High asymmetry layout. Corrections required.'}
            </p>
          </div>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-lg shadow-inner ${
            result.overallScore >= 80 ? 'bg-green-50 text-green-600' :
            result.overallScore >= 50 ? 'bg-yellow-50 text-yellow-600' :
                                         'bg-red-50 text-red-600'
          }`}>
            {result.overallScore >= 80 ? 'Good' : result.overallScore >= 50 ? 'Mod' : 'Risk'}
          </div>
        </div>

        {skeletonImage && (
          <div className="card animate-slide-up bg-white p-4 ring-1 ring-slate-100 shadow-sm rounded-2xl">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pose Analysis — Actual Frame
            </h3>
            <img src={skeletonImage} alt="Pose skeleton overlay"
              className="w-full rounded-xl shadow-inner border border-slate-100" />
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Green dots = detected joints · Blue lines = bone connections
            </p>
          </div>
        )}

        <div className="card grid grid-cols-5 gap-4 p-4 bg-white ring-1 ring-slate-100 shadow-sm animate-slide-up">
          <div className="col-span-2 flex items-center justify-center bg-slate-50/50 rounded-xl p-2 border border-slate-100">
            <BodySilhouette riskIndicators={result.riskIndicators} />
          </div>
          <div className="col-span-3 flex flex-col gap-2 justify-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joint Risk Profiles</h3>
            {result.riskIndicators.map((ri) => {
              const badge = riskBadge[ri.level];
              return (
                <div key={ri.region} className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-xs font-semibold text-slate-700">{ri.region}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {ri.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 animate-slide-up">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Biomechanical Anomalies</h3>
          {result.findings.map((finding, i) => (
            <div key={i} className="flex gap-3 bg-white p-3.5 rounded-xl ring-1 ring-slate-100 shadow-sm">
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                finding.severity === 'High' ? 'text-risk-high' :
                finding.severity === 'Moderate' ? 'text-risk-moderate' : 'text-risk-low'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">{finding.area} Observation</span>
                  <span className={`text-[9px] font-extrabold tracking-wide uppercase ${
                    finding.severity === 'High' ? 'text-risk-high' :
                    finding.severity === 'Moderate' ? 'text-risk-moderate' : 'text-risk-low'
                  }`}>{finding.severity} Risk</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-normal">{finding.observation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Report Screen ────────────────────────────────────────────

function ReportScreen({
  result, skeletonImage, athleteName, athleteAge, coachName, onBack, onNewAnalysis,
}: {
  result: AnalysisResult;
  skeletonImage: string | null;
  athleteName: string;
  athleteAge?: number;
  coachName?: string;
  onBack: () => void;
  onNewAnalysis: () => void;
}) {
  const handleDownloadPDF = async () => {
    await generatePDFReport({
      athleteName:  athleteName || result.athleteName,
      athleteAge,
      athleteSport: result.sport,
      coachName,
      screening: {
        date:              result.date,
        sport:             result.sport,
        overallScore:      result.overallScore,
        riskIndicators:    result.riskIndicators,
        findings:          result.findings,
        exercises:         result.exercises,
        kneeAsymmetry:     parseFloat(result.riskIndicators.find(r => r.region === 'Knee')?.detail?.match(/[\d.]+/)?.[0] ?? '0'),
        shoulderAsymmetry: parseFloat(result.riskIndicators.find(r => r.region === 'Shoulder')?.detail?.match(/[\d.]+/)?.[0] ?? '0'),
        hipAsymmetry:      parseFloat(result.riskIndicators.find(r => r.region === 'Hip')?.detail?.match(/[\d.]+/)?.[0] ?? '0'),
        skeletonImageUrl:  skeletonImage,
      },
    });
  };

  const handleShare = async () => {
    const text = [
      'InjuryPredict Screening Report',
      '',
      `Athlete: ${athleteName || result.athleteName}`,
      `Sport:   ${result.sport}`,
      `Date:    ${result.date}`,
      `Score:   ${result.overallScore}/100`,
      '',
      'Risk Summary:',
      ...result.riskIndicators.map(r => `• ${r.region}: ${r.level}`),
      '',
      'Generated by InjuryPredict — AI Injury Prevention',
    ].join('\n');

    if (navigator.share) {
      await navigator.share({ title: 'InjuryPredict Report', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="screen-container bg-slate-50">
      <header className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost -ml-2 px-2 text-slate-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-slate-900">Preventative Protocol</h1>
        </div>
        <button onClick={onNewAnalysis} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <RotateCcw className="h-5 w-5" />
        </button>
      </header>

      <div className="screen-content gap-5 py-4 overflow-y-auto">

        {/* Athlete + score summary */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 p-5 text-white shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">Screening Report</p>
              <h2 className="text-lg font-bold tracking-tight">{athleteName || result.athleteName}</h2>
              <p className="text-xs text-white/70 mt-0.5">
                {result.sport} · {result.date}
                {coachName ? ` · Coach: ${coachName}` : ''}
              </p>
            </div>
            <div className="flex flex-col items-center shrink-0">
              <span className="text-3xl font-black">{result.overallScore}</span>
              <span className="text-[10px] text-white/60 uppercase tracking-wider">/100</span>
            </div>
          </div>
        </div>

        {/* Corrective strategy */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md">
          <div className="flex items-center gap-2 text-brand-400">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Corrective Strategy</span>
          </div>
          <h2 className="text-lg font-bold mt-1 tracking-tight">Prescribed Corrective Exercises</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Targeted routines based on structural joint loads and asymmetrical movement trends.
          </p>
        </div>

        {/* Exercise list */}
        <div className="flex flex-col gap-3.5">
          {result.exercises.map((ex, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl ring-1 ring-slate-100 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {ex.targetArea}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 mt-1.5">{ex.name}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-slate-400 block">{ex.sets}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">
                    {ex.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{ex.description}</p>
            </div>
          ))}
        </div>

        {/* Risk summary */}
        <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Joint Risk Summary</h3>
          <div className="flex flex-col gap-2">
            {result.riskIndicators.map((ri) => {
              const badge = riskBadge[ri.level];
              return (
                <div key={ri.region} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-semibold text-slate-700">{ri.region}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {ri.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2">
          This report is for screening purposes only and does not constitute medical advice.
          Consult a qualified sports medicine professional for clinical diagnosis.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────

export default function App() {
  const initialScreen = (): Screen => {
    const session = getSession();
    if (!session) return 'role-selection';
    return session.role === 'coach' ? 'coach-dashboard' : 'athlete-dashboard';
  };

  const [screen, setScreen]                   = useState<Screen>(initialScreen);
  const [selectedSport, setSelectedSport]     = useState<Sport | null>(null);
  const [result, setResult]                   = useState<AnalysisResult | null>(null);
  const [skeletonImage, setSkeletonImage]     = useState<string | null>(null);
  const [uploadedFile, setUploadedFile]       = useState<File | null>(null);
  const [analysisError, setAnalysisError]     = useState<string | null>(null);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const [currentCoach, setCurrentCoach]     = useState<Coach | null>(() => {
    const s = getSession();
    return s?.role === 'coach' ? getCoachById(s.userId) : null;
  });
  const [currentAthlete, setCurrentAthlete] = useState<Athlete | null>(() => {
    const s = getSession();
    return s?.role === 'athlete' ? getAthleteById(s.userId) : null;
  });

  const refreshSession = useCallback(() => {
    const s = getSession();
    if (s?.role === 'coach') {
      setCurrentCoach(getCoachById(s.userId));
      setCurrentAthlete(null);
    } else if (s?.role === 'athlete') {
      setCurrentAthlete(getAthleteById(s.userId));
      setCurrentCoach(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setCurrentCoach(null);
    setCurrentAthlete(null);
    setScreen('role-selection');
    setSelectedSport(null);
    setResult(null);
    setSkeletonImage(null);
    setUploadedFile(null);
    setAnalysisError(null);
    setSelectedAthlete(null);
  }, []);

  const handleSportSelect = useCallback((sport: Sport) => {
    setSelectedSport(sport);
    setScreen('video-upload');
  }, []);

  const handleAnalyze = useCallback((file: File) => {
    setUploadedFile(file);
    setScreen('analysis');
  }, []);

  const handleAnalysisComplete = useCallback(async () => {
    if (!selectedSport) return;
    setAnalysisError(null);

    if (!uploadedFile) {
      setAnalysisError('No video was provided. Please upload a video and try again.');
      setScreen('video-upload');
      return;
    }

    try {
      const { loadPoseModel, extractFramesFromVideo, analyzeVideo, getRiskOverrides } = await import('./poseAnalysis');

      const model                    = await loadPoseModel();
      const { canvases, timestamps } = await extractFramesFromVideo(uploadedFile, 6);
      const bio                      = await analyzeVideo(model, canvases, timestamps);

      if (!bio.poseDetected) {
        setAnalysisError("We couldn't detect a person clearly in this video. Make sure the full body is visible, well-lit, and facing the camera, then try again.");
        setScreen('video-upload');
        return;
      }

      if (!bio.validMovement) {
        setAnalysisError("A person was detected, but no significant movement was found. Please record a video where the athlete is actively performing a movement (e.g. squat, sprint, throw).");
        setScreen('video-upload');
        return;
      }

      const overrides = getRiskOverrides(bio);
      const res        = { ...generateMockResult(selectedSport, selectedAthlete?.name ?? '') };

      res.riskIndicators = res.riskIndicators.map((ri) => ({
        ...ri,
        level: overrides[ri.region] ?? ri.level,
        detail:
          ri.region === 'Knee'     ? `Knee asymmetry: ${bio.kneeAsymmetry.toFixed(1)}° avg. difference across ${bio.framesWithPose} frames` :
          ri.region === 'Shoulder' ? `Shoulder height asymmetry: ${bio.shoulderAsymmetry.toFixed(1)}%` :
          ri.region === 'Hip'      ? `Hip alignment asymmetry: ${bio.hipAsymmetry.toFixed(1)}%` :
          ri.detail,
      }));

      const riskScoreMap: Record<RiskLevel, number> = { Low: 10, Moderate: 50, High: 90 };
      const totalRisk  = res.riskIndicators.reduce((sum, r) => sum + riskScoreMap[r.level as RiskLevel], 0);
      res.overallScore = Math.round(100 - totalRisk / res.riskIndicators.length);

      if (bio.skeletonCanvas) setSkeletonImage(bio.skeletonCanvas.toDataURL());

      const targetAthleteId = selectedAthlete?.id ?? currentAthlete?.id ?? null;
      const targetCoachId   = currentCoach?.id ?? 'self';

      if (targetAthleteId) {
        const screening: Screening = {
          id:                `s-${Date.now()}`,
          athleteId:         targetAthleteId,
          coachId:           targetCoachId,
          date:              new Date().toISOString().slice(0, 10),
          sport:             selectedSport,
          overallScore:      res.overallScore,
          riskIndicators:    res.riskIndicators.map(r => ({ region: r.region, level: r.level })),
          findings:          res.findings.map(f => ({ observation: f.observation, severity: f.severity, area: f.area })),
          exercises:         res.exercises.map(e => ({ name: e.name, description: e.description, difficulty: e.difficulty, sets: e.sets, targetArea: e.targetArea })),
          kneeAsymmetry:     bio.kneeAsymmetry,
          shoulderAsymmetry: bio.shoulderAsymmetry,
          hipAsymmetry:      bio.hipAsymmetry,
          skeletonImageUrl:  bio.skeletonCanvas ? bio.skeletonCanvas.toDataURL() : null,
          poseDetected:      bio.poseDetected,
        };
        saveScreening(screening);
      }

      setResult(res);
      setScreen('results');

    } catch (err) {
      console.error('Pose analysis failed:', err);
      setAnalysisError("We couldn't process this video. Please make sure it's a valid video file (MP4/MOV) and try again.");
      setScreen('video-upload');
    }
  }, [selectedSport, uploadedFile, selectedAthlete, currentAthlete, currentCoach]);

  const handleNewAnalysis = useCallback(() => {
    const session = getSession();
    setScreen(
      session?.role === 'coach'   ? 'coach-dashboard'   :
      session?.role === 'athlete' ? 'athlete-dashboard' :
      'role-selection'
    );
    setSelectedSport(null);
    setResult(null);
    setSkeletonImage(null);
    setUploadedFile(null);
    setAnalysisError(null);
    setSelectedAthlete(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen max-w-lg mx-auto relative bg-slate-50">

      {/* Auth */}
      {screen === 'role-selection' && (
        <RoleSelectionScreen
          onCoach={() => setScreen('coach-login')}
          onAthlete={() => setScreen('athlete-login')}
        />
      )}
      {screen === 'coach-login' && (
        <CoachLoginScreen
          onBack={() => setScreen('role-selection')}
          onLogin={() => { refreshSession(); setScreen('coach-dashboard'); }}
          onRegister={() => setScreen('coach-register')}
        />
      )}
      {screen === 'coach-register' && (
        <CoachRegisterScreen
          onBack={() => setScreen('coach-login')}
          onSuccess={() => { refreshSession(); setScreen('coach-dashboard'); }}
        />
      )}
      {screen === 'athlete-login' && (
        <AthleteLoginScreen
          onBack={() => setScreen('role-selection')}
          onLogin={() => { refreshSession(); setScreen('athlete-dashboard'); }}
          onRegister={() => setScreen('athlete-register')}
        />
      )}
      {screen === 'athlete-register' && (
        <AthleteRegisterScreen
          onBack={() => setScreen('athlete-login')}
          onSuccess={() => { refreshSession(); setScreen('athlete-dashboard'); }}
        />
      )}

      {/* Coach flow — key={screen} forces remount on every navigation,
          so CoachDashboardScreen always re-reads fresh data from localStorage */}
      {screen === 'coach-dashboard' && currentCoach && (
        <CoachDashboardScreen
          key={screen}
          coach={currentCoach}
          onSelectAthlete={(a) => { setSelectedAthlete(a); setScreen('athlete-profile'); }}
          onNewAthlete={() => setScreen('sport-selection')}
          onLogout={handleLogout}
        />
      )}
      {screen === 'athlete-profile' && selectedAthlete && (
        <AthleteProfileScreen
          key={selectedAthlete.id}
          athlete={selectedAthlete}
          onBack={() => setScreen('coach-dashboard')}
          onNewScan={() => setScreen('sport-selection')}
        />
      )}

      {/* Athlete self-service */}
      {screen === 'athlete-dashboard' && currentAthlete && (
        <AthleteDashboardScreen
          athlete={currentAthlete}
          onLogout={handleLogout}
        />
      )}

      {/* Screening flow */}
      {screen === 'sport-selection' && (
        <SportSelectionScreen
          onBack={() => {
            const s = getSession();
            setScreen(s?.role === 'coach' ? (selectedAthlete ? 'athlete-profile' : 'coach-dashboard') : 'athlete-dashboard');
          }}
          onSelect={handleSportSelect}
          selected={selectedSport}
        />
      )}
      {screen === 'video-upload' && selectedSport && (
        <VideoUploadScreen
          onBack={() => setScreen('sport-selection')}
          onAnalyze={handleAnalyze}
          sport={selectedSport}
          error={analysisError}
        />
      )}
      {screen === 'analysis' && (
        <AnalysisScreen onComplete={handleAnalysisComplete} />
      )}
      {screen === 'results' && result && (
        <ResultsScreen
          result={result}
          skeletonImage={skeletonImage}
          onBack={() => setScreen('video-upload')}
          onViewReport={() => setScreen('report')}
        />
      )}
      {screen === 'report' && result && (
        <ReportScreen
          result={result}
          skeletonImage={skeletonImage}
          athleteName={selectedAthlete?.name ?? currentAthlete?.name ?? result.athleteName}
          athleteAge={selectedAthlete?.age ?? currentAthlete?.age}
          coachName={currentCoach?.name}
          onBack={() => setScreen('results')}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  );
}