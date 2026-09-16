"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * The reference does NOT rotate the grid container. It is a plain 3x3 grid
 * with explicit cell placement; each *button* is rotate-45 individually and
 * the label span is counter-rotated.
 */

const TILE_BASE =
  "w-[153.88px] h-[153.88px] hover:bg-gray-300 transform rotate-45 flex items-center justify-center -m-5 font-semibold leading-[24px] tracking-tight uppercase";

/**
 * Hovering a tile reveals EXACTLY ONE diamond layer — the one mapped to that
 * tile — growing from 400px to its own size while fading in. The other two
 * layers stay at w-[400px] opacity-0. Confirmed against the reference DOM.
 *
 * Sizes are confirmed: 602 / 682 / 762.
 *
 * VERIFY: both side tiles appear to map to Medium, but only one of them was
 * clearly captured. Hover Cosmetic Concerns and Skin Type Details separately
 * and check that each shows w-[682px].
 *
 * Write sizes as complete class strings — Tailwind scans source text, so a
 * class built from a variable at runtime generates nothing.
 *
 * "Diamond Large" points at Diamond-dark-small on purpose — a reference bug,
 * reproduced deliberately.
 */
const DIAMONDS = [
  {
    alt: "Diamond Small",
    src: "/diamonds/Diamond-dark-small.webp",
    hover: "w-[602px] h-[602px]",
  },
  {
    alt: "Diamond Medium",
    src: "/diamonds/Diamond-medium-medium.webp",
    hover: "w-[682px] h-[682px]",
  },
  {
    alt: "Diamond Large",
    src: "/diamonds/Diamond-dark-small.webp",
    hover: "w-[762px] h-[762px]",
  },
];

const REST = "w-[400px] h-[400px]";

const DIAMOND_FOR_TILE: Record<string, string> = {
  Demographics: "Diamond Small",
  "Cosmetic Concerns": "Diamond Medium",
  "Skin Type Details": "Diamond Medium",
  Weather: "Diamond Large",
};

const DISABLED_TILES = [
  { label: "Cosmetic Concerns", cell: "row-start-2 col-start-1" },
  { label: "Skin Type Details", cell: "row-start-2 col-start-3" },
  { label: "Weather", cell: "row-start-3 col-start-2" },
];

export default function Select() {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const activeDiamond = hoveredTile ? DIAMOND_FOR_TILE[hoveredTile] : null;

  return (
    <div>
      <div className="absolute top-10 left-8 text-left mt-5">
        <h1 className="text-base font-semibold leading-[24px] tracking-tight">
          A.I. ANALYSIS
        </h1>
        <p className="text-sm mt-1 text-muted-foreground uppercase leading-[24px]">
          A.I. has estimated the following.
          <br />
          Fix estimated information if needed.
        </p>
      </div>

      <div className="h-[78.3vh] flex flex-col items-center justify-center bg-white">
        <div className="relative">
          {DIAMONDS.map((d) => {
            const on = d.alt === activeDiamond;
            return (
              <div
                key={d.alt}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div
                  className={`absolute transition-all duration-400 ${
                    on ? `${d.hover} opacity-100` : `${REST} opacity-0`
                  }`}
                >
                  <Image
                    src={d.src}
                    alt={d.alt}
                    fill
                    sizes="100vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            );
          })}

          <div className="relative z-10 grid grid-cols-3 grid-rows-3 gap-0">
            <div className="flex items-center justify-center col-start-2">
              <Link href="/summary">
                <button
                  type="button"
                  onMouseEnter={() => setHoveredTile("Demographics")}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`${TILE_BASE} bg-gray-200 cursor-pointer hover:scale-[1.05] transition-transform duration-300`}
                >
                  <span className="transform -rotate-45">Demographics</span>
                </button>
              </Link>
            </div>

            {DISABLED_TILES.map((tile) => (
              <div
                key={tile.label}
                className={`flex items-center justify-center ${tile.cell}`}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredTile(tile.label)}
                  onMouseLeave={() => setHoveredTile(null)}
                  className={`${TILE_BASE} bg-gray-100 cursor-not-allowed`}
                >
                  <span className="transform -rotate-45">{tile.label}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 md:pt-12 pb-8 bg-white sticky md:static bottom-40 mb-0 md:mb-0">
        <div className="flex justify-between max-w-full mx-auto px-13 md:px-9">
          <Link href="/result">
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

          <Link href="/summary">
            <div>
              <div className=" w-12 h-12 flex items-center justify-center border border-[#1A1B1C] rotate-45 scale-[1] sm:hidden">
                <span className="rotate-[-45deg] text-xs font-semibold sm:hidden">
                  SUM
                </span>
              </div>
              <div className="group hidden sm:flex flex-row relative justify-center items-center">
                <span className="text-sm font-semibold hidden sm:block mr-5">
                  GET SUMMARY
                </span>
                <div className=" w-12 h-12 hidden sm:flex justify-center border border-[#1A1B1C] rotate-45 scale-[0.85] group-hover:scale-[0.92] ease duration-300" />
                <span className="absolute right-[15px] bottom-[13px] scale-[0.9] hidden sm:block group-hover:scale-[0.92] ease duration-300">
                  ▶
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
