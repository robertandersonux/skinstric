import Image from "next/image";
import Link from "next/link";

/**
 * Matches the reference layout header exactly.
 *
 * Several classes here are inert and are kept only for fidelity:
 *   - text-opacity-70   (Tailwind v3 syntax, no-op in v4)
 *   - text-primary-foreground / hover:bg-primary/90 / shadow
 *                       (shadcn leftovers with no matching theme tokens)
 * They render nothing. Don't "clean them up" and then wonder why a diff
 * against the reference shows a difference.
 *
 * Note the ENTER CODE button has NO border radius in the reference.
 */
export default function Header() {
  return (
    <div className="flex flex-row h-[64px] w-full justify-between py-3 mb-3 relative z-[1000]">
      <div className="flex flex-row pt-1 scale-75 justify-center items-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors h-9 px-4 py-2 font-semibold text-sm mr-2 line-clamp-4 leading-[16px] text-[#1A1B1C] z-1000"
        >
          SKINSTRIC
        </Link>

        <Image
          src="/header/left-bracket.png"
          alt="left-bracket"
          width={5}
          height={19}
          className="w-[4px] h-[17px]"
        />

        <p className="text-[#1a1b1c83] text-opacity-70  font-semibold text-sm ml-1.5 mr-1.5">
          INTRO
        </p>

        <Image
          src="/header/right-bracket.png"
          alt="right-bracket"
          width={5}
          height={19}
          className="w-[4px] h-[17px]"
        />
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold  transition-colors  disabled:pointer-events-none text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mx-4 scale-[0.8] text-[#FCFCFC] text-[10px] bg-[#1A1B1C] leading-[16px]"
      >
        ENTER CODE
      </button>
    </div>
  );
}