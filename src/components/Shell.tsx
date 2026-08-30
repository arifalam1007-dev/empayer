import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../store/auth";
import { useGame, type View } from "../store/game";
import { fmtMoney, fmtRate, levelInfo, netWorth, tierFor, titleFor, totalIncome } from "../game/data";
import { Bar, Icon, Modal } from "./ui";
import Contact from "./Contact";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "businesses", label: "Businesses", icon: "case" },
  { id: "map", label: "City Map", icon: "map" },
  { id: "upgrades", label: "Upgrades", icon: "trend" },
  { id: "missions", label: "Missions", icon: "target" },
  { id: "achievements", label: "Achievements", icon: "trophy" },
  { id: "leaderboard", label: "Leaderboard", icon: "crown" },
  { id: "profile", label: "Profile", icon: "user" },
];

const SHORT: Record<View, string> = {
  dashboard: "Home",
  businesses: "Biz",
  map: "Map",
  upgrades: "Boost",
  missions: "Goals",
  achievements: "Awards",
  leaderboard: "Ranks",
  profile: "You",
};

const KIND: Record<string, { border: string; icon: string; color: string }> = {
  gold: { border: "#f6c453", icon: "coin", color: "text-goldhi" },
  good: { border: "#3ee08f", icon: "check", color: "text-cash" },
  level: { border: "#56c8ff", icon: "bolt", color: "text-sky" },
  info: { border: "#6f9584", icon: "sparkle", color: "text-mint" },
};

function Ambient() {
  const coins = [
    { left: "8%", size: 22, dur: 28, delay: -3, o: 0.07 },
    { left: "24%", size: 14, dur: 36, delay: -14, o: 0.05 },
    { left: "41%", size: 18, dur: 24, delay: -8, o: 0.06 },
    { left: "57%", size: 13, dur: 40, delay: -20, o: 0.05 },
    { left: "72%", size: 20, dur: 26, delay: -11, o: 0.07 },
    { left: "88%", size: 15, dur: 33, delay: -17, o: 0.06 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 10% -10%, #f6c45314, transparent 40%), radial-gradient(circle at 96% 6%, #3ee08f10, transparent 38%), radial-gradient(circle at 50% 115%, #0d2b1eaa, transparent 55%)" }} />
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(#e9f5ee 1px, transparent 1px), linear-gradient(90deg, #e9f5ee 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      {coins.map((c, i) => (
        <span key={i} className="drift absolute text-gold" style={{ left: c.left, animationDuration: c.dur + "s", animationDelay: c.delay + "s", ["--o" as string]: c.o }}>
          <Icon name="coin" size={c.size} />
        </span>
      ))}
    </div>
  );
}

