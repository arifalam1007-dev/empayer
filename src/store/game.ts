/* ============================================================
   Game engine store — tick loop actions, purchases, upgrades,
   districts, missions, achievements, offline earnings, saving.
   All money is virtual in-game currency.
   ============================================================ */
import { create } from "zustand";
import {
  ACHS,
  CATALOG,
  CATEGORIES,
  CUSTOM_MIN_LEVEL,
  DISTRICTS,
  MAX_CUSTOM,
  MISSIONS,
  bizIncome,
  bizValue,
  catCost,
  customIncome,
  customPrice,
  fmtMoney,
  fmtRate,
  levelInfo,
  netWorth,
  nice,
  relocFee,
  titleFor,
  totalIncome,
  uid,
  upCost,
} from "../game/data";
import type { Biz, CatId, GameState } from "../game/data";

export type View =
  | "dashboard"
  | "businesses"
  | "map"
  | "upgrades"
  | "missions"
  | "achievements"
  | "leaderboard"
  | "profile";

export interface Toast {
  id: number;
  kind: "gold" | "good" | "level" | "info";
  title: string;
  sub?: string;
}

let tid = 1;
const saveKey = (u: string) => `be_save_v1_${u}`;

const zeroCats = (): Record<CatId, number> => ({ building: 0, staff: 0, marketing: 0, equipment: 0, tech: 0 });

function freshState(name: string): GameState {
  const shop = CATALOG[0];
  return {
    money: 1000,
    lifetime: 1000,
    xp: 0,
    businesses: [
      { uid: "starter", type: shop.type, name: "Small Shop", icon: shop.icon, color: shop.color, level: 1, loc: "suburbs", cats: zeroCats(), custom: false, basePrice: shop.price, baseIncome: shop.income },
    ],
    districts: ["suburbs"],
    claimed: [],
    ach: [],
    activity: [{ id: tid++, t: Date.now(), text: `${name} founded the empire with a Small Shop and $1,000`, kind: "info" }],
    hist: [],
    stats: { bought: 0, upgrades: 0, catUpgrades: 0, moves: 0, customs: 0, startedAt: Date.now(), playedMs: 0 },
    lastSaved: Date.now(),
  };
}

function loadState(userUid: string, name: string): { s: GameState; offline: number | null } {
  let s: GameState | null = null;
  try {
    const raw = localStorage.getItem(saveKey(userUid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1 && parsed.s) s = parsed.s as GameState;
    }
  } catch {
    s = null;
  }
  if (!s) return { s: freshState(name), offline: null };

  // offline earnings: 50% efficiency, capped at 8 hours
  let offline: number | null = null;
  const elapsed = (Date.now() - s.lastSaved) / 1000;
  const inc = totalIncome(s);
  if (elapsed >= 60 && inc > 0) {
    offline = Math.floor(inc * Math.min(elapsed, 8 * 3600) * 0.5);
    if (offline > 0) {
      s.money += offline;
      s.lifetime += offline;
    } else offline = null;
  }
  return { s, offline };
}

interface GameStore {
  s: GameState | null;
  userName: string;
  userUid: string;
  view: View;
  sel: string | null;
  offline: number | null;
  toasts: Toast[];
  pulse: number;

  setView: (v: View, sel?: string | null) => void;
  boot: (userUid: string, name: string) => void;
  tick: (dt: number) => void;
  save: () => void;
  buy: (type: string) => void;
  buyCustom: (input: { name: string; arch: string; color: string; icon: string }) => string | null;
  upgrade: (bizUid: string) => void;
  buyCat: (bizUid: string, cat: CatId) => void;
  unlockDistrict: (id: string) => void;
  relocate: (bizUid: string, loc: string) => void;
  claim: (mid: string) => void;
  toast: (kind: Toast["kind"], title: string, sub?: string) => void;
  dropToast: (id: number) => void;
  collectOffline: () => void;
  resetEmpire: () => void;
}

let bootedUid: string | null = null;
let saveAcc = 0;
let achAcc = 0;
let histAcc = 0;

