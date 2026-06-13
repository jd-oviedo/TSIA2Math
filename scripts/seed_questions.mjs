import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const bankPath = join(__dirname, '../public/data/question_bank.json')
const items = JSON.parse(readFileSync(bankPath, 'utf8'))

console.log(`Seeding ${items.length} items...`)

const { data, error } = await supabase
  .from('questions')
  .upsert(items, { onConflict: 'item_id' })

if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`✓ Seeded successfully`)