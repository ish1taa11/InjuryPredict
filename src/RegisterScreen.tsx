import { useState } from "react";

interface Props {
  role: "coach" | "athlete";
  onFinish: () => void;
  onBack: () => void;
}

export default function RegisterScreen({
  role,
  onFinish,
  onBack,
}: Props) {

  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-6">

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8">

        <button
          onClick={onBack}
          className="text-blue-600 mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold">
          {role === "coach"
            ? "Coach Registration"
            : "Athlete Registration"}
        </h1>

        <p className="text-slate-500 mt-2">
          Step {step} of {role === "coach" ? 5 : 6}
        </p>

        <div className="w-full h-2 rounded-full bg-slate-200 mt-5">
          <div
            className="h-2 rounded-full bg-blue-600"
            style={{
              width: `${
                role === "coach"
                  ? (step / 5) * 100
                  : (step / 6) * 100
              }%`,
            }}
          />
        </div>

        <div className="mt-10">

          {step === 1 && (
            <>
              <h2 className="font-bold text-xl mb-5">
                Personal Information
              </h2>

              <input
                className="border rounded-xl p-3 w-full mb-4"
                placeholder="First Name"
              />

              <input
                className="border rounded-xl p-3 w-full mb-4"
                placeholder="Last Name"
              />

              <input
                className="border rounded-xl p-3 w-full mb-4"
                placeholder="Email"
              />

              <input
                type="password"
                className="border rounded-xl p-3 w-full"
                placeholder="Password"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-bold text-xl mb-5">

                {role === "coach"
                  ? "Academy Information"
                  : "Sports Information"}

              </h2>

              <p className="text-slate-500">

                We'll build this next.

              </p>
            </>
          )}

          {step >= 3 && (
            <div className="text-center py-20">

              <h2 className="text-2xl font-bold">
                Coming Next...
              </h2>

            </div>
          )}

        </div>

        <div className="flex justify-between mt-10">

          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="border rounded-xl px-6 py-3"
          >
            Previous
          </button>

          {step < (role === "coach" ? 5 : 6) ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 text-white rounded-xl px-6 py-3"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="bg-green-600 text-white rounded-xl px-6 py-3"
            >
              Finish
            </button>
          )}

        </div>

      </div>

    </div>
  );
}