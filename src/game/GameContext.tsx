/* ============================================================
   Business Empire — global game state, tick loop, side effects
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AccountUser, ActivityEntry, BusinessInstance, CatId, DistrictId, GameState } from "./data";
import { ACHIEVEMENTS, CATALOG, CUSTOM_FEE_RATIO, CUSTOM_LIMIT, DISTRICTS, MAX_CAT, MISSIONS } from "./data";
import {
  businessIncome, calcOffline, catCost, customIncomeFor, deleteSave, fmtDuration, fmtMoney, fmtShort,
  freshState, levelFromXp, loadSave, netWorth, ownedInDistrict, tierForLevel, totalIncome, uid,
  upgradeCost, writeSave, xpProgress,
} from "./engine";

/* ---------------- toasts & floaters ---------------- */

export type ToastKind = "success" | "gold" | "info" | "error" | "levelup" | "rocket";
export interface Toast { id: string; title: string; sub?: string; kind: ToastKind }
export interface Floater { id: string; text: string; tone: "cash" | "gold" | "ember" }
export interface BuyOpts { defId?: string; district?: DistrictId }
export interface OfflineInfo { amount: number; seconds: number }

/* ---------------- reducer ---------------- */

type Action =
  | { type: "TICK"; dt: number }
  | { type: "HUSTLE"; amount: number; now: number }
  | { type: "BUY"; defId: string; district: DistrictId; now: number }
  | { type: "CREATE_CUSTOM"; name: string; icon: string; color: string; price: number; district: DistrictId; now: number }
  | { type: "UPGRADE"; id: string; now: number }
  | { type: "UPGRADE_CAT"; id: string; cat: CatId; now: number }
  | { type: "RELOCATE"; id: string; district: DistrictId; now: number }
  | { type: "CLAIM_MISSION"; id: string; now: number }
  | { type: "UNLOCK_ACH"; id: string; now: number }
  | { type: "APPLY_OFFLINE"; amount: number; seconds: number }
  | { type: "CLEAR_LEVELUPS" }
  | { type: "RESET"; now: number };

function act(s: GameState, text: string, tone: ActivityEntry["tone"], now: number): ActivityEntry[] {
  return [{ t: now, text, tone }, ...s.activity].slice(0, 8);
}

/* Applies xp and handles level-ups (bonus cash + pending flag). */
function gainXp(s: GameState, amount: number, now: number): GameState {
  const before = levelFromXp(s.xp);
  const xp = s.xp + amount;
  const after = levelFromXp(xp);
  if (after <= before) return { ...s, xp };
  const ips = totalIncome(s);
  const bonus = Math.max(250, 45 * ips) * (after - before);
  return {
    ...s,
    xp,
    money: s.money + bonus,
    totalEarned: s.totalEarned + bonus,
    levelUpsPending: s.levelUpsPending + (after - before),
    activity: act(s, `🎉 Reached level ${after} — bonus ${fmtMoney(bonus)}`, "gold", now),
  };
}

