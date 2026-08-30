import { useGame } from "../store/game";
import { ACHS, MISSIONS, boardRows, fmtMoney, fmtRate, netWorth, tierFor, totalIncome } from "../game/data";
import { Bar, Icon, SectionHead } from "./ui";

/* ---------------- Missions ---------------- */

export function Missions() {
  const s = useGame((st) => st.s)!;
  const claim = useGame((st) => st.claim);

  const open = MISSIONS.filter((m) => !s.claimed.includes(m.id));
  const done = MISSIONS.filter((m) => s.claimed.includes(m.id));
  const sorted = [...open].sort((a, b) => {
    const ra = a.metric(s) >= a.target ? 1 : 0;
    const rb = b.metric(s) >= b.target ? 1 : 0;
    if (ra !== rb) return rb - ra;
    return b.metric(s) / b.target - a.metric(s) / a.target;
  });

  return (
    <div className="space-y-5">
      <SectionHead
        kicker="Contracts"
        title="Missions"
        right={<span className="chip num text-goldhi"><Icon name="target" size={12} /> {s.claimed.length}/{MISSIONS.length} claimed</span>}
      />
      <div className="stagger space-y-2.5">
        {sorted.map((m) => {
          const cur = Math.min(m.metric(s), m.target);
          const ready = m.metric(s) >= m.target;
          return (
            <div key={m.id} className={"panel flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap " + (ready ? "border-[#f6c45366]" : "")} style={ready ? { boxShadow: "0 0 24px -10px #f6c45388" } : undefined}>
              <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + (ready ? "border border-[#f6c45366] bg-[#f6c45318] text-gold" : "border border-edge2 bg-[#0d2118] text-dim")}>
                <Icon name="target" size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-bold text-fog">{m.title}</span>
                  <span className="chip num px-1.5 py-0.5 text-[9.5px] text-goldhi border-[#f6c45344]">+{fmtMoney(m.reward)}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-dim">{m.desc}</div>
                <div className="mt-2 flex items-center gap-2.5">
                  <Bar value={cur} max={m.target} color={ready ? "var(--color-gold)" : "var(--color-sky)"} h={6} className="flex-1" />
                  <span className="num shrink-0 text-[10.5px] text-dim">{m.fmt(cur)} / {m.fmt(m.target)}</span>
                </div>
              </div>
              <button className={"btn h-10 shrink-0 px-4 text-[12px] " + (ready ? "btn-gold glowpulse" : "btn-ghost")} disabled={!ready} onClick={() => claim(m.id)}>
                {ready ? <>Claim <Icon name="gift" size={14} /></> : <span className="num">{Math.floor((cur / m.target) * 100)}%</span>}
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <div className="panel p-6 text-center text-[13px] text-mint">Every contract fulfilled. The city works for you now.</div>}
      </div>

      {done.length > 0 && (
        <div>
          <div className="mb-2.5 text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Completed</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {done.map((m) => (
              <div key={m.id} className="flex items-center gap-2.5 rounded-xl border border-edge bg-[#0c1f17] px-3 py-2.5 opacity-80">
                <Icon name="check" size={15} className="shrink-0 text-cash" />
                <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-mint">{m.title}</span>
                <span className="num text-[10.5px] text-dim">+{fmtMoney(m.reward)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Achievements ---------------- */

export function Achievements() {
  const s = useGame((st) => st.s)!;
  const unlocked = s.ach.length;

  return (
    <div className="space-y-5">
      <SectionHead
        kicker="Trophy cabinet"
        title="Achievements"
        right={<span className="chip num text-goldhi"><Icon name="trophy" size={12} /> {unlocked}/{ACHS.length}</span>}
      />
      <Bar value={unlocked} max={ACHS.length} h={8} className="max-w-md" />
      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHS.map((a) => {
          const has = s.ach.includes(a.id);
          return (
            <div key={a.id} className={"panel flex items-center gap-3 p-4 transition-all " + (has ? "border-[#f6c45355]" : "opacity-70")}>
              <span
                className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full border " + (has ? "border-[#f6c45366] bg-[#f6c45318] text-gold" : "border-edge2 bg-[#0d2118] text-dim")}
                style={has ? { boxShadow: "0 0 16px -4px #f6c45388" } : undefined}
              >
                <Icon name={has ? a.icon : "lock"} size={19} />
              </span>
              <div className="min-w-0">
                <div className={"text-[13px] font-bold " + (has ? "text-goldhi" : "text-mint")}>{a.title}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-dim">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Leaderboard ---------------- */

const MEDAL = ["text-gold", "text-[#c8d4ce]", "text-[#d9a066]"];

export function Leaderboard() {
  const s = useGame((st) => st.s)!;
  const userName = useGame((st) => st.userName);
  const rows = boardRows(userName, netWorth(s), totalIncome(s));
  const myRank = rows.findIndex((r) => r.you) + 1;

  return (
    <div className="space-y-5">
      <SectionHead
        kicker="Rich list"
        title="Leaderboard"
        right={<span className="chip num text-goldhi"><Icon name="crown" size={12} /> your rank #{myRank}</span>}
      />
      <div className="panel overflow-hidden">
        <div className="hidden grid-cols-[44px_1fr_130px_110px] items-center gap-2 border-b border-edge px-4 py-2.5 text-[9.5px] font-bold tracking-[0.18em] text-dim uppercase sm:grid">
          <span>Rank</span><span>Tycoon</span><span className="text-right">Net worth</span><span className="text-right">Income</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={"grid grid-cols-[44px_1fr_auto] items-center gap-2 border-b border-[#142b20] px-4 py-3 last:border-0 sm:grid-cols-[44px_1fr_130px_110px] " + (r.you ? "bg-[#f6c4530d]" : "")}
          >
            <span className="flex items-center gap-1">
              {i < 3 ? <Icon name="trophy" size={16} className={MEDAL[i]} /> : <span className="num w-4 text-center text-[12px] font-bold text-dim">{i + 1}</span>}
            </span>
            <span className="min-w-0">
              <span className={"block truncate text-[13px] font-bold " + (r.you ? "text-goldhi" : "text-fog")}>
                {r.name} {r.you && <span className="chip num ml-1 px-1.5 py-0.5 text-[8.5px] border-[#f6c45355] text-goldhi">YOU</span>}
              </span>
              <span className="text-[10px] font-bold tracking-wider text-dim uppercase">{tierFor(r.nw).name}</span>
            </span>
            <span className="num text-right text-[13px] font-bold text-fog">{fmtMoney(r.nw)}</span>
            <span className="num hidden text-right text-[11.5px] text-cash sm:block">{fmtRate(r.inc)}</span>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-[11px] text-dim">
        <Icon name="sparkle" size={13} className="text-gold" />
        Rival fortunes are simulated for the demo — connect Firebase or Supabase later for a live ladder.
      </p>
    </div>
  );
}
