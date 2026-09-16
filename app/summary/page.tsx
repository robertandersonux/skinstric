"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  toScores,
  topKey,
  type Demographics,
  type Score,
} from "@/lib/demographics";
import { loadDemographics } from "@/lib/phaseTwo";

type Category = "race" | "age" | "gender";

const CATEGORY_LABELS: Record<Category, string> = {
  race: "RACE",
  age: "AGE",
  gender: "SEX",
};

/**
 * The reference uses react-circular-progressbar, which renders an arc <path>
 * that already starts at 12 o'clock — no rotation anywhere. Do NOT add
 * -rotate-90 here; there is no wrapper to absorb it and the transform would
 * fight the centering, same trap as the diamonds.
 *
 * r = 49.15 in a 100x100 box -> circumference 308.819.
 */
const ARC = `
      M 50,50
      m 0,-49.15
      a 49.15,49.15 0 1 1 0,98.3
      a 49.15,49.15 0 1 1 0,-98.3
    `;
const CIRCUMFERENCE = 308.819;

function Ring({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "384px",
        position: "relative",
        transform: "scale(1)",
        transformOrigin: "center center",
      }}
    >
      <svg
        className="CircularProgressbar text-[#1A1B1C]"
        viewBox="0 0 100 100"
        data-test-id="CircularProgressbar"
      >
        <path
          className="CircularProgressbar-trail"
          d={ARC}
          strokeWidth={1.7}
          fillOpacity={0}
          style={{
            stroke: "#d6d6d6",
            strokeLinecap: "butt",
            strokeDasharray: `${CIRCUMFERENCE}px, ${CIRCUMFERENCE}px`,
            strokeDashoffset: "0px",
          }}
        />
        <path
          className="CircularProgressbar-path"
          d={ARC}
          strokeWidth={1.7}
          fillOpacity={0}
          style={{
            stroke: "rgb(26, 27, 28)",
            strokeLinecap: "butt",
            transitionDuration: "0.8s",
            strokeDasharray: `${CIRCUMFERENCE}px, ${CIRCUMFERENCE}px`,
            strokeDashoffset: `${offset.toFixed(2)}px`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* The reference puts the % span in `absolute` with no offsets, so it
            drops out of flow and sits tight against the number. Reproduced. */}
        <p className="text-3xl md:text-[40px] font-normal">
          {Math.round(percent)}
          <span className="absolute text-xl md:text-3xl">%</span>
        </p>
      </div>
    </div>
  );
}

