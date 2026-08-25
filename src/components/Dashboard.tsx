import { useGame } from "../store/game";
import {
  CATALOG,
  DISTRICTS,
  MISSIONS,
  bizIncome,
  boardRows,
  fmtMoney,
  fmtRate,
  levelInfo,
  netWorth,
  nextTier,
  tierFor,
  timeAgo,
  totalIncome,
  upCost,
} from "../game/data";
import { Bar, Chip, Icon, LogoBadge, Spark } from "./ui";

const ACT_ICON: Record<string, { icon: string; color: string }> = {
  buy: { icon: "case", color: "text-gold" },
  up: { icon: "trend", color: "text-cash" },
  gold: { icon: "coin", color: "text-goldhi" },
  info: { icon: "sparkle", color: "text-mint" },
  trophy: { icon: "trophy", color: "text-sky" },
};

function Stat({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-panel p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-dim uppercase">
        <Icon name={icon} size={13} className={color} /> {label}
      </div>
      <div className="num mt-1.5 text-lg font-bold text-fog sm:text-xl">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const s = useGame((st) => st.s)!;
  const setView = useGame((st) => st.setView);
  const upgrade = useGame((st) => st.upgrade);
  const buy = useGame((st) => st.buy);
  const claim = useGame((st) => st.claim);
  const userName = useGame((st) => st.userName);

  const inc = totalIncome(s);
  const nw = netWorth(s);
  const tier = tierFor(nw);
  const nxt = nextTier(nw);
  const li = levelInfo(s.xp);

  const ranked = [...s.businesses].sort((a, b) => bizIncome(b) - bizIncome(a));
  const best = ranked[0];
  const market = CATALOG.filter((d) => !s.businesses.some((b) => b.type === d.type && !b.custom));
  const cheapest = [...market].sort((a, b) => a.price - b.price)[0];

  const ready = MISSIONS.filter((m) => !s.claimed.includes(m.id) && m.metric(s) >= m.target);
  const nextMission = ready[0] ?? MISSIONS.find((m) => !s.claimed.includes(m.id));

  const rows = boardRows(userName, nw, inc);
  const myRank = rows.findIndex((r) => r.you) + 1;

  return (
    <div className="space-y-5">
      {/* net worth hero */}
      <section className="panel-hot relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, #f6c45318, transparent 65%)" }} />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.22em] text-dim uppercase">Net worth</div>
            <div className="num mt-1 text-4xl font-bold text-goldhi sm:text-5xl" style={{ textShadow: "0 0 30px #f6c45333" }}>
              {fmtMoney(nw)}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <Chip className="border-[#f6c45344] bg-[#f6c45310] text-goldhi">
                <Icon name={tier.icon} size={12} /> {tier.name}
              </Chip>
              <Chip className="text-mint">
                <Icon name="user" size={12} className="text-sky" /> LV {li.level}
              </Chip>
              {nxt && (
                <span className="text-[11px] text-dim">
                  next tier <b className="text-mint">{nxt.name}</b> at <span className="num">{fmtMoney(nxt.at)}</span>
                </span>
              )}
            </div>
            {nxt ? (
              <Bar className="mt-2.5 max-w-sm" value={nw - tier.at} max={nxt.at - tier.at} />
            ) : (
              <div className="mt-2 text-[11.5px] font-bold text-gold">You sit at the top of the ladder. Legends only.</div>
            )}
          </div>
          <div className="text-right">
            <div className="mb-1.5 text-[9.5px] font-bold tracking-[0.18em] text-dim uppercase">Cash · last 90s</div>
            <Spark data={s.hist} />
          </div>
        </div>
      </section>

      {/* stat strip */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-edge bg-edge sm:grid-cols-4">
        <Stat icon="trend" label="Income / sec" value={fmtRate(inc)} color="text-cash" />
        <Stat icon="clock" label="Lifetime earned" value={fmtMoney(s.lifetime)} color="text-gold" />
        <Stat icon="case" label="Businesses" value={String(s.businesses.length)} color="text-sky" />
        <Stat icon="map" label="Districts" value={`${s.districts.length}/${DISTRICTS.length}`} color="text-rose" />
      </section>

      {/* trio */}
      <section className="stagger grid gap-4 lg:grid-cols-3">
        {/* best earner */}
        <div className="panel flex flex-col p-5">
          <div className="mb-3 text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Best earner</div>
          {best && (
            <>
              <div className="flex items-center gap-3">
                <LogoBadge icon={best.icon} color={best.color} size={52} level={best.level} />
                <div className="min-w-0">
                  <div className="truncate text-[14.5px] font-bold text-fog">{best.name}</div>
                  <div className="num text-lg font-bold text-cash">{fmtRate(bizIncome(best))}</div>
                </div>
                <span className="chip num ml-auto text-goldhi">LV {best.level}</span>
              </div>
              <div className="mt-3">
                <Bar value={inc > 0 ? bizIncome(best) : 0} max={Math.max(inc, 1)} color="var(--color-cash)" h={6} />
                <div className="mt-1 text-[10.5px] text-dim">{inc > 0 ? Math.round((bizIncome(best) / inc) * 100) : 0}% of total income</div>
              </div>
              <div className="mt-auto flex gap-2 pt-4">
                <button className="btn btn-gold h-10 flex-1 text-[12.5px]" disabled={s.money < upCost(best)} onClick={() => upgrade(best.uid)}>
                  Upgrade · {fmtMoney(upCost(best))}
                </button>
                <button className="btn btn-ghost h-10 px-3 text-[12.5px]" onClick={() => setView("upgrades", best.uid)}>
                  Manage
                </button>
              </div>
            </>
          )}
        </div>

        {/* next mission */}
        <div className="panel flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Next mission</span>
            <Icon name="target" size={15} className="text-gold" />
          </div>
          {nextMission ? (
            <>
              <div className="text-[15px] font-bold text-fog">{nextMission.title}</div>
              <div className="mt-1 text-[12px] leading-snug text-mint">{nextMission.desc}</div>
              <div className="mt-3">
                {(() => {
                  const cur = nextMission.metric(s);
                  const isReady = cur >= nextMission.target;
                  return (
                    <>
                      <Bar value={cur} max={nextMission.target} color={isReady ? "var(--color-gold)" : "var(--color-sky)"} h={7} />
                      <div className="num mt-1 flex justify-between text-[10.5px] text-dim">
                        <span>{nextMission.fmt(Math.min(cur, nextMission.target))} / {nextMission.fmt(nextMission.target)}</span>
                        <span className="text-goldhi">+{fmtMoney(nextMission.reward)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="mt-auto pt-4">
                {ready[0] ? (
                  <button className="btn btn-gold glowpulse h-10 w-full text-[12.5px]" onClick={() => claim(nextMission.id)}>
                    Claim {fmtMoney(nextMission.reward)} <Icon name="gift" size={15} />
                  </button>
                ) : (
                  <button className="btn btn-ghost h-10 w-full text-[12.5px]" onClick={() => setView("missions")}>
                    All missions <Icon name="chevron" size={14} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-mint">Every mission claimed. Pure execution.</div>
          )}
        </div>

        {/* quick buy */}
        <div className="panel flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Next acquisition</span>
            <Icon name="case" size={15} className="text-cash" />
          </div>
          {cheapest ? (
            <>
              <div className="flex items-center gap-3">
                <LogoBadge icon={cheapest.icon} color={cheapest.color} size={48} />
                <div className="min-w-0">
                  <div className="truncate text-[14.5px] font-bold text-fog">{cheapest.name}</div>
                  <div className="num text-[12.5px] font-semibold text-cash">+{fmtRate(cheapest.income)}</div>
                </div>
              </div>
              <p className="mt-2.5 line-clamp-2 text-[12px] leading-snug text-dim">{cheapest.desc}</p>
              <div className="mt-auto pt-4">
                <button className="btn btn-cash h-10 w-full text-[12.5px]" disabled={s.money < cheapest.price} onClick={() => buy(cheapest.type)}>
                  Buy · {fmtMoney(cheapest.price)}
                </button>
                {s.money < cheapest.price && (
                  <div className="num mt-1.5 text-center text-[10.5px] text-dim">need {fmtMoney(cheapest.price - s.money)} more</div>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-snug text-mint">You own every flagship business. Time to found a custom brand.</p>
              <button className="btn btn-gold mt-auto h-10 w-full text-[12.5px]" onClick={() => setView("businesses")}>
                Create business <Icon name="plus" size={15} />
              </button>
            </>
          )}
        </div>
      </section>

      {/* activity + ranks */}
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Latest moves</span>
            <Icon name="bolt" size={14} className="text-gold" />
          </div>
          <ul className="space-y-2.5">
            {s.activity.slice(0, 8).map((a) => {
              const ic = ACT_ICON[a.kind] ?? ACT_ICON.info;
              return (
                <li key={a.id} className="flex items-start gap-2.5 border-b border-[#142b20] pb-2.5 text-[12.5px] last:border-0 last:pb-0">
                  <Icon name={ic.icon} size={14} className={ic.color + " mt-0.5 shrink-0"} />
                  <span className="flex-1 leading-snug text-mint">{a.text}</span>
                  <span className="num shrink-0 text-[10.5px] text-dim">{timeAgo(a.t)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.18em] text-dim uppercase">City rich list</span>
            <span className="num chip text-goldhi">#{myRank}</span>
          </div>
          <ul className="space-y-2">
            {rows.slice(0, 4).map((r, i) => (
              <li key={r.name} className={"flex items-center gap-2.5 rounded-lg px-2 py-1.5 " + (r.you ? "border border-[#f6c45344] bg-[#f6c45310]" : "")}>
                <span className={"num w-5 text-center text-[12px] font-black " + (i === 0 ? "text-gold" : i === 1 ? "text-[#c8d4ce]" : i === 2 ? "text-[#d9a066]" : "text-dim")}>{i + 1}</span>
                <span className={"min-w-0 flex-1 truncate text-[12.5px] font-semibold " + (r.you ? "text-goldhi" : "text-mint")}>{r.name}</span>
                <span className="num text-[12px] font-bold text-fog">{fmtMoney(r.nw)}</span>
              </li>
            ))}
          </ul>
          <button className="btn btn-ghost mt-4 h-9 w-full text-[12px]" onClick={() => setView("leaderboard")}>
            Full leaderboard <Icon name="chevron" size={13} />
          </button>
        </div>
      </section>
    </div>
  );
}
