import { useState, useRef } from 'react';
import {
  Shield, ArrowLeft, Eye, EyeOff, User, Users,
  Mail, Lock, Phone, Building, Award, Camera, ChevronRight
} from 'lucide-react';
import {
  getCoachByEmail, saveCoach, generateId, setSession,
  storePassword, checkPassword,
  getAthleteAccountByEmail, saveAthleteAccount, saveAthlete, getAthleteById,
  type Coach, type Athlete, type AthleteAccount,
} from './lib/storage';

// ─── Shared UI ────────────────────────────────────────────────

function InputField({
  label, type = 'text', value, onChange, placeholder, icon: Icon, required = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20 transition-all ${Icon ? 'pl-9' : ''} ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function PhotoPicker({ value, onChange }: { value: string | null; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => { if (e.target?.result) onChange(e.target.result as string); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative h-20 w-20 rounded-2xl overflow-hidden bg-brand-50 ring-2 ring-brand-200 hover:ring-brand-400 transition-all"
      >
        {value ? (
          <img src={value} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <Camera className="h-6 w-6 text-brand-400" />
            <span className="text-[9px] font-semibold text-brand-400">Add Photo</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <p className="text-[10px] text-slate-400">Optional profile photo</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
      <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
      <p className="text-xs text-red-700">{message}</p>
    </div>
  );
}

// ─── Role Selection ───────────────────────────────────────────

export function RoleSelectionScreen({
  onCoach, onAthlete,
}: {
  onCoach: () => void;
  onAthlete: () => void;
}) {
  return (
    <div className="screen-container bg-mesh">
      <div className="screen-content justify-between pb-10 pt-8">

        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center shadow-xl shadow-brand-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Injury<span className="text-gradient">Predict</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">AI-powered athlete injury prevention</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Continue as
          </p>

          <button
            onClick={onCoach}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm hover:ring-brand-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-md shadow-brand-500/30">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-slate-900">Coach</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Manage athletes, run screenings, track team health
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
          </button>

          <button
            onClick={onAthlete}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm hover:ring-teal-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-500/30">
              <User className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-slate-900">Athlete</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                View your screenings, track progress, follow exercises
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-300 mt-6">
          India's first AI injury prevention platform for grassroots athletes
        </p>
      </div>
    </div>
  );
}

// ─── Coach Login ──────────────────────────────────────────────

export function CoachLoginScreen({
  onBack, onLogin, onRegister,
}: {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const coach = getCoachByEmail(email.trim());
    if (!coach) {
      setError('No coach account found with this email. Please register first.');
      setLoading(false);
      return;
    }

    if (!checkPassword(coach.id, password)) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    setSession({ userId: coach.id, role: 'coach', name: coach.name });
    setLoading(false);
    onLogin();
  };

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Coach Sign In</h1>
          <p className="text-xs text-slate-400">Enter your credentials to continue</p>
        </div>
      </header>

      <div className="screen-content gap-4 pt-4">
        <div className="flex justify-center mb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <InputField label="Email" type="email" value={email} onChange={setEmail}
          placeholder="your@email.com" icon={Mail} required />
        <InputField label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Your password" icon={Lock} required />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full mt-2 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">new here?</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button
          onClick={onRegister}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Create Coach Account
        </button>
      </div>
    </div>
  );
}

// ─── Coach Register ───────────────────────────────────────────

export function CoachRegisterScreen({
  onBack, onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [photo, setPhoto]         = useState<string | null>(null);
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [org, setOrg]             = useState('');
  const [experience, setExp]      = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!name.trim())  { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password)     { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (getCoachByEmail(email.trim())) {
      setError('An account with this email already exists. Please sign in.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const id = generateId();
    const coach: Coach = {
      id,
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      phone:        phone.trim(),
      organization: org.trim(),
      experience:   experience.trim(),
      photoUrl:     photo,
      createdAt:    new Date().toISOString().slice(0, 10),
    };

    saveCoach(coach);
    storePassword(id, password);
    setSession({ userId: id, role: 'coach', name: coach.name });

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Create Coach Account</h1>
          <p className="text-xs text-slate-400">Set up your coaching profile</p>
        </div>
      </header>

      <div className="screen-content gap-4 pt-2 pb-8">
        <PhotoPicker value={photo} onChange={setPhoto} />

        {error && <ErrorBanner message={error} />}

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Details</p>
          <InputField label="Full Name" value={name} onChange={setName}
            placeholder="Your full name" icon={User} required />
          <InputField label="Email" type="email" value={email} onChange={setEmail}
            placeholder="your@email.com" icon={Mail} required />
          <InputField label="Phone" type="tel" value={phone} onChange={setPhone}
            placeholder="10-digit mobile number" icon={Phone} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Details</p>
          <InputField label="Organization / Academy" value={org} onChange={setOrg}
            placeholder="e.g. Shivaji Sports Academy" icon={Building} />
          <InputField label="Years of Experience" value={experience} onChange={setExp}
            placeholder="e.g. 5 years" icon={Award} />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set Password</p>
          <InputField label="Password" type="password" value={password} onChange={setPassword}
            placeholder="Minimum 6 characters" icon={Lock} required />
          <InputField label="Confirm Password" type="password" value={confirm} onChange={setConfirm}
            placeholder="Repeat your password" icon={Lock} required />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="btn-primary w-full mt-2 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Athlete Login ────────────────────────────────────────────

export function AthleteLoginScreen({
  onBack, onLogin, onRegister,
}: {
  onBack: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const account = getAthleteAccountByEmail(email.trim());
    if (!account) {
      setError('No athlete account found with this email. Please register first.');
      setLoading(false);
      return;
    }

    if (!checkPassword(account.id, password)) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    const athlete = getAthleteById(account.id);
    if (!athlete) {
      setError('Athlete profile not found. Please contact your coach.');
      setLoading(false);
      return;
    }

    setSession({ userId: athlete.id, role: 'athlete', name: athlete.name });
    setLoading(false);
    onLogin();
  };

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Athlete Sign In</h1>
          <p className="text-xs text-slate-400">Enter your credentials to continue</p>
        </div>
      </header>

      <div className="screen-content gap-4 pt-4">
        <div className="flex justify-center mb-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <InputField label="Email" type="email" value={email} onChange={setEmail}
          placeholder="your@email.com" icon={Mail} required />
        <InputField label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Your password" icon={Lock} required />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full mt-2 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400">new here?</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <button
          onClick={onRegister}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Create Athlete Account
        </button>
      </div>
    </div>
  );
}

// ─── Athlete Register ─────────────────────────────────────────

export function AthleteRegisterScreen({
  onBack, onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [photo, setPhoto]     = useState<string | null>(null);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [age, setAge]         = useState('');
  const [gender, setGender]   = useState('');
  const [sport, setSport]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const sports = [
    'Cricket', 'Kabaddi', 'Football',
    'Athletics', 'Wrestling', 'Kho-Kho', 'Badminton', 'Other',
  ];

  const handleRegister = async () => {
    setError('');

    if (!name.trim())  { setError('Full name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!age)          { setError('Age is required.'); return; }
    if (!sport)        { setError('Please select your sport.'); return; }
    if (!password)     { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (getAthleteAccountByEmail(email.trim())) {
      setError('An account with this email already exists. Please sign in.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const id = generateId();

    const athlete: Athlete = {
      id,
      coachId:          'self',
      name:             name.trim(),
      age:              parseInt(age),
      gender:           (gender || 'Other') as 'Male' | 'Female' | 'Other',
      sport,
      position:         '',
      height:           '',
      weight:           '',
      dominantHand:     'Right',
      dominantLeg:      'Right',
      experience:       '',
      trainingHours:    '',
      previousInjuries: '',
      currentPain:      '',
      emergencyContact: '',
      photoUrl:         photo,
      createdAt:        new Date().toISOString().slice(0, 10),
    };

    const account: AthleteAccount = {
      id,
      email: email.trim().toLowerCase(),
    };

    saveAthlete(athlete);
    saveAthleteAccount(account);
    storePassword(id, password);
    setSession({ userId: id, role: 'athlete', name: athlete.name });

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="screen-container bg-mesh">
      <header className="flex items-center gap-3 px-5 py-4">
        <button onClick={onBack} className="btn-ghost -ml-2 px-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Create Athlete Account</h1>
          <p className="text-xs text-slate-400">Set up your personal profile</p>
        </div>
      </header>

      <div className="screen-content gap-4 pt-2 pb-8">
        <PhotoPicker value={photo} onChange={setPhoto} />

        {error && <ErrorBanner message={error} />}

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Basic Details</p>
          <InputField label="Full Name" value={name} onChange={setName}
            placeholder="Your full name" icon={User} required />
          <InputField label="Email" type="email" value={email} onChange={setEmail}
            placeholder="your@email.com" icon={Mail} required />
          <InputField label="Age" type="number" value={age} onChange={setAge}
            placeholder="e.g. 16" required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Gender</label>
            <div className="flex gap-2">
              {['Male', 'Female', 'Other'].map(g => (
                <button key={g} type="button" onClick={() => setGender(g)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    gender === g
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Sport <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sports.map(s => (
                <button key={s} type="button" onClick={() => setSport(s)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    sport === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Set Password</p>
          <InputField label="Password" type="password" value={password} onChange={setPassword}
            placeholder="Minimum 6 characters" icon={Lock} required />
          <InputField label="Confirm Password" type="password" value={confirm} onChange={setConfirm}
            placeholder="Repeat your password" icon={Lock} required />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="btn-primary w-full mt-2 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
          {!loading && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}