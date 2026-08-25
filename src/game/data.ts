/* ============================================================
   BUSINESS EMPIRE — core data & math engine
   All money is virtual / in-game only.
   ============================================================ */

export type CatId = "building" | "staff" | "marketing" | "equipment" | "tech";

export interface BizDef {
  type: string;
  name: string;
  icon: string;
  price: number;
  income: number; // $/sec at level 1
  color: string;
  desc: string;
}

export const CATALOG: BizDef[] = [
  { type: "shop", name: "Corner Shop", icon: "🏪", price: 100, income: 1, color: "#3ee08f", desc: "A scrappy little storefront. Every empire starts somewhere." },
  { type: "coffee", name: "Coffee Shop", icon: "☕", price: 750, income: 15, color: "#e8a15c", desc: "Caffeine is a legally binding subscription." },
  { type: "restaurant", name: "Burger Restaurant", icon: "🍔", price: 4800, income: 75, color: "#ff7a59", desc: "Flame-grilled margins, extra cheese." },
  { type: "clothing", name: "Clothing Store", icon: "👕", price: 30000, income: 380, color: "#56c8ff", desc: "Fast fashion, faster turnover." },
  { type: "supermarket", name: "Supermarket", icon: "🛒", price: 190000, income: 1900, color: "#9be15d", desc: "40 aisles of pure recurring revenue." },
  { type: "car", name: "Car Dealership", icon: "🚗", price: 1200000, income: 9500, color: "#f6c453", desc: "Zero down, one hundred percent hustle." },
  { type: "tech", name: "Tech Company", icon: "💻", price: 7500000, income: 48000, color: "#b8a7ff", desc: "Ship it. Scale it. Series E it." },
  { type: "bank", name: "Private Bank", icon: "🏦", price: 48000000, income: 240000, color: "#7ee8d4", desc: "Other people's money, your management fee." },
  { type: "hotel", name: "Grand Hotel", icon: "🏨", price: 300000000, income: 1200000, color: "#ff6f9c", desc: "300 rooms, a spa, and a rooftop infinity pool." },
  { type: "airline", name: "Skyline Air", icon: "✈️", price: 2000000000, income: 6500000, color: "#8fc7ff", desc: "Mile-high profits. Window seat included." },
];

export const CATEGORIES: { id: CatId; name: string; icon: string; desc: string; per: number }[] = [
  { id: "building", name: "Building", icon: "building", desc: "Bigger floors, flashier signage, better curb appeal.", per: 0.12 },
  { id: "staff", name: "Employees", icon: "people", desc: "Hire and train a sharper, faster team.", per: 0.12 },
  { id: "marketing", name: "Marketing", icon: "megaphone", desc: "Billboards, viral ads, grand re-openings.", per: 0.12 },
  { id: "equipment", name: "Equipment", icon: "gear", desc: "Faster machines, fewer breakdowns.", per: 0.12 },
  { id: "tech", name: "Technology", icon: "rocket", desc: "Automation, apps and AI forecasting.", per: 0.12 },
];
export const CAT_IDS: CatId[] = CATEGORIES.map((c) => c.id);

export interface District {
  id: string;
  name: string;
  mult: number;
  cost: number;
  color: string;
  icon: string;
  desc: string;
  cell: string; // grid placement on the city map
}

export const DISTRICTS: District[] = [
  { id: "suburbs", name: "Suburbs", mult: 1, cost: 0, color: "#3ee08f", icon: "home", desc: "Quiet streets, steady foot traffic, cheap rent. Home turf.", cell: "col-span-12 md:col-span-7" },
  { id: "downtown", name: "Downtown", mult: 1.25, cost: 25000, color: "#56c8ff", icon: "tower", desc: "Crowded blocks and office workers with money to burn.", cell: "col-span-12 md:col-span-5" },
  { id: "financial", name: "Financial District", mult: 1.6, cost: 1500000, color: "#f6c453", icon: "bank", desc: "Glass towers, hedge funds, and very expensive sandwiches.", cell: "col-span-12 md:col-span-4" },
  { id: "airport", name: "Airport Zone", mult: 2, cost: 40000000, color: "#9fb4c4", icon: "plane", desc: "Captive travelers, duty-free prices, 24/7 rush hour.", cell: "col-span-12 md:col-span-8" },
  { id: "luxury", name: "Luxury District", mult: 2.5, cost: 750000000, color: "#ff6f9c", icon: "gem", desc: "Gold-plated everything. The 1% shop here — your customers.", cell: "col-span-12" },
];

