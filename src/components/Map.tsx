import { useState } from "react";
import { useGame } from "../store/game";
import { DISTRICTS, bizIncome, fmtMoney, fmtRate, relocFee, totalIncome } from "../game/data";
import { Icon, LogoBadge, Modal, SectionHead } from "./ui";

export default function Map() {
  const s = useGame((st) => st.s)!;
  const unlockDistrict = useGame((st) => st.unlockDistrict);
  const relocate = useGame((st) => st.relocate);
  const [sel, setSel] = useState<string | null>(null);
  const [moveMode, setMoveMode] = useState(false);

  const inc = totalIncome(s);
  const d = DISTRICTS.find((x) => x.id === sel);
  const inDistrict = (id: string) => s.businesses.filter((b) => b.loc === id);

  const tile = (dist: typeof DISTRICTS[number]) => {
    const unlocked = s.districts.includes(dist.id);
    const bizs = inDistrict(dist.id);
    const dInc = bizs.reduce((t, b) => t + bizIncome(b), 0);
    return (
      <div
        key={dist.id}
        role="button"
        tabIndex={0}
        onClick={() => { setSel(dist.id); setMoveMode(false); }}
        className={dist.cell + " panel group relative cursor-pointer overflow-hidden p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#3a6b52]"}
        style={{ borderTop: `3px solid ${dist.color}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: dist.color + "22", color: dist.color, border: `1px solid ${dist.color}55` }}>
            <Icon name={dist.icon} size={18} />
          </span>
          <span className="chip num" style={{ borderColor: dist.color + "66", color: dist.color, background: dist.color + "14" }}>×{dist.mult}</span>
        </div>
        <div className="display mt-2.5 text-lg text-fog">{dist.name}</div>

        {unlocked ? (
          <>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bizs.length === 0 && <span className="text-[10.5px] text-dim">No businesses yet — move one here for ×{dist.mult} income.</span>}
              {bizs.map((b) => (
                <span key={b.uid} className="chip py-1 text-[10.5px] normal-case">
                  <span>{b.icon}</span> {b.name} <b className="num text-goldhi">L{b.level}</b>
                </span>
              ))}
            </div>
            <div className="num mt-2.5 text-[11px] font-bold" style={{ color: dist.color }}>
              {bizs.length} business{bizs.length === 1 ? "" : "es"} · {fmtRate(dInc)}
            </div>
          </>
        ) : (
          <>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-dim">{dist.desc}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <Icon name="lock" size={13} className="text-dim" />
              <button
                className={"btn h-8 px-3 text-[11.5px] " + (s.money >= dist.cost ? "btn-gold" : "btn-ghost")}
                disabled={s.money < dist.cost}
                onClick={(e) => { e.stopPropagation(); unlockDistrict(dist.id); }}
              >
                Unlock · {fmtMoney(dist.cost)}
              </button>
            </div>
          </>
        )}
        {/* hover glow */}
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-28 w-28 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(circle, ${dist.color}22, transparent 70%)` }} />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <SectionHead
        kicker="The city"
        title="District Map"
        right={<span className="chip num text-cash"><Icon name="trend" size={12} /> empire {fmtRate(inc)}</span>}
      />

      <div className="grid grid-cols-12 gap-3">
        {tile(DISTRICTS[0])}
        {tile(DISTRICTS[1])}
        <div className="roads col-span-12 h-2.5 rounded-full opacity-70" />
        {tile(DISTRICTS[2])}
        {tile(DISTRICTS[3])}
        <div className="roads col-span-12 h-2.5 rounded-full opacity-70" />
        {tile(DISTRICTS[4])}
      </div>

      <p className="text-[11px] text-dim">
        Tap a district to inspect it. Pricier districts multiply the income of every business located there — relocation costs 5% of business value.
      </p>

      {/* district detail */}
      <Modal open={!!d} onClose={() => setSel(null)} w={520}>
        {d && (
          <>
            <div className="p-5 pb-4" style={{ background: `linear-gradient(160deg, ${d.color}1c, transparent 65%)` }}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: d.color + "22", color: d.color, border: `1px solid ${d.color}55` }}>
                  <Icon name={d.icon} size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="display text-2xl text-fog">{d.name}</h3>
                  <div className="num text-[11.5px] font-bold" style={{ color: d.color }}>income multiplier ×{d.mult}</div>
                </div>
                <button onClick={() => setSel(null)} className="rounded-lg border border-edge2 p-2 text-dim transition-colors hover:text-fog"><Icon name="x" size={15} /></button>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-mint">{d.desc}</p>
            </div>

            <div className="space-y-4 p-5 pt-1">
              {!s.districts.includes(d.id) ? (
                <button className="btn btn-gold h-11 w-full text-[13px]" disabled={s.money < d.cost} onClick={() => unlockDistrict(d.id)}>
                  Unlock {d.name} · {fmtMoney(d.cost)}
                </button>
              ) : (
                <>
                  <div>
                    <div className="mb-2 text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Located here</div>
                    {inDistrict(d.id).length === 0 ? (
                      <div className="inset-well px-3 py-3 text-[12px] text-dim">Empty lot. Move a business in and let the multiplier cook.</div>
                    ) : (
                      <ul className="space-y-2">
                        {inDistrict(d.id).map((b) => (
                          <li key={b.uid} className="inset-well flex items-center gap-2.5 p-2">
                            <LogoBadge icon={b.icon} color={b.color} size={34} level={b.level} />
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[12.5px] font-bold text-fog">{b.name}</div>
                              <div className="num text-[11px] text-cash">{fmtRate(bizIncome(b))}</div>
                            </div>
                            <span className="chip num text-goldhi">L{b.level}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <button className="btn btn-ghost mb-2 h-9 w-full text-[12px]" onClick={() => setMoveMode((m) => !m)}>
                      <Icon name="pin" size={14} /> {moveMode ? "Cancel moving" : "Move a business here"}
                    </button>
                    {moveMode && (
                      <ul className="space-y-2">
                        {s.businesses.filter((b) => b.loc !== d.id).map((b) => {
                          const fee = relocFee(b);
                          return (
                            <li key={b.uid} className="inset-well flex items-center gap-2.5 p-2">
                              <span className="text-xl">{b.icon}</span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[12.5px] font-bold text-fog">{b.name}</div>
                                <div className="text-[10.5px] text-dim">from {DISTRICTS.find((x) => x.id === b.loc)?.name}</div>
                              </div>
                              <button className="btn btn-cash h-8 px-3 text-[11px]" disabled={s.money < fee} onClick={() => relocate(b.uid, d.id)}>
                                Move · {fmtMoney(fee)}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
