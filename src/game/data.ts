/* ============================================================
   Business Empire — core data model & static game data
   ============================================================ */

export type CatId = "building" | "employees" | "marketing" | "equipment" | "technology";
export type DistrictId = "suburbs" | "downtown" | "financial" | "airport" | "luxury";
export type Provider = "email" | "google";

export interface BusinessDef {
  id: string;
  icon: string;
  name: string;
  tag: string;
  price: number;
  income: number; // $/sec at level 1
  color: string;
}

export interface BusinessInstance {
  id: string;
  defId: string;
  name: string;
  icon: string;
  color: string;
  level: number;
  baseIncome: number;
  basePrice: number;
  cats: Record<CatId, number>;
  location: DistrictId;
  invested: number;
  custom: boolean;
  createdAt: number;
}

export interface ActivityEntry {
  t: number;
  text: string;
  tone: "gold" | "cash" | "sky" | "ember";
}

export interface GameState {
  money: number;
  totalEarned: number;
  totalSpent: number;
  totalClicks: number;
  purchases: number;
  upgradesDone: number;
  relocations: number;
  customsCreated: number;
  offlineCollected: number;
  missionsClaimed: string[];
  achievementsUnlocked: string[];
  businesses: BusinessInstance[];
  xp: number;
  levelUpsPending: number;
  activity: ActivityEntry[];
  createdAt: number;
  lastSeen: number;
}

export interface AccountUser {
  uid: string;
  name: string;
  email: string;
  provider: Provider;
  company: string;
  createdAt: number;
}

/* ---------------- upgrade categories ---------------- */

export interface CatDef {
  id: CatId;
  icon: string;
  name: string;
  desc: string;
  color: string;
}

export const CATEGORIES: CatDef[] = [
  { id: "building", icon: "🏢", name: "Building", desc: "Bigger premises, better footfall", color: "#56c8ff" },
  { id: "employees", icon: "👥", name: "Employees", desc: "More hands, faster service", color: "#3ee08f" },
  { id: "marketing", icon: "📢", name: "Marketing", desc: "Louder brand, loyal crowds", color: "#ff6f9c" },
  { id: "equipment", icon: "⚙️", name: "Equipment", desc: "Industrial-grade machinery", color: "#f6c453" },
  { id: "technology", icon: "🚀", name: "Technology", desc: "Automation & software edge", color: "#b8a7ff" },
];

export const MAX_CAT = 10;

/* ---------------- business catalog ---------------- */

export const CATALOG: BusinessDef[] = [
  { id: "shop", icon: "🏪", name: "Corner Shop", tag: "Where every empire begins", price: 1_000, income: 1, color: "#3ee08f" },
  { id: "coffee", icon: "☕", name: "Coffee Shop", tag: "Caffeine is a business model", price: 6_000, income: 8, color: "#f6c453" },
  { id: "food", icon: "🍔", name: "Restaurant", tag: "Hot food, hot margins", price: 32_000, income: 46, color: "#ff7a59" },
  { id: "clothing", icon: "👕", name: "Clothing Store", tag: "Fashion never sleeps", price: 140_000, income: 210, color: "#ff6f9c" },
  { id: "market", icon: "🛒", name: "Supermarket", tag: "Sell everything to everyone", price: 620_000, income: 980, color: "#56c8ff" },
  { id: "cars", icon: "🚗", name: "Car Dealership", tag: "Chrome, leather, commission", price: 2_800_000, income: 4_600, color: "#b8a7ff" },
  { id: "tech", icon: "💻", name: "Tech Company", tag: "Ship fast, scale faster", price: 12_000_000, income: 20_500, color: "#7ef0d4" },
  { id: "bank", icon: "🏦", name: "Bank", tag: "Money makes money", price: 52_000_000, income: 92_000, color: "#ffe08a" },
  { id: "hotel", icon: "🏨", name: "Grand Hotel", tag: "Five stars, five zeroes", price: 230_000_000, income: 420_000, color: "#f09ad1" },
  { id: "airline", icon: "✈️", name: "Airline", tag: "Own the skies", price: 1_050_000_000, income: 2_000_000, color: "#8fd0ff" },
];

