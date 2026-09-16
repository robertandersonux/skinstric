"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DiamondStack from "@/components/DiamondStack";
import { submitPhaseTwo, saveDemographics } from "@/lib/phaseTwo";

/**
 * The smaller three-layer diamond cluster used on this screen. All layers start
 * at the same angle; they drift apart over time because their speeds differ.
 * The rotate-* classes on the large/medium layers match the reference markup
 * verbatim but are dead: the spin animation's transform overrides them.
 */
function ResDiamonds({ variant }: { variant: "camera" | "gallery" }) {
  const isGallery = variant === "gallery";

  const layers = [
    {
      src: "/result/ResDiamond-large.webp",
      size: 484,
      rotate: isGallery ? "rotate-[205deg]" : "rotate-[200deg]",
      className:
        "h-[270px] w-[270px] animate-spin-slow md:h-[482px] md:w-[482px]",
    },
    {
      src: "/result/ResDiamond-medium.webp",
      size: 448,
      rotate: isGallery ? "rotate-[195deg]" : "rotate-[190deg]",
      className:
        "h-[230px] w-[230px] animate-spin-slower md:h-[444px] md:w-[444px]",
    },
    {
      src: "/result/ResDiamond-small.webp",
      size: 408,
      rotate: "",
      className:
        "h-[190px] w-[190px] animate-spin-slowest md:h-[405px] md:w-[405px]",
    },
  ];

  return (
    <>
      {layers.map((layer) => (
        <div
          key={layer.src}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src={layer.src}
            alt=""
            width={layer.size}
            height={layer.size}
            className={`${layer.className} ${layer.rotate}`}
          />
        </div>
      ))}
    </>
  );
}

