import { useGame } from "../store/game";
import { CATEGORIES, DISTRICTS, bizIncome, bizValue, catCost, catMult, distMult, fmtMoney, fmtRate, upCost } from "../game/data";
import { Icon, LogoBadge, SectionHead } from "./ui";

const CAT_COLORS: Record<string, string> = {
  building: "#56c8ff",
  staff: "#3ee08f",
  marketing: "#ff6f9c",
  equipment: "#f6c453",
  tech: "#b8a7ff",
};

export default function Upgrades() {
  const s = useGame((st) => st.s)!;
  const sel = useGame((st) => st.sel);
  const setView = useGame((st) => st.setView);
  const upgrade = useGame((st) => st.upgrade);
  const buyCat = useGame((st) => st.buyCat);

  const biz = s.businesses.find((b) => b.uid === sel) ?? s.businesses[0];
  if (!biz) return null;

  const cost = upCost(biz);
  const nextRate = biz.baseIncome * (biz.level + 1) * Math.pow(1.35, biz.level) * catMult(biz) * distMult(biz.loc);
  const district = DISTRICTS.find((d) => d.id === biz.loc);
  const badge = 64 + Math.min(24, biz.level * 2);

  return (
    <div className="space-y-5">
      <SectionHead kicker="Growth department" title="Upgrades" />

      {/* selector */}
      <div className="flex gap-2 overflow-x-auto pb-1.5">
        {s.businesses.map((b) => (
          <button
            key={b.uid}
            onClick={() => setView("upgrades", b.uid)}
            className={"flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-bold transition-all " + (b.uid === biz.uid ? "border-[#f6c453] bg-[#f6c45314] text-goldhi" : "border-edge bg-panel text-dim hover:border-edge2 hover:text-fog")}
          >
            <span className="text-base leading-none">{b.icon}</span>
            {b.name}
            <span className="num text-[10px] opacity-70">L{b.level}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* level card */}
        <div className="panel-hot flex h-fit flex-col p-5">
          <div className="flex items-center gap-4">
            <LogoBadge icon={biz.icon} color={biz.color} size={badge} level={biz.level} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-bold text-fog">{biz.name}</span>
                {biz.custom && <span className="chip px-1.5 py-0.5 text-[9px] border-[#b8a7ff55] text-lilac">CUSTOM</span>}
              </div>
              <div className="display text-4xl text-goldhi">LV {biz.level}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
            <div className="inset-well p-2.5">
              <div className="text-[9px] font-bold tracking-widest text-dim uppercase">Income</div>
              <div className="num mt-0.5 text-[15px] font-bold text-cash">{fmtRate(bizIncome(biz))}</div>
            </div>
            <div className="inset-well p-2.5">
              <div className="text-[9px] font-bold tracking-widest text-dim uppercase">Value</div>
              <div className="num mt-0.5 text-[15px] font-bold text-fog">{fmtMoney(bizValue(biz))}</div>
            </div>
          </div>

          <div className="inset-well mt-2.5 p-2.5 text-center">
            <div className="text-[9px] font-bold tracking-widest text-dim uppercase">District bonus</div>
            <div className="mt-0.5 text-[12px] font-bold" style={{ color: district?.color }}>
              {district?.name} ×{district?.mult}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#33604a] bg-[#123023] p-3 text-center">
            <div className="num text-[12px] text-mint">
              {fmtRate(bizIncome(biz))} <span className="mx-1 text-gold">→</span> <b className="text-[14px] text-goldhi">{fmtRate(nextRate)}</b>
            </div>
          </div>

          <button className="btn btn-gold mt-4 h-12 w-full text-[13.5px]" disabled={s.money < cost} onClick={() => upgrade(biz.uid)}>
            <Icon name="trend" size={16} /> Upgrade · {fmtMoney(cost)}
          </button>
          {s.money < cost && <div className="num mt-1.5 text-center text-[10.5px] text-dim">need {fmtMoney(cost - s.money)} more</div>}
        </div>

        {/* category upgrades */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Upgrade categories · +12% income each</span>
            <span className="num text-[10.5px] text-dim">max Lv 25</span>
          </div>
          {CATEGORIES.map((c) => {
            const lvl = biz.cats[c.id];
            const cc = catCost(biz, c.id);
            const maxed = lvl >= 25;
            const afford = s.money >= cc;
            return (
              <div key={c.id} className="panel flex items-center gap-3.5 p-3.5 transition-all hover:border-[#3a6b52]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: CAT_COLORS[c.id] + "20", color: CAT_COLORS[c.id], border: `1px solid ${CAT_COLORS[c.id]}50` }}>
                  <Icon name={c.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-fog">{c.name}</span>
                    <span className="chip num px-1.5 py-0.5 text-[9.5px]" style={{ borderColor: CAT_COLORS[c.id] + "55", color: CAT_COLORS[c.id] }}>LV {lvl}</span>
                    {lvl > 0 && <span className="num text-[10.5px] font-bold text-cash">+{lvl * 12}%</span>}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-dim">{c.desc}</div>
                  <div className="mt-1.5 flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < Math.min(10, Math.ceil(lvl / 2.5)) ? CAT_COLORS[c.id] : "#142b20" }} />
                    ))}
                  </div>
                </div>
                <button
                  className={"btn h-10 shrink-0 px-3.5 text-[12px] " + (maxed ? "btn-ghost" : afford ? "btn-cash" : "btn-ghost")}
                  disabled={maxed}
                  onClick={() => buyCat(biz.uid, c.id)}
                >
                  {maxed ? (
                    <span className="inline-flex items-center gap-1.5 font-black text-goldhi"><Icon name="check" size={14} /> MAX</span>
                  ) : (
                    fmtMoney(cc)
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
