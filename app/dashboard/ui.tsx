import { C, ink, EYEBROW } from '@/app/components/curriculum-theme';
import { FONT_HEADING, FONT_BODY } from '@/app/components/fonts';

// The handful of shapes every dashboard page repeats. Server components, no
// state: the pages that need interactivity import their own client pieces.

export function PageHeading({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 26 }}>
      <h1
        style={{
          margin: 0,
          font: `600 29px ${FONT_HEADING}`,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: C.midnight,
        }}
      >
        {title}
      </h1>
      {blurb && (
        <p style={{ margin: 0, font: `400 14.5px ${FONT_BODY}`, lineHeight: 1.6, color: ink(0.6) }}>
          {blurb}
        </p>
      )}
    </header>
  );
}

export function Card({
  children,
  padding = '22px 24px',
}: {
  children: React.ReactNode;
  padding?: string;
}) {
  return (
    <section
      style={{
        background: C.paper,
        border: `1px solid ${ink(0.09)}`,
        borderRadius: 16,
        padding,
        boxShadow: '0 1px 3px rgba(14,14,17,.05)',
      }}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: '0 0 4px', font: `600 16px ${FONT_HEADING}`, color: C.midnight }}>
      {children}
    </h2>
  );
}

export function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return <div style={{ ...EYEBROW, color: color ?? ink(0.42) }}>{children}</div>;
}

export function Muted({ children, size = 14 }: { children: React.ReactNode; size?: number }) {
  return (
    <p style={{ margin: 0, font: `400 ${size}px ${FONT_BODY}`, lineHeight: 1.6, color: ink(0.6) }}>
      {children}
    </p>
  );
}

// Deliberately plain. An empty dashboard is the normal first-run state, not a
// failure, and it should not be dressed up as one.
export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card padding="34px 26px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
        <div style={{ font: `600 15px ${FONT_HEADING}`, color: C.midnight }}>{title}</div>
        <Muted size={13.5}>{detail}</Muted>
      </div>
    </Card>
  );
}

// One progress bar shape, used for the course total and for each unit.
export function ProgressBar({
  value,
  total,
  height = 10,
}: {
  value: number;
  total: number;
  height?: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${pct} percent complete`}
      style={{
        width: '100%',
        height,
        borderRadius: height / 2,
        background: ink(0.1),
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: height / 2,
          background: C.sunset,
        }}
      />
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
