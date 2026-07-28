'use client';

import { C, ink } from '@/app/components/curriculum-theme';
import { FONT_BODY } from '@/app/components/fonts';
import type { NavStep } from './topic-data';

// Previous and Next at the foot of every topic page.
//
// Previous is never gated: going back to re-read or re-attempt something
// already unlocked is always allowed. Next carries the mastery gate, and when
// it is locked it says what is still needed rather than sitting there greyed
// out with no explanation.

export default function TopicNav({
  previous,
  next,
  unlocked,
  requirement,
}: {
  previous: NavStep;
  next: NavStep;
  unlocked: boolean;
  // What is still outstanding, shown only while locked.
  requirement?: string;
}) {
  const nextDisabled = Boolean(next) && !unlocked;

  return (
    <nav
      aria-label="Topic navigation"
      style={{
        marginTop: 8,
        paddingTop: 22,
        borderTop: `1px solid ${ink(0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {nextDisabled && requirement && (
        <div
          id="topic-nav-requirement"
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 12,
            background: C.sand,
            font: `400 13.5px ${FONT_BODY}`,
            lineHeight: 1.55,
            color: ink(0.65),
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              flex: 'none',
              borderRadius: '50%',
              background: C.sunset,
            }}
          />
          {requirement}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {previous ? (
          <a
            className="um-btn-outline"
            href={previous.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 11,
              boxShadow: `inset 0 0 0 1.5px ${ink(0.22)}`,
              font: `500 14.5px ${FONT_BODY}`,
              color: ink(0.7),
            }}
          >
            <span aria-hidden="true">&larr;</span>
            <span>
              Previous
              <span style={{ color: ink(0.45) }}> · {previous.label}</span>
            </span>
          </a>
        ) : (
          // Start of the course. Held as an empty cell so Next stays right.
          <span />
        )}

        {next &&
          (nextDisabled ? (
            <button
              type="button"
              disabled
              aria-describedby="topic-nav-requirement"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 11,
                border: 'none',
                background: ink(0.09),
                font: `600 14.5px ${FONT_BODY}`,
                color: ink(0.4),
                cursor: 'not-allowed',
              }}
            >
              <span>
                Next
                <span style={{ color: ink(0.32) }}> · {next.label}</span>
              </span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          ) : (
            <a
              className="um-btn-primary"
              href={next.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 11,
                background: C.sunset,
                boxShadow: `0 2px 0 ${C.sunsetShadow}`,
                font: `600 14.5px ${FONT_BODY}`,
                color: C.midnight,
              }}
            >
              <span>
                Next
                <span style={{ color: 'rgba(14,14,17,.55)' }}> · {next.label}</span>
              </span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          ))}
      </div>
    </nav>
  );
}
