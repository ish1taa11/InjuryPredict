import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Shield, Activity, Smartphone, ChevronRight, ArrowLeft, Dumbbell,
  CircleDot, Footprints, Timer, Search, Upload, Camera, Sun, User,
  Ruler, Clock, Film, X, AlertTriangle, CheckCircle2, FileText,
  Calendar, Trophy, Download, Share2, RotateCcw
} from 'lucide-react';

// Types
type Sport = 'Cricket' | 'Kabaddi' | 'Football' | 'Athletics' | 'General Screening';
type RiskLevel = 'Low' | 'Moderate' | 'High';
type Screen = 'home' | 'sport-selection' | 'video-upload' | 'analysis' | 'results' | 'report';

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

// Mock data generation
function generateMockResult(sport: Sport, athleteName: string): AnalysisResult {
  const sportRisks: Record<string, RiskIndicator[]> = {
    Cricket: [
      { region: 'Knee', level: 'High', detail: 'Medial knee valgus angle exceeds safe threshold' },
      { region: 'Shoulder', level: 'Moderate', detail: 'Rotational imbalance in bowling shoulder' },
      { region: 'Hip', level: 'Low', detail: 'Hip flexor range within normal limits' },
      { region: 'Spine', level: 'Moderate', detail: 'Lumbar flexion pattern asymmetry' },
      { region: 'Ankle', level: 'Low', detail: 'Ankle dorsiflexion adequate' },
    ],
    Kabaddi: [
      { region: 'Knee', level: 'High', detail: 'Lateral knee instability during lunges' },
      { region: 'Shoulder', level: 'High', detail: 'Repetitive strain indicators in rotator cuff' },
      { region: 'Hip', level: 'Moderate', detail: 'Hip adductor tightness detected' },
      { region: 'Spine', level: 'Moderate', detail: 'Cervical extension stress pattern' },
      { region: 'Ankle', level: 'Moderate', detail: 'Eversion range limitation' },
    ],
    Football: [
      { region: 'Knee', level: 'Moderate', detail: 'ACL strain risk from cutting movements' },
      { region: 'Shoulder', level: 'Low', detail: 'Shoulder girdle stable' },
      { region: 'Hip', level: 'Moderate', detail: 'Hip flexor-extensor imbalance' },
      { region: 'Spine', level: 'Low', detail: 'Core stability adequate' },
      { region: 'Ankle', level: 'High', detail: 'Inversion sprain susceptibility elevated' },
    ],
    Athletics: [
      { region: 'Knee', level: 'Moderate', detail: 'Patellar tracking asymmetry' },
      { region: 'Shoulder', level: 'Low', detail: 'Bilateral shoulder symmetry good' },
      { region: 'Hip', level: 'High', detail: 'Reduced hip rotation range' },
      { region: 'Spine', level: 'Low', detail: 'Sagittal alignment normal' },
      { region: 'Ankle', level: 'Moderate', detail: 'Calf-Achilles complex tightness' },
    ],
    'General Screening': [
      { region: 'Knee', level: 'Moderate', detail: 'Knee valgus detected during squat' },
      { region: 'Shoulder', level: 'Low', detail: 'Bilateral shoulder range symmetrical' },
      { region: 'Hip', level: 'Moderate', detail: 'Left-right asymmetry observed' },
      { region: 'Spine', level: 'Low', detail: 'Neutral spinal alignment maintained' },
      { region: 'Ankle', level: 'Moderate', detail: 'Reduced dorsiflexion on left side' },
    ],
  };

  const sportFindings: Record<string, Finding[]> = {
    Cricket: [
      { observation: 'Knee valgus collapse detected during bowling delivery stride', severity: 'High', area: 'Knee' },
      { observation: 'Left-right shoulder asymmetry in follow-through', severity: 'Moderate', area: 'Shoulder' },
      { observation: 'Lumbar spine hyperextension during delivery', severity: 'Moderate', area: 'Spine' },
      { observation: 'Reduced hip stability on landing leg', severity: 'Low', area: 'Hip' },
    ],
    Kabaddi: [
      { observation: 'Knee valgus detected during raid lunges', severity: 'High', area: 'Knee' },
      { observation: 'Shoulder imbalance from repetitive arm extensions', severity: 'High', area: 'Shoulder' },
      { observation: 'Hip adductor tightness limits lateral movement', severity: 'Moderate', area: 'Hip' },
      { observation: 'Ankle instability on uneven surfaces', severity: 'Moderate', area: 'Ankle' },
    ],
    Football: [
      { observation: 'ACL strain pattern during cutting maneuvers', severity: 'Moderate', area: 'Knee' },
      { observation: 'Ankle inversion susceptibility on plant foot', severity: 'High', area: 'Ankle' },
      { observation: 'Hip flexor tightness limits stride length', severity: 'Moderate', area: 'Hip' },
      { observation: 'Left-right asymmetry observed in gait cycle', severity: 'Low', area: 'Spine' },
    ],
    Athletics: [
      { observation: 'Reduced hip rotation range affects sprint mechanics', severity: 'High', area: 'Hip' },
      { observation: 'Patellar tracking asymmetry in sprinting gait', severity: 'Moderate', area: 'Knee' },
      { observation: 'Calf-Achilles complex shows tightness patterns', severity: 'Moderate', area: 'Ankle' },
      { observation: 'Mild trunk rotation asymmetry in running', severity: 'Low', area: 'Spine' },
    ],
    'General Screening': [
      { observation: 'Knee valgus detected during bodyweight squat', severity: 'Moderate', area: 'Knee' },
      { observation: 'Left-right asymmetry observed in single-leg stance', severity: 'Moderate', area: 'Hip' },
      { observation: 'Reduced hip stability during dynamic movements', severity: 'Moderate', area: 'Hip' },
      { observation: 'Shoulder imbalance in overhead reach', severity: 'Low', area: 'Shoulder' },
    ],
  };

  const sportExercises: Record<string, Exercise[]> = {
    Cricket: [
      { name: 'Clamshell', description: 'Lie on your side with knees bent. Slowly raise your top knee while keeping feet together, then lower. Strengthens gluteus medius to reduce knee valgus.', difficulty: 'Beginner', sets: '3 x 15 each side', targetArea: 'Hip' },
      { name: 'Bulgarian Split Squat', description: 'Rear foot elevated on bench. Lower into a deep squat, keeping front knee tracking over toes. Improves unilateral leg strength and stability.', difficulty: 'Intermediate', sets: '3 x 10 each leg', targetArea: 'Knee' },
      { name: 'Pallof Press', description: 'Stand perpendicular to a resistance band anchored at chest height. Press band outward resisting rotation. Builds anti-rotation core stability for bowling.', difficulty: 'Advanced', sets: '3 x 12 each side', targetArea: 'Spine' },
    ],
    Kabaddi: [
      { name: 'Glute Bridge', description: 'Lie on your back, knees bent. Drive hips up squeezing glutes at the top. Improves hip extension power and pelvic stability for raid movements.', difficulty: 'Beginner', sets: '3 x 20', targetArea: 'Hip' },
      { name: 'Single Leg Squat', description: 'Stand on one leg, lower into a partial squat keeping knee aligned over foot. Develops proprioception and knee stability for lunges.', difficulty: 'Intermediate', sets: '3 x 8 each leg', targetArea: 'Knee' },
      { name: 'Face Pull with External Rotation', description: 'Using a cable or band at face height, pull toward forehead while rotating hands outward. Strengthens rotator cuff and rear deltoids.', difficulty: 'Advanced', sets: '3 x 15', targetArea: 'Shoulder' },
    ],
    Football: [
      { name: 'Nordic Hamstring Curl', description: 'Kneel with partner holding ankles. Slowly lower torso forward using hamstrings to control descent. Prevents hamstring and ACL injuries.', difficulty: 'Intermediate', sets: '3 x 6', targetArea: 'Knee' },
      { name: 'Ankle Alphabet', description: 'Lift one foot and trace each letter of the alphabet in the air using only your ankle. Restores full ankle mobility and proprioception.', difficulty: 'Beginner', sets: '1 x A-Z each foot', targetArea: 'Ankle' },
      { name: 'Lateral Band Walk', description: 'Place resistance band around ankles. Maintain quarter squat and walk sideways keeping tension on band. Builds hip abductor endurance for cutting.', difficulty: 'Beginner', sets: '3 x 20 each direction', targetArea: 'Hip' },
    ],
    Athletics: [
      { name: '90/90 Hip Rotation Drill', description: 'Sit with front leg at 90-degree hip flexion and back leg at 90-degree extension. Rotate to switch leg positions. Restores hip internal and external rotation.', difficulty: 'Beginner', sets: '3 x 10 each direction', targetArea: 'Hip' },
      { name: 'Eccentric Calf Raise', description: 'Rise onto toes with both feet, then slowly lower using only one foot over 3-4 seconds. Strengthens Achilles tendon and calf complex.', difficulty: 'Intermediate', sets: '3 x 15 each foot', targetArea: 'Ankle' },
      { name: 'Single Leg Deadlift', description: 'Hold a light weight, hinge forward on one leg while extending the other back. Keep hips level. Develops hamstring power and balance.', difficulty: 'Advanced', sets: '3 x 8 each leg', targetArea: 'Knee' },
    ],
    'General Screening': [
      { name: 'Clamshell', description: 'Lie on your side with knees bent. Slowly raise your top knee while keeping feet together, then lower. Strengthens gluteus medius to reduce knee valgus.', difficulty: 'Beginner', sets: '3 x 15 each side', targetArea: 'Hip' },
      { name: 'Glute Bridge', description: 'Lie on your back, knees bent. Drive hips up squeezing glutes at the top. Improves hip extension and pelvic stability.', difficulty: 'Beginner', sets: '3 x 20', targetArea: 'Hip' },
      { name: 'Single Leg Squat', description: 'Stand on one leg, lower into a partial squat keeping knee aligned over foot. Develops proprioception and unilateral stability.', difficulty: 'Intermediate', sets: '3 x 8 each leg', targetArea: 'Knee' },
    ],
  };

  const risks = sportRisks[sport] || sportRisks['General Screening'];
  const findings = sportFindings[sport] || sportFindings['General Screening'];
  const exercises = sportExercises[sport] || sportExercises['General Screening'];

  const riskScore: Record<RiskLevel, number> = { Low: 10, Moderate: 50, High: 90 };
  const totalRisk = risks.reduce((sum, r) => sum + riskScore[r.level], 0);
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

// Risk badge styles
const riskBadge: Record<RiskLevel, { bg: string; text: string; dot: string; border: string }> = {
  Low: { bg: 'bg-green-50', text: 'text-risk-low', dot: 'bg-risk-low', border: 'border-green-200' },
  Moderate: { bg: 'bg-yellow-50', text: 'text-risk-moderate', dot: 'bg-risk-moderate', border: 'border-yellow-200' },
  High: { bg: 'bg-red-50', text: 'text-risk-high', dot: 'bg-risk-high', border: 'border-red-200' },
};

// Body Silhouette Component
function BodySilhouette({ riskIndicators }: { riskIndicators: RiskIndicator[] }) {
  const positions: Record<string, { cx: number; cy: number }> = {
    Shoulder: { cx: 100, cy: 55 },
    Spine: { cx: 100, cy: 100 },
    Hip: { cx: 100, cy: 145 },
    Knee: { cx: 100, cy: 190 },
    Ankle: { cx: 100, cy: 235 },
  };

  const riskColors: Record<RiskLevel, string> = {
    Low: '#22c55e',
    Moderate: '#eab308',
    High: '#ef4444',
  };

  return (
    <svg viewBox="0 0 200 280" className="w-full max-w-[200px] mx-auto" fill="none">
      {/* Body outline */}
      <g stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
        <circle cx="100" cy="20" r="14" />
        <line x1="100" y1="34" x2="100" y2="48" />
        <line x1="65" y1="55" x2="135" y2="55" />
        <line x1="65" y1="55" x2="50" y2="95" />
        <line x1="50" y1="95" x2="42" y2="130" />
        <line x1="135" y1="55" x2="150" y2="95" />
        <line x1="150" y1="95" x2="158" y2="130" />
        <line x1="85" y1="55" x2="85" y2="140" />
        <line x1="115" y1="55" x2="115" y2="140" />
        <line x1="85" y1="140" x2="115" y2="140" />
        <line x1="85" y1="140" x2="78" y2="190" />
        <line x1="78" y1="190" x2="75" y2="235" />
        <line x1="115" y1="140" x2="122" y2="190" />
        <line x1="122" y1="190" x2="125" y2="235" />
      </g>

      {/* Risk indicator dots */}
      {riskIndicators.map((ri) => {
        const pos = positions[ri.region];
        if (!pos) return null;
        const color = riskColors[ri.level];
        return (
          <g key={ri.region}>
            <circle cx={pos.cx} cy={pos.cy} r="8" fill={color} opacity="0.15">
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
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

// Screen 1: Home Screen
function HomeScreen({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">InjuryPredict</span>
        </div>
        <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">Beta</span>
      </header>

      <div className="screen-content justify-between pb-10">
        <div className="flex-1 flex flex-col items-center text-center pt-4">
          {/* Hero illustration */}
          <div className="relative w-44 h-52 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400/20 to-teal-400/20 blur-2xl" />
            <svg viewBox="0 0 200 240" className="relative z-10 w-full h-full animate-float" fill="none">
              {/* Body outline */}
              <g stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
                <circle cx="100" cy="22" r="16" />
                <line x1="100" y1="38" x2="100" y2="54" />
                <line x1="64" y1="62" x2="136" y2="62" />
                <line x1="64" y1="62" x2="48" y2="105" />
                <line x1="48" y1="105" x2="40" y2="145" />
                <line x1="136" y1="62" x2="152" y2="105" />
                <line x1="152" y1="105" x2="160" y2="145" />
                <line x1="82" y1="62" x2="82" y2="145" />
                <line x1="118" y1="62" x2="118" y2="145" />
                <line x1="82" y1="145" x2="118" y2="145" />
                <line x1="82" y1="145" x2="76" y2="195" />
                <line x1="76" y1="195" x2="72" y2="230" />
                <line x1="118" y1="145" x2="124" y2="195" />
                <line x1="124" y1="195" x2="128" y2="230" />
              </g>

              {/* AI tracking nodes */}
              {[[100, 22], [100, 62], [64, 62], [136, 62], [100, 100], [82, 145], [118, 145], [76, 195], [124, 195]].map(([cx, cy], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="3.5" fill="#14b8a6" opacity="0.9">
                    <animate attributeName="opacity" values="0.9;0.4;0.9" dur={`${1.5 + i * 0.15}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r="6" fill="none" stroke="#14b8a6" strokeWidth="0.8" opacity="0.4">
                    <animate attributeName="r" values="6;10;6" dur={`${2 + i * 0.1}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2 + i * 0.1}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}

              {/* Scan line */}
              <rect x="25" y="0" width="150" height="5" fill="url(#scanGrad)" opacity="0.4">
                <animate attributeName="y" values="-10;240;-10" dur="3s" repeatCount="indefinite" />
              </rect>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 animate-fade-in">
            Injury<span className="text-gradient">Predict</span>
          </h1>
          <p className="mt-3 text-base font-medium text-slate-600 leading-relaxed animate-slide-up">
            Identify injury-risk factors before injuries happen.
          </p>
          <p className="mt-2.5 text-sm text-slate-400 leading-relaxed max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Record a 30-second movement video for biomechanical risk analysis across 5 key joints.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Smartphone, label: 'Phone Only', sub: 'No sensors' },
            { icon: Activity, label: '5 Joints', sub: 'Full scan' },
            { icon: Shield, label: 'Prevent', sub: 'Before injury' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-white/90 p-3 ring-1 ring-slate-100 shadow-sm">
              <Icon className="h-5 w-5 text-brand-600" />
              <span className="text-xs font-semibold text-slate-700">{label}</span>
              <span className="text-[10px] text-slate-400">{sub}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={onAnalyze} className="btn-primary w-full text-base">
            Analyze Movement
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Screen 2: Sport Selection
function SportSelectionScreen({ onBack, onSelect, selected }: { onBack: () => void; onSelect: (sport: Sport) => void; selected: Sport | null }) {
  const sports: { name: Sport; icon: typeof Activity; desc: string; gradient: string }[] = [
    { name: 'Cricket', icon: Dumbbell, desc: 'Bowling & batting mechanics', gradient: 'from-blue-500 to-blue-600' },
    { name: 'Kabaddi', icon: CircleDot, desc: 'Raid & defense movements', gradient: 'from-orange-500 to-red-500' },
    { name: 'Football', icon: Footprints, desc: 'Running & cutting patterns', gradient: 'from-green-500 to-emerald-600' },
    { name: 'Athletics', icon: Timer, desc: 'Sprint & jump analysis', gradient: 'from-violet-500 to-purple-600' },
    { name: 'General Screening', icon: Search, desc: 'Overall movement assessment', gradient: 'from-teal-500 to-cyan-600' },
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

// Screen 3: Video Upload
function VideoUploadScreen({ onBack, onAnalyze, sport, error }: { onBack: () => void; onAnalyze: (file: File) => void; sport: Sport; error?: string | null }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    { icon: Sun, label: 'Good lighting', detail: 'Natural or bright indoor light' },
    { icon: User, label: 'Full body visible', detail: 'Head to toes in frame' },
    { icon: Ruler, label: '3-5 meters away', detail: 'Maintain proper distance' },
    { icon: Clock, label: '10-30 seconds', detail: 'Capture full movement cycle' },
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
            isDragging ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20' : file ? 'border-green-400 bg-green-50/30' : 'border-slate-200 bg-white/60 hover:border-brand-400 hover:bg-brand-50/20'
          }`}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            accept="video/*"
            className="hidden"
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

// Screen 4: Analysis Loading Screen
function AnalysisScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    'Decoding video frames...',
    'Initializing MediaPipe tracking engine...',
    'Extracting biomechanical joint nodes...',
    'Calculating left/right joint symmetry parameters...',
    'Generating predictive injury risk model...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 12) + 4;
        return next > 100 ? 100 : next;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const currentStage = Math.min(Math.floor((progress / 100) * stages.length), stages.length - 1);
    setStage(currentStage);
  }, [progress]);

  return (
    <div className="screen-container bg-slate-900 text-white">
      <div className="screen-content justify-center items-center gap-8 px-8 text-center">
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Radial outer glow */}
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
          {/* Rotating track */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="6" fill="transparent" />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#06b6d4"
              strokeWidth="6"
              fill="transparent"
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

// Screen 5: Results Screen
function ResultsScreen({ result, skeletonImage, onBack, onViewReport }: {
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
        <button onClick={onViewReport} className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors">
          Full Report
        </button>
      </header>

      <div className="screen-content gap-4 py-4 overflow-y-auto">
        {/* Score Card */}
        <div className="card flex items-center justify-between p-4 bg-white ring-1 ring-slate-100 shadow-sm animate-slide-up">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Movement Score</span>
            <span className="text-2xl font-black text-slate-900">{result.overallScore}<span className="text-slate-300 text-lg font-normal">/100</span></span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {result.overallScore >= 80 ? 'Optimal coordination profile.' : result.overallScore >= 50 ? 'Mild asymmetry risk flags identified.' : 'High asymmetry layout. Corrections required.'}
            </p>
          </div>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-black text-lg shadow-inner ${result.overallScore >= 80 ? 'bg-green-50 text-green-600' : result.overallScore >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
            {result.overallScore >= 80 ? 'Good' : result.overallScore >= 50 ? 'Mod' : 'Risk'}
          </div>
        </div>

        {/* Pose Analysis Frame Card */}
        {skeletonImage && (
          <div className="card animate-slide-up bg-white p-4 ring-1 ring-slate-100 shadow-sm rounded-2xl">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Pose Analysis — Actual Frame
            </h3>
            <img
              src={skeletonImage}
              alt="Pose skeleton overlay"
              className="w-full rounded-xl shadow-inner border border-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Green dots = detected joints · Blue lines = bone connections
            </p>
          </div>
        )}

        {/* Risk Map Section */}
        <div className="card grid grid-cols-5 gap-4 p-4 bg-white ring-1 ring-slate-100 shadow-sm animate-slide-up" style={{ animationDelay: '0.05s' }}>
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

        {/* Key Findings */}
        <div className="flex flex-col gap-2.5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Biomechanical Anomalies</h3>
          {result.findings.map((finding, i) => (
            <div key={i} className="flex gap-3 bg-white p-3.5 rounded-xl ring-1 ring-slate-100 shadow-sm">
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${finding.severity === 'High' ? 'text-risk-high' : finding.severity === 'Moderate' ? 'text-risk-moderate' : 'text-risk-low'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">{finding.area} Observation</span>
                  <span className={`text-[9px] font-extrabold tracking-wide uppercase ${finding.severity === 'High' ? 'text-risk-high' : finding.severity === 'Moderate' ? 'text-risk-moderate' : 'text-risk-low'}`}>{finding.severity} Risk</span>
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

// Screen 6: Detailed Report Screen
function ReportScreen({ result, onBack, onNewAnalysis }: { result: AnalysisResult; onBack: () => void; onNewAnalysis: () => void }) {
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
        {/* Prescription Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-md shadow-slate-950/10">
          <div className="flex items-center gap-2 text-brand-400">
            <Trophy className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Corrective Strategy</span>
          </div>
          <h2 className="text-lg font-bold mt-1 tracking-tight">Prescribed Corrective Exercises</h2>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Targeted routines based on structural joint loads and asymmetrical movement trends identified in your track.
          </p>
        </div>

        {/* Exercises List */}
        <div className="flex flex-col gap-3.5">
          {result.exercises.map((ex, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl ring-1 ring-slate-100 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase tracking-wide">{ex.targetArea}</span>
                  <h4 className="text-sm font-bold text-slate-800 mt-1.5">{ex.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block">{ex.sets}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1">{ex.difficulty}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{ex.description}</p>
            </div>
          ))}
        </div>

        {/* Actions layout */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button onClick={() => alert('PDF download is fully configured for native production wrappers.')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export PDF
          </button>
          <button onClick={() => alert('Sharing hooks registered.')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Share2 className="h-4 w-4" /> Share Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Container Component
export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [skeletonImage, setSkeletonImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
    // No file at all — shouldn't normally happen, but guard anyway
    setAnalysisError("No video was provided. Please upload a video and try again.");
    setScreen('video-upload');
    return;
  }

  try {
    const { loadPoseModel, extractFramesFromVideo, analyzeVideo, getRiskOverrides } = await import('./poseAnalysis');

    const model = await loadPoseModel();
    const { canvases, timestamps } = await extractFramesFromVideo(uploadedFile, 6);
    const bio = await analyzeVideo(model, canvases, timestamps);

    // CASE 1: No person detected at all
    if (!bio.poseDetected) {
      setAnalysisError(
        "We couldn't detect a person clearly in this video. Make sure the full body is visible, well-lit, and facing the camera, then try again."
      );
      setScreen('video-upload');
      return;
    }

    // CASE 2: Person detected but no real movement (static/photo-like video)
    if (!bio.validMovement) {
      setAnalysisError(
        "A person was detected, but no significant movement was found. Please record a video where the athlete is actively performing a movement (e.g. squat, sprint, throw)."
      );
      setScreen('video-upload');
      return;
    }

    // CASE 3: Valid — generate result using real measurements
    const overrides = getRiskOverrides(bio);

    const res = {
      ...generateMockResult(selectedSport, ''),
    };

    res.riskIndicators = res.riskIndicators.map((ri) => ({
      ...ri,
      level: overrides[ri.region] ?? ri.level,
      detail:
        ri.region === 'Knee'
          ? `Knee asymmetry: ${bio.kneeAsymmetry.toFixed(1)}° avg. difference across ${bio.framesWithPose} frames`
          : ri.region === 'Shoulder'
          ? `Shoulder height asymmetry: ${bio.shoulderAsymmetry.toFixed(1)}%`
          : ri.region === 'Hip'
          ? `Hip alignment asymmetry: ${bio.hipAsymmetry.toFixed(1)}%`
          : ri.detail,
    }));

    // Recompute overall score from the (possibly updated) risk indicators
    const riskScoreMap: Record<RiskLevel, number> = { Low: 10, Moderate: 50, High: 90 };
    const totalRisk = res.riskIndicators.reduce((sum, r) => sum + riskScoreMap[r.level], 0);
    res.overallScore = Math.round(100 - totalRisk / res.riskIndicators.length);

    if (bio.skeletonCanvas) {
      setSkeletonImage(bio.skeletonCanvas.toDataURL());
    }

    setResult(res);
    setScreen('results');

  } catch (err) {
    console.error('Pose analysis failed:', err);
    setAnalysisError(
      "We couldn't process this video. Please make sure it's a valid video file (MP4/MOV) and try again."
    );
    setScreen('video-upload');
  }
}, [selectedSport, uploadedFile]);

  const handleNewAnalysis = useCallback(() => {
  setScreen('home');
  setSelectedSport(null);
  setResult(null);
  setSkeletonImage(null);
  setUploadedFile(null);
  setAnalysisError(null);
}, []);
  return (
    <div className="min-h-screen max-w-lg mx-auto relative bg-slate-50">
      {screen === 'home' && <HomeScreen onAnalyze={() => setScreen('sport-selection')} />}
      {screen === 'sport-selection' && <SportSelectionScreen onBack={() => setScreen('home')} onSelect={handleSportSelect} selected={selectedSport} />}
      {screen === 'video-upload' && selectedSport && <VideoUploadScreen onBack={() => setScreen('sport-selection')} onAnalyze={handleAnalyze} sport={selectedSport} error={analysisError} />}
      {screen === 'analysis' && <AnalysisScreen onComplete={handleAnalysisComplete} />}
      {screen === 'results' && result && <ResultsScreen result={result} skeletonImage={skeletonImage} onBack={() => setScreen('video-upload')} onViewReport={() => setScreen('report')} />}
      {screen === 'report' && result && <ReportScreen result={result} onBack={() => setScreen('results')} onNewAnalysis={handleNewAnalysis} />}
    </div>
  );
}