export const STARTER_BUSINESS: Omit<BusinessInstance, "id" | "createdAt"> = {
  defId: "shop",
  name: "Corner Shop",
  icon: "🏪",
  color: "#3ee08f",
  level: 1,
  baseIncome: 1,
  basePrice: 1_000,
  cats: { building: 0, employees: 0, marketing: 0, equipment: 0, technology: 0 },
  location: "suburbs",
  invested: 1_000,
  custom: false,
};

/* ---------------- custom business balance ---------------- */

export const CUSTOM_LIMIT = 5;
export const CUSTOM_FEE_RATIO = 0.2; // 20% creation fee on top of investment
export const CUSTOM_PAYBACK = 900; // seconds of payback at base
export const CUSTOM_EFFICIENCY = 0.85; // custom businesses run slightly below catalog parity
export const CUSTOM_MIN_PRICE = 25_000;
export const CUSTOM_MAX_PRICE = 25_000_000;
export const CUSTOM_LOGOS = ["🧁", "🎮", "🛹", "📚", "🌮", "💈", "🎬", "🧺", "🔧", "🎧", "🍰", "🪴", "🐶", "⛳", "🧊", "🎯", "🛼", "🥤"];
export const CUSTOM_COLORS = ["#3ee08f", "#f6c453", "#ff7a59", "#ff6f9c", "#56c8ff", "#b8a7ff", "#7ef0d4", "#ffe08a", "#f09ad1", "#8fd0ff", "#c5e86c", "#ffa94d"];
export const CUSTOM_TYPES = ["Retail", "Food & Drink", "Services", "Entertainment", "Tech", "Wellness"];

/* ---------------- districts ---------------- */

export interface District {
  id: DistrictId;
  name: string;
  icon: string;
  mult: number;
  capacity: number;
  fee: number;
  tint: string;
  blurb: string;
}

export const DISTRICTS: District[] = [
  { id: "suburbs", name: "Suburbs", icon: "🏡", mult: 1.0, capacity: 8, fee: 250, tint: "#173428", blurb: "Quiet streets, steady neighbors. Cheap plots, honest money." },
  { id: "downtown", name: "Downtown", icon: "🏙️", mult: 1.3, capacity: 6, fee: 30_000, tint: "#14303c", blurb: "Crowds all day. Rent bites but income jumps +30%." },
  { id: "financial", name: "Financial District", icon: "🏦", mult: 1.6, capacity: 5, fee: 400_000, tint: "#2e2a15", blurb: "Suits, skyscrapers, serious capital. +60% income." },
  { id: "airport", name: "Airport", icon: "✈️", mult: 2.0, capacity: 4, fee: 5_000_000, tint: "#1a2c40", blurb: "A captive audience of travelers. 2× income." },
  { id: "luxury", name: "Luxury District", icon: "💎", mult: 2.5, capacity: 3, fee: 40_000_000, tint: "#331c31", blurb: "Gold-plated clientele. 2.5× income, if you can afford the plot." },
];

/* ---------------- missions ---------------- */

export interface MissionDef {
  id: string;
  title: string;
  desc: string;
  metric: (s: GameState, ips: number) => number;
  metricLabel: (s: GameState, ips: number) => string;
  target: number;
  reward: number;
  xp: number;
}

const moneyLabel = (n: number) => "$" + fmtShort(n);
import { fmtShort } from "./engine";