/* ---------------- state types ---------------- */

export interface Biz {
  uid: string;
  type: string;
  name: string;
  icon: string;
  color: string;
  level: number;
  loc: string; // district id
  cats: Record<CatId, number>;
  custom: boolean;
  basePrice: number;
  baseIncome: number;
}

export interface Act {
  id: number;
  t: number;
  text: string;
  kind: "buy" | "up" | "gold" | "info" | "trophy";
}

export interface GameState {
  money: number;
  lifetime: number;
  xp: number;
  businesses: Biz[];
  districts: string[];
  claimed: string[];
  ach: string[];
  activity: Act[];
  hist: number[];
  stats: {
    bought: number;
    upgrades: number;
    catUpgrades: number;
    moves: number;
    customs: number;
    startedAt: number;
    playedMs: number;
  };
  lastSaved: number;
}

/* ---------------- formulas ---------------- */

const geo = (r: number, n: number) => (n <= 0 ? 0 : (Math.pow(r, n) - 1) / (r - 1));

export const nice = (n: number): number => {
  if (n < 100) return Math.max(1, Math.round(n));
  if (n < 500) return Math.round(n / 5) * 5;
  if (n < 5000) return Math.round(n / 10) * 10;
  if (n < 50000) return Math.round(n / 50) * 50;
  if (n < 500000) return Math.round(n / 100) * 100;
  if (n < 5e6) return Math.round(n / 1000) * 1000;
  if (n < 5e7) return Math.round(n / 10000) * 10000;
  if (n < 5e9) return Math.round(n / 1e5) * 1e5;
  return Math.round(n / 1e7) * 1e7;
};

/** income/sec of a business at its current level, before district bonus */
export const baseBizIncome = (b: Biz) =>
  b.baseIncome * b.level * Math.pow(1.35, b.level - 1) * catMult(b);

export const catMult = (b: Biz) => CAT_IDS.reduce((m, c) => m + 1 + 0.12 * b.cats[c], 1);

export const upCost = (b: Biz) => nice(b.basePrice * 0.64 * Math.pow(1.6, b.level));

export const catCost = (b: Biz, c: CatId) => nice(b.basePrice * 0.3 * Math.pow(1.9, b.cats[c]));

export const bizValue = (b: Biz) =>
  b.basePrice * (1 + 0.64 * 1.6 * geo(1.6, b.level - 1)) +
  b.basePrice * 0.3 * CAT_IDS.reduce((t, c) => t + geo(1.9, b.cats[c]), 0);

export const distMult = (loc: string) => DISTRICTS.find((d) => d.id === loc)?.mult ?? 1;

export const bizIncome = (b: Biz) => baseBizIncome(b) * distMult(b.loc);

export const totalIncome = (s: GameState) => s.businesses.reduce((t, b) => t + bizIncome(b), 0);

export const netWorth = (s: GameState) => s.money + s.businesses.reduce((t, b) => t + bizValue(b), 0);

export const maxBizLevel = (s: GameState) => s.businesses.reduce((m, b) => Math.max(m, b.level), 0);

export const relocFee = (b: Biz) => Math.max(100, nice(bizValue(b) * 0.05));

/* ---------------- XP / levels / titles ---------------- */

export const xpNeed = (lvl: number) => Math.floor(150 * Math.pow(lvl, 1.6));