export default function Result() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askCamera, setAskCamera] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      sessionStorage.setItem("skinstric:image", dataUrl);
      setProcessing(true);
      setError(null);

      const started = Date.now();
      const result = await submitPhaseTwo(dataUrl);

      // Keep the loading state visible long enough to read.
      const elapsed = Date.now() - started;
      if (elapsed < 1200) {
        await new Promise((r) => setTimeout(r, 1200 - elapsed));
      }

      setProcessing(false);

      if (result.ok) {
        saveDemographics(result.data);
      } else {
        setError(result.error);
        setPreview(null);
      }
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Preparing your analysis ---------- */

  if (processing) {
    return (
      <main className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden bg-white">
        <DiamondStack />
        <div className="pointer-events-none relative z-10 flex flex-col items-center justify-center">
          <p className="text-sm uppercase">Preparing your analysis...</p>
          <div className="mt-4 flex gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink [animation-delay:400ms]" />
          </div>
        </div>
      </main>
    );
  }

  /* ---------- Camera / gallery choice ---------- */

  return (
    <main className="relative flex min-h-[92vh] flex-col justify-center bg-white md:pt-[64px]">
      <div className="absolute top-2 left-9 text-left md:left-8">
        <p className="text-xs font-semibold md:text-sm">TO START ANALYSIS</p>
      </div>

      <div className="relative mb-0 flex flex-[0.4] flex-col items-center space-y-[-20px] md:mb-30 md:flex-1 md:flex-row md:space-y-0 xl:justify-center">
        {/* ----- Camera ----- */}
        <div className="relative flex -translate-y-[1%] flex-col items-center justify-center md:absolute md:left-[55%] md:-translate-x-full md:translate-y-0 lg:left-[50%] xl:left-[40%]">
          <div className="h-[270px] w-[270px] md:h-[482px] md:w-[482px]" />
          <ResDiamonds variant="camera" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Image
              src="/result/camera-icon.webp"
              alt="Camera Icon"
              width={136}
              height={136}
              onClick={() => setAskCamera(true)}
              className="absolute h-[100px] w-[100px] cursor-pointer duration-700 ease-in-out hover:scale-108 md:h-[136px] md:w-[136px]"
            />

            <div className="absolute right-[90px] bottom-[1%] -translate-y-[20px] md:top-[30.9%] md:right-[-12px]">
              <p className="mt-1 text-xs leading-[24px] font-normal md:text-sm">
                ALLOW A.I.
                <br />
                TO SCAN YOUR FACE
              </p>
              <Image
                src="/result/ResScanLine.webp"
                alt=""
                width={66}
                height={59}
                className="absolute hidden md:top-[20px] md:right-[143px] md:block"
              />
            </div>

            {/* Camera permission prompt */}
            {askCamera && (
              <div className="absolute z-50 w-[352px] md:top-[43%] md:left-[360px]">
                <div className="bg-[#1A1B1C] pt-4 pb-2">
                  <h2 className="mb-12 pl-4 text-base leading-[24px] font-semibold text-[#FCFCFC]">
                    ALLOW A.I. TO ACCESS YOUR CAMERA
                  </h2>
                  <div className="mt-4 flex border-t border-[#FCFCFC] pt-2">
                    <button
                      type="button"
                      onClick={() => setAskCamera(false)}
                      className="cursor-pointer px-7 text-sm leading-4 font-normal tracking-tight text-[#fcfcfca1] hover:text-gray-500 md:translate-x-45"
                    >
                      DENY
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/camera")}
                      className="cursor-pointer px-5 text-sm leading-4 font-semibold tracking-tight text-[#FCFCFC] hover:text-gray-300 md:translate-x-45"
                    >
                      ALLOW
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ----- Gallery ----- */}
        <div className="relative mt-12 flex -translate-y-[10%] flex-col items-center justify-center opacity-100 transition-opacity duration-300 md:absolute md:left-[45%] md:mt-0 md:translate-y-0 lg:left-[50%] xl:left-[55%]">
          <div className="h-[270px] w-[270px] md:h-[482px] md:w-[482px]" />
          <ResDiamonds variant="gallery" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Image
              src="/result/gallery-icon.webp"
              alt="Photo Upload Icon"
              width={136}
              height={136}
              onClick={() => fileRef.current?.click()}
              className="absolute h-[100px] w-[100px] cursor-pointer duration-700 ease-in-out hover:scale-108 md:h-[136px] md:w-[136px]"
            />

            <div className="absolute top-[75%] -translate-y-[10px] md:top-[70%] md:left-[17px]">
              <p className="mt-2 text-right text-[12px] leading-[24px] font-normal md:text-[14px]">
                ALLOW A.I.
                <br />
                ACCESS GALLERY
              </p>
              <Image
                src="/result/ResGalleryLine.webp"
                alt=""
                width={66}
                height={59}
                className="absolute hidden md:bottom-[39px] md:left-[120px] md:block"
              />
            </div>
          </div>
        </div>

        {/* ----- Preview ----- */}
        <div className="absolute top-[-75px] right-7 transition-opacity duration-300 md:top-[-50px] md:right-8">
          <h1 className="mb-1 text-xs font-normal md:text-sm">Preview</h1>
          <div className="h-24 w-24 overflow-hidden border border-gray-300 md:h-32 md:w-32">
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Selected"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 text-[12px] text-red-600">
          {error}
        </p>
      )}

      <div className="sticky bottom-30.5 mb-0 bg-white pt-4 pb-8 md:static md:mb-0">
        <div className="absolute bottom-8 flex w-full justify-between px-13 md:px-9">
          <Link className="relative" aria-label="Back" href="/testing">
            <div>
              <div className="relative flex h-12 w-12 rotate-45 items-center justify-center border border-[#1A1B1C] sm:hidden">
                <span className="-rotate-45 text-xs font-semibold">BACK</span>
              </div>
              <div className="group relative hidden flex-row items-center justify-center sm:flex">
                <div className="flex h-12 w-12 rotate-45 scale-[0.85] justify-center border border-[#1A1B1C] duration-300 group-hover:scale-[0.92]" />
                <span className="absolute bottom-[13px] left-[15px] scale-[0.9] rotate-180 duration-300 group-hover:scale-[0.92]">
                  ▶
                </span>
                <span className="ml-6 text-sm font-semibold">BACK</span>
              </div>
            </div>
          </Link>

          <Link href="/select">
            <div className={preview ? "animate-slide-in-left" : "hidden"}>
              <div>
                <div className="flex h-12 w-12 rotate-45 items-center justify-center border border-[#1A1B1C] sm:hidden">
                  <span className="-rotate-45 text-xs font-semibold">
                    PROCEED
                  </span>
                </div>
                <div className="group relative hidden flex-row items-center justify-center sm:flex">
                  <span className="mr-5 text-sm font-semibold">PROCEED</span>
                  <div className="flex h-12 w-12 rotate-45 scale-[0.85] justify-center border border-[#1A1B1C] duration-300 group-hover:scale-[0.92]" />
                  <span className="absolute right-[15px] bottom-[13px] scale-[0.9] duration-300 group-hover:scale-[0.92]">
                    ▶
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}