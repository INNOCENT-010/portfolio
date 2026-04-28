// scripts/sync-github.mjs
// Usage: node scripts/sync-github.mjs

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load your .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const GITHUB_USERNAME = 'INNOCENT-010'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Languages → category mapping
const SKIP_REPOS = ['innocentdev'] // your portfolio repo, skip it

async function fetchRepos() {
  console.log(`\n📡 Fetching repos for ${GITHUB_USERNAME}...`)
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
    { headers: { 'User-Agent': 'innocentdev-sync' } }
  )
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  const repos = await res.json()
  console.log(`✅ Found ${repos.length} repos\n`)
  return repos
}

async function fetchLanguages(repoName) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
    { headers: { 'User-Agent': 'innocentdev-sync' } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return Object.keys(data).slice(0, 5) // top 5 languages
}

function buildProject(repo, languages, index) {
  return {
    title: repo.name
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()),
    description: repo.description || `A ${languages[0] || 'code'} project.`,
    long_description: repo.description || '',
    tech_stack: languages,
    github_url: repo.html_url,
    live_url: repo.homepage || null,
    image_url: null,
    featured: false,
    order_index: index + 1,
  }
}

async function run() {
  const repos = await fetchRepos()

  const filtered = repos.filter(r =>
    !r.fork &&
    !r.private &&
    !SKIP_REPOS.includes(r.name)
  )

  console.log(`🔍 Syncing ${filtered.length} repos (skipping forks, private, and portfolio)...\n`)

  const projects = []

  for (const repo of filtered) {
    process.stdout.write(`  → ${repo.name} ... `)
    const languages = await fetchLanguages(repo.name)
    projects.push(buildProject(repo, languages, projects.length))
    console.log(`[${languages.join(', ') || 'no languages'}]`)
    // small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 150))
  }

  console.log(`\n📦 Inserting ${projects.length} projects into Supabase...`)

  // Upsert by github_url so running it twice won't duplicate
  const { error } = await supabase
    .from('projects')
    .upsert(projects, { onConflict: 'github_url', ignoreDuplicates: false })

  if (error) {
    console.error('❌ Supabase error:', error.message)
    process.exit(1)
  }

  console.log(`✅ Done! ${projects.length} projects synced to Supabase.`)
  console.log(`\n👉 Go to /admin/projects to set which ones are "featured"\n`)
}

run().catch(err => {
  console.error('❌ Fatal error:', err.message)
  process.exit(1)
})