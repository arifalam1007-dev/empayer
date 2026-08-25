import type { ReactNode } from "react";

/* ---------------- custom inline SVG icon set ---------------- */

const P = (d: string) => <path d={d} />;

export function Icon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  let body: ReactNode = null;
  switch (name) {
    case "grid":
      body = (<><rect x="3" y="3" width="7.5" height="7.5" rx="1.8" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" /></>);
      break;
    case "case":
      body = (<><rect x="2.5" y="7" width="19" height="13" rx="2" />{P("M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7")}{P("M2.5 12.5h19")}</>);
      break;
    case "map":
      body = (<>{P("M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z")}{P("M9 4v14")}{P("M15 6v14")}</>);
      break;
    case "trend":
      body = (<>{P("M3 17.5l5.5-5.5 4 4L20 8")}{P("M15.5 8H20v4.5")}</>);
      break;
    case "target":
      body = (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.9" fill="currentColor" /></>);
      break;
    case "trophy":
      body = (<>{P("M7 4h10v5a5 5 0 0 1-10 0V4Z")}{P("M7 5.5H4a3 3 0 0 0 3 4")}{P("M17 5.5h3a3 3 0 0 1-3 4")}{P("M12 14v3.5")}{P("M8 21h8")}{P("M9.5 17.5h5l.8 3.5H8.7l.8-3.5Z")}</>);
      break;
    case "crown":
      body = (<>{P("m3 7 4.5 4L12 4.5 16.5 11 21 7v10.5H3V7Z")}{P("M3 17.5h18")}</>);
      break;
    case "user":
      body = (<><circle cx="12" cy="8" r="4" />{P("M4 20.5c1.4-3.7 4.4-5.3 8-5.3s6.6 1.6 8 5.3")}</>);
      break;
    case "coin":
      body = (<><circle cx="12" cy="12" r="8.5" />{P("M12 6.5v11")}{P("M14.7 8.8c-.6-.8-1.6-1.3-2.7-1.3-1.5 0-2.6.8-2.6 1.9 0 2.6 5.3 1.5 5.3 4.2 0 1.2-1.1 2-2.7 2-1.2 0-2.3-.5-2.9-1.4")}</>);
      break;
    case "bolt":
      body = P("M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z");
      break;
    case "lock":
      body = (<><rect x="5" y="11" width="14" height="9.5" rx="2" />{P("M8 11V8a4 4 0 0 1 8 0v3")}{P("M12 15v2")}</>);
      break;
    case "check":
      body = P("m4.5 12.5 5 5L19.5 7");
      break;
    case "x":
      body = (<>{P("M6 6l12 12")}{P("M18 6 6 18")}</>);
      break;
    case "plus":
      body = (<>{P("M12 5v14")}{P("M5 12h14")}</>);
      break;
    case "mail":
      body = (<><rect x="3" y="5" width="18" height="14" rx="2" />{P("m3.5 7.5 8.5 6 8.5-6")}</>);
      break;
    case "sparkle":
      body = (<>{P("M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z")}{P("m18.7 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z")}</>);
      break;
    case "building":
      body = (<>{P("M4.5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16")}{P("M14.5 9.5h3a2 2 0 0 1 2 2V21")}{P("M2.5 21h19")}{P("M8 7h2")}{P("M8 11h2")}{P("M8 15h2")}{P("M17.5 14h.01")}{P("M17.5 17h.01")}</>);
      break;
    case "people":
      body = (<><circle cx="9" cy="8" r="3.4" />{P("M2.5 19.5c1-3.2 3.4-4.7 6.5-4.7s5.5 1.5 6.5 4.7")}{P("M15.5 5a3 3 0 0 1 0 6")}{P("M17.8 14.9c1.9.5 3.2 1.9 3.7 4.2")}</>);
      break;
    case "megaphone":
      body = (<>{P("M4 9.5v5l3.5.9L19 20V4L7.5 8.6 4 9.5Z")}{P("M8.5 16.4v3.1a1.5 1.5 0 0 0 3 .3")}</>);
      break;
    case "gear":
      body = (<><circle cx="12" cy="12" r="3.4" />{P("M12 2.8v2.7")}{P("M12 18.5v2.7")}{P("M2.8 12h2.7")}{P("M18.5 12h2.7")}{P("m5.2 5.2 1.9 1.9")}{P("m16.9 16.9 1.9 1.9")}{P("m18.8 5.2-1.9 1.9")}{P("m7.1 16.9-1.9 1.9")}</>);
      break;
    case "rocket":
      body = (<>{P("M12 3c2.9 1.7 4.3 4.8 4.3 8.4L19 14l-2.9.8L14.5 18h-5L8 14.8 5 14l2.7-2.6C7.7 7.8 9.1 4.7 12 3Z")}{P("M12 20.5 10.8 18h2.4L12 20.5Z")}{P("m5 14-1.5 4L8 16.6")}{P("m19 14 1.5 4-4.5-1.4")}</>);
      break;
    case "pin":
      body = (<>{P("M12 21.5s-6.5-5.5-6.5-10.7A6.5 6.5 0 0 1 12 4.5a6.5 6.5 0 0 1 6.5 6.3C18.5 16 12 21.5 12 21.5Z")}{P("M12 13a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z")}</>);
      break;
    case "clock":
      body = (<><circle cx="12" cy="12" r="8.5" />{P("M12 7v5l3.4 2")}</>);
      break;
    case "out":
      body = (<>{P("M9.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3.5")}{P("m15 8 4 4-4 4")}{P("M19 12H9.5")}</>);
      break;
    case "chevron":
      body = P("m9 5 7 7-7 7");
      break;
    case "globe":
      body = (<><circle cx="12" cy="12" r="8.5" />{P("M3.5 12h17")}{P("M12 3.5c2.9 2.6 2.9 14.4 0 17-2.9-2.6-2.9-14.4 0-17Z")}</>);
      break;
    case "cart":
      body = (<><circle cx="9.5" cy="19.5" r="1.4" />{P("M16 18.1a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 0 0-2.8 0Z")}{P("M3 4h2.5l2.3 11h10.4L20 8H6.7")}</>);
      break;
    case "tower":
      body = (<>{P("M6 21V8l6-4.5L18 8v13")}{P("M3.5 21h17")}{P("M9.5 11h1.6")}{P("M13 11h1.6")}{P("M9.5 14.5h1.6")}{P("M13 14.5h1.6")}{P("M10.5 21v-3h3v3")}</>);
      break;
    case "bank":
      body = (<>{P("m3 9.5 9-5.5 9 5.5")}{P("M4.5 10v8")}{P("M8.5 10v8")}{P("M12 10v8")}{P("M15.5 10v8")}{P("M19.5 10v8")}{P("M2.5 20.5h19")}</>);
      break;
    case "plane":
      body = (<>{P("M21 4 3 11.2l6.8 2.4L12 20.5 21 4Z")}{P("M9.8 13.6 21 4")}</>);
      break;
    case "gem":
      body = (<>{P("M7 4h10l4 5-9 11.5L3 9l4-5Z")}{P("M3 9h18")}{P("m12 20.5-3.5-11.5L12 4l3.5 5L12 20.5Z")}</>);
      break;
    case "home":
      body = (<>{P("m4 11 8-7 8 7")}{P("M6 9.5V20h12V9.5")}{P("M10 20v-5h4v5")}</>);
      break;
    case "star":
      body = P("m12 3 2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.5 3.1 1.1-6.3L3 9.6l6.3-.9L12 3Z");
      break;
    case "refresh":
      body = (<>{P("M20 11.5A8 8 0 1 0 18.9 16")}{P("M20 5v6.5h-6.5")}</>);
      break;
    case "copy":
      body = (<><rect x="9" y="9" width="11.5" height="11.5" rx="2" />{P("M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1")}</>);
      break;
    case "shield":
      body = P("M12 2.8 5 5.8v5.4c0 4.6 3 8.1 7 10 4-1.9 7-5.4 7-10V5.8l-7-3Z");
      break;
    case "flag":
      body = (<>{P("M5.5 21.5V4")}{P("M5.5 4.5h13L16 8.5l2.5 4h-13")}</>);
      break;
    case "gift":
      body = (<>{P("M4 8.5h16V13H4z")}{P("M6 13v7.5h12V13")}{P("M12 8.5v12")}{P("M12 8.5S7.5 9 7.5 6 11 3.5 12 8.5Z")}{P("M12 8.5S16.5 9 16.5 6 13 3.5 12 8.5Z")}</>);
      break;
    case "download":
      body = (<>{P("M12 3.5V15")}{P("m7 10.5 5 5 5-5")}{P("M4.5 20.5h15")}</>);
      break;
    default:
      body = <circle cx="12" cy="12" r="8" />;
  }

  if (name === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      {body}
    </svg>
  );
}

/* ---------------- primitives ---------------- */

export function Bar({ value, max, color = "var(--color-gold)", className = "", h = 8 }: { value: number; max: number; color?: string; className?: string; h?: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1e-9)) * 100));
  return (
    <div className={"relative overflow-hidden rounded-full border border-[#1a3528] bg-[#0a1b14] " + className} style={{ height: h }}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
        style={{ width: pct + "%", background: `linear-gradient(90deg, ${color}99, ${color})`, boxShadow: `0 0 12px -2px ${color}` }}
      />
    </div>
  );
}

