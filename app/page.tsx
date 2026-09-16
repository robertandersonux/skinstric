"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  // Drives the heading fade-in on mount (reference does this with GSAP:
  // the h1 ships with opacity-0 and gets an inline opacity:1 after paint).
  const [mounted, setMounted] = useState(false);

  // Which side CTA is being hovered. Null means neither.
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Heading slides away from the hovered side.
  const headingShift =
    hovered === "left"
      ? "translate-x-[100px]"
      : hovered === "right"
        ? "-translate-x-[100px]"
        : "translate-x-0";

  return (
    <div className="max-sm:scale-[0.75] max-sm:origin-center max-sm:p-6">
      <div className="flex flex-col items-center justify-center h-[71dvh] md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
        {/* MOBILE: two nested diamonds behind the heading (350 and 420) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden"
        >
          <div className="w-[350px] h-[350px] border border-dotted border-[#A0A4AB] rotate-45 absolute top-1/2 left-1/2 -translate-x-[52%] -translate-y-1/2" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center lg:hidden"
        >
          <div className="w-[420px] h-[420px] border border-dotted border-[#A0A4AB] rotate-45 absolute top-1/2 left-1/2 -translate-x-[52%] -translate-y-1/2" />
        </div>

        {/* HEADING — fades in on mount, slides on side-CTA hover */}
        <div
          id="main-heading"
          className={`relative z-10 text-center transition-transform duration-500 ease-in-out ${headingShift}`}
        >
          <h1
            className={`text-[60px] text-[#1A1B1C] lg:text-[100px] font-normal tracking-tighter leading-none transition-opacity duration-1000 ease-out ${
              mounted ? "opacity-100" : "opacity-0"
            }`}
          >
            Sophisticated
            <br />
            <span className="block text-[#1A1B1C]">skincare</span>
          </h1>
        </div>

        {/* MOBILE: centered paragraph */}
        <p className="z-10 block lg:hidden w-[30ch] mt-4 text-[16px] font-semibold text-center text-[#1a1b1c83]">
          Skinstric developed an A.I. that creates a highly-personalized routine
          tailored to what your skin needs.
        </p>

        {/* MOBILE: ENTER EXPERIENCE */}
        <div className="z-10 mt-4 lg:hidden">
          <Link href="/testing">
            <button
              type="button"
              className="relative flex items-center gap-4 hover:scale-105 duration-300"
            >
              <span className="text-[12px] font-bold cursor-pointer">
                ENTER EXPERIENCE
              </span>
              <div className="w-[24px] h-[24px] border border-solid border-black rotate-45 cursor-pointer" />
              <span className="absolute left-[129px] scale-[0.5] duration-300">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="fill-current text-black"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </Link>
        </div>

        {/* DESKTOP: bottom-left blurb */}
        <div className="hidden lg:block fixed bottom-[calc(-7vh)] left-[calc(-20vw)] xl:left-[calc(-27vw)] 2xl:left-[calc(-31vw)] [@media(width>=1920px)]:left-[calc(-33vw)] font-normal text-sm text-[#1A1B1C] space-y-3 uppercase">
          <p>
            Skinstric developed an A.I. that creates a
            <br />
            highly-personalized routine tailored to
            <br />
            what your skin needs.
          </p>
        </div>

        {/* DESKTOP: left diamond + DISCOVER A.I. */}
        <div
          id="left-section"
          className={`hidden lg:block fixed left-[calc(-53vw)] xl:left-[calc(-50vw)] top-1/2 -translate-y-1/2 w-[500px] h-[500px] transition-opacity duration-500 ease-in-out ${
            hovered === "right" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="relative w-full h-full">
            <div
              aria-hidden
              className="w-full h-full border border-dotted border-[#A0A4AB] rotate-45 absolute inset-0"
            />
            <button
              id="discover-button"
              type="button"
              onMouseEnter={() => setHovered("left")}
              onMouseLeave={() => setHovered(null)}
              className="group inline-flex items-center justify-center gap-4 whitespace-nowrap rounded-md text-sm font-normal text-[#1A1B1C] transition-colors cursor-pointer h-9 absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/5 xl:translate-x-1/6 [@media(width>=1920px)]:translate-x-1/20 px-3 py-1"
            >
              <div className="w-[30px] h-[30px] border border-solid border-black rotate-45 cursor-pointer group-hover:scale-110 duration-300" />
              <span className="absolute left-[18px] top-[8px] scale-[0.9] rotate-180 group-hover:scale-105 duration-300">
                ▶
              </span>
              <span>DISCOVER A.I.</span>
            </button>
          </div>
        </div>

        {/* DESKTOP: right diamond + TAKE TEST */}
        <div
          id="right-section"
          className={`hidden lg:block fixed top-1/2 right-[calc(-53vw)] xl:right-[calc(-50vw)] -translate-y-1/2 w-[500px] h-[500px] transition-opacity duration-500 ease-in-out ${
            hovered === "left" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="relative w-full h-full">
            <div
              aria-hidden
              className="w-full h-full border border-dotted border-[#A0A4AB] rotate-45 absolute inset-0"
            />
            <Link href="/testing">
              <button
                id="take-test-button"
                type="button"
                onMouseEnter={() => setHovered("right")}
                onMouseLeave={() => setHovered(null)}
                className="group inline-flex items-center justify-center gap-4 whitespace-nowrap rounded-md text-sm font-normal text-[#1A1B1C] transition-colors cursor-pointer h-9 absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/5 xl:-translate-x-1/6 [@media(width>=1920px)]:-translate-x-1/20 px-3 py-1"
              >
                TAKE TEST
                <div className="w-[30px] h-[30px] border border-solid border-black rotate-45 group-hover:scale-110 duration-300" />
                <span className="absolute left-[107px] top-[9px] scale-[0.9] cursor-pointer group-hover:scale-105 duration-300">
                  ▶
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}