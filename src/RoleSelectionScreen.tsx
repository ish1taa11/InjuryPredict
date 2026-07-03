import React from "react";

interface Props {
  onSelect: (role: "coach" | "athlete") => void;
}

export default function RoleSelectionScreen({
  onSelect,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">

      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">

        <h1 className="text-3xl font-bold text-center">
          InjuryPredict AI
        </h1>

        <p className="text-center text-slate-500 mt-3">
          AI Powered Sports Injury Risk Assessment
        </p>

        <div className="mt-10 space-y-5">

          <button
            onClick={() => onSelect("athlete")}
            className="w-full rounded-2xl bg-blue-600 text-white p-5 hover:bg-blue-700 transition"
          >
            <h2 className="text-xl font-bold">
              Athlete
            </h2>

            <p className="text-sm mt-2 opacity-90">
              Scan yourself, monitor injury risk,
              and track your performance history.
            </p>
          </button>

          <button
            onClick={() => onSelect("coach")}
            className="w-full rounded-2xl bg-green-600 text-white p-5 hover:bg-green-700 transition"
          >
            <h2 className="text-xl font-bold">
              Coach
            </h2>

            <p className="text-sm mt-2 opacity-90">
              Manage athletes, perform screenings,
              and monitor your team's health.
            </p>
          </button>

        </div>

      </div>

    </div>
  );
}