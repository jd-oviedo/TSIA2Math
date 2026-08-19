import Link from 'next/link';
import { requireWorksheetTeacher } from './worksheet-data';
import { createAdminClient } from '@/app/lib/supabase-admin';
import { DASH, cardStyle } from '@/app/components/dashboard-theme';
import WorksheetList from './WorksheetList';

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
    <main style={{ background: DASH.pageBg, minHeight: '100vh', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 16,
            marginBottom: 22,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Link
              href="/teacher"
              style={{ fontSize: 13, color: DASH.muted, textDecoration: 'none' }}
            >
              ← Dashboard
            </Link>
            <h1
              style={{
                fontSize: 27,
                fontWeight: 700,
                color: DASH.heading,
                margin: '8px 0 4px',
                letterSpacing: '-0.01em',
              }}
            >
              Worksheets
            </h1>
            <p style={{ color: DASH.muted, fontSize: 14, margin: 0 }}>
              Printable practice with an answer key that explains every wrong option.
            </p>
          </div>
          <Link
            href="/teacher/worksheets/new"
            style={{
              background: DASH.heading,
              color: '#FFF',
              padding: '10px 18px',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            New worksheet
          </Link>
        </div>

        {!migrated && (
          <div
            style={{
              ...cardStyle(DASH),
              padding: '16px 18px',
              marginBottom: 18,
              borderLeft: '4px solid #B08328',
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: DASH.ink }}>
              <strong>Not enabled yet.</strong> The <code>worksheets</code> table has not
              been created. Run <code>sql/worksheets.sql</code> in the Supabase SQL editor.
            </p>
          </div>
        )}

        <WorksheetList worksheets={worksheets} />
      </div>
    </main>
  );
}
