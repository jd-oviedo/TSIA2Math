import Link from 'next/link';
import { requireWorksheetTeacher } from './worksheet-data';
import { createAdminClient } from '../../lib/supabase-admin';
import { WS, WS_CHROME_CSS, microLabel, panelStyle, ctaStyle } from './worksheet-theme';
import WorksheetList from './WorksheetList';
import { readWorksheetQuota } from '../../lib/worksheet-quota';
import { QuotaMeter, QuotaCapNotice } from './QuotaNotice';
import TeacherShell from '../TeacherShell';
import { loadTeacherIdentity } from '../teacher-identity';

export const dynamic = 'force-dynamic';

export type WorksheetSummary = {
  id: string;
  title: string;
  created_at: string;
  item_count: number;
  topics: string[];
};

export default async function WorksheetsIndexPage() {
  const profile = await requireWorksheetTeacher('/teacher/worksheets');
  // Name, email and founder flag for the rail. Read after the gate, never
  // before: this page has no business knowing who is looking at it until it
  // has established they are allowed to.
  const identity = await loadTeacherIdentity();

  // Read, never computed. worksheet_quota_used applies the same period rule the
  // enforcing function does, so the number below is the number the create route
  // will act on. An unlimited plan comes back unmetered without a round trip.
  const quota = await readWorksheetQuota(profile.id, profile.plan);
  const metered = !quota.unmetered && quota.cap !== null;
  const capped = metered && quota.used >= (quota.cap ?? 0);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('worksheets')
    .select('id, title, items, options, created_at')
    .eq('teacher_id', profile.id)
    .order('created_at', { ascending: false });

  // A missing table is a pre-migration deploy, not a failure. The page renders
  // its empty state and says what is wrong, rather than 500ing the dashboard.
  const migrated = !(error && (error.code === '42P01' || error.code === 'PGRST205'));
  if (error && migrated) console.error('[worksheets] list failed:', error.message);

  const worksheets: WorksheetSummary[] = (data ?? []).map((w) => ({
    id: w.id as string,
    title: w.title as string,
    created_at: w.created_at as string,
    item_count: Array.isArray(w.items) ? w.items.length : 0,
    topics: ((w.options ?? {}) as { topics?: string[] }).topics ?? [],
  }));

  return (
    <TeacherShell
      variant="standalone"
      activeLabel="Worksheets"
      teacherName={identity.teacherName}
      teacherEmail={identity.teacherEmail}
      isFounder={identity.isFounder}
      plan={profile.plan}
    >
      {/* ws-chrome: this page renders no sheet, so the whole main is chrome. */}
      <main className="ws-page ws-chrome">
        <style>{WS_CHROME_CSS}</style>

        {/* The band header. One step lighter than the page ground, one hairline
            under it, no radius and no shadow, per the board. */}
        <header className="ws-headband" style={{ background: WS.band, borderBottom: `1px solid ${WS.hairline}` }}>
          <div className="ws-headband-inner">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <Link href="/teacher" style={{ ...microLabel, letterSpacing: '0.14em', textDecoration: 'none' }}>
                Teacher
              </Link>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: WS.ink, margin: 0, letterSpacing: '-0.01em' }}>
                Worksheets
              </h1>
              <p style={{ fontSize: 13, color: WS.muted, margin: 0, lineHeight: 1.5 }}>
                Printable TSIA2 practice with an answer key. Print again any time, it never counts twice.
              </p>
            </div>

            <div className="ws-headband-actions">
              {metered && <QuotaMeter used={quota.used} cap={quota.cap as number} />}
              {/* Disabled as a courtesy, never as the enforcement. A teacher can
                  POST to the route directly, so the RPC's return is the authority
                  and this only saves them a wasted click. */}
              {capped ? (
                <span
                  aria-disabled="true"
                  style={{
                    ...ctaStyle,
                    background: WS.quietBox,
                    color: WS.disabled,
                    padding: '11px 18px',
                    fontSize: 13.5,
                    whiteSpace: 'nowrap',
                    cursor: 'not-allowed',
                  }}
                >
                  + New worksheet
                </span>
              ) : (
                <Link
                  href="/teacher/worksheets/new"
                  className="ws-cta"
                  style={{
                    ...ctaStyle,
                    padding: '11px 18px',
                    fontSize: 13.5,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                  }}
                >
                  + New worksheet
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="ws-shell">
          {capped && <QuotaCapNotice cap={quota.cap as number} />}

          {!migrated && (
            <div
              style={{
                ...panelStyle,
                padding: '16px 18px',
                marginBottom: 18,
                boxShadow: `inset 3px 0 0 ${WS.marker}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 14, color: WS.ink, lineHeight: 1.55 }}>
                <strong>Not enabled yet.</strong> The <code>worksheets</code> table has not
                been created. Run <code>sql/worksheets.sql</code> in the Supabase SQL editor.
              </p>
            </div>
          )}

          <WorksheetList worksheets={worksheets} />
        </div>
      </main>
    </TeacherShell>
  );
}
