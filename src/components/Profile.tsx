import { useState } from "react";
import { useAuth } from "../store/auth";
import { useGame } from "../store/game";
import { ACHS, DISTRICTS, MISSIONS, fmtDur, fmtMoney, fmtRate, levelInfo, netWorth, tierFor, titleFor, totalIncome } from "../game/data";
import { Bar, Chip, Icon, SectionHead } from "./ui";

function Cell({ label, value, accent = "text-fog" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-panel p-3.5">
      <div className="text-[9.5px] font-bold tracking-[0.16em] text-dim uppercase">{label}</div>
      <div className={"num mt-1 text-[15px] font-bold " + accent}>{value}</div>
    </div>
  );
}

export default function Profile() {
  const s = useGame((st) => st.s)!;
  const userName = useGame((st) => st.userName);
  const resetEmpire = useGame((st) => st.resetEmpire);
  const toast = useGame((st) => st.toast);
  const { user, signOut } = useAuth();
  const [armed, setArmed] = useState(false);

  const li = levelInfo(s.xp);
  const nw = netWorth(s);
  const tier = tierFor(nw);
  const provider = user?.provider ?? "guest";

  const exportSave = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify({ v: 1, s }, null, 2));
      toast("good", "SAVE COPIED", "Empire save JSON is on your clipboard.");
    } catch {
      toast("info", "COPY BLOCKED", "Your browser refused clipboard access.");
    }
  };

  const onReset = () => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 3500);
      return;
    }
    setArmed(false);
    resetEmpire();
  };

  return (
    <div className="space-y-5">
      <SectionHead kicker="The boss" title="Profile" />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* identity */}
        <div className="panel-hot relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle, #3ee08f14, transparent 65%)" }} />
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f6c45355] bg-[#f6c45314] text-2xl font-black text-goldhi" style={{ boxShadow: "0 0 24px -6px #f6c45388" }}>
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="display text-2xl text-fog">{userName}</h3>
                <Chip className="text-goldhi border-[#f6c45344]"><Icon name={tier.icon} size={12} /> {tier.name}</Chip>
              </div>
              <div className="mt-1 text-[12px] text-dim">{user?.email}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip className="text-sky border-[#56c8ff44]">
                  <Icon name={provider === "google" ? "google" : provider === "email" ? "mail" : "user"} size={11} />
                  {provider === "google" ? "Google account" : provider === "email" ? "Email account" : "Guest session"}
                </Chip>
                <Chip className="text-mint">member since {new Date(user?.createdAt ?? Date.now()).toLocaleDateString()}</Chip>
              </div>
            </div>
          </div>

          {/* level */}
          <div className="inset-well mt-5 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[9.5px] font-bold tracking-[0.2em] text-dim uppercase">Player level</div>
                <div className="display mt-0.5 text-3xl text-goldhi">LV {li.level} <span className="text-base text-mint">· {titleFor(li.level)}</span></div>
              </div>
              <div className="num text-right text-[11px] text-dim">
                {li.into.toLocaleString()} / {li.need.toLocaleString()} XP
                <div className="text-goldhi">{s.xp.toLocaleString()} XP total</div>
              </div>
            </div>
            <Bar className="mt-2.5" value={li.into} max={li.need} h={9} />
            <div className="mt-2 text-[10.5px] text-dim">Earn XP from purchases, upgrades, missions and achievements. Each level pays a cash bonus.</div>
          </div>
        </div>

        {/* actions */}
        <div className="panel flex h-fit flex-col gap-2.5 p-5">
          <div className="mb-1 text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Empire controls</div>
          <button className="btn btn-ghost h-10 w-full text-[12.5px]" onClick={exportSave}>
            <Icon name="copy" size={15} /> Export save (JSON)
          </button>
          <button className={"btn h-10 w-full text-[12.5px] " + (armed ? "btn-danger glowpulse" : "btn-ghost")} onClick={onReset}>
            <Icon name="refresh" size={15} /> {armed ? "Click again to confirm" : "Reset empire"}
          </button>
          <button className="btn btn-danger h-10 w-full text-[12.5px]" onClick={signOut}>
            <Icon name="out" size={15} /> Sign out
          </button>
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-[#1a3528] bg-[#0a1b14] px-3 py-2.5 text-[10.5px] leading-relaxed text-dim">
            <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-cash" />
            Progress autosaves every few seconds to this browser, per account. Authentication is a local demo — swap in Firebase or Supabase in
            src/store/auth.ts.
          </div>
        </div>
      </div>

      {/* stats */}
      <div>
        <div className="mb-2.5 text-[10px] font-bold tracking-[0.18em] text-dim uppercase">Career numbers</div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-edge bg-edge sm:grid-cols-3 lg:grid-cols-4">
          <Cell label="Net worth" value={fmtMoney(nw)} accent="text-goldhi" />
          <Cell label="Income / sec" value={fmtRate(totalIncome(s))} accent="text-cash" />
          <Cell label="Lifetime earned" value={fmtMoney(s.lifetime)} accent="text-goldhi" />
          <Cell label="Cash on hand" value={fmtMoney(s.money)} />
          <Cell label="Businesses" value={String(s.businesses.length)} />
          <Cell label="Level-ups" value={String(s.stats.upgrades)} />
          <Cell label="Category upgrades" value={String(s.stats.catUpgrades)} />
          <Cell label="Relocations" value={String(s.stats.moves)} />
          <Cell label="Custom brands" value={`${s.stats.customs}/5`} />
          <Cell label="Districts" value={`${s.districts.length}/${DISTRICTS.length}`} />
          <Cell label="Missions claimed" value={`${s.claimed.length}/${MISSIONS.length}`} />
          <Cell label="Achievements" value={`${s.ach.length}/${ACHS.length}`} />
          <Cell label="Time at the helm" value={fmtDur(s.stats.playedMs)} />
          <Cell label="Founded" value={new Date(s.stats.startedAt).toLocaleDateString()} />
        </div>
      </div>
    </div>
  );
}
