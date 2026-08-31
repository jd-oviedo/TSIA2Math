'use client';

import { NAVY } from './dashboard-chrome';

// The one collapse control the teacher dashboard uses, and the wrapper its body
// goes in.
//
// EXTRACTED RATHER THAN COPIED FOUR TIMES. CurriculumRollupPanel shipped the
// first one in PR #238 as inline JSX; this change adds three more (Assigned
// work, Class roster, Top misconceptions) and one of them lives in a different
// file. Four hand-rolled copies of an aria-expanded/aria-controls pair is four
// chances to forget the second half of it, so there is one.
//
// THE STATE STAYS AT THE CALL SITE. This exports a button and a wrapper, not a
// <Collapsible>. Each section already owns other state that its header renders
// beside the chevron -- the roster's sort mode, the assignment list's busy id --
// and a component that owned the open flag would have to take all of that as
// props to put it back in the right place.
//
// OPEN BY DEFAULT AND UNPERSISTED, at every call site. The reasoning is the one
// recorded on CurriculumRollupPanel: a collapse exists so a teacher who has read
// a section can get past it, not so the product can decide the section is
// unimportant. Storing the choice would mean a teacher who collapsed the roster
// once in September never seeing it again. If it should persist it belongs with
// the other per-teacher flags in profiles, not in localStorage.

/**
 * The chevron button. Dashboard Navy outline, the secondary treatment Invite
 * and Collapse already carry, because a collapse is the least consequential
 * control in any header it sits in and never competes with the one primary.
 *
 * `controls` MUST be unique in the document: it is an id reference, and two
 * sections sharing one would point both buttons at whichever body rendered
 * first. The four call sites use their own section names.
 */
export function CollapseButton({
  collapsed,
  onToggle,
  controls,
  /** Named for a screen reader, since the visible label is just "Collapse". */
  section,
}: {
  collapsed: boolean;
  onToggle: () => void;
  controls: string;
  section: string;
}) {
  return (
    <button
      type="button"
      className="um-tdash-ghost"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-controls={controls}
      aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${section}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: `1px solid ${NAVY}`,
        borderRadius: 0,
        padding: '5px 10px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      <svg
        className="um-tdash-chev"
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ transform: collapsed ? 'rotate(-90deg)' : 'none' }}
      >
        <polyline points="2.5 4.5 6 8 9.5 4.5" />
      </svg>
      {collapsed ? 'Expand' : 'Collapse'}
    </button>
  );
}

/**
 * The animatable body.
 *
 * TWO ELEMENTS, AND BOTH ARE LOAD-BEARING. The outer is the one-row grid whose
 * row fraction animates; the inner is the clipping box. Collapsing them into
 * one would mean animating grid-template-rows on the same element that has to
 * carry overflow:hidden, and the child is what gets clipped, not the grid.
 *
 * The id goes on the OUTER element, which is what aria-controls points at and
 * what stays in the DOM at both states. See dashboard-chrome.ts for why this is
 * grid rows rather than height or the `hidden` attribute it replaced.
 */
export function CollapseBody({
  id,
  collapsed,
  children,
}: {
  id: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="um-tdash-collapse" data-collapsed={collapsed ? 'true' : 'false'}>
      <div>{children}</div>
    </div>
  );
}
