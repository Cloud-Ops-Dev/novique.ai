import ThemeShell from "@/components/marketing/ThemeShell";
import PageHero from "@/components/marketing/PageHero";
import SectionHeading from "@/components/marketing/SectionHeading";
import StatusTag from "@/components/marketing/StatusTag";
import DarkButton from "@/components/marketing/DarkButton";
import GraphicFrame from "@/components/graphics/GraphicFrame";
import RecallSignal from "@/components/graphics/RecallSignal";
import ProcessFlowLine from "@/components/graphics/ProcessFlowLine";
import IsoFigure from "@/components/graphics/IsoFigure";
import SignalField from "@/components/graphics/SignalField";
import { PRODUCTS, SYSTEMS, statusMeta } from "@/lib/work/products";

export const metadata = {
  title: "Work",
  description:
    "What Novique has shipped and what's next. LabelWatch, AnswerCrew, Retinue, and Glow Routine live today, LienSentry on waitlist — plus the systems we operate.",
};

const labelwatch = PRODUCTS.find((p) => p.slug === "labelwatch")!;
const answercrew = PRODUCTS.find((p) => p.slug === "answercrew")!;
const retinue = PRODUCTS.find((p) => p.slug === "retinue")!;
const liensentry = PRODUCTS.find((p) => p.slug === "liensentry")!;
const glow = PRODUCTS.find((p) => p.slug === "glow-routine")!;

const CASE = [
  { k: "The problem", v: "Dietary-supplement brands are liable for ingredients they don't manufacture. When the FDA posts a recall, the brands affected are often the last to know — and a missed recall is a legal and PR fire." },
  { k: "What we built", v: "A service that ingests the federal recall feeds every night, normalizes them, and matches each entry against a brand's catalog and competitors — alerting them the moment something lands." },
  { k: "The model", v: "A subscription SaaS at $39 / $99 / $299 a month on Stripe, live today at label.watch. Real customers, real billing." },
  { k: "We operate it", v: "We don't hand it off. The same team that built the recall pipeline runs it in production and watches it — which is exactly how we'd run something for you." },
];

const LIEN_CASE = [
  { k: "The problem", v: "Texas Chapter 53 protects a subcontractor's right to get paid — but only if the right notices go out on time. Every commercial job carries three statutory deadlines: fund-trapping notices, derivative-claimant notices, and the lien affidavit. Miss one and the lien rights on that money are gone." },
  { k: "What we built", v: "A rules engine that tracks every active job's Chapter 53 calendar and alerts the sub before each deadline — email, Slack, Teams, or SMS — with opt-in certified mail and a tracked return receipt when it's time to file." },
  { k: "The model", v: "A subscription SaaS at $99 / $249 / $499 a month for commercial-mechanical subcontractors. The waitlist is open today at liensentry.com." },
  { k: "We operate it", v: "Same promise as LabelWatch: we don't hand it off. The team that built the deadline engine runs it and watches it — with an audit-ready trail of every notice." },
];