function CashFloaters() {
  const [items, setItems] = useState<{ id: number; val: number; dx: number }[]>([]);
  useEffect(() => {
    const iv = setInterval(() => {
      const s = useGame.getState().s;
      if (!s) return;
      const inc = totalIncome(s);
      if (inc <= 0) return;
      setItems((p) => [...p.slice(-6), { id: Math.random(), val: inc, dx: Math.random() * 64 - 32 }]);
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-x-0 -bottom-1">
      {items.map((f) => (
        <span key={f.id} className="absolute left-1/2" style={{ marginLeft: f.dx }}>
          <span className="rise num block text-[12.5px] font-bold whitespace-nowrap text-cash" style={{ textShadow: "0 0 10px #3ee08f77" }}>
            +{fmtMoney(f.val)}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const s = useGame((st) => st.s);
  const view = useGame((st) => st.view);
  const setView = useGame((st) => st.setView);
  const toasts = useGame((st) => st.toasts);
  const dropToast = useGame((st) => st.dropToast);
  const pulse = useGame((st) => st.pulse);
  const offline = useGame((st) => st.offline);
  const collectOffline = useGame((st) => st.collectOffline);
  const userName = useGame((st) => st.userName);
  const signOut = useAuth((a) => a.signOut);

  if (!s) return null;
  const inc = totalIncome(s);
  const nw = netWorth(s);
  const li = levelInfo(s.xp);
  const tier = tierFor(nw);
  const active = NAV.find((n) => n.id === view)!;

  return (
    <div className="relative min-h-screen bg-ink">
      <Ambient />
      {pulse > 0 && <div key={pulse} className="flashring pointer-events-none fixed inset-0 z-[60]" />}

      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-edge bg-pit/75 backdrop-blur lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f6c45366] bg-[#f6c45318] text-gold" style={{ boxShadow: "0 0 18px -4px #f6c45366" }}>
            <Icon name="coin" size={22} />
          </div>
          <div>
            <div className="display text-[15px] leading-none text-fog">Business</div>
            <div className="display text-[15px] leading-tight text-gold">Empire</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={"navitem " + (view === n.id ? "on" : "")}>
              <Icon name={n.icon} size={17} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-edge p-3">
          <div className="panel-hot flex items-center gap-2.5 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge2 bg-panel3 text-[13px] font-black text-goldhi">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-bold text-fog">{userName}</div>
              <div className="text-[9.5px] font-bold tracking-wider text-gold uppercase">{tier.name}</div>
            </div>
            <button onClick={signOut} title="Sign out" className="rounded-lg border border-edge2 p-1.5 text-dim transition-colors hover:border-[#6b2b1f] hover:text-ember">
              <Icon name="out" size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-60">
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b border-edge bg-[#081712dd] backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-gold"><Icon name="coin" size={22} /></span>
              <span className="display text-sm text-fog">
                B<span className="text-gold">E</span>
              </span>
            </div>
            <div className="hidden lg:block">
              <h1 className="display text-lg leading-none text-fog">{active.label}</h1>
              <p className="mt-0.5 text-[10.5px] font-bold tracking-wider text-dim uppercase">{tier.name} · {fmtMoney(nw)}</p>
            </div>

            <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
              <div className="hidden items-center gap-1.5 rounded-lg border border-[#1f4634] bg-[#0d241a] px-2.5 py-1.5 sm:flex" title="Total income per second">
                <Icon name="trend" size={14} className="text-cash" />
                <span className="num text-[13px] font-bold text-cash">{fmtRate(inc)}</span>
              </div>
              <div className="relative pr-1 text-right">
                <div className="text-[9px] font-black tracking-[0.22em] text-dim uppercase">Cash</div>
                <div className="num text-lg leading-tight font-bold text-goldhi sm:text-xl" style={{ textShadow: "0 0 18px #f6c45333" }}>
                  {fmtMoney(s.money)}
                </div>
                <CashFloaters />
              </div>
              <div className="flex items-center gap-2">
                <div className="num flex h-9 w-11 items-center justify-center rounded-xl border border-[#f6c45355] bg-[#f6c45314] text-[11.5px] font-black text-goldhi">
                  LV{li.level}
                </div>
                <div className="hidden w-24 md:block">
                  <div className="mb-1 flex justify-between text-[9px] font-bold tracking-wider text-dim uppercase">
                    <span className="truncate">{titleFor(li.level)}</span>
                  </div>
                  <Bar value={li.into} max={li.need} h={5} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:pb-12">
          {children}
          <Contact />
        </main>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-[#05100ce8] backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-8">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={"flex flex-col items-center gap-0.5 py-2 text-[8.5px] font-bold tracking-wide uppercase transition-colors " + (view === n.id ? "text-goldhi" : "text-dim")}>
              <Icon name={n.icon} size={16} />
              {SHORT[n.id]}
            </button>
          ))}
        </div>
      </nav>

      {/* toasts */}
      <div className="pointer-events-none fixed top-[70px] right-3 z-[70] flex w-[284px] flex-col gap-2">
        {toasts.map((t) => {
          const k = KIND[t.kind];
          return (
            <button key={t.id} onClick={() => dropToast(t.id)} className="panel slidein pointer-events-auto flex items-start gap-2.5 border-l-4 p-3 text-left" style={{ borderLeftColor: k.border }}>
              <Icon name={k.icon} size={17} className={k.color + " mt-0.5 shrink-0"} />
              <span className="min-w-0">
                <span className={"block text-[12.5px] font-black tracking-wide " + k.color}>{t.title}</span>
                {t.sub && <span className="mt-0.5 block text-[11.5px] leading-snug text-mint">{t.sub}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* welcome back / offline earnings */}
      <Modal open={offline !== null && offline > 0} onClose={collectOffline} w={430}>
        <div className="p-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f6c45355] bg-[#f6c45314]">
            <span className="coinflip text-gold"><Icon name="coin" size={30} /></span>
          </div>
          <h2 className="display text-3xl text-goldhi">Welcome back! 🎉</h2>
          <p className="mt-2 text-[13px] text-mint">Your empire kept the lights on while you were away.</p>
          <div className="num bignum mt-4 text-4xl font-bold text-cash" style={{ textShadow: "0 0 26px #3ee08f55" }}>
            +{fmtMoney(offline ?? 0)}
          </div>
          <p className="mt-1.5 text-[11px] text-dim">offline earnings · 50% rate · capped at 8h</p>
          <button className="btn btn-gold mt-6 h-11 w-full text-[14px]" onClick={collectOffline}>
            Collect & keep building <Icon name="chevron" size={15} />
          </button>
        </div>
      </Modal>
    </div>
  );
}