export const MISSIONS: MissionDef[] = [
  { id: "m_first5k", title: "Grand Opening", desc: "Earn a total of $5,000", metric: (s) => s.totalEarned, metricLabel: (s) => moneyLabel(s.totalEarned), target: 5_000, reward: 3_000, xp: 60 },
  { id: "m_own3", title: "Portfolio Builder", desc: "Own 3 businesses", metric: (s) => s.businesses.length, metricLabel: (s) => `${s.businesses.length} / 3`, target: 3, reward: 8_000, xp: 80 },
  { id: "m_ips100", title: "The $100 Club", desc: "Reach $100/sec income", metric: (_s, ips) => ips, metricLabel: (_s, ips) => `$${fmtShort(ips)}/s`, target: 100, reward: 15_000, xp: 90 },
  { id: "m_upg10", title: "Renovator", desc: "Complete 10 upgrades", metric: (s) => s.upgradesDone, metricLabel: (s) => `${s.upgradesDone} / 10`, target: 10, reward: 12_000, xp: 80 },
  { id: "m_own5", title: "Diversified", desc: "Own 5 businesses", metric: (s) => s.businesses.length, metricLabel: (s) => `${s.businesses.length} / 5`, target: 5, reward: 60_000, xp: 120 },
  { id: "m_ips1k", title: "Cash Cascade", desc: "Reach $1,000/sec income", metric: (_s, ips) => ips, metricLabel: (_s, ips) => `$${fmtShort(ips)}/s`, target: 1_000, reward: 80_000, xp: 140 },
  { id: "m_custom1", title: "Founder", desc: "Create a custom business", metric: (s) => s.customsCreated, metricLabel: (s) => `${s.customsCreated} / 1`, target: 1, reward: 300_000, xp: 200 },
  { id: "m_earn1m", title: "First Million", desc: "Earn $1,000,000 total", metric: (s) => s.totalEarned, metricLabel: (s) => moneyLabel(s.totalEarned), target: 1_000_000, reward: 250_000, xp: 180 },
  { id: "m_upg40", title: "Machine Operator", desc: "Complete 40 upgrades", metric: (s) => s.upgradesDone, metricLabel: (s) => `${s.upgradesDone} / 40`, target: 40, reward: 200_000, xp: 160 },
  { id: "m_ips10k", title: "Money Printer", desc: "Reach $10,000/sec income", metric: (_s, ips) => ips, metricLabel: (_s, ips) => `$${fmtShort(ips)}/s`, target: 10_000, reward: 100_000, xp: 220 },
  { id: "m_bank", title: "Too Big to Fail", desc: "Own a Bank", metric: (s) => (s.businesses.some((b) => b.defId === "bank") ? 1 : 0), metricLabel: (s) => (s.businesses.some((b) => b.defId === "bank") ? "Owned" : "Not owned"), target: 1, reward: 1_500_000, xp: 260 },
  { id: "m_ips100k", title: "Hundred K Flow", desc: "Reach $100,000/sec income", metric: (_s, ips) => ips, metricLabel: (_s, ips) => `$${fmtShort(ips)}/s`, target: 100_000, reward: 5_000_000, xp: 320 },
  { id: "m_own10", title: "Mogul", desc: "Own 10 businesses", metric: (s) => s.businesses.length, metricLabel: (s) => `${s.businesses.length} / 10`, target: 10, reward: 10_000_000, xp: 400 },
  { id: "m_ips1m", title: "Millionaire Machine", desc: "Reach $1,000,000/sec income", metric: (_s, ips) => ips, metricLabel: (_s, ips) => `$${fmtShort(ips)}/s`, target: 1_000_000, reward: 75_000_000, xp: 500 },
  { id: "m_earn1b", title: "The Billionaire", desc: "Earn $1,000,000,000 total", metric: (s) => s.totalEarned, metricLabel: (s) => moneyLabel(s.totalEarned), target: 1_000_000_000, reward: 500_000_000, xp: 700 },
];

