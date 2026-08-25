import { useState } from "react";
import type { AccountUser } from "../game/data";
import { auth } from "../game/auth";
import { GoogleG, IconBriefcase, IconMail, IconTrendUp, IconZap } from "./icons";

const PITCH = [
  { icon: <IconZap size={17} />, text: "Start with $1,000 and a tiny shop — compound it into an empire" },
  { icon: <IconBriefcase size={17} />, text: "10 industries, 5 city districts, 5 upgrade tracks per business" },
  { icon: <IconTrendUp size={17} />, text: "Earn while you're away — offline income waits for you" },
];

export default function AuthScreen({ onAuthed }: { onAuthed: (u: AccountUser) => void }) {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  const submit = async () => {
    setError(null);
    setBusy("email");
    const res = mode === "up"
      ? await auth.signUpWithEmail(name, email, password)
      : await auth.signInWithEmail(email, password);
    setBusy(null);
    if (res.ok && res.user) onAuthed(res.user);
    else setError(res.error ?? "Something went wrong.");
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    const res = await auth.signInWithGoogle();
    setBusy(null);
    if (res.ok && res.user) onAuthed(res.user);
    else setError(res.error ?? "Google sign-in failed.");
  };

  const input =
    "w-full rounded-lg border border-edge bg-pit/70 px-3.5 py-2.5 text-sm text-fog placeholder:text-dim/70 outline-none transition-colors focus:border-gold/70 focus:ring-2 focus:ring-gold/15";

  return (
    <div className="bg-board relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <AmbientCoins />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
        {/* ---- left: the pitch ---- */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-8 pt-12 lg:px-12 lg:py-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-gold/40 bg-gradient-to-b from-gold/25 to-gold/5 text-xl shadow-[0_0_30px_rgba(246,196,83,0.25)]">💰</div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-dim">Idle Tycoon</span>
          </div>

          <h1 className="font-display mt-6 text-6xl leading-[0.92] text-fog sm:text-7xl lg:text-8xl">
            BUSINESS
            <span className="text-outline-gold block">EMPIRE</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mint/90">
            Buy the block. Upgrade the block. Own the city. Every second your businesses
            print money — your job is deciding where it flows next.
          </p>

          <ul className="mt-8 space-y-3.5">
            {PITCH.map((p, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-fog/90">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-edge2 bg-panel text-gold">{p.icon}</span>
                {p.text}
              </li>
            ))}
          </ul>

          {/* ticker */}
          <div className="mt-10 hidden overflow-hidden rounded-lg border border-edge bg-pit/60 lg:block">
            <TickerRow />
          </div>
        </div>

        {/* ---- right: the form ---- */}
        <div className="flex flex-1 items-center justify-center px-6 pb-14 lg:px-12">
          <div className="pop-in w-full max-w-sm rounded-xl border border-edge bg-panel/95 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)] sm:p-7">
            <div className="flex rounded-lg border border-edge bg-pit/60 p-1">
              {(["up", "in"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); }}
                  className={`flex-1 rounded-md py-2 text-[13px] font-extrabold uppercase tracking-wider transition-all ${
                    mode === m ? "bg-gold text-[#241a03] shadow" : "text-dim hover:text-fog"
                  }`}
                >
                  {m === "up" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>

            <h2 className="font-display mt-5 text-2xl text-fog">
              {mode === "up" ? "Incorporate your empire" : "Welcome back, boss"}
            </h2>
            <p className="mt-1 text-[13px] text-dim">
              {mode === "up" ? "Your first $1,000 and a Corner Shop are waiting." : "Your businesses kept earning while you were out."}
            </p>

            <div className="mt-5 space-y-3">
              {mode === "up" && (
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-dim">Your name</label>
                  <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Cash" />
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-dim">Email</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim"><IconMail size={15} /></span>
                  <input className={`${input} pl-9`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@empire.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-dim">Password</label>
                <input
                  className={input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>

              {error && (
                <div className="pop-in rounded-lg border border-ember/40 bg-ember/10 px-3 py-2.5 text-[13px] font-semibold text-[#ffb59f]">
                  {error}
                </div>
              )}

              <button
                onClick={submit}
                disabled={busy !== null}
                className="press lift w-full rounded-lg border border-goldhi/70 bg-gold py-2.5 text-sm font-extrabold tracking-wide text-[#241a03] shadow-[0_6px_24px_rgba(246,196,83,0.3)] transition-all hover:brightness-110 disabled:opacity-60"
              >
                {busy === "email" ? "Signing you in…" : mode === "up" ? "Found my company →" : "Enter the boardroom →"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-edge" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-dim">or</span>
                <span className="h-px flex-1 bg-edge" />
              </div>

              <button
                onClick={google}
                disabled={busy !== null}
                className="press lift flex w-full items-center justify-center gap-2.5 rounded-lg border border-edge2 bg-panel2 py-2.5 text-sm font-bold text-fog transition-all hover:border-fog/40 disabled:opacity-60"
              >
                <GoogleG size={17} /> Continue with Google
              </button>

              <p className="pt-1 text-center text-[11px] leading-relaxed text-dim">
                Demo auth — accounts live in this browser only. The module is built to swap
                straight onto <span className="text-mint">Firebase</span> or <span className="text-mint">Supabase</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TickerRow() {
  const items = ["SHOP +2.4%", "COFF +5.1%", "BRGR −0.8%", "TECH +9.3%", "BANK +1.2%", "AIRL +3.7%", "HOTL −1.4%", "LUXE +6.8%", "FINX +0.4%", "CRGO +2.2%"];
  const row = items.map((t, i) => (
    <span key={i} className={`mx-4 text-xs font-bold tracking-wider ${t.includes("−") ? "text-ember" : "text-cash"}`}>{t}</span>
  ));
  return (
    <div className="ticker-track flex w-max items-center py-2">
      {[0, 1].map((k) => (
        <span key={k} className="flex items-center">{row}</span>
      ))}
    </div>
  );
}

function AmbientCoins() {
  const glyphs = ["$", "¢", "$", "◆", "$", "▮"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="particle absolute text-gold/40"
          style={{
            left: `${(i * 97) % 100}%`,
            fontSize: `${14 + ((i * 13) % 22)}px`,
            ["--pd" as string]: `${18 + ((i * 7) % 16)}s`,
            ["--pdel" as string]: `${-(i * 2.7)}s`,
            ["--po" as string]: 0.14 + ((i * 3) % 10) / 55,
          }}
        >
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </div>
  );
}
