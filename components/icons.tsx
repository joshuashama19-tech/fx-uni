import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.4 2.4L16 9.5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconChart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-5 3 3 5-7" />
    </svg>
  );
}

export function IconCandles(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3v3M6 12v9M18 3v9M18 18v3" />
      <rect x="3.5" y="6" width="5" height="6" rx="1" />
      <rect x="15.5" y="12" width="5" height="6" rx="1" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconBrain(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3.5 3.5 0 0 0 2.5 6H9a3 3 0 0 0 3-3V6a2 2 0 0 0-3-2Z" />
      <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3.5 3.5 0 0 1-2.5 6H15a3 3 0 0 1-3-3" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 6-6 2 2-6 6-2Z" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="10.5" width="16" height="9.5" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

export function IconSmartphone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function IconLayers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12.5 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16m0 5v-5h5" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17.5h.01" />
    </svg>
  );
}

export function IconGift(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="8.5" width="17" height="4.5" rx="1" />
      <path d="M5 13v7.5h14V13M12 8.5V21M12 8.5C9.5 8.5 8 7 8 5.5A2.5 2.5 0 0 1 12 3.7 2.5 2.5 0 0 1 16 5.5c0 1.5-1.5 3-4 3Z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.9 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.9-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconImage(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 5-5 3.5 3.5L17 11l3 3" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a16.6 16.6 0 0 1-3.1 4.1M6.5 6.6C4 8.3 2.5 12 2.5 12a16.4 16.4 0 0 0 4.6 5.5A9.6 9.6 0 0 0 12 19c1 0 2-.15 2.9-.45" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