/* ---------------- achievements ---------------- */

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  desc: string;
  check: (s: GameState, ips: number, netWorth: number) => boolean;
  reward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "a_level5", icon: "⭐", name: "Rising Star", desc: "Reach player level 5", check: (s) => levelFromXp(s.xp) >= 5, reward: 20_000 },
  { id: "a_clicks50", icon: "👊", name: "Hustler", desc: "Hustle 50 times", check: (s) => s.totalClicks >= 50, reward: 15_000 },
  { id: "a_collector", icon: "🗂️", name: "Collector", desc: "Own all 10 catalog business types", check: (s) => CATALOG.every((d) => s.businesses.some((b) => b.defId === d.id)), reward: 2_000_000 },
  { id: "a_l25", icon: "🥈", name: "Silver Anniversary", desc: "Get any business to level 25", check: (s) => s.businesses.some((b) => b.level >= 25), reward: 1_000_000 },
  { id: "a_net1m", icon: "💵", name: "Net-Worth Millionaire", desc: "Reach $1M net worth", check: (_s, _i, nw) => nw >= 1_000_000, reward: 150_000 },
  { id: "a_net1b", icon: "🏛️", name: "Empire Builder", desc: "Reach $1B net worth", check: (_s, _i, nw) => nw >= 1_000_000_000, reward: 50_000_000 },
  { id: "a_cat10", icon: "🔩", name: "Fully Equipped", desc: "Max any upgrade category (Lv 10)", check: (s) => s.businesses.some((b) => Object.values(b.cats).some((v) => v >= MAX_CAT)), reward: 900_000 },
  { id: "a_upg100", icon: "🛠️", name: "Centurion", desc: "Complete 100 upgrades", check: (s) => s.upgradesDone >= 100, reward: 3_000_000 },
  { id: "a_city", icon: "🗺️", name: "City Slicker", desc: "Own a business in all 5 districts", check: (s) => DISTRICTS.every((d) => s.businesses.some((b) => b.location === d.id)), reward: 5_000_000 },
  { id: "a_brand3", icon: "🎨", name: "Brand Portfolio", desc: "Create 3 custom businesses", check: (s) => s.customsCreated >= 3, reward: 750_000 },
  { id: "a_offline", icon: "😴", name: "Passive Genius", desc: "Collect offline earnings", check: (s) => s.offlineCollected > 0, reward: 25_000 },
  { id: "a_sky", icon: "🛫", name: "Frequent Flyer", desc: "Own an Airline", check: (s) => s.businesses.some((b) => b.defId === "airline"), reward: 25_000_000 },
];

import { levelFromXp } from "./engine";

/* ---------------- leaderboard rivals ---------------- */

export interface Rival {
  name: string;
  icon: string;
  base: number;
  rate: number; // growth per day
  phase: number;
}

const RIVAL_EPOCH = Date.UTC(2026, 0, 1);

export const RIVALS: Rival[] = [
  { name: "Gordon Gekko Jr.", icon: "🎩", base: 2_400_000, rate: 0.028, phase: 0.7 },
  { name: "Amara Okafor", icon: "👑", base: 18_000_000, rate: 0.024, phase: 2.1 },
  { name: "Viktor Petrov", icon: "🦈", base: 95_000_000, rate: 0.02, phase: 4.4 },
  { name: "Lola Fontaine", icon: "💎", base: 420_000_000, rate: 0.017, phase: 1.3 },
  { name: "Kenji Nakamura", icon: "🏯", base: 2_100_000_000, rate: 0.014, phase: 5.2 },
  { name: "Isabella Romano", icon: "🍷", base: 9_800_000_000, rate: 0.011, phase: 3.6 },
  { name: "Bruce Vanderhoof", icon: "🛢️", base: 45_000_000_000, rate: 0.009, phase: 0.2 },
  { name: "Sheik Al-Farouk", icon: "🛥️", base: 210_000_000_000, rate: 0.007, phase: 2.8 },
  { name: "Maximilian Sterling", icon: "🚀", base: 900_000_000_000, rate: 0.005, phase: 4.9 },
];

export function rivalWorth(r: Rival, now: number): number {
  const days = Math.max(0, (now - RIVAL_EPOCH) / 86_400_000);
  const wobble = 1 + 0.035 * Math.sin(now / 7_200_000 + r.phase * 2.3);
  return r.base * (1 + days * r.rate) * wobble;
}

/* ---------------- ticker tape ---------------- */

export const TICKER_SYMBOLS = ["SHOP", "COFF", "BRGR", "TECH", "BANK", "AIRL", "HOTL", "AUTO", "RETL", "FINX", "LUXE", "CRGO"];
