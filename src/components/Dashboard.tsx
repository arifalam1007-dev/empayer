import { useRef, useState } from "react";
import { useGame } from "../game/GameContext";
import { DISTRICTS, MISSIONS } from "../game/data";
import { businessIncome, fmtDuration, fmtMoney, fmtShort, tierForLevel, titleForLevel } from "../game/engine";
import { Bar, Panel, SectionHead } from "./ui";
import { IconArrowUp, IconTarget, IconZap } from "./icons";
import type { TabId } from "./Shell";

interface ClickPop { id: number; x: number; y: number; text: string }

export default function Dashboard({ go }: { go: (t: TabId) => void }) {
  const g = useGame();
  const [pops, setPops] = useState<ClickPop[]>([]);
  const popId = useRef(0);
  const s = g.state;

  const hustleClick = (e: React.MouseEvent) => {
    const amount = Math.max(1, Math.round(g.ips * 1.5 + g.lv.level * 3));
    g.hustle();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const id = ++popId.current;
    setPops((p) => [...p.slice(-8), { id, x: e.clientX - rect.left, y: e.clientY - rect.top, text: `+$${fmtShort(amount)}` }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 1000);
  };

  const sorted = [...s.businesses].sort((a, b) => businessIncome(b) - businessIncome(a));
  const top = sorted.slice(0, 4);
  const maxInc = top.length ? businessIncome(top[0]) : 1;

  const nextMission = MISSIONS.find((m) => !s.missionsClaimed.includes(m.id));
  const tier = tierForLevel(g.lv.level);

  const stats: { label: string; value: string; sub: string; tone: string }[] = [
    { label: "Total earned", value: fmtMoney(s.totalEarned), sub: "lifetime revenue", tone: "text-goldhi" },
    { label: "Businesses", value: `${s.businesses.length}`, sub: `${s.businesses.filter((b) => b.custom).length} custom brands`, tone: "text-cash" },
    { label: "Upgrades done", value: `${s.upgradesDone}`, sub: `${s.relocations} relocations`, tone: "text-sky" },
    { label: "Offline banked", value: fmtMoney(s.offlineCollected), sub: "earned while away", tone: "text-lilac" },
  ];

  return (
    <div className="space-y-6">
      {/* ---------- command row ---------- */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="shine relative overflow-hidden p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold/90">Headquarters</div>
              <h1 className="font-display mt-1 text-3xl leading-none text-fog sm:text-4xl">{g.user.company}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider ${tier.cls}`}>{tier.name}</span>
                <span className="text-[12px] font-bold text-dim">{titleForLevel(g.lv.level)} · Level {g.lv.level}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-dim">Net worth</div>
                  <div className="tnum text-3xl font-extrabold text-goldhi sm:text-4xl">{fmtMoney(g.nw)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-dim">Cash on hand</div>
                  <div className="tnum text-xl font-extrabold text-fog">{fmtMoney(s.money)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-dim">Per second</div>
                  <div className="tnum text-xl font-extrabold text-cash">${fmtShort(g.ips)}/s</div>
                </div>
              </div>
            </div>

            {/* hustle button */}
            <button
              onClick={hustleClick}
              className="press relative select-none overflow-visible rounded-xl border-2 border-gold/60 bg-gradient-to-b from-gold/25 to-gold/8 px-7 py-6 text-center shadow-[0_10px_36px_rgba(246,196,83,0.22)] transition-all hover:brightness-110 active:scale-95"
            >
              <span className="block text-3xl"><IconZap size={30} /></span>
              <span className="font-display mt-1 block text-lg tracking-wide text-goldhi">HUSTLE</span>
              <span className="tnum block text-[11px] font-bold text-gold/80">+${fmtShort(Math.max(1, Math.round(g.ips * 1.5 + g.lv.level * 3)))} per tap</span>
              {pops.map((p) => (
                <span key={p.id} className="float-up pointer-events-none absolute text-base font-extrabold text-goldhi" style={{ left: p.x, top: p.y, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                  {p.text}
                </span>
              ))}
            </button>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-[10.5px] font-bold uppercase tracking-wider">
              <span className="text-gold">Level {g.lv.level} → {g.lv.level + 1}</span>
              <span className="tnum text-dim">{fmtShort(g.lv.into)} / {fmtShort(g.lv.need)} XP</span>
            </div>
            <Bar pct={(g.lv.into / g.lv.need) * 100} color="var(--color-gold)" live />
          </div>
        </Panel>

        {/* next mission */}
        <Panel className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold/90"><IconTarget size={14} /> Next mission</div>
            <button onClick={() => go("missions")} className="press text-[11px] font-bold text-dim hover:text-gold">View all →</button>
          </div>
          {nextMission ? (() => {
            const prog = nextMission.metric(s, g.ips);
            const pct = Math.min(100, (prog / nextMission.target) * 100);
            return (
              <div className="mt-3 flex flex-1 flex-col">
                <h3 className="font-display text-xl text-fog">{nextMission.title}</h3>
                <p className="mt-1 text-[13px] text-mint/90">{nextMission.desc}</p>
                <div className="mt-auto pt-4">
                  <div className="mb-1.5 flex justify-between text-[11px] font-bold">
                    <span className="text-dim">{nextMission.metricLabel(s, g.ips)}</span>
                    <span className="tnum text-gold">Reward {fmtMoney(nextMission.reward)}</span>
                  </div>
                  <Bar pct={pct} color="var(--color-cash)" live />
                  <div className="tnum mt-1 text-right text-[10.5px] font-bold text-dim">{pct.toFixed(0)}% complete</div>
                </div>
              </div>
            );
          })() : (
            <div className="mt-3 flex flex-1 flex-col items-start justify-center">
              <div className="text-3xl">🏆</div>
              <h3 className="font-display mt-2 text-xl text-fog">All missions complete</h3>
              <p className="text-[13px] text-mint/90">You've outgrown the checklist. The market is yours.</p>
            </div>
          )}
        </Panel>
      </div>

      {/* ---------- stat strip ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((st) => (
          <Panel key={st.label} className="lift p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">{st.label}</div>
            <div className={`tnum mt-1.5 text-xl font-extrabold sm:text-2xl ${st.tone}`}>{st.value}</div>
            <div className="mt-0.5 text-[11px] font-semibold text-dim">{st.sub}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------- top earners ---------- */}
        <Panel className="p-5">
          <SectionHead kicker="Portfolio" title="Top earners" />
          <div className="space-y-3">
            {top.length === 0 && <div className="text-sm text-dim">No businesses yet.</div>}
            {top.map((b) => {
              const inc = businessIncome(b);
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border text-xl" style={{ borderColor: b.color + "55", background: b.color + "12" }}>{b.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[13px] font-extrabold">
                      <span className="truncate text-fog">{b.name} <span className="text-dim">Lv {b.level}</span></span>
                      <span className="tnum text-cash">${fmtShort(inc)}/s</span>
                    </div>
                    <div className="mt-1.5"><Bar pct={(inc / maxInc) * 100} color={b.color} h="h-1.5" /></div>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={() => go("upgrades")} className="press mt-4 flex items-center gap-1.5 text-[12px] font-bold text-gold hover:text-goldhi">
            <IconArrowUp size={13} /> Boost them in Upgrades
          </button>
        </Panel>

        {/* ---------- activity ---------- */}
        <Panel className="p-5">
          <SectionHead kicker="Wire" title="Latest moves" />
          <ul className="space-y-2.5">
            {s.activity.map((a, i) => (
              <li key={a.t + "-" + i} className="flex items-start gap-3 rounded-lg border border-edge/60 bg-pit/40 px-3 py-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-gold" : a.tone === "cash" ? "bg-cash" : a.tone === "sky" ? "bg-sky" : "bg-ember"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold leading-snug text-fog/90">{a.text}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-dim">
                    <IconClockMini /> {fmtDuration(Math.max(0, (Date.now() - a.t) / 1000))} ago
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ---------- district pulse ---------- */}
      <Panel className="p-5">
        <SectionHead kicker="City" title="District exposure" right={
          <button onClick={() => go("map")} className="press text-[11px] font-bold text-dim hover:text-gold">Open map →</button>
        } />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {DISTRICTS.map((d) => {
            const mine = s.businesses.filter((b) => b.location === d.id);
            const inc = mine.reduce((sum, b) => sum + businessIncome(b), 0);
            return (
              <button key={d.id} onClick={() => go("map")} className="press lift rounded-lg border border-edge p-3 text-left hover:border-gold/50" style={{ background: d.tint + "66" }}>
                <div className="text-xl">{d.icon}</div>
                <div className="mt-1 text-[12px] font-extrabold text-fog">{d.name}</div>
                <div className="tnum text-[10.5px] font-bold text-dim">{mine.length}/{d.capacity} plots</div>
                <div className="tnum text-[11px] font-extrabold text-cash">{inc > 0 ? `$${fmtShort(inc)}/s` : "—"}</div>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function IconClockMini() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}
void IconCoin;
