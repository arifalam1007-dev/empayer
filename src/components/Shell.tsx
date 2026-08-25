import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { DistrictId } from "../game/data";
import { CATALOG, DISTRICTS } from "../game/data";
import { fmtMoney, fmtShort, fmtDuration, ownedInDistrict, tierForLevel, titleForLevel } from "../game/engine";
import { useGame } from "../game/GameContext";
import type { Toast } from "../game/GameContext";
import { Bar, Modal, GoldBtn, GhostBtn } from "./ui";
import {
  IconDashboard, IconBriefcase, IconMap, IconTrendUp, IconTarget, IconTrophy, IconPodium, IconUser, IconClock, IconZap,
} from "./icons";

export type TabId = "dashboard" | "businesses" | "map" | "upgrades" | "missions" | "achievements" | "leaderboard" | "profile";

export const NAV: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <IconDashboard size={18} /> },
  { id: "businesses", label: "Businesses", icon: <IconBriefcase size={18} /> },
  { id: "map", label: "Map", icon: <IconMap size={18} /> },
  { id: "upgrades", label: "Upgrades", icon: <IconTrendUp size={18} /> },
  { id: "missions", label: "Missions", icon: <IconTarget size={18} /> },
  { id: "achievements", label: "Achievements", icon: <IconTrophy size={18} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <IconPodium size={18} /> },
  { id: "profile", label: "Profile", icon: <IconUser size={18} /> },
];

