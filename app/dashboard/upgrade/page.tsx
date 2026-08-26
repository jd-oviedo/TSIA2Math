import Link from 'next/link';
import { FREE_SAMPLE } from '../../lib/capabilities';

// Where the course gate sends a signed-in visitor with no entitlement.
//
// Deliberately small. Phase 5 builds the real upgrade funnel (it maps the six
// /pricing slugs onto Stripe and closes the founding-tier backdoor), and
// anything ambitious here would be thrown away by it. What this has to do is
// not leave someone who clicked a topic staring at a redirect with no
// explanation.
//
// It lives under /dashboard rather than under /course for two reasons: a page
// inside the gated tree would have to exempt itself from the gate, which is a
// hole by construction; and this audience is signed in, which is exactly what
// the dashboard layout already checks. It is also picked up automatically by
// scripts/verify_auth_gate.mjs, which discovers dashboard routes off the
// filesystem precisely so a new one cannot ship ungated.

export default function UpgradePage() {
  const sampleHref = `/course/tsia2/math/unit/0/topic/${FREE_SAMPLE.topicId}/lesson`;

  return (
    <main style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h1 style={{ margin: 0, font: '600 26px system-ui, sans-serif', lineHeight: 1.25 }}>
        This topic is part of the Full Course
      </h1>

      <p style={{ margin: 0, font: '400 15.5px system-ui, sans-serif', lineHeight: 1.65 }}>
        The Full Course unlocks every topic: the guided notes, the practice, the mini quizzes,
        and Mu to work through anything you miss.
      </p>

      <p style={{ margin: 0, font: '400 15.5px system-ui, sans-serif', lineHeight: 1.65 }}>
        One topic is open to everyone with an account, so you can see how it works before you
        decide.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
        <a
          href="https://unpackmath.com/pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '0 20px',
            borderRadius: '10px',
            background: '#0f1e35',
            color: '#ffffff',
            font: '600 15px system-ui, sans-serif',
            textDecoration: 'none',
          }}
        >
          See what is included
        </a>
        <Link
          href={sampleHref}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '0 20px',
            borderRadius: '10px',
            font: '500 15px system-ui, sans-serif',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Open the free topic
        </Link>
      </div>
    </main>
  );
}
