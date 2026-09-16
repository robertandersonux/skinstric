import Image from "next/image";

/**
 * The three spinning diamond layers used on /testing and its processing states.
 *
 * All three start at the same angle and share one center. They drift apart
 * because their durations differ, which is what the reference does too — the
 * rotate-190 / rotate-185 classes in the reference markup are dead, since the
 * animation's transform overrides any transform set on the same element.
 *
 * The wrapper holds the centering translate and the image does nothing but
 * spin, so the animation can't clobber the centering.
 */
export default function DiamondStack() {
  const layers = [
    {
      src: "/diamonds/Diamond-light-large.webp",
      size: 764,
      className:
        "h-[480px] w-[480px] animate-spin-slow md:h-[762px] md:w-[762px]",
    },
    {
      src: "/diamonds/Diamond-medium-medium.webp",
      size: 684,
      className:
        "h-[400px] w-[400px] animate-spin-slower md:h-[682px] md:w-[682px]",
    },
    {
      src: "/diamonds/Diamond-dark-small.webp",
      size: 604,
      className:
        "h-[320px] w-[320px] animate-spin-slowest md:h-[602px] md:w-[602px]",
    },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {layers.map((layer) => (
        <div
          key={layer.src}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src={layer.src}
            alt=""
            width={layer.size}
            height={layer.size}
            className={layer.className}
          />
        </div>
      ))}
    </div>
  );
}