export default function WorkPage() {
  return (
    <ThemeShell>
      <PageHero
        eyebrow="Portfolio"
        headline="What we've shipped — and what's next."
        subhead="Four products live today, one more with an open waitlist. No vaporware, no invented screenshots — just what's real, labeled honestly."
        ctas={[
          { label: "Book a call", href: "/consultation", variant: "primary" },
          { label: "How we work", href: "/services", variant: "ghost" },
        ]}
      />

      {/* LabelWatch case study */}
      <section className="mx-auto max-w-container px-6 py-16 md:py-24">
        <div className="nv-card overflow-hidden rounded-2xl">
          <GraphicFrame height={160} className="border-b border-stroke-1 bg-surface-1">
            <RecallSignal className="absolute inset-0" />
          </GraphicFrame>
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-dh1 text-ink-0">{labelwatch.name}</h2>
              <StatusTag label="Live now" tone="live" />
            </div>
            <p className="mt-2 font-mono text-sm text-ink-3">SaaS product · label.watch</p>
            <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {CASE.map((c) => (
                <div key={c.k}>
                  <h3 className="nv-eyebrow mb-2">{c.k}</h3>
                  <p className="text-ink-1">{c.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <DarkButton href="https://label.watch" external variant="outline">
                Visit label.watch ↗
              </DarkButton>
            </div>
          </div>
        </div>
      </section>

      {/* LienSentry case study */}
      <section className="mx-auto max-w-container px-6 pb-16 md:pb-24">
        <div className="nv-card overflow-hidden rounded-2xl">
          <GraphicFrame height={160} className="border-b border-stroke-1 bg-surface-1">
            <ProcessFlowLine className="absolute inset-0" />
          </GraphicFrame>
          <div className="p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-dh1 text-ink-0">{liensentry.name}</h2>
              <StatusTag label="Waitlist open" tone="soon" />
            </div>
            <p className="mt-2 font-mono text-sm text-ink-3">SaaS product · liensentry.com</p>
            <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {LIEN_CASE.map((c) => (
                <div key={c.k}>
                  <h3 className="nv-eyebrow mb-2">{c.k}</h3>
                  <p className="text-ink-1">{c.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <DarkButton href="https://liensentry.com" external variant="outline">
                Join the waitlist at liensentry.com ↗
              </DarkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Also live */}
      <section className="mx-auto max-w-container px-6 py-12 md:py-16">
        <div className="mb-8">
          <SectionHeading eyebrow="Also live" title="More products in production" subhead="Running today, operated by the same team." />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <ComingCard name={answercrew.name} sub="Voice AI service · answercrew.pro" meta={statusMeta(answercrew.status)} blurb={answercrew.blurb}>
            <DarkButton href="https://answercrew.pro" external variant="outline">
              Visit answercrew.pro ↗
            </DarkButton>
          </ComingCard>
          <ComingCard name={retinue.name} sub="Open source · github.com/novique-ai/retinue" meta={statusMeta(retinue.status, retinue.statusLabel)} blurb={retinue.blurb}>
            <DarkButton href="https://github.com/novique-ai/retinue" external variant="outline">
              View on GitHub ↗
            </DarkButton>
          </ComingCard>
          <ComingCard name={glow.name} sub="App Store app" meta={statusMeta(glow.status, glow.statusLabel)} blurb={glow.blurb}>
            <DarkButton href={glow.url!} external variant="outline">
              Get it on the App Store ↗
            </DarkButton>
          </ComingCard>
        </div>
      </section>

      {/* Systems we operate */}
      <section className="mx-auto max-w-container px-6 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_360px] md:items-center">
          <div>
            <SectionHeading
              eyebrow="Beyond the products"
              title="The systems we operate"
              subhead="Credibility isn't a logo wall. It's the production infrastructure we run every day — the same competencies we bring to your build."
            />
            <ul className="mt-8 space-y-5">
              {SYSTEMS.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-ink-0">{s.title}</p>
                    <p className="text-sm text-ink-2">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="group relative h-[340px]">
            <IsoFigure variant="lattice" />
          </div>
        </div>
      </section>

      {/* Build-in-public note */}
      <section className="relative overflow-hidden border-y border-stroke-1 bg-surface-1">
        <GraphicFrame className="absolute inset-0 opacity-40">
          <SignalField density={0.6} accentRatio={0.05} />
        </GraphicFrame>
        <div className="relative mx-auto max-w-reading px-6 py-16 text-center">
          <p className="font-display text-dh2 text-ink-0 text-balance">
            Everything on this page is real, running, and labeled with its honest status.
          </p>
          <p className="mt-3 text-ink-2">This page grows as we ship.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-container px-6 py-20 text-center md:py-24">
        <h2 className="mx-auto max-w-2xl font-display text-dh1 text-ink-0">Want us to build the next one for you?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <DarkButton href="/consultation" size="lg">Book a call</DarkButton>
          <DarkButton href="https://label.watch" external variant="ghost" size="lg">See LabelWatch</DarkButton>
        </div>
      </section>
    </ThemeShell>
  );
}

function ComingCard({
  name,
  sub,
  meta,
  blurb,
  children,
}: {
  name: string;
  sub: string;
  meta: { label: string; tone: "live" | "soon" };
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nv-card flex flex-col p-6">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="font-display text-dh3 text-ink-0">{name}</h3>
        <StatusTag label={meta.label} tone={meta.tone} />
      </div>
      <p className="mb-3 font-mono text-xs text-ink-3">{sub}</p>
      <p className="text-sm leading-relaxed text-ink-2">{blurb}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
