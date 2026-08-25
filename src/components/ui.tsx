import type { ReactNode } from "react";
import { IconX } from "./icons";

/* ---------------- Modal ---------------- */

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={`pop-in relative w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl border border-edge bg-panel shadow-[0_30px_80px_rgba(0,0,0,0.6)]`}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="press absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md border border-edge bg-panel2 text-dim hover:text-fog hover:border-edge2 transition-colors"
        >
          <IconX size={15} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Progress bar ---------------- */

export function Bar({ pct, color = "var(--color-cash)", live, h = "h-2" }: { pct: number; color?: string; live?: boolean; h?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className={`${h} w-full overflow-hidden rounded-full bg-pit border border-edge/60`}>
      <div
        className={`${h} ${live ? "bar-live" : ""} rounded-full transition-[width] duration-500 ease-out`}
        style={{ width: `${p}%`, background: color }}
      />
    </div>
  );
}

/* ---------------- Section heading ---------------- */

export function SectionHead({ kicker, title, right }: { kicker: string; title: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/90">{kicker}</div>
        <h2 className="font-display text-2xl sm:text-3xl text-fog leading-tight">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------------- Panel ---------------- */

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-edge bg-panel/90 ${className}`}>{children}</div>;
}

/* ---------------- Buttons ---------------- */

export function GoldBtn({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`press lift relative overflow-hidden rounded-lg px-4 py-2 text-sm font-extrabold tracking-wide transition-all
        ${disabled
          ? "cursor-not-allowed bg-panel2 text-dim border border-edge"
          : "bg-gold text-[#241a03] border border-goldhi/70 shadow-[0_4px_18px_rgba(246,196,83,0.28)] hover:brightness-110"} ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`press lift rounded-lg border px-4 py-2 text-sm font-bold transition-all
        ${disabled
          ? "cursor-not-allowed border-edge bg-panel text-dim"
          : "border-edge2 bg-panel2 text-fog hover:border-gold/60 hover:text-goldhi"} ${className}`}
    >
      {children}
    </button>
  );
}

export function CashBtn({ children, onClick, disabled, className = "" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`press lift rounded-lg px-4 py-2 text-sm font-extrabold transition-all
        ${disabled
          ? "cursor-not-allowed bg-panel2 text-dim border border-edge"
          : "bg-cash text-[#042412] border border-[#8ff0bf]/70 shadow-[0_4px_18px_rgba(62,224,143,0.25)] hover:brightness-110"} ${className}`}
    >
      {children}
    </button>
  );
}
