'use client';

// The one interactive element on a print route.
//
// A client component of its own so the print pages themselves stay server
// components: they read answer-bearing data through the admin client, and a
// 'use client' directive at the top of one of those files would be a very quiet
// way to ship a worked solution to the browser as a prop.
export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className="ws-btn primary" onClick={() => window.print()}>
      {label}
    </button>
  );
}
