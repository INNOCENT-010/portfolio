import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const revalidate = 60

export default async function CVPage() {
  const { data: profile } = await supabase.from('profile').select('name, title, cv_url').single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 48px) 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Curriculum Vitae
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: '6px' }}>
              {profile?.name ?? 'Amaechi Innocent'}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
              {profile?.title ?? 'Full Stack Developer'}
            </p>
          </div>

          {profile?.cv_url && (
            <a href={profile.cv_url} download target="_blank" rel="noopener noreferrer"
              className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              Download CV ↓
            </a>
          )}
        </div>

        {/* CV viewer */}
        {profile?.cv_url ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f', overflow: 'hidden' }}>
            {/* PDF embed */}
            {profile.cv_url.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={`${profile.cv_url}#toolbar=0&navpanes=0&scrollbar=0`}
                style={{ width: '100%', height: 'clamp(500px, 80vh, 900px)', border: 'none', display: 'block' }}
                title="CV"
              />
            ) : (
              /* Word doc / other — use Google Docs viewer */
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(profile.cv_url)}&embedded=true`}
                style={{ width: '100%', height: 'clamp(500px, 80vh, 900px)', border: 'none', display: 'block' }}
                title="CV"
              />
            )}
          </div>
        ) : (
          <div style={{ border: '1px dashed rgba(255,255,255,0.1)', padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.2)', marginBottom: '12px', fontStyle: 'italic' }}>
              CV not uploaded yet
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.08em' }}>
              Upload via /admin/profile
            </p>
          </div>
        )}

        {/* Bottom links */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/about" className="btn-ghost" style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
            About Me
          </Link>
          <Link href="/portfolio" className="btn-ghost" style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
            View Work
          </Link>
          <a href="mailto:innorh45@gmail.com" className="btn-primary" style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  )
}