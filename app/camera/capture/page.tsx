"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/**
 * Matches the reference /camera/capture exactly.
 *
 * Reference behaviour worth preserving:
 *  - The video block only mounts once the stream exists. While permission is
 *    pending, the page renders NOTHING but the dark field, BACK and the hidden
 *    canvas — there is no spinner or placeholder. Verified by capturing the
 *    loading state with getnpm dev runUserMedia held open.
 *  - The denial state is unstyled debug output: a raw error string in a
 *    red-100/red-400 banner. Reproduced deliberately.
 *  - <video> carries autoplay and playsinline only — no muted. Adding muted
 *    would be a divergence. Autoplay still works because the stream has no
 *    audio track (audio: false).
 *  - The shutter is a plain <div> with a click handler, not a <button>, so the
 *    reference has no keyboard-accessible shutter. Matched here. If you want
 *    keyboard access, add role="button" tabIndex={0} and log it as a divergence.
 */

export default function Capture() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setError("NotSupportedError: Camera unavailable");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        // The user may have navigated away while the prompt was open.
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    }

    start();

    // Release the camera on unmount, or the indicator light stays on.
    // This also covers navigating away via the BACK link.
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // The <video> does not exist until `ready` flips, so attach the stream
  // after that render rather than inside the async function.
  useEffect(() => {
    if (ready && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [ready]);

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
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    router.push("/select");
  }

  return (
    <div className="h-[90vh] w-screen">
      <div className="relative h-[92vh] w-screen overflow-hidden bg-gray-900">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p>Camera access error: {error}</p>
          </div>
        )}

        {ready && (
          <div className="absolute inset-0 z-10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 flex items-center space-x-3">
              <div className="font-semibold text-sm tracking-tight leading-[14px] text-[#FCFCFC] hidden sm:block">
                TAKE PICTURE
              </div>
              <div
                onClick={handleCapture}
                className="transform hover:scale-105 ease-in-out duration-300"
              >
                <Image
                  src="/result/takePictureIcon.webp"
                  alt="Take Picture"
                  width={60}
                  height={60}
                  className="w-16 h-16 cursor-pointer"
                />
              </div>
            </div>

            <div className="absolute bottom-30 sm:bottom-40 left-0 right-0 text-center z-20">
              <p className="text-sm mb-2 font-normal leading-6 text-[#FCFCFC]">
                TO GET BETTER RESULTS MAKE SURE TO HAVE
              </p>
              <div className="flex justify-center space-x-8 text-xs leading-6 text-[#FCFCFC]">
                <p>◇ NEUTRAL EXPRESSION</p>
                <p>◇ FRONTAL POSE</p>
                <p>◇ ADEQUATE LIGHTING</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute md:bottom-8 bottom-60 left-8 z-20">
          <Link href="/result">
            <div>
              <div className="relative w-12 h-12 flex items-center justify-center border border-[#FCFCFC] rotate-45 scale-[1] sm:hidden">
                <span className="rotate-[-45deg] text-xs font-semibold sm:hidden text-[#FCFCFC]">
                  BACK
                </span>
              </div>
              <div className="group hidden sm:flex flex-row relative justify-center items-center">
                <div className=" w-12 h-12 hidden sm:flex justify-center border border-[#FCFCFC] rotate-45 scale-[0.85] group-hover:scale-[0.92] ease duration-300" />
                <span className="absolute left-[15px] bottom-[13px] scale-[0.9] rotate-180 hidden sm:block text-[#FCFCFC] group-hover:scale-[0.92] ease duration-300">
                  ▶
                </span>
                <span className="text-sm font-semibold hidden sm:block ml-6 text-[#FCFCFC]">
                  BACK
                </span>
              </div>
            </div>
          </Link>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