export function levelInfo(xp: number) {
  let level = 1;
  let rest = xp;
  while (level < 99 && rest >= xpNeed(level)) {
    rest -= xpNeed(level);
    level++;
  }
  return { level, into: rest, need: xpNeed(level) };
}

const TITLES: [number, string][] = [
  [1, "Lemonade Rookie"],
  [3, "Street Hustler"],
  [5, "Shop Manager"],
  [8, "Local Mogul"],
  [12, "City Tycoon"],
  [16, "Corp Executive"],
  [20, "Industry Baron"],
  [25, "Market Maker"],
  [30, "Money Magnate"],
  [40, "Empire Architect"],
  [50, "Business Legend"],
];
export const titleFor = (lvl: number) => {
  let t = TITLES[0][1];
  for (const [n, name] of TITLES) if (lvl >= n) t = name;
  return t;
};

/* ---------------- empire tiers ---------------- */

export const TIERS = [
  { name: "Street Hustler", at: 0, icon: "cart" },
  { name: "Entrepreneur", at: 100000, icon: "case" },
  { name: "Corporation", at: 10000000, icon: "tower" },
  { name: "Conglomerate", at: 1000000000, icon: "globe" },
  { name: "Business Empire", at: 100000000000, icon: "crown" },
];
export const tierFor = (nw: number) => {
  let t = TIERS[0];
  for (const x of TIERS) if (nw >= x.at) t = x;
  return t;
};
export const nextTier = (nw: number) => TIERS.find((t) => t.at > nw) ?? null;

/* ---------------- custom businesses (balanced) ---------------- */

export const CUSTOM_LOGOS = ["🏪", "☕", "🍔", "👕", "🛒", "🚗", "💻", "🏦", "🏨", "✈️", "🎮", "🌮", "🍰", "📦", "🎬", "⛽", "💎", "🧁", "🚚", "🏭"];
export const SWATCHES = ["#f6c453", "#3ee08f", "#56c8ff", "#ff6f9c", "#ff8a4c", "#b8a7ff", "#4cd9c0", "#f45b69", "#9be15d", "#e8a15c"];
export const MAX_CUSTOM = 5;
export const CUSTOM_MIN_LEVEL = 3;

/** Custom brands cost more per existing brand and earn slightly less — identity over efficiency. */
export const customPrice = (arch: BizDef, count: number) => nice(arch.price * 0.9 * Math.pow(1.35, count));
export const customIncome = (arch: BizDef) => arch.income * 0.75;

/* ---------------- missions ---------------- */

export interface Mission {
  id: string;
  title: string;
  desc: string;
  target: number;
  reward: number;
  fmt: (v: number) => string;
  metric: (s: GameState) => number;
}