export function Modal({ open, onClose, children, w = 480 }: { open: boolean; onClose: () => void; children: ReactNode; w?: number }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-[#04100ad0] backdrop-blur-sm" />
      <div className="panel slideup relative max-h-[88vh] w-full overflow-y-auto" style={{ maxWidth: w }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function LogoBadge({ icon, color, size = 48, level = 1 }: { icon: string; color: string; size?: number; level?: number }) {
  const glow = Math.min(1, level / 18);
  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-[26%]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.52,
        lineHeight: 1,
        background: `radial-gradient(circle at 30% 25%, ${color}45, ${color}12 72%)`,
        border: `1.5px solid ${color}70`,
        boxShadow: `0 0 ${8 + glow * 26}px -4px ${color}88, inset 0 0 ${6 + glow * 10}px -6px ${color}`,
      }}
    >
      <span style={{ filter: `drop-shadow(0 2px 4px #0008)` }}>{icon}</span>
    </div>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={"chip " + className}>{children}</span>;
}

export function SectionHead({ kicker, title, right }: { kicker?: string; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-dim">{kicker}</div>}
        <h2 className="display text-2xl text-fog md:text-3xl">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Spark({ data, w = 220, h = 64, color = "var(--color-cash)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-[#1a3528] bg-[#0a1b14] text-[11px] text-dim" style={{ width: w, height: h }}>
        collecting data…
      </div>
    );
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = Math.max(max - min, 1e-6);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 4 - ((v - min) / span) * (h - 10)).toFixed(1)}`);
  const line = pts.join(" ");
  return (
    <svg width={w} height={h} className="rounded-lg border border-[#1a3528] bg-[#0a1b14]">
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={color + ""} opacity="0.09" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={pts[pts.length - 1].split(",")[1]} r="3" fill={color} />
    </svg>
  );
}
