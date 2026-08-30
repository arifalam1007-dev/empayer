import { useEffect } from "react";
import { useAuth } from "./store/auth";
import { useGame } from "./store/game";
import Login from "./components/Login";
import Shell from "./components/Shell";
import Dashboard from "./components/Dashboard";
import Businesses from "./components/Businesses";
import Map from "./components/Map";
import Upgrades from "./components/Upgrades";
import { Achievements, Leaderboard, Missions } from "./components/Progress";
import Profile from "./components/Profile";
import { Icon } from "./components/ui";

function BootScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-ink">
      <div className="relative">
        <span className="coinflip inline-block text-gold" style={{ filter: "drop-shadow(0 0 22px #f6c45366)" }}>
          <Icon name="coin" size={64} />
        </span>
        <span className="absolute inset-0 -z-10 rounded-full" style={{ background: "radial-gradient(circle, #f6c45322, transparent 70%)" }} />
      </div>
      <div className="display text-2xl tracking-wide text-fog">
        Business <span className="text-gold">Empire</span>
      </div>
      <div className="pulsesoft num text-[12px] font-bold tracking-[0.22em] text-dim uppercase">opening the vault…</div>
    </div>
  );
}

export default function App() {
  const user = useAuth((a) => a.user);
  const view = useGame((st) => st.view);
  const ready = useGame((st) => st.s !== null);

  // restore session once
  useEffect(() => {
    try {
      useAuth.getState().boot();
    } catch {
      /* storage unavailable — stay logged out */
    }
  }, []);

  // boot the empire + run the money engine
  useEffect(() => {
    if (!user) return;
    try {
      useGame.getState().boot(user.uid, user.name);
    } catch {
      /* never crash on load */
    }
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 300);
      last = now;
      if (document.visibilityState === "visible") useGame.getState().tick(dt);
    }, 250);
    const onHide = () => useGame.getState().save();
    window.addEventListener("beforeunload", onHide);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(iv);
      window.removeEventListener("beforeunload", onHide);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [user]);

  if (!user) return <Login />;
  if (!ready) return <BootScreen />;

  return (
    <Shell>
      {view === "dashboard" && <Dashboard />}
      {view === "businesses" && <Businesses />}
      {view === "map" && <Map />}
      {view === "upgrades" && <Upgrades />}
      {view === "missions" && <Missions />}
      {view === "achievements" && <Achievements />}
      {view === "leaderboard" && <Leaderboard />}
      {view === "profile" && <Profile />}
    </Shell>
  );
}
