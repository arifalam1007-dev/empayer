import { Icon } from "./ui";

/* Local icons so nothing else in the game needs to change */
const PhoneSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 3.5h3.5L10 8l-2 1.7a13.5 13.5 0 0 0 6.3 6.3L16 14l4.5 1.5V19a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5Z" />
  </svg>
);

const WhatsAppSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.18-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.06a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.07.89.9-2.99-.2-.31a8.16 8.16 0 1 1 6.8 3.72Zm4.47-6.1c-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.13-.17.24-.64.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.66.3-.22.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.13.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.45-.6 1.66-1.17.2-.58.2-1.06.14-1.17-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);

export default function Contact() {
  return (
    <footer className="panel relative mt-8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg, var(--color-gold), var(--color-cash), var(--color-gold))" }} />
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        {/* heading */}
        <div className="max-w-sm">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-dim">
            <Icon name="sparkle" size={12} className="text-gold" /> Get in touch
          </div>
          <h2 className="display text-2xl text-fog sm:text-3xl">
            Contact <span className="text-gold">Me</span>
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-mint">
            Questions about the empire, partnerships, or a bug you spotted in the market? Reach out — I usually reply fast.
          </p>
        </div>

        {/* actions */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center lg:gap-3">
          <a href="tel:0543421676" className="btn btn-ghost h-12 flex-1 px-4 text-[13px] sm:flex-none">
            <span className="text-gold"><PhoneSvg size={17} /></span>
            <span className="num tracking-wide">0543421676</span>
          </a>

          <a href="mailto:arifalam1007@gmail.com" className="btn btn-ghost h-12 flex-1 px-4 text-[13px] sm:flex-none">
            <span className="text-sky"><Icon name="mail" size={17} /></span>
            <span className="num">arifalam1007@gmail.com</span>
          </a>

          <a
            href="https://wa.me/971543421676"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-cash h-12 flex-1 px-5 text-[13px] sm:flex-none"
            style={{ boxShadow: "0 6px 22px -8px #3ee08f88, inset 0 1px 0 #c9ffe2" }}
          >
            <WhatsAppSvg size={18} /> Message me on WhatsApp
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-edge bg-[#0a1b14] px-5 py-2.5 text-[10.5px] font-semibold text-dim sm:px-6">
        <Icon name="clock" size={12} className="text-cash" />
        Available 7 days a week
        <span className="mx-1 text-edge2">·</span>
        <Icon name="shield" size={12} className="text-gold" />
        Direct line — no bots, no tickets
        <span className="mx-1 text-edge2">·</span>
        <span className="num">wa.me/971543421676</span>
      </div>
    </footer>
  );
}
