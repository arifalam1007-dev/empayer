import { useState } from "react";
import { useGame } from "../store/game";
import {
  CATALOG,
  CATEGORIES,
  CUSTOM_LOGOS,
  CUSTOM_MIN_LEVEL,
  DISTRICTS,
  MAX_CUSTOM,
  SWATCHES,
  bizIncome,
  bizValue,
  customIncome,
  customPrice,
  fmtMoney,
  fmtRate,
  levelInfo,
  totalIncome,
  upCost,
} from "../game/data";
import type { Biz } from "../game/data";
import { Icon, LogoBadge, Modal, SectionHead } from "./ui";

const CAT_COLORS: Record<string, string> = {
  building: "#56c8ff",
  staff: "#3ee08f",
  marketing: "#ff6f9c",
  equipment: "#f6c453",
  tech: "#b8a7ff",
};

function OwnedCard({ b }: { b: Biz }) {
  const s = useGame((st) => st.s)!;
  const upgrade = useGame((st) => st.upgrade);
  const setView = useGame((st) => st.setView);
  const cost = upCost(b);
  const district = DISTRICTS.find((d) => d.id === b.loc);
  const badge = 44 + Math.min(20, b.level * 2);

  return (
    <div
      className="panel group relative cursor-pointer overflow-hidden p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#3a6b52]"
      style={{ boxShadow: "0 10px 30px -18px #000c" }}
      onClick={() => setView("upgrades", b.uid)}
    >
      <div className="flex items-start gap-3">
        <LogoBadge icon={b.icon} color={b.color} size={badge} level={b.level} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14.5px] font-bold text-fog">{b.name}</span>
            {b.custom && <span className="chip px-1.5 py-0.5 text-[9px] border-[#b8a7ff55] text-lilac">CUSTOM</span>}
          </div>
          <div className="num text-[17px] font-bold text-cash">{fmtRate(bizIncome(b))}</div>
        </div>
        <span className="chip num shrink-0 border-[#f6c45344] bg-[#f6c45310] text-[11px] text-goldhi">LV {b.level}</span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-dim">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: district?.color }} />
          {district?.name} <b className="text-mint">×{district?.mult}</b>
        </span>
        <span className="num">value {fmtMoney(bizValue(b))}</span>
      </div>

      {/* category pips */}
      <div className="mt-2.5 flex gap-1">
        {CATEGORIES.map((c) => (
          <div key={c.id} title={`${c.name} Lv ${b.cats[c.id]}`} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#122b20]">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: Math.min(100, b.cats[c.id] * 12) + "%", background: CAT_COLORS[c.id] }} />
          </div>
        ))}
      </div>

      <button
        className="btn btn-gold mt-3.5 h-10 w-full text-[12.5px]"
        disabled={s.money < cost}
        onClick={(e) => {
          e.stopPropagation();
          upgrade(b.uid);
        }}
      >
        Upgrade → LV {b.level + 1} · {fmtMoney(cost)}
      </button>
    </div>
  );
}

function CreateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useGame((st) => st.s)!;
  const buyCustom = useGame((st) => st.buyCustom);
  const [name, setName] = useState("");
  const [arch, setArch] = useState("coffee");
  const [color, setColor] = useState(SWATCHES[0]);
  const [icon, setIcon] = useState("🏪");
  const [err, setErr] = useState<string | null>(null);

  const a = CATALOG.find((c) => c.type === arch)!;
  const count = s.stats.customs;
  const price = customPrice(a, count);
  const income = customIncome(a);
  const li = levelInfo(s.xp);
  const locked = li.level < CUSTOM_MIN_LEVEL;

  const submit = () => {
    const r = buyCustom({ name, arch, color, icon });
    if (r) setErr(r);
    else {
      setName("");
      setErr(null);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} w={660}>
      <div className="border-b border-edge p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-dim uppercase">Create business</div>
            <h3 className="display mt-1 text-2xl text-fog">Found a brand</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-edge2 p-2 text-dim transition-colors hover:text-fog">
            <Icon name="x" size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-dim uppercase">Brand name</label>
            <input className="input" placeholder="e.g. Midnight Espresso" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-dim uppercase">Business model</label>
            <div className="grid grid-cols-5 gap-1.5">
              {CATALOG.map((c) => (
                <button
                  key={c.type}
                  title={c.name}
                  onClick={() => setArch(c.type)}
                  className={"flex flex-col items-center gap-0.5 rounded-lg border py-2 transition-all " + (arch === c.type ? "border-[#f6c453] bg-[#f6c45314]" : "border-edge bg-[#0d2118] hover:border-edge2")}
                >
                  <span className="text-lg leading-none">{c.icon}</span>
                  <span className={"text-[8.5px] font-bold " + (arch === c.type ? "text-goldhi" : "text-dim")}>{c.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-dim uppercase">Brand color</label>
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={"h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 " + (color === c ? "border-fog" : "border-transparent")} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold tracking-wider text-dim uppercase">Logo</label>
            <div className="grid grid-cols-10 gap-1">
              {CUSTOM_LOGOS.map((l) => (
                <button key={l} onClick={() => setIcon(l)} className={"flex h-9 items-center justify-center rounded-lg border text-lg transition-all " + (icon === l ? "border-[#f6c453] bg-[#f6c45314] scale-110" : "border-edge bg-[#0d2118] hover:border-edge2")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <p className="rounded-lg border border-[#1a3528] bg-[#0a1b14] px-3 py-2 text-[10.5px] leading-relaxed text-dim">
            Balance rules: custom brands earn <b className="text-mint">75%</b> of the model's income and cost <b className="text-goldhi">+35%</b> for every
            brand you already own. Max {MAX_CUSTOM} brands · requires player level {CUSTOM_MIN_LEVEL}.
          </p>
        </div>

        {/* live preview */}
        <div className="inset-well flex h-fit flex-col items-center p-4 text-center md:sticky md:top-0">
          <div className="text-[9.5px] font-bold tracking-[0.2em] text-dim uppercase">Preview</div>
          <div className="mt-3">
            <LogoBadge icon={icon} color={color} size={72} />
          </div>
          <div className="mt-2.5 min-h-5 text-[14px] font-bold break-all text-fog">{name.trim() || "Your Brand"}</div>
          <div className="num mt-1 text-[13px] font-bold text-cash">+{fmtRate(income)}</div>
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-[11px]"><span className="text-dim">Founding cost</span><span className="num font-bold text-goldhi">{fmtMoney(price)}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-dim">Brands owned</span><span className="num font-bold text-mint">{count}/{MAX_CUSTOM}</span></div>
            <div className="flex justify-between text-[11px]"><span className="text-dim">Player level</span><span className={"num font-bold " + (locked ? "text-ember" : "text-mint")}>LV {li.level}{locked ? ` / ${CUSTOM_MIN_LEVEL}` : ""}</span></div>
          </div>
          {err && <div className="mt-3 w-full rounded-lg border border-[#6b2b1f] bg-[#3a1712] px-2.5 py-2 text-[11px] font-semibold text-ember">{err}</div>}
          <button className="btn btn-gold mt-4 h-10 w-full text-[12.5px]" disabled={locked} onClick={submit}>
            Found brand · {fmtMoney(price)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function Businesses() {
  const s = useGame((st) => st.s)!;
  const buy = useGame((st) => st.buy);
  const [creating, setCreating] = useState(false);
  const inc = totalIncome(s);
  const market = CATALOG.filter((d) => !s.businesses.some((b) => b.type === d.type && !b.custom));
  const owned = [...s.businesses].sort((a, b) => bizIncome(b) - bizIncome(a));

  return (
    <div className="space-y-6">
      <SectionHead
        kicker="Portfolio"
        title="Your Businesses"
        right={
          <div className="flex items-center gap-2.5">
            <span className="chip num text-cash"><Icon name="trend" size={12} /> {fmtRate(inc)}</span>
            <button className="btn btn-gold h-10 px-4 text-[12.5px]" onClick={() => setCreating(true)}>
              <Icon name="plus" size={15} /> Create business
            </button>
          </div>
        }
      />

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {owned.map((b) => (
          <OwnedCard key={b.uid} b={b} />
        ))}
        {/* create tile */}
        <button
          onClick={() => setCreating(true)}
          className="flex min-h-[190px] flex-col items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-edge2 bg-[#0c1f1700] text-dim transition-all hover:-translate-y-1 hover:border-[#f6c45366] hover:text-goldhi"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-edge2 bg-panel"><Icon name="plus" size={22} /></span>
          <span className="text-[13px] font-bold">Found a custom brand</span>
          <span className="text-[10.5px]">name it, color it, launch it</span>
        </button>
      </div>

      {market.length > 0 && (
        <>
          <SectionHead kicker="Market" title="Businesses for sale" />
          <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {market.map((d) => {
              const afford = s.money >= d.price;
              return (
                <div key={d.type} className={"panel flex flex-col p-4 transition-all " + (afford ? "" : "opacity-75")}>
                  <div className="flex items-center gap-3">
                    <LogoBadge icon={d.icon} color={d.color} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-bold text-fog">{d.name}</div>
                      <div className="num text-[13px] font-bold text-cash">+{fmtRate(d.income)}</div>
                    </div>
                    <Icon name="lock" size={15} className={afford ? "text-cash" : "text-dim"} />
                  </div>
                  <p className="mt-2.5 line-clamp-2 min-h-[32px] text-[11.5px] leading-snug text-dim">{d.desc}</p>
                  <button className="btn btn-cash mt-3.5 h-10 w-full text-[12.5px]" disabled={!afford} onClick={() => buy(d.type)}>
                    Acquire · {fmtMoney(d.price)}
                  </button>
                  {!afford && <div className="num mt-1.5 text-center text-[10.5px] text-dim">need {fmtMoney(d.price - s.money)} more</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <CreateModal open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