function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "TICK": {
      const gain = totalIncome(s) * a.dt;
      if (gain <= 0) return s;
      return { ...s, money: s.money + gain, totalEarned: s.totalEarned + gain };
    }
    case "HUSTLE":
      return gainXp(
        {
          ...s,
          money: s.money + a.amount,
          totalEarned: s.totalEarned + a.amount,
          totalClicks: s.totalClicks + 1,
        },
        1, a.now,
      );
    case "BUY": {
      const def = CATALOG.find((d) => d.id === a.defId);
      const district = DISTRICTS.find((d) => d.id === a.district);
      if (!def || !district) return s;
      const total = def.price + district.fee;
      if (s.money < total || ownedInDistrict(s, district.id) >= district.capacity) return s;
      const b: BusinessInstance = {
        id: uid("b"), defId: def.id, name: def.name, icon: def.icon, color: def.color,
        level: 1, baseIncome: def.income, basePrice: def.price,
        cats: { building: 0, employees: 0, marketing: 0, equipment: 0, technology: 0 },
        location: district.id, invested: def.price, custom: false, createdAt: a.now,
      };
      const next: GameState = {
        ...s,
        money: s.money - total,
        totalSpent: s.totalSpent + total,
        purchases: s.purchases + 1,
        businesses: [...s.businesses, b],
        activity: act(s, `${def.icon} Opened ${def.name} in ${district.name} for ${fmtMoney(total)}`, "cash", a.now),
      };
      return gainXp(next, 25, a.now);
    }
    case "CREATE_CUSTOM": {
      const district = DISTRICTS.find((d) => d.id === a.district);
      if (!district) return s;
      const fee = a.price * CUSTOM_FEE_RATIO;
      const total = a.price + fee + district.fee;
      if (s.money < total || ownedInDistrict(s, district.id) >= district.capacity) return s;
      if (s.businesses.filter((b) => b.custom).length >= CUSTOM_LIMIT) return s;
      const b: BusinessInstance = {
        id: uid("b"), defId: "custom", name: a.name, icon: a.icon, color: a.color,
        level: 1, baseIncome: customIncomeFor(a.price), basePrice: a.price,
        cats: { building: 0, employees: 0, marketing: 0, equipment: 0, technology: 0 },
        location: district.id, invested: a.price, custom: true, createdAt: a.now,
      };
      const next: GameState = {
        ...s,
        money: s.money - total,
        totalSpent: s.totalSpent + total,
        purchases: s.purchases + 1,
        customsCreated: s.customsCreated + 1,
        businesses: [...s.businesses, b],
        activity: act(s, `🎨 Founded custom brand “${a.name}” for ${fmtMoney(total)}`, "sky", a.now),
      };
      return gainXp(next, 40, a.now);
    }
    case "UPGRADE": {
      const idx = s.businesses.findIndex((b) => b.id === a.id);
      if (idx === -1) return s;
      const b = s.businesses[idx];
      const cost = upgradeCost(b);
      if (s.money < cost) return s;
      const up: BusinessInstance = { ...b, level: b.level + 1, invested: b.invested + cost };
      const next: GameState = {
        ...s,
        money: s.money - cost,
        totalSpent: s.totalSpent + cost,
        upgradesDone: s.upgradesDone + 1,
        businesses: s.businesses.map((x) => (x.id === a.id ? up : x)),
        activity: act(s, `⬆️ ${b.name} upgraded to Lv ${up.level}`, "cash", a.now),
      };
      return gainXp(next, 5, a.now);
    }
    case "UPGRADE_CAT": {
      const idx = s.businesses.findIndex((b) => b.id === a.id);
      if (idx === -1) return s;
      const b = s.businesses[idx];
      if (b.cats[a.cat] >= MAX_CAT) return s;
      const cost = catCost(b, a.cat);
      if (s.money < cost) return s;
      const up: BusinessInstance = { ...b, cats: { ...b.cats, [a.cat]: b.cats[a.cat] + 1 }, invested: b.invested + cost };
      const next: GameState = {
        ...s,
        money: s.money - cost,
        totalSpent: s.totalSpent + cost,
        upgradesDone: s.upgradesDone + 1,
        businesses: s.businesses.map((x) => (x.id === a.id ? up : x)),
      };
      return gainXp(next, 5, a.now);
    }
    case "RELOCATE": {
      const idx = s.businesses.findIndex((b) => b.id === a.id);
      const district = DISTRICTS.find((d) => d.id === a.district);
      if (idx === -1 || !district) return s;
      const b = s.businesses[idx];
      if (b.location === district.id || s.money < district.fee) return s;
      const others = s.businesses.filter((x) => x.id !== a.id && x.location === district.id).length;
      if (others >= district.capacity) return s;
      const next: GameState = {
        ...s,
        money: s.money - district.fee,
        totalSpent: s.totalSpent + district.fee,
        relocations: s.relocations + 1,
        businesses: s.businesses.map((x) => (x.id === a.id ? { ...x, location: district.id } : x)),
        activity: act(s, `🚚 Moved ${b.name} to ${district.name} (${district.mult}× income)`, "sky", a.now),
      };
      return gainXp(next, 5, a.now);
    }
    case "CLAIM_MISSION": {
      if (s.missionsClaimed.includes(a.id)) return s;
      const m = MISSIONS.find((x) => x.id === a.id);
      if (!m || m.metric(s, totalIncome(s)) < m.target) return s;
      const next: GameState = {
        ...s,
        money: s.money + m.reward,
        totalEarned: s.totalEarned + m.reward,
        missionsClaimed: [...s.missionsClaimed, a.id],
        activity: act(s, `🏁 Mission “${m.title}” complete — +${fmtMoney(m.reward)}`, "gold", a.now),
      };
      return gainXp(next, m.xp, a.now);
    }
    case "UNLOCK_ACH": {
      if (s.achievementsUnlocked.includes(a.id)) return s;
      const ach = ACHIEVEMENTS.find((x) => x.id === a.id);
      if (!ach) return s;
      const next: GameState = {
        ...s,
        money: s.money + ach.reward,
        totalEarned: s.totalEarned + ach.reward,
        achievementsUnlocked: [...s.achievementsUnlocked, a.id],
        activity: act(s, `${ach.icon} Achievement “${ach.name}” — +${fmtMoney(ach.reward)}`, "gold", a.now),
      };
      return gainXp(next, 40, a.now);
    }
    case "APPLY_OFFLINE":
      return {
        ...s,
        money: s.money + a.amount,
        totalEarned: s.totalEarned + a.amount,
        offlineCollected: s.offlineCollected + a.amount,
      };
    case "CLEAR_LEVELUPS":
      return s.levelUpsPending === 0 ? s : { ...s, levelUpsPending: 0 };
    case "RESET":
      return freshState();
    default:
      return s;
  }
}

