"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Status = "requesting" | "ready" | "denied" | "unavailable";

export default function Camera() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>("requesting");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        // The user may have navigated away while the permission prompt was open.
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("denied");
      }
    }

    start();

    // Release the camera when leaving the page, or the light stays on.
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // JPEG at 0.9 keeps the base64 payload far smaller than PNG.
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    sessionStorage.setItem("skinstric:image", dataUrl);
    stopStream();
    router.push("/select");
  }

  function handleBack() {
    stopStream();
    router.push("/result");
  }

  return (
    <div className="h-[90vh] w-screen">
      <div className="relative h-[92vh] w-screen overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Permission states sit over the dark backdrop */}
          {status !== "ready" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center text-[#FCFCFC]">
                        {status === "requesting" && (
            <div className="flex h-[65vh] items-center justify-center bg-white md:h-[85vh]">
              <div className="relative flex flex-col items-center justify-center">
                <div
                  aria-hidden
                  className="absolute h-[270px] w-[270px] rotate-45 border border-dotted border-[#A0A4AB]"
                />
                <Image
                  src="/result/camera-icon.webp"
                  alt=""
                  width={136}
                  height={136}
                  className="h-[100px] w-[100px]"
                />
                <p className="mt-6 text-xs leading-6 text-[#1a1b1c83]">
                  SETTING UP CAMERA ...
                </p>
              </div>
            </div>
          )}

              {status === "denied" && (
                <>
                  <p className="text-sm leading-6">
                    CAMERA ACCESS WAS DENIED
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[#fcfcfca1]">
                    Allow camera access in your browser settings, or go back and
                    upload a photo instead.
                  </p>
                </>
              )}

              {status === "unavailable" && (
                <>
                  <p className="text-sm leading-6">
                    NO CAMERA AVAILABLE ON THIS DEVICE
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[#fcfcfca1]">
                    Go back and upload a photo instead.
                  </p>
                </>
              )}
            </div>
          )}

          {status === "ready" && (
            <>
              {/* Shutter, right edge, vertically centred */}
              <div className="absolute top-1/2 right-8 z-20 flex -translate-y-1/2 items-center space-x-3">
                <div className="hidden text-sm leading-[14px] font-semibold tracking-tight text-[#FCFCFC] sm:block">
                  TAKE PICTURE
                </div>
                <button
  type="button"
  onClick={handleCapture}
  aria-label="Take picture"
  className="duration-300 ease-in-out hover:scale-105"
>
  <Image
    src="/result/takePictureIcon.webp"
    alt=""
    width={60}
    height={60}
    className="h-16 w-16 cursor-pointer"
  />
</button>
              </div>

              {/* Shooting tips */}
              <div className="absolute right-0 bottom-30 left-0 z-20 text-center sm:bottom-40">
                <p className="mb-2 text-sm leading-6 font-normal text-[#FCFCFC]">
                  TO GET BETTER RESULTS MAKE SURE TO HAVE
                </p>
                <div className="flex justify-center space-x-8 text-xs leading-6 text-[#FCFCFC]">
                  <p>◇ NEUTRAL EXPRESSION</p>
                  <p>◇ FRONTAL POSE</p>
                  <p>◇ ADEQUATE LIGHTING</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* BACK — white on the dark backdrop */}
        <div className="absolute bottom-60 left-8 z-20 md:bottom-8">
          <button type="button" onClick={handleBack} aria-label="Back">
            <div className="relative flex h-12 w-12 rotate-45 items-center justify-center border border-[#FCFCFC] sm:hidden">
              <span className="-rotate-45 text-xs font-semibold text-[#FCFCFC]">
                BACK
              </span>
            </div>
            <div className="group relative hidden flex-row items-center justify-center sm:flex">
              <div className="flex h-12 w-12 rotate-45 scale-[0.85] justify-center border border-[#FCFCFC] duration-300 group-hover:scale-[0.92]" />
              <span className="absolute bottom-[13px] left-[15px] scale-[0.9] rotate-180 text-[#FCFCFC] duration-300 group-hover:scale-[0.92]">
                ▶
              </span>
              <span className="ml-6 text-sm font-semibold text-[#FCFCFC]">
                BACK
              </span>
            </div>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}