import { NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase-admin'
import { createServerClient } from '@/app/lib/supabase-server'
import { safeLimit, revealLimiter } from '@/app/lib/rate-limit'
import { revealBodySchema } from '@/app/lib/schemas'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const limited = await safeLimit(revealLimiter, ip)
  if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json()
  const parsed = revealBodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { item_id, selected_answer } = parsed.data

  // Check session -- anonymous users get isCorrect only
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Admin client to access answer-bearing fields
  const admin = createAdminClient()
  const { data: item, error } = await admin
    .from('questions')
    .select('correct_answer, explanation, distractor_logic')
    .eq('item_id', item_id)
    .single()

  if (error || !item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const isCorrect = item.correct_answer === selected_answer

  return NextResponse.json({
    isCorrect,
    correct_answer: item.correct_answer,
    explanation: isAuthenticated ? (item.explanation as string) : null,
    distractor_note: isAuthenticated
      ? (item.distractor_logic as Record<string, string>)[selected_answer]
      : null,
  })
}