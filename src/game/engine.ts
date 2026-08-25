/* ============================================================
   Business Empire — math engine, formatting, persistence
   ============================================================ */

import type { BusinessInstance, CatId, DistrictId, GameState } from "./data";
import { CATALOG, DISTRICTS, STARTER_BUSINESS } from "./data";

/* ---------------- number formatting ---------------- */

const UNITS = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"];

export function fmtShort(n: number): string {
  if (!isFinite(n)) return "∞";
  const neg = n < 0;
  let v = Math.abs(n);
  if (v < 1000) {
    const s = v < 10 && v % 1 !== 0 ? v.toFixed(1) : Math.floor(v).toString();
    return (neg ? "-" : "") + s;
  }
  let u = -1;
  while (v >= 1000 && u < UNITS.length - 1) {
    v /= 1000;
    u++;
  }
  const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return (neg ? "-" : "") + v.toFixed(digits) + UNITS[u];
}

export function fmtMoney(n: number): string {
  if (!isFinite(n)) return "$∞";
  const neg = n < 0;
  const v = Math.abs(n);
  if (v < 1_000_000) return (neg ? "-$" : "$") + Math.floor(v).toLocaleString("en-US");
  return (neg ? "-$" : "$") + fmtShort(v);
}

export function niceRound(n: number): number {
  if (n < 1000) return Math.ceil(n);
  const pow = Math.pow(10, Math.floor(Math.log10(n)) - 2);
  return Math.ceil(n / pow) * pow;
}

/* ---------------- income & costs ---------------- */

export function levelMult(level: number): number {
  return level * (1 + 0.12 * (level - 1));
}

export function catMult(level: number): number {
  return 1 + 0.22 * level;
}

export function districtMult(loc: DistrictId): number {
  return DISTRICTS.find((d) => d.id === loc)?.mult ?? 1;
}

export function businessIncome(b: BusinessInstance): number {
  let m = levelMult(b.level);
  (Object.keys(b.cats) as CatId[]).forEach((c) => {
    m *= catMult(b.cats[c]);
  });
  m *= districtMult(b.location);
  return b.baseIncome * m;
}

export function totalIncome(s: GameState): number {
  return s.businesses.reduce((sum, b) => sum + businessIncome(b), 0);
}

export function upgradeCost(b: BusinessInstance): number {
  return niceRound(b.basePrice * 0.6 * Math.pow(b.level, 1.5));
}

export function catCost(b: BusinessInstance, cat: CatId): number {
  return niceRound(Math.max(150, b.basePrice * 0.5 * Math.pow(2.3, b.cats[cat])));
}

export function businessValue(b: BusinessInstance): number {
  return b.invested * 0.65 + b.basePrice * 0.5;
}

export function netWorth(s: GameState): number {
  return s.money + s.businesses.reduce((sum, b) => sum + businessValue(b), 0);
}

export function customIncomeFor(price: number): number {
  return (price / 900) * 0.85;
}

/* ---------------- player levels & xp ---------------- */

export function xpToNext(level: number): number {
  return Math.floor(350 * Math.pow(level, 1.85));
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let rest = xp;
  while (rest >= xpToNext(level) && level < 500) {
    rest -= xpToNext(level);
    level++;
  }
  return level;
}

export function xpProgress(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let rest = xp;
  while (rest >= xpToNext(level) && level < 500) {
    rest -= xpToNext(level);
    level++;
  }
  return { level, into: rest, need: xpToNext(level) };
}

export function titleForLevel(level: number): string {
  if (level >= 60) return "Market Titan";
  if (level >= 45) return "Industry Baron";
  if (level >= 32) return "Conglomerate Chief";
  if (level >= 22) return "Corporation Boss";
  if (level >= 14) return "Chain Operator";
  if (level >= 8) return "Entrepreneur";
  if (level >= 4) return "Shopkeeper";
  return "Rookie Founder";
}

export function tierForLevel(level: number): { name: string; cls: string } {
  if (level >= 100) return { name: "Empire", cls: "text-[#ffe08a] border-[#ffe08a]/50" };
  if (level >= 50) return { name: "Conglomerate", cls: "text-[#f09ad1] border-[#f09ad1]/50" };
  if (level >= 25) return { name: "Corporation", cls: "text-[#b8a7ff] border-[#b8a7ff]/50" };
  if (level >= 10) return { name: "Chain", cls: "text-[#56c8ff] border-[#56c8ff]/50" };
  if (level >= 5) return { name: "Established", cls: "text-[#3ee08f] border-[#3ee08f]/50" };
  return { name: "Startup", cls: "text-[#9fd8bd] border-[#9fd8bd]/40" };
}

/* ---------------- saves ---------------- */

const SAVE_PREFIX = "be_save_";

export function freshState(): GameState {
  const now = Date.now();
  return {
    money: 1000,
    totalEarned: 0,
    totalSpent: 0,
    totalClicks: 0,
    purchases: 0,
    upgradesDone: 0,
    relocations: 0,
    customsCreated: 0,
    offlineCollected: 0,
    missionsClaimed: [],
    achievementsUnlocked: [],
    businesses: [
      { ...STARTER_BUSINESS, cats: { ...STARTER_BUSINESS.cats }, id: "b_starter", createdAt: now },
    ],
    xp: 0,
    levelUpsPending: 0,
    activity: [{ t: now, text: "Founded your company with a small Corner Shop", tone: "gold" }],
    createdAt: now,
    lastSeen: now,
  };
}

export function loadSave(uid: string): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + uid);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (typeof parsed.money !== "number" || !Array.isArray(parsed.businesses)) return null;
    // migrate/normalize
    const base = freshState();
    return {
      ...base,
      ...parsed,
      businesses: parsed.businesses.map((b) => {
        const defaults: Record<CatId, number> = { building: 0, employees: 0, marketing: 0, equipment: 0, technology: 0 };
        return { ...b, cats: { ...defaults, ...b.cats } };
      }),
      levelUpsPending: 0,
    };
  } catch {
    return null;
  }
}

export function writeSave(uid: string, state: GameState): void {
  try {
    localStorage.setItem(SAVE_PREFIX + uid, JSON.stringify({ ...state, lastSeen: Date.now() }));
  } catch {
    /* storage full or unavailable — game keeps running in memory */
  }
}

export function deleteSave(uid: string): void {
  try {
    localStorage.removeItem(SAVE_PREFIX + uid);
  } catch {
    /* noop */
  }
}

/* ---------------- offline earnings ---------------- */

export const OFFLINE_RATE = 0.5; // 50% efficiency while away
export const OFFLINE_CAP_HOURS = 8;

export function calcOffline(state: GameState, now: number): { amount: number; seconds: number } {
  const elapsed = Math.max(0, (now - state.lastSeen) / 1000);
  if (elapsed < 45) return { amount: 0, seconds: 0 };
  const capped = Math.min(elapsed, OFFLINE_CAP_HOURS * 3600);
  const ips = totalIncome(state);
  return { amount: ips * capped * OFFLINE_RATE, seconds: capped };
}

export function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/* ---------------- catalog lookup ---------------- */

export function defById(id: string) {
  return CATALOG.find((d) => d.id === id);
}

export function districtById(id: DistrictId) {
  return DISTRICTS.find((d) => d.id === id) ?? DISTRICTS[0];
}

export function ownedInDistrict(s: GameState, d: DistrictId): number {
  return s.businesses.filter((b) => b.location === d).length;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
