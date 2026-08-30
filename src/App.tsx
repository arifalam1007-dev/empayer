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

export default function App() {
  const user = useAuth((a) => a.user);
  const view = useGame((st) => st.view);

  // restore session once
  useEffect(() => {
    useAuth.getState().boot();
  }, []);

  // boot the empire + run the money engine
  useEffect(() => {
    if (!user) return;
    useGame.getState().boot(user.uid, user.name);
    let last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 120);
      last = now;
      useGame.getState().tick(dt);
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
