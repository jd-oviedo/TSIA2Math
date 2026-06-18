'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>
          sign in to unpackmath
        </h1>
        <p style={{ marginBottom: '32px', opacity: 0.7 }}>
          save your progress and track your growth
        </p>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.1)',
            background: '#fff',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'redirecting...' : 'continue with Google'}
        </button>
      </div>
    </div>
  )
}