const mutate = (fn: (s: GameState) => void) => (st: GameStore) => {
  if (!st.s) return {};
  const s: GameState = { ...st.s, stats: { ...st.s.stats }, businesses: st.s.businesses.map((b) => ({ ...b, cats: { ...b.cats } })) };
  fn(s);
  s.lastSaved = Date.now();
  return { s };
};

const log = (s: GameState, text: string, kind: "buy" | "up" | "gold" | "info" | "trophy") => {
  s.activity = [{ id: tid++, t: Date.now(), text, kind }, ...s.activity].slice(0, 30);
};

function grantXp(s: GameState, amount: number, pushToast: (k: Toast["kind"], t: string, sub?: string) => void) {
  const before = levelInfo(s.xp).level;
  s.xp += Math.floor(amount);
  const after = levelInfo(s.xp);
  if (after.level > before) {
    const reward = 250 * after.level * after.level;
    s.money += reward;
    s.lifetime += reward;
    pushToast("level", `LEVEL UP — LV ${after.level}`, `${titleFor(after.level)} · Bonus ${fmtMoney(reward)}`);
    log(s, `Reached player level ${after.level} — ${titleFor(after.level)}`, "trophy");
  }
}

export const useGame = create<GameStore>((set, get) => ({
  s: null,
  userName: "",
  userUid: "",
  view: "dashboard",
  sel: null,
  offline: null,
  toasts: [],
  pulse: 0,

  setView: (v, sel = null) => set({ view: v, sel }),

  boot: (userUid, name) => {
    if (bootedUid === userUid && get().s) return;
    bootedUid = userUid;
    const { s, offline } = loadState(userUid, name);
    set({ s, offline, userName: name, userUid, view: "dashboard", sel: null, toasts: [], pulse: 0 });
    try {
      localStorage.setItem(saveKey(userUid), JSON.stringify({ v: 1, s }));
    } catch {
      /* storage full — ignore */
    }
  },

  tick: (dt) => {
    const st = get();
    if (!st.s) return;
    const inc = totalIncome(st.s);
    const gain = inc * dt;

    saveAcc += dt;
    achAcc += dt;
    histAcc += dt;

    set(mutate((s) => {
      s.money += gain;
      s.lifetime += gain;
      s.stats.playedMs += dt * 1000;
      if (histAcc >= 1) {
        histAcc = 0;
        s.hist = [...s.hist, s.money].slice(-90);
      }
    }));

    if (achAcc >= 1) {
      achAcc = 0;
      const s = get().s!;
      const newly = ACHS.filter((a) => !s.ach.includes(a.id) && a.test(s));
      if (newly.length) {
        set(mutate((ns) => {
          ns.ach = [...ns.ach, ...newly.map((a) => a.id)];
          grantXp(ns, newly.length * 250, (k, t, sub) => get().toast(k, t, sub));
          for (const a of newly) {
            get().toast("good", "ACHIEVEMENT UNLOCKED", a.title);
            log(ns, `Achievement unlocked — ${a.title}`, "trophy");
          }
        }));
        get().save();
      }
    }

    if (saveAcc >= 3) {
      saveAcc = 0;
      get().save();
    }
  },

  save: () => {
    const { s, userUid } = get();
    if (!s || !userUid) return;
    try {
      localStorage.setItem(saveKey(userUid), JSON.stringify({ v: 1, s }));
    } catch {
      /* ignore */
    }
  },

  buy: (type) => {
    const st = get();
    const def = CATALOG.find((c) => c.type === type);
    if (!st.s || !def) return;
    if (st.s.businesses.some((b) => b.type === type && !b.custom)) {
      st.toast("info", "ALREADY OWNED", `${def.name} is in your portfolio.`);
      return;
    }
    if (st.s.money < def.price) {
      st.toast("info", "NOT ENOUGH CASH", `You need ${fmtMoney(def.price - st.s.money)} more.`);
      return;
    }
    set(mutate((s) => {
      s.money -= def.price;
      s.businesses = [...s.businesses, { uid: uid(), type: def.type, name: def.name, icon: def.icon, color: def.color, level: 1, loc: "suburbs", cats: zeroCats(), custom: false, basePrice: def.price, baseIncome: def.income }];
      s.stats.bought++;
      grantXp(s, def.price / 25, (k, t, sub) => get().toast(k, t, sub));
      log(s, `Acquired ${def.name} for ${fmtMoney(def.price)}`, "buy");
    }));
    get().toast("gold", "BUSINESS ACQUIRED!", `${def.name} joins the empire`);
    get().save();
  },

  buyCustom: (input) => {
    const st = get();
    if (!st.s) return "Not ready.";
    const arch = CATALOG.find((c) => c.type === input.arch);
    if (!arch) return "Pick a business model.";
    const name = input.name.trim();
    if (name.length < 2 || name.length > 24) return "Name must be 2–24 characters.";
    const count = st.s.stats.customs;
    if (count >= MAX_CUSTOM) return `Limit of ${MAX_CUSTOM} custom brands reached.`;
    if (levelInfo(st.s.xp).level < CUSTOM_MIN_LEVEL) return `Reach player level ${CUSTOM_MIN_LEVEL} first.`;
    const price = customPrice(arch, count);
    if (st.s.money < price) return `You need ${fmtMoney(price - st.s.money)} more.`;
    set(mutate((s) => {
      s.money -= price;
      s.businesses = [...s.businesses, { uid: uid(), type: arch.type + "_custom", name, icon: input.icon, color: input.color, level: 1, loc: "suburbs", cats: zeroCats(), custom: true, basePrice: price, baseIncome: customIncome(arch) }];
      s.stats.customs++;
      s.stats.bought++;
      grantXp(s, price / 25, (k, t, sub) => get().toast(k, t, sub));
      log(s, `Founded custom brand “${name}” for ${fmtMoney(price)}`, "buy");
    }));
    get().toast("gold", "BUSINESS FOUNDED!", `${name} is open for business`);
    get().save();
    return null;
  },

  upgrade: (bizUid) => {
    const st = get();
    const b = st.s?.businesses.find((x) => x.uid === bizUid);
    if (!st.s || !b) return;
    const cost = upCost(b);
    if (st.s.money < cost) {
      st.toast("info", "NOT ENOUGH CASH", `Upgrade needs ${fmtMoney(cost - st.s.money)} more.`);
      return;
    }
    let newRate = 0;
    let lvl = 0;
    set(mutate((s) => {
      const nb = s.businesses.find((x) => x.uid === bizUid)!;
      s.money -= cost;
      nb.level++;
      lvl = nb.level;
      s.stats.upgrades++;
      newRate = bizIncome(nb);
      grantXp(s, cost / 25, (k, t, sub) => get().toast(k, t, sub));
      log(s, `${nb.name} upgraded to level ${nb.level}`, "up");
    }));
    set((p) => ({ pulse: p.pulse + 1 }));
    get().toast("gold", "UPGRADE COMPLETE! 🚀", `${b.name} → Level ${lvl} · now ${fmtRate(newRate)}`);
    get().save();
  },

  buyCat: (bizUid, cat) => {
    const st = get();
    const b = st.s?.businesses.find((x) => x.uid === bizUid);
    if (!st.s || !b) return;
    const cost = catCost(b, cat);
    const catDef = CATEGORIES.find((c) => c.id === cat)!;
    if (b.cats[cat] >= 25) {
      st.toast("info", "MAXED OUT", `${catDef.name} is fully upgraded.`);
      return;
    }
    if (st.s.money < cost) {
      st.toast("info", "NOT ENOUGH CASH", `You need ${fmtMoney(cost - st.s.money)} more.`);
      return;
    }
    set(mutate((s) => {
      const nb = s.businesses.find((x) => x.uid === bizUid)!;
      s.money -= cost;
      nb.cats[cat]++;
      s.stats.catUpgrades++;
      grantXp(s, cost / 25, (k, t, sub) => get().toast(k, t, sub));
      log(s, `${nb.name}: ${catDef.name} upgraded to Lv ${nb.cats[cat]}`, "up");
    }));
    set((p) => ({ pulse: p.pulse + 1 }));
    get().toast("good", "UPGRADE COMPLETE! 🚀", `${b.name} · ${catDef.name} Lv ${b.cats[cat] + 1} → +12% income`);
    get().save();
  },

  unlockDistrict: (id) => {
    const st = get();
    const d = DISTRICTS.find((x) => x.id === id);
    if (!st.s || !d || st.s.districts.includes(id)) return;
    if (st.s.money < d.cost) {
      st.toast("info", "NOT ENOUGH CASH", `Unlocking ${d.name} needs ${fmtMoney(d.cost - st.s.money)} more.`);
      return;
    }
    set(mutate((s) => {
      s.money -= d.cost;
      s.districts = [...s.districts, id];
      grantXp(s, d.cost / 50, (k, t, sub) => get().toast(k, t, sub));
      log(s, `Unlocked ${d.name} — all income ×${d.mult}`, "gold");
    }));
    get().toast("gold", "DISTRICT UNLOCKED!", `${d.name} — income ×${d.mult} for businesses located there`);
    get().save();
  },

  relocate: (bizUid, loc) => {
    const st = get();
    const b = st.s?.businesses.find((x) => x.uid === bizUid);
    const d = DISTRICTS.find((x) => x.id === loc);
    if (!st.s || !b || !d || b.loc === loc) return;
    if (!st.s.districts.includes(loc)) return;
    const fee = relocFee(b);
    if (st.s.money < fee) {
      st.toast("info", "NOT ENOUGH CASH", `Moving costs ${fmtMoney(fee - st.s.money)} more.`);
      return;
    }
    set(mutate((s) => {
      const nb = s.businesses.find((x) => x.uid === bizUid)!;
      s.money -= fee;
      nb.loc = loc;
      s.stats.moves++;
      grantXp(s, fee / 50, (k, t, sub) => get().toast(k, t, sub));
      log(s, `${nb.name} relocated to ${d.name} (×${d.mult})`, "info");
    }));
    get().toast("good", "RELOCATED", `${b.name} → ${d.name} · income ×${d.mult}`);
    get().save();
  },

  claim: (mid) => {
    const st = get();
    const m = MISSIONS.find((x) => x.id === mid);
    if (!st.s || !m || st.s.claimed.includes(mid)) return;
    if (m.metric(st.s) < m.target) return;
    set(mutate((s) => {
      s.claimed = [...s.claimed, mid];
      s.money += m.reward;
      s.lifetime += m.reward;
      grantXp(s, m.reward / 100, (k, t, sub) => get().toast(k, t, sub));
      log(s, `Mission complete — ${m.title} (+${fmtMoney(m.reward)})`, "gold");
    }));
    get().toast("gold", "MISSION COMPLETE!", `${m.title} · +${fmtMoney(m.reward)}`);
    get().save();
  },

  toast: (kind, title, sub) => {
    const id = tid++;
    set((p) => ({ toasts: [...p.toasts.slice(-3), { id, kind, title, sub }] }));
    setTimeout(() => get().dropToast(id), 3800);
  },

  dropToast: (id) => set((p) => ({ toasts: p.toasts.filter((t) => t.id !== id) })),

  collectOffline: () => set({ offline: null }),

  resetEmpire: () => {
    const { userUid, userName } = get();
    try {
      localStorage.removeItem(saveKey(userUid));
    } catch {
      /* ignore */
    }
    bootedUid = null;
    const s = freshState(userName);
    set({ s, offline: null, view: "dashboard", sel: null });
    try {
      localStorage.setItem(saveKey(userUid), JSON.stringify({ v: 1, s }));
    } catch {
      /* ignore */
    }
    get().toast("info", "EMPIRE RESET", "Back to a small shop and a dream.");
  },
}));

/* convenience selector */
export const useNetWorth = () => {
  const s = useGame((st) => st.s);
  return s ? netWorth(s) : 0;
};
export const useBizValue = (b: Biz) => bizValue(b);