/* ---------------- context ---------------- */

interface GameCtx {
  user: AccountUser;
  state: GameState;
  ips: number;
  nw: number;
  lv: { level: number; into: number; need: number };
  toasts: Toast[];
  floaters: Floater[];
  toast: (title: string, sub?: string, kind?: ToastKind) => void;
  floater: (text: string, tone?: Floater["tone"]) => void;
  buy: BuyOpts | null;
  openBuy: (opts?: BuyOpts) => void;
  closeBuy: () => void;
  offline: OfflineInfo | null;
  collectOffline: () => void;
  dismissOffline: () => void;
  hustle: () => void;
  buyBusiness: (defId: string, district: DistrictId) => void;
  createCustom: (name: string, icon: string, color: string, price: number, district: DistrictId) => void;
  upgrade: (id: string) => void;
  upgradeCat: (id: string, cat: CatId) => void;
  relocate: (id: string, district: DistrictId) => void;
  claimMission: (id: string) => void;
  resetProgress: () => void;
  saveNow: () => void;
  lastSavedAt: number;
}

const Ctx = createContext<GameCtx | null>(null);

export function useGame(): GameCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame outside provider");
  return v;
}

export function GameProvider({ user, children }: { user: AccountUser; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, user.uid, (u) => loadSave(u) ?? freshState());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [buy, setBuy] = useState<BuyOpts | null>(null);
  const [offline, setOffline] = useState<OfflineInfo | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState(Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;
  const offlineChecked = useRef(false);

  const toast = useCallback((title: string, sub?: string, kind: ToastKind = "success") => {
    const id = uid("t");
    setToasts((t) => [...t.slice(-3), { id, title, sub, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const floater = useCallback((text: string, tone: Floater["tone"] = "cash") => {
    const id = uid("f");
    setFloaters((f) => [...f.slice(-14), { id, text, tone }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1400);
  }, []);

  /* ---- tick loop ---- */
  useEffect(() => {
    let last = Date.now();
    let passive = 0;
    const iv = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 10);
      last = now;
      dispatch({ type: "TICK", dt });
      passive += dt;
      if (passive >= 2) {
        passive = 0;
        const ipsNow = totalIncome(stateRef.current);
        if (ipsNow > 0) floater(`+$${fmtShort(ipsNow * 2)}`, "cash");
      }
    }, 100);
    return () => clearInterval(iv);
  }, [floater]);

  /* ---- offline earnings check on mount ---- */
  useEffect(() => {
    if (offlineChecked.current) return;
    offlineChecked.current = true;
    const { amount, seconds } = calcOffline(stateRef.current, Date.now());
    if (amount >= 1) setOffline({ amount, seconds });
  }, []);

  /* ---- autosave ---- */
  useEffect(() => {
    const iv = setInterval(() => {
      writeSave(user.uid, stateRef.current);
      setLastSavedAt(Date.now());
    }, 3000);
    const onHide = () => writeSave(user.uid, stateRef.current);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, [user.uid]);

  /* ---- level-up toasts ---- */
  useEffect(() => {
    if (state.levelUpsPending > 0) {
      const lv = levelFromXp(state.xp);
      toast("LEVEL UP!", `You reached level ${lv} — bonus cash deposited 💸`, "levelup");
      dispatch({ type: "CLEAR_LEVELUPS" });
    }
  }, [state.levelUpsPending, state.xp, toast]);

  /* ---- achievement watcher ---- */
  const ips = useMemo(() => totalIncome(state), [state]);
  const nw = useMemo(() => netWorth(state), [state]);
  useEffect(() => {
    for (const ach of ACHIEVEMENTS) {
      if (!state.achievementsUnlocked.includes(ach.id) && ach.check(state, ips, nw)) {
        dispatch({ type: "UNLOCK_ACH", id: ach.id, now: Date.now() });
        toast(`${ach.icon} ACHIEVEMENT UNLOCKED!`, `${ach.name} — +${fmtMoney(ach.reward)}`, "gold");
      }
    }
  }, [state, ips, nw, toast]);

  /* ---- actions ---- */
  const hustle = useCallback(() => {
    const s = stateRef.current;
    const amount = Math.max(1, Math.round(totalIncome(s) * 1.5 + levelFromXp(s.xp) * 3));
    dispatch({ type: "HUSTLE", amount, now: Date.now() });
    floater(`+$${fmtShort(amount)}`, "gold");
  }, [floater]);

  const buyBusiness = useCallback((defId: string, district: DistrictId) => {
    const s = stateRef.current;
    const def = CATALOG.find((d) => d.id === defId);
    const dis = DISTRICTS.find((d) => d.id === district);
    if (!def || !dis) return;
    const total = def.price + dis.fee;
    if (ownedInDistrict(s, district) >= dis.capacity) {
      toast("District full", `${dis.name} has no empty plots left.`, "error");
      return;
    }
    if (s.money < total) {
      toast("Not enough money", `You need ${fmtMoney(total - s.money)} more.`, "error");
      return;
    }
    dispatch({ type: "BUY", defId, district, now: Date.now() });
    toast(`${def.icon} BUSINESS ACQUIRED!`, `${def.name} is now generating income.`, "success");
    setBuy(null);
  }, [toast]);

  const createCustom = useCallback((name: string, icon: string, color: string, price: number, district: DistrictId) => {
    const s = stateRef.current;
    const dis = DISTRICTS.find((d) => d.id === district);
    if (!dis) return;
    const total = price + price * CUSTOM_FEE_RATIO + dis.fee;
    if (s.businesses.filter((b) => b.custom).length >= CUSTOM_LIMIT) {
      toast("Brand Lab at capacity", `You can run up to ${CUSTOM_LIMIT} custom brands.`, "error");
      return;
    }
    if (ownedInDistrict(s, district) >= dis.capacity) {
      toast("District full", `${dis.name} has no empty plots left.`, "error");
      return;
    }
    if (s.money < total) {
      toast("Not enough money", `You need ${fmtMoney(total)} in total.`, "error");
      return;
    }
    dispatch({ type: "CREATE_CUSTOM", name, icon, color, price, district, now: Date.now() });
    toast("🎨 BRAND FOUNDED!", `“${name}” is open for business.`, "success");
    setBuy(null);
  }, [toast]);

  const upgrade = useCallback((id: string) => {
    const s = stateRef.current;
    const b = s.businesses.find((x) => x.id === id);
    if (!b) return;
    const cost = upgradeCost(b);
    if (s.money < cost) {
      toast("Not enough money", `Upgrade costs ${fmtMoney(cost)}.`, "error");
      return;
    }
    dispatch({ type: "UPGRADE", id, now: Date.now() });
    const newIncome = businessIncome({ ...b, level: b.level + 1 });
    toast("UPGRADE COMPLETE! 🚀", `${b.name} → Lv ${b.level + 1} · now $${fmtShort(newIncome)}/sec`, "rocket");
    floater(`+$${fmtShort(newIncome)}/s`, "cash");
  }, [toast, floater]);

  const upgradeCat = useCallback((id: string, cat: CatId) => {
    const s = stateRef.current;
    const b = s.businesses.find((x) => x.id === id);
    if (!b) return;
    if (b.cats[cat] >= MAX_CAT) return;
    const cost = catCost(b, cat);
    if (s.money < cost) {
      toast("Not enough money", `This upgrade costs ${fmtMoney(cost)}.`, "error");
      return;
    }
    dispatch({ type: "UPGRADE_CAT", id, cat, now: Date.now() });
    toast("UPGRADE COMPLETE! 🚀", `${b.name} improved — profits climbing.`, "rocket");
  }, [toast]);

  const relocate = useCallback((id: string, district: DistrictId) => {
    const s = stateRef.current;
    const dis = DISTRICTS.find((d) => d.id === district);
    const b = s.businesses.find((x) => x.id === id);
    if (!dis || !b) return;
    if (s.money < dis.fee) {
      toast("Not enough money", `A plot in ${dis.name} costs ${fmtMoney(dis.fee)}.`, "error");
      return;
    }
    dispatch({ type: "RELOCATE", id, district, now: Date.now() });
    toast("🚚 RELOCATED!", `${b.name} moved to ${dis.name} — ${dis.mult}× income.`, "info");
  }, [toast]);

  const claimMission = useCallback((id: string) => {
    const m = MISSIONS.find((x) => x.id === id);
    if (!m) return;
    dispatch({ type: "CLAIM_MISSION", id, now: Date.now() });
    toast("MISSION COMPLETE! 🏁", `${m.title} — collected ${fmtMoney(m.reward)}`, "gold");
    floater(`+$${fmtShort(m.reward)}`, "gold");
  }, [toast, floater]);

  const collectOffline = useCallback(() => {
    if (offline) {
      dispatch({ type: "APPLY_OFFLINE", amount: offline.amount, seconds: offline.seconds });
      floater(`+$${fmtShort(offline.amount)}`, "gold");
      toast("💰 COLLECTED!", `${fmtMoney(offline.amount)} added to your balance.`, "gold");
      setOffline(null);
    }
  }, [offline, toast, floater]);

  const resetProgress = useCallback(() => {
    deleteSave(user.uid);
    dispatch({ type: "RESET", now: Date.now() });
    toast("Fresh start", "Your empire has been reset. Back to the Corner Shop!", "info");
  }, [user.uid, toast]);

  const saveNow = useCallback(() => {
    writeSave(user.uid, stateRef.current);
    setLastSavedAt(Date.now());
    toast("💾 Progress saved", "Your empire is safe.", "info");
  }, [user.uid, toast]);

  const lv = xpProgress(state.xp);
  const tier = tierForLevel(lv.level);

  const value: GameCtx = {
    user, state, ips, nw, lv, toasts, floaters, toast, floater,
    buy, openBuy: (opts) => setBuy(opts ?? {}), closeBuy: () => setBuy(null),
    offline, collectOffline, dismissOffline: () => setOffline(null),
    hustle, buyBusiness, createCustom, upgrade, upgradeCat, relocate, claimMission,
    resetProgress, saveNow, lastSavedAt,
  };
  void tier;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
