"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateTextField } from "@/lib/validation";
import { submitPhaseOne, saveUserInfo } from "@/lib/phaseOne";
import DiamondStack from "@/components/DiamondStack";

type Step = "name" | "location" | "processing" | "thanks";


/**
 * BACK / PROCEED control. Matches the reference: a 48px diamond at scale-[0.85]
 * growing to [0.92] on hover, with a separate mobile treatment that puts the
 * label inside the diamond.
 */
function NavButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto"
    >
      {/* Mobile: label sits inside the rotated diamond */}
      <div className="relative flex h-12 w-12 rotate-45 items-center justify-center border border-[#1A1B1C] sm:hidden">
        <span className="-rotate-45 text-xs font-semibold">{label}</span>
      </div>

      {/* Desktop: diamond plus arrow plus label */}
      <div className="group relative hidden flex-row items-center justify-center sm:flex">
        {direction === "right" && (
          <span className="mr-6 text-sm font-semibold">{label}</span>
        )}

        <div className="flex h-12 w-12 rotate-45 scale-[0.85] justify-center border border-[#1A1B1C] duration-300 group-hover:scale-[0.92]" />

        <span
          className={`absolute bottom-[13px] scale-[0.9] duration-300 group-hover:scale-[0.92] ${
            direction === "left" ? "left-[15px] rotate-180" : "right-[15px]"
          }`}
        >
          ▶
        </span>

        {direction === "left" && (
          <span className="ml-6 text-sm font-semibold">{label}</span>
        )}
      </div>
    </button>
  );
}

export default function Testing() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const value = step === "name" ? name : location;
  const setValue = step === "name" ? setName : setLocation;
  const fieldLabel = step === "name" ? "name" : "city name";

  async function handleProceed() {
    const result = validateTextField(value, fieldLabel);

    if (!result.valid) {
      setError(result.error);
      return;
    }

    setError(null);

    // The name step only advances — nothing is sent until we have both fields.
    if (step === "name") {
      setName(result.value);
      setStep("location");
      return;
    }

    setStep("processing");

    const info = { name, location: result.value };
    const response = await submitPhaseOne(info);

    if (!response.ok) {
      setError(response.error);
      setStep("location");
      return;
    }

    saveUserInfo(info);
    setStep("thanks");
  }

  function handleBack() {
    setError(null);
    if (step === "location") setStep("name");
    else if (step === "processing" || step === "thanks") setStep("location");
    else router.push("/");
  }

  /* ---------- Processing / Thank you ---------- */

  if (step === "processing" || step === "thanks") {
    return (
      <main className="relative flex min-h-[90vh] flex-col items-center justify-center bg-white text-center">
        <div className="absolute left-9 top-16 text-left">
          <p className="text-xs font-semibold">TO START ANALYSIS</p>
        </div>

        <div className="relative mb-40 flex h-full w-full flex-col items-center justify-center">
          <div className="relative z-10">
            {step === "processing" ? (
              <>
                <p className="text-[16px]">Processing submission</p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:200ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:400ms]" />
                </div>
              </>
            ) : (
              <>
                <p className="text-[24px]">Thank you!</p>
                <p className="mt-2 text-[16px]">Proceed for the next step</p>
              </>
            )}
          </div>

          <DiamondStack />
        </div>

        <div className="absolute bottom-38.5 z-20 flex w-full justify-between px-13 md:bottom-8 md:px-9">
          <NavButton label="BACK" direction="left" onClick={handleBack} />
                    {step === "thanks" ? (
            <div className="animate-slide-in-left">
              <NavButton
                label="PROCEED"
                direction="right"
                onClick={() => router.push("/result")}
              />
            </div>
          ) : (
            <span />
          )}
        </div>
      </main>
    );
  }

  /* ---------- Name / Location input ---------- */

  return (
    <main className="relative flex min-h-[90vh] flex-col items-center justify-center bg-white text-center">
      <div className="absolute left-9 top-16 text-left">
        <p className="text-xs font-semibold">TO START ANALYSIS</p>
      </div>

      <div className="relative mb-40 flex h-full w-full flex-col items-center justify-center">
        <p className="mb-1 text-sm uppercase tracking-wider text-gray-400">
          CLICK TO TYPE
        </p>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleProceed();
          }}
          autoFocus
          autoComplete="off"
          placeholder={step === "name" ? "Introduce Yourself" : "Your City Name"}
          className="pointer-events-auto relative z-10 w-[372px] appearance-none border-b border-black bg-transparent pt-1 text-center text-5xl font-normal leading-[64px] tracking-[-0.07em] text-[#1A1B1C] focus:outline-none sm:w-[432px] sm:text-6xl"
        />

        {/* Fixed height keeps the layout from jumping when an error appears */}
        <p className="relative z-10 mt-3 h-5 text-[12px] text-red-600">
          {error ?? ""}
        </p>

        <DiamondStack />
      </div>

            <div className="absolute bottom-38.5 z-20 flex w-full justify-between px-13 md:bottom-8 md:px-9">
        <NavButton label="BACK" direction="left" onClick={handleBack} />
      </div>
    </main>
  );
}