export const MISSIONS: Mission[] = [
  { id: "m_inc_100", title: "Warm-Up Act", desc: "Reach $100/sec total income.", target: 100, reward: 2500, fmt: fmtMoney, metric: totalIncome },
  { id: "m_inc_1k", title: "Momentum", desc: "Reach $1.00K/sec total income.", target: 1000, reward: 25000, fmt: fmtMoney, metric: totalIncome },
  { id: "m_inc_10k", title: "Big League", desc: "Reach $10.0K/sec total income.", target: 10000, reward: 100000, fmt: fmtMoney, metric: totalIncome },
  { id: "m_inc_100k", title: "Money Machine", desc: "Reach $100K/sec total income.", target: 100000, reward: 1000000, fmt: fmtMoney, metric: totalIncome },
  { id: "m_inc_1m", title: "The Printing Press", desc: "Reach $1.00M/sec total income.", target: 1000000, reward: 25000000, fmt: fmtMoney, metric: totalIncome },
  { id: "m_own_3", title: "Portfolio Builder", desc: "Own 3 businesses at once.", target: 3, reward: 15000, fmt: fmtInt, metric: (s) => s.businesses.length },
  { id: "m_own_5", title: "Diversified", desc: "Own 5 businesses at once.", target: 5, reward: 100000, fmt: fmtInt, metric: (s) => s.businesses.length },
  { id: "m_own_10", title: "Market Sweep", desc: "Own all 10 flagship businesses.", target: 10, reward: 10000000, fmt: fmtInt, metric: (s) => s.businesses.filter((b) => !b.custom).length },
  { id: "m_lvl_5", title: "Polish the Brass", desc: "Get any business to level 5.", target: 5, reward: 8000, fmt: fmtInt, metric: maxBizLevel },
  { id: "m_lvl_10", title: "Double Digits", desc: "Get any business to level 10.", target: 10, reward: 200000, fmt: fmtInt, metric: maxBizLevel },
  { id: "m_lvl_20", title: "Overachiever", desc: "Get any business to level 20.", target: 20, reward: 5000000, fmt: fmtInt, metric: maxBizLevel },
  { id: "m_net_1m", title: "Millionaire", desc: "Reach a $1.00M net worth.", target: 1e6, reward: 100000, fmt: fmtMoney, metric: netWorth },
  { id: "m_net_1b", title: "Billionaire", desc: "Reach a $1.00B net worth.", target: 1e9, reward: 50000000, fmt: fmtMoney, metric: netWorth },
  { id: "m_custom", title: "Founder", desc: "Create your own custom business.", target: 1, reward: 50000, fmt: fmtInt, metric: (s) => s.stats.customs },
  { id: "m_district", title: "Uptown Move", desc: "Unlock the Downtown district.", target: 2, reward: 30000, fmt: fmtInt, metric: (s) => s.districts.length },
  { id: "m_cat_10", title: "Tinkerer", desc: "Buy 10 category upgrades.", target: 10, reward: 20000, fmt: fmtInt, metric: (s) => s.stats.catUpgrades },
];

/* ---------------- achievements ---------------- */

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  test: (s: GameState) => boolean;
}

export const ACHS: Achievement[] = [
  { id: "a_first_buy", title: "Open for Business", desc: "Buy your first business.", icon: "case", test: (s) => s.stats.bought >= 1 },
  { id: "a_first_up", title: "Level Headed", desc: "Upgrade a business for the first time.", icon: "trend", test: (s) => s.stats.upgrades >= 1 },
  { id: "a_five_biz", title: "Five Alive", desc: "Own 5 businesses at once.", icon: "grid", test: (s) => s.businesses.length >= 5 },
  { id: "a_all_biz", title: "Full Portfolio", desc: "Own all 10 flagship businesses.", icon: "crown", test: (s) => s.businesses.filter((b) => !b.custom).length >= 10 },
  { id: "a_lvl10", title: "Perfect 10", desc: "Reach business level 10.", icon: "star", test: (s) => maxBizLevel(s) >= 10 },
  { id: "a_lvl25", title: "Quarter Century", desc: "Reach business level 25.", icon: "star", test: (s) => maxBizLevel(s) >= 25 },
  { id: "a_million", title: "Millionaire", desc: "Hold a $1M net worth.", icon: "coin", test: (s) => netWorth(s) >= 1e6 },
  { id: "a_billion", title: "Billionaire", desc: "Hold a $1B net worth.", icon: "gem", test: (s) => netWorth(s) >= 1e9 },
  { id: "a_trillion", title: "Trillionaire", desc: "Hold a $1T net worth. Absurd.", icon: "rocket", test: (s) => netWorth(s) >= 1e12 },
  { id: "a_founder", title: "Founder", desc: "Create a custom business.", icon: "sparkle", test: (s) => s.stats.customs >= 1 },
  { id: "a_uptown", title: "Uptown", desc: "Unlock 3 districts.", icon: "map", test: (s) => s.districts.length >= 3 },
  { id: "a_allcity", title: "Mayor Material", desc: "Unlock every district.", icon: "pin", test: (s) => s.districts.length >= 5 },
  { id: "a_plvl5", title: "Rising Star", desc: "Reach player level 5.", icon: "bolt", test: (s) => levelInfo(s.xp).level >= 5 },
  { id: "a_plvl15", title: "Executive Suite", desc: "Reach player level 15.", icon: "bolt", test: (s) => levelInfo(s.xp).level >= 15 },
  { id: "a_life_10m", title: "Cash Flow", desc: "Earn $10M lifetime.", icon: "clock", test: (s) => s.lifetime >= 1e7 },
  { id: "a_life_10b", title: "Deep Pockets", desc: "Earn $10B lifetime.", icon: "clock", test: (s) => s.lifetime >= 1e10 },
  { id: "a_tinker", title: "Tinkerer", desc: "Buy 25 category upgrades.", icon: "gear", test: (s) => s.stats.catUpgrades >= 25 },
  { id: "a_nomad", title: "Mover & Shaker", desc: "Relocate businesses 3 times.", icon: "pin", test: (s) => s.stats.moves >= 3 },
];

