import { useState } from "react";

interface Props {
  role: "coach" | "athlete";
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
  onBack: () => void;
}

export default function LoginScreen({
  role,
  onLogin,
  onRegister,
  onBack,
}: Props) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">

      <div className="bg-white rounded-3xl shadow-xl p-8 w-[420px]">

        <button
          onClick={onBack}
          className="text-blue-600 mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">
          {role === "coach" ? "Coach Login" : "Athlete Login"}
        </h1>

        <div className="mt-8 space-y-5">

          <input
            className="w-full border rounded-xl p-3"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border rounded-xl p-3"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={()=>onLogin(email,password)}
            className="w-full bg-blue-600 text-white rounded-xl p-3"
          >
            Login
          </button>

          <button
            onClick={onRegister}
            className="w-full border rounded-xl p-3"
          >
            Create New Account
          </button>

        </div>

      </div>

    </div>
  );
}