function displayValue(category: Category, raw: string) {
  if (!raw) return "—";
  if (category === "gender") return raw.toUpperCase();
  if (category === "age") return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function Summary() {
  const router = useRouter();

  const [data, setData] = useState<Demographics | null>(null);
  const [category, setCategory] = useState<Category>("race");
  const [selected, setSelected] = useState<Record<Category, string>>({
    race: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    const stored = loadDemographics();
    if (!stored) {
      router.push("/result");
      return;
    }
    setData(stored);
    setSelected({
      race: topKey(toScores(stored.race)),
      age: topKey(toScores(stored.age)),
      gender: topKey(toScores(stored.gender)),
    });
  }, [router]);

  if (!data) {
    return (
      <div className="h-screen md:h-[90vh] flex flex-col md:mt-5">
        <main className="flex-1 w-full bg-white flex items-center justify-center">
          <p className="text-sm">Loading analysis…</p>
        </main>
      </div>
    );
  }

  const scores: Score[] = toScores(data[category]);
  const activeKey = selected[category];
  const active = scores.find((s) => s.key === activeKey) ?? scores[0];
  const activeLabel = displayValue(category, active.label);

  return (
    <div className="h-screen md:h-[90vh] flex flex-col md:mt-5">
      <main className="flex-1 w-full bg-white md:overflow-hidden overflow-auto">
        <div className="md:h-full max-w-full mx-5 px-4 md:px-auto flex flex-col">
          {/* Heading */}
          <div className="text-start ml-4 mb-4 md:mb-10 md:ml-0">
            <h2 className="text-base md:text-base font-semibold mb-1 leading-[24px]">
              A.I. ANALYSIS
            </h2>
            <h3 className="text-4xl md:text-[72px] font-normal leading-[64px] tracking-tighter">
              DEMOGRAPHICS
            </h3>
            <h4 className="text-sm mt-2 leading-[24px]">PREDICTED RACE &amp; AGE</h4>
          </div>

          <div className="grid md:grid-cols-[1.5fr_8.5fr_3.15fr] gap-4 mt-10 mb-40 md:gap-4 pb-0 md:pb-0 md:mb-0">
            {/* Left: category selector. `bg-white-100` is not a real Tailwind
                class in the reference — kept for fidelity, it is a no-op. */}
            <div className="bg-white-100 space-y-3 md:flex md:flex-col h-[62%]">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((key) => {
                const isActive = key === category;
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCategory(key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setCategory(key);
                    }}
                    className={`p-3 cursor-pointer  ${
                      isActive
                        ? "bg-[#1A1B1C] text-white hover:bg-black"
                        : "bg-[#F3F3F4]"
                    } flex-1 flex flex-col justify-between hover:bg-[#E1E1E2] border-t`}
                  >
                    <p className="text-base font-semibold">
                      {displayValue(key, selected[key])}
                    </p>
                    <h4 className="text-base font-semibold mb-1">
                      {CATEGORY_LABELS[key]}
                    </h4>
                  </div>
                );
              })}
            </div>

            {/* Center: label + ring */}
            <div className="relative bg-gray-100 p-4 flex flex-col items-center justify-center md:h-[57vh] md:border-t">
              <p className="hidden md:block md:absolute text-[40px] mb-2 left-5 top-2">
                {activeLabel}
              </p>
              <div className="relative md:absolute w-full max-w-[384px] aspect-square mb-4 md:right-5 md:bottom-2">
                <Ring percent={Number(active.percent)} />
              </div>
              <p className="md:absolute text-xs text-[#A0A4AB] md:text-sm lg:text-base font-normal mb-1 leading-[24px] md:bottom-[-15%] md:left-[22%] lg:left-[30%] xl:left-[40%] 2xl:left-[45%]">
                If A.I. estimate is wrong, select the correct one.
              </p>
            </div>

            {/* Right: score list */}
            <div className="bg-gray-100 pt-4 pb-4 md:border-t">
              <div className="space-y-0">
                <div className="flex justify-between px-4">
                  <h4 className="text-base leading-[24px] tracking-tight font-medium mb-2">
                    {CATEGORY_LABELS[category]}
                  </h4>
                  <h4 className="text-base leading-[24px] tracking-tight font-medium mb-2">
                    A.I. CONFIDENCE
                  </h4>
                </div>

                {scores.map((score) => {
                  const isActive = score.key === activeKey;
                  return (
                    <div
                      key={score.key}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setSelected((prev) => ({ ...prev, [category]: score.key }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelected((prev) => ({
                            ...prev,
                            [category]: score.key,
                          }));
                        }
                      }}
                      className={`flex items-center justify-between h-[48px] hover:bg-[#E1E1E2] px-4 cursor-pointer ${
                        isActive ? "bg-[#1A1B1C] text-white hover:bg-black" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Image
                          src={
                            isActive
                              ? "/summary/activeRadioButton.png"
                              : "/summary/radioButton.png"
                          }
                          alt="radio button"
                          width={12}
                          height={12}
                          className="w-[12px] h-[12px] mr-2"
                        />
                        <span className="font-normal text-base leading-6 tracking-tight">
                          {score.label}
                        </span>
                      </div>
                      <span className="font-normal text-base leading-6 tracking-tight">
                        {Math.round(Number(score.percent))}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div className="pt-4 md:pt-[37px] pb-6 bg-white sticky bottom-40 md:static md:bottom-0 mb-8 md:mb-16">
            <div className="flex justify-between max-w-full mx-auto px-4 md:px-0">
              <Link href="/select" aria-label="Back">
                <div>
                  <div className="relative w-12 h-12 flex items-center justify-center border border-[#1A1B1C] rotate-45 scale-[1] sm:hidden">
                    <span className="rotate-[-45deg] text-xs font-semibold sm:hidden">
                      BACK
                    </span>
                  </div>
                  <div className="group hidden sm:flex flex-row relative justify-center items-center">
                    <div className="w-12 h-12 hidden sm:flex justify-center border border-[#1A1B1C] rotate-45 scale-[0.85] group-hover:scale-[0.92] ease duration-300" />
                    <span className="absolute left-[15px] bottom-[13px] scale-[0.9] rotate-180 hidden sm:block group-hover:scale-[0.92] ease duration-300">
                      ▶
                    </span>
                    <span className="text-sm font-semibold hidden sm:block ml-6 ">
                      BACK
                    </span>
                  </div>
                </div>
              </Link>

              {/* HOME has no `group` and no hover classes in the reference —
                  it does not animate on hover. Reproduced. */}
              <Link href="/" aria-label="Home">
                <div>
                  <div className=" w-12 h-12 flex items-center justify-center border border-[#1A1B1C] rotate-45 scale-[1] sm:hidden">
                    <span className="rotate-[-45deg] text-xs font-semibold sm:hidden">
                      HOME
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-row relative justify-center items-center">
                    <span className="text-sm font-semibold hidden sm:block mr-5">
                      HOME
                    </span>
                    <div className=" w-12 h-12 hidden sm:flex justify-center border border-[#1A1B1C] rotate-45 scale-[0.85]" />
                    <span className="absolute right-[15px] bottom-[13px] scale-[0.9] hidden sm:block">
                      ▶
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}