/* ---------------- leaderboard bots ---------------- */

const BOTS = [
  { name: "V. Vanderbildt", base: 118e9 },
  { name: "A. Onassis", base: 47e9 },
  { name: "E. Marsden", base: 21.4e9 },
  { name: "S. McDuck", base: 8.2e9 },
  { name: "T. Stark", base: 3.1e9 },
  { name: "B. Wayne", base: 920e6 },
  { name: "C. Kane", base: 405e6 },
  { name: "J. Pierpont", base: 172e6 },
  { name: "O. Windsor", base: 61e6 },
  { name: "G. Rambeau", base: 23.5e6 },
  { name: "K. Krusty", base: 8.9e6 },
  { name: "M. Lomonade", base: 2.95e6 },
  { name: "P. Palak", base: 840e3 },
  { name: "R. Rook", base: 142e3 },
];

export interface BoardRow {
  name: string;
  nw: number;
  inc: number;
  you?: boolean;
}

export function boardRows(playerName: string, playerNw: number, playerInc: number): BoardRow[] {
  const h = Date.now() / 3.6e6;
  const rows: BoardRow[] = BOTS.map((b, i) => {
    const nw = b.base * (1 + 0.0006 * h) * (1 + 0.03 * Math.sin(h / 11 + i * 2.3));
    return { name: b.name, nw, inc: nw * 0.0045 };
  });
  rows.push({ name: playerName, nw: playerNw, inc: playerInc, you: true });
  return rows.sort((a, b) => b.nw - a.nw);
}

/* ---------------- formatting ---------------- */

const UNITS: [number, string][] = [
  [1e30, "No"],
  [1e27, "Oc"],
  [1e24, "Sp"],
  [1e21, "Sx"],
  [1e18, "Qi"],
  [1e15, "Qa"],
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
];

export function fmtMoney(n: number): string {
  if (!isFinite(n)) return "∞";
  const neg = n < 0;
  n = Math.abs(n);
  let core: string | undefined;
  for (const [v, sfx] of UNITS) {
    if (n >= v) {
      const x = n / v;
      core = (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2)) + sfx;
      break;
    }
  }
  if (!core) {
    core =
      n >= 1000
        ? Math.floor(n).toLocaleString("en-US")
        : n >= 100
          ? Math.floor(n).toString()
          : n % 1 > 0.001
            ? n.toFixed(1)
            : Math.floor(n).toString();
  }
  return (neg ? "-$" : "$") + core;
}

export function fmtInt(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

export const fmtRate = (n: number) => fmtMoney(n) + "/s";

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const timeAgo = (t: number) => {
  const d = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (d < 60) return d + "s ago";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  return Math.floor(d / 86400) + "d ago";
};

export const fmtDur = (ms: number) => {
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h " + (m % 60) + "m";
  return Math.floor(h / 24) + "d " + (h % 24) + "h";
};
