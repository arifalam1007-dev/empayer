import { useState } from "react";
import { useAuth } from "../store/auth";
import { Icon } from "./ui";

const TICKER = [
  "☕ Coffee futures up 12%",
  "🍔 Burger wars heat up downtown",
  "✈️ Skyline Air IPO rumors swirl",
  "🏦 Interest rates wobble again",
  "💎 Luxury District rents at record high",
  "🚗 EV boom supercharges dealerships",
  "💻 Tech layoffs? Not in this economy",
  "🏨 Grand Hotel books out till 2027",
  "🛒 Supermarket aisle 12 goes viral",
  "👕 Vintage denim margins hit 340%",
];

function CoinBg() {
  const coins = [
    { left: "6%", size: 26, dur: 26, delay: 0, o: 0.1 },
    { left: "16%", size: 16, dur: 34, delay: -8, o: 0.08 },
    { left: "29%", size: 22, dur: 22, delay: -15, o: 0.12 },
    { left: "44%", size: 14, dur: 38, delay: -4, o: 0.07 },
    { left: "58%", size: 24, dur: 24, delay: -19, o: 0.1 },
    { left: "71%", size: 18, dur: 30, delay: -11, o: 0.09 },
    { left: "83%", size: 28, dur: 21, delay: -6, o: 0.11 },
    { left: "93%", size: 15, dur: 36, delay: -25, o: 0.08 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((c, i) => (
        <span key={i} className="drift absolute" style={{ left: c.left, animationDuration: c.dur + "s", animationDelay: c.delay + "s", ["--o" as string]: c.o }}>
          <span className="text-gold" style={{ fontSize: c.size, filter: "drop-shadow(0 0 6px #f6c45344)" }}>
            <Icon name="coin" size={c.size} />
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Login() {
  const { busy, signIn, signUp, signInGoogle, guest } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = mode === "in" ? signIn(email, pass) : signUp(name, email, pass);
    setErr(r);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink">
      {/* ambient layers */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 12% -10%, #f6c45318, transparent 42%), radial-gradient(circle at 95% 8%, #3ee08f12, transparent 40%), radial-gradient(circle at 50% 120%, #0d2b1e, transparent 60%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#e9f5ee 1px, transparent 1px), linear-gradient(90deg, #e9f5ee 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <CoinBg />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-0">
        {/* brand side */}
        <div className="gridfade">
          <div className="chip mb-6 border-[#f6c45344] bg-[#f6c45312] text-goldhi">
            <Icon name="coin" size={13} /> VIRTUAL TYCOON SIMULATION
          </div>
          <h1 className="display text-[17vw] leading-[0.88] text-fog sm:text-7xl lg:text-8xl">
            Business
            <br />
            <span className="text-gold" style={{ textShadow: "0 0 40px #f6c45355" }}>
              Empire
            </span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-mint">
            Start with a small shop and <b className="text-fog">$1,000</b>. Reinvest every dollar, upgrade five ways, claim five districts, and stack
            businesses until the skyline has your name on it.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5 text-[12px] font-bold text-mint">
            <span className="chip"><Icon name="case" size={13} className="text-gold" /> 10 industries + custom brands</span>
            <span className="chip"><Icon name="map" size={13} className="text-sky" /> 5 city districts</span>
            <span className="chip"><Icon name="clock" size={13} className="text-cash" /> earns while you're away</span>
          </div>
        </div>

        {/* auth card */}
        <div className="panel slideup relative overflow-hidden p-6 sm:p-8" style={{ boxShadow: "0 30px 80px -30px #000c" }}>
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg, var(--color-gold), var(--color-cash))" }} />
          <div className="mb-5 flex items-center justify-between">
            <h2 className="display text-xl text-fog">Get the keys</h2>
            <div className="inset-well flex p-1 text-[12px] font-bold">
              {(["in", "up"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setErr(null); }} className={"rounded-lg px-3 py-1.5 transition-all " + (mode === m ? "bg-[#f6c4531e] text-goldhi" : "text-dim hover:text-fog")}>
                  {m === "in" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          </div>

          <button onClick={signInGoogle} disabled={busy} className="btn btn-ghost h-11 w-full text-[14px]">
            {busy ? <span className="pulsesoft inline-flex items-center gap-2"><Icon name="refresh" size={16} className="animate-spin" /> Contacting Google…</span> : (<><Icon name="google" size={17} /> Continue with Google</>)}
          </button>

          <div className="my-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-dim">
            <span className="h-px flex-1 bg-edge" /> or use email <span className="h-px flex-1 bg-edge" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />}
            <input className="input" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
            {err && <div className="rounded-lg border border-[#6b2b1f] bg-[#3a1712] px-3 py-2 text-[12.5px] font-semibold text-ember">{err}</div>}
            <button type="submit" className="btn btn-gold h-11 w-full text-[14px]">
              {mode === "in" ? "Sign in & play" : "Create account & play"} <Icon name="chevron" size={15} />
            </button>
          </form>

          <button onClick={guest} className="mt-4 w-full text-center text-[12.5px] font-bold text-dim transition-colors hover:text-goldhi">
            Skip the paperwork — play as guest →
          </button>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-[#1a3528] bg-[#0a1b14] px-3 py-2.5 text-[11px] leading-relaxed text-dim">
            <Icon name="shield" size={14} className="mt-0.5 shrink-0 text-cash" />
            Demo authentication runs entirely in your browser. Swap in Firebase or Supabase later — the app only consumes the session user.
          </div>
        </div>
      </div>

      {/* news ticker */}
      <div className="relative z-10 border-t border-edge bg-pit/80 py-2.5 backdrop-blur">
        <div className="flex overflow-hidden">
          <div className="marquee flex shrink-0 items-center gap-8 pr-8 whitespace-nowrap text-[12px] font-semibold text-dim">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-8">
                {t} <span className="text-gold">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
