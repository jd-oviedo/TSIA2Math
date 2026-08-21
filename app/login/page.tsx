'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LOGIN_CSS } from './login-theme';
import { RoleSelect } from './RoleSelect';
import { SignIn } from './SignIn';

// /login. One route, three screens, branching on the `role` param exactly as it
// did before: teacher or student render the sign-in screen, anything else --
// including a missing role -- renders the selector.
//
// That last clause is load-bearing and easy to miss. /dashboard's gate redirects
// here WITHOUT a role, so the selector, not the sign-in screen, is what a
// signed-out deep link actually lands on.

function LoginBody() {
  const role = useSearchParams().get('role');
  if (role === 'teacher' || role === 'student') return <SignIn role={role} />;
  return <RoleSelect />;
}

export default function LoginPage() {
  return (
    <>
      {/* The --uml-* variables and the handful of rules inline styles cannot
          express: :focus-visible, :hover, and the narrow-width header. */}
      <style>{LOGIN_CSS}</style>
      <Suspense fallback={null}>
        <LoginBody />
      </Suspense>
    </>
  );
}