export default function Shell({ tab, setTab, children }: { tab: TabId; setTab: (t: TabId) => void; children: ReactNode }) {
  const g = useGame();
  return (
    <div className="bg-board relative min-h-screen">
      <div className="bg-grid pointer-events-none fixed inset-0" />
      <Particles />

      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-40 border-b border-edge bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-2.5 sm:px-6 lg:pl-[264px]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/40 bg-gold/10 text-lg">💰</span>
            <div className="hidden min-w-0 md:block">
              <div className="truncate text-[13px] font-extrabold leading-tight text-fog">{g.user.company}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">{titleForLevel(g.lv.level)} · Lv {g.lv.level}</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-4">
            <MoneyPill />
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-edge bg-panel px-3 py-1.5">
              <span className="text-sm">📈</span>
              <div>
                <div className="tnum text-[13px] font-extrabold leading-tight text-cash">${fmtShort(g.ips)}/s</div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-dim">Money/sec</div>
              </div>
            </div>
            <div className="hidden w-36 lg:block">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-gold">Lv {g.lv.level}</span>
                <span className="text-dim">{fmtShort(g.lv.into)}/{fmtShort(g.lv.need)} XP</span>
              </div>
              <Bar pct={(g.lv.into / g.lv.need) * 100} color="var(--color-gold)" h="h-1.5" />
            </div>
          </div>
        </div>
        <Ticker />
      </header>

      {/* ---------- sidebar (desktop) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-edge bg-pit/70 pt-[118px] backdrop-blur-sm lg:flex">
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`press group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-bold transition-all ${
                tab === n.id ? "bg-gold/12 text-goldhi" : "text-mint/80 hover:bg-panel hover:text-fog"
              }`}
            >
              <span className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gold transition-all ${tab === n.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
              <span className={tab === n.id ? "text-gold" : "text-dim group-hover:text-mint"}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-edge p-4">
          <div className="rounded-lg border border-edge bg-panel p-3">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-dim"><IconZap size={13} /> Net worth</div>
            <div className="tnum mt-1 text-lg font-extrabold text-goldhi">{fmtMoney(g.nw)}</div>
            <div className="mt-2"><Bar pct={(g.lv.into / g.lv.need) * 100} color="var(--color-gold)" h="h-1" /></div>
          </div>
        </div>
      </aside>

      {/* ---------- main ---------- */}
      <main className="relative mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:pb-10 lg:pl-[264px]">
        <div key={tab} className="tab-in">{children}</div>
      </main>

      {/* ---------- bottom nav (mobile) ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-ink/95 backdrop-blur-md lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex overflow-x-auto px-2 py-1.5" style={{ scrollbarWidth: "none" }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`press flex min-w-[74px] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-wide transition-colors ${
                tab === n.id ? "bg-gold/12 text-goldhi" : "text-dim"
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      <ToastStack toasts={g.toasts} />
      <BuyModal />
      <OfflineModal />
    </div>
  );
}

/* ================= money pill + floaters ================= */

function MoneyPill() {
  const g = useGame();
  return (
    <div className="relative flex items-center gap-2 rounded-lg border border-gold/35 bg-gradient-to-b from-gold/15 to-gold/5 px-3 py-1.5 shadow-[0_0_24px_rgba(246,196,83,0.12)]">
      <span className="text-sm">💰</span>
      <div>
        <div className="tnum text-[13px] font-extrabold leading-tight text-goldhi sm:text-sm">{fmtMoney(g.state.money)}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-gold/70">Balance</div>
      </div>
      <div className="pointer-events-none absolute -top-1 right-2">
        {g.floaters.map((f) => (
          <span
            key={f.id}
            className={`float-up absolute right-0 whitespace-nowrap text-[13px] font-extrabold ${
              f.tone === "gold" ? "text-goldhi" : f.tone === "ember" ? "text-ember" : "text-cash"
            }`}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
          >
            {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================= ticker ================= */

function Ticker() {
  const g = useGame();
  const [, force] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => force((x) => x + 1), 5000);
    return () => clearInterval(iv);
  }, []);
  const wobble = (i: number) => {
    const v = Math.sin(Date.now() / 3_600_000 + i * 1.7) * 6 + Math.sin(Date.now() / 610_000 + i) * 1.4;
    return v;
  };
  const syms = ["SHOP", "COFF", "BRGR", "TECH", "BANK", "AIRL", "HOTL", "AUTO", "RETL", "FINX"];
  const row = (k: number) => (
    <span key={k} className="flex items-center">
      {syms.map((s, i) => {
        const v = wobble(i + k * 0.01);
        const up = v >= 0;
        return (
          <span key={s} className="mx-4 flex items-center gap-1.5 text-[10.5px] font-bold tracking-widest">
            <span className="text-dim">{s}</span>
            <span className={up ? "text-cash" : "text-ember"}>{up ? "▲" : "▼"} {Math.abs(v).toFixed(1)}%</span>
          </span>
        );
      })}
      <span className="mx-4 flex items-center gap-1.5 text-[10.5px] font-bold tracking-widest">
        <span className="text-gold">YOU</span>
        <span className="text-goldhi">${fmtShort(g.ips)}/s</span>
      </span>
    </span>
  );
  return (
    <div className="overflow-hidden border-t border-edge/60 bg-pit/60">
      <div className="ticker-track flex w-max py-1">{[0, 1].map(row)}</div>
    </div>
  );
}

/* ================= toasts ================= */

function ToastStack({ toasts }: { toasts: Toast[] }) {
  const styles: Record<Toast["kind"], string> = {
    success: "border-cash/50 text-cash",
    gold: "border-gold/50 text-goldhi",
    info: "border-sky/50 text-sky",
    error: "border-ember/50 text-[#ffb59f]",
    levelup: "border-gold/70 text-goldhi",
    rocket: "border-cash/60 text-cash",
  };
  return (
    <div className="pointer-events-none fixed right-3 top-16 z-[80] flex w-[290px] flex-col gap-2 sm:right-5">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-in rounded-lg border bg-panel/95 px-3.5 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.5)] backdrop-blur ${styles[t.kind]}`}>
          <div className="font-display text-[14px] tracking-wide">{t.title}</div>
          {t.sub && <div className="mt-0.5 text-[12px] font-semibold leading-snug text-fog/85">{t.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ================= buy modal ================= */

function BuyModal() {
  const g = useGame();
  const [defId, setDefId] = useState<string | null>(null);
  const [district, setDistrict] = useState<DistrictId>("suburbs");

  useEffect(() => {
    if (g.buy) {
      setDefId(g.buy.defId ?? null);
      setDistrict(g.buy.district ?? "suburbs");
    }
  }, [g.buy]);

  if (!g.buy) return null;
  const def = defId ? CATALOG.find((d) => d.id === defId) : undefined;
  const dis = DISTRICTS.find((d) => d.id === district)!;
  const total = def ? def.price + dis.fee : 0;

  return (
    <Modal open onClose={g.closeBuy} wide>
      <div className="p-5 sm:p-6">
        {!def ? (
          <>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/90">Acquire a business</div>
            <h3 className="font-display mt-1 text-2xl text-fog">What are we buying{g.buy.district ? ` in ${dis.name}` : ""}?</h3>
            <div className="mt-4 grid max-h-[52vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {CATALOG.map((d) => {
                const owned = g.state.businesses.some((b) => b.defId === d.id);
                const afford = g.state.money >= d.price;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDefId(d.id)}
                    className={`press lift rounded-lg border p-3 text-left transition-colors ${
                      afford ? "border-edge bg-panel2 hover:border-gold/60" : "border-edge/60 bg-panel opacity-55"
                    }`}
                  >
                    <div className="text-2xl">{d.icon}</div>
                    <div className="mt-1 text-[13px] font-extrabold text-fog">{d.name}</div>
                    <div className="tnum text-[11.5px] font-bold text-gold">{fmtMoney(d.price)}</div>
                    <div className="tnum text-[10.5px] text-cash">+${fmtShort(d.income)}/s</div>
                    {owned && <div className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-dim">Already owned ✓</div>}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-xl border-2 text-4xl" style={{ borderColor: def.color + "66", background: def.color + "14" }}>{def.icon}</div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold/90">Acquiring</div>
                <h3 className="font-display text-2xl leading-tight text-fog">{def.name}</h3>
                <div className="tnum text-[13px] font-bold text-cash">+${fmtShort(def.income)}/s base income</div>
              </div>
              <button onClick={() => setDefId(null)} className="press ml-auto rounded-md border border-edge bg-panel2 px-2.5 py-1.5 text-[11px] font-bold text-dim hover:text-fog">← Change</button>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-dim">Choose a district</div>
              <div className="space-y-2">
                {DISTRICTS.map((d) => {
                  const used = ownedInDistrict(g.state, d.id);
                  const full = used >= d.capacity;
                  const active = district === d.id;
                  return (
                    <button
                      key={d.id}
                      disabled={full}
                      onClick={() => setDistrict(d.id)}
                      className={`press flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        full ? "cursor-not-allowed border-edge/50 bg-panel opacity-45"
                        : active ? "border-gold/70 bg-gold/10" : "border-edge bg-panel2 hover:border-edge2"
                      }`}
                    >
                      <span className="text-xl">{d.icon}</span>
                      <span className="flex-1">
                        <span className="block text-[13.5px] font-extrabold text-fog">{d.name}</span>
                        <span className="block text-[11px] text-dim">{used}/{d.capacity} plots used</span>
                      </span>
                      <span className="tnum rounded-md border border-cash/30 bg-cash/10 px-2 py-0.5 text-[11.5px] font-extrabold text-cash">{d.mult}× income</span>
                      <span className="tnum w-20 text-right text-[12px] font-bold text-gold">{d.fee === 0 ? "Free" : fmtMoney(d.fee)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-edge bg-pit/60 px-4 py-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Total cost (business + plot)</div>
                <div className={`tnum text-xl font-extrabold ${g.state.money >= total ? "text-goldhi" : "text-ember"}`}>{fmtMoney(total)}</div>
              </div>
              <div className="flex gap-2">
                <GhostBtn onClick={g.closeBuy}>Cancel</GhostBtn>
                <GoldBtn disabled={g.state.money < total} onClick={() => g.buyBusiness(def.id, district)}>
                  {g.state.money < total ? `Need ${fmtMoney(total - g.state.money)}` : "Buy business →"}
                </GoldBtn>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ================= offline modal ================= */

function OfflineModal() {
  const g = useGame();
  if (!g.offline) return null;
  return (
    <Modal open onClose={g.dismissOffline}>
      <div className="relative overflow-hidden p-6 text-center sm:p-8">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="coin-spin mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-gold/60 bg-gradient-to-b from-gold/30 to-gold/5 text-4xl shadow-[0_0_50px_rgba(246,196,83,0.35)]">💰</div>
          <h3 className="font-display mt-5 text-4xl text-goldhi">WELCOME BACK! 🎉</h3>
          <p className="mt-2 text-sm text-mint">
            You were away for <span className="font-extrabold text-fog">{fmtDuration(g.offline.seconds)}</span>. Your businesses kept working at 50% efficiency.
          </p>
          <div className="mx-auto mt-5 max-w-xs rounded-xl border border-gold/40 bg-pit/70 px-6 py-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">You earned</div>
            <div className="tnum mt-1 text-3xl font-extrabold text-goldhi">{fmtMoney(g.offline.amount)}</div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <GhostBtn onClick={g.dismissOffline}>Later</GhostBtn>
            <GoldBtn onClick={g.collectOffline} className="pulse-glow">Collect earnings →</GoldBtn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================= particles ================= */

function Particles() {
  const glyphs = ["$", "$", "◆", "$", "¢", "$"];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="particle absolute text-gold"
          style={{
            left: `${(i * 83 + 7) % 100}%`,
            fontSize: `${12 + ((i * 11) % 18)}px`,
            ["--pd" as string]: `${20 + ((i * 6) % 18)}s`,
            ["--pdel" as string]: `${-(i * 3.1)}s`,
            ["--po" as string]: 0.05 + ((i * 4) % 8) / 100,
          }}
        >
          {glyphs[i % glyphs.length]}
        </span>
      ))}
    </div>
  );
}
