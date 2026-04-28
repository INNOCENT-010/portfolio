import { supabase } from '@/lib/supabase'
import type { Profile, Project, Skill } from '@/lib/supabase'
import Link from 'next/link'
import CTALinks from '@/components/CTALinks'
import ProjectCard from '@/components/ProjectCard'

async function getData() {
  const [profileRes, projectsRes, skillsRes] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('projects').select('*').eq('featured', true).order('order_index'),
    supabase.from('skills').select('*').order('order_index').limit(8),
  ])
  return {
    profile: profileRes.data as Profile | null,
    projects: (projectsRes.data ?? []) as Project[],
    skills: (skillsRes.data ?? []) as Skill[],
  }
}

export const revalidate = 60

export default async function HomePage() {
  const { profile, projects, skills } = await getData()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {profile?.hero_image_url ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={profile.hero_image_url} alt="Hero"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.32)' }} />
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#0A0A0A' }} />
        )}

        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0.15) 50%, rgba(10,10,10,0.88) 90%, #0A0A0A 100%)'
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {profile?.available ? 'Available for work' : 'Not available'}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 9vw, 7rem)', fontWeight: 300, lineHeight: 0.95, color: '#fff', marginBottom: '8px', letterSpacing: '-0.01em' }}>
            {profile?.name?.split(' ')[0]}
          </h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 9vw, 7rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: 'rgba(255,255,255,0.45)', marginBottom: '36px', letterSpacing: '-0.01em' }}>
            {profile?.name?.split(' ')[1]}
          </h1>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 300, color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, maxWidth: '380px', margin: '0 auto 44px' }}>
            {profile?.title} — building scalable, elegant applications with modern technologies.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/portfolio" className="btn-primary">View My Work</Link>
            <Link href="/about" className="btn-ghost">About Me</Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)' }} />
        </div>
      </section>

      {/* SKILLS STRIP */}
      {skills.length > 0 && (
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '18px 48px' }}>
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>Stack</span>
            {skills.map(s => (
              <span key={s.id} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', fontWeight: 300 }}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PROJECTS */}
      {projects.length > 0 && (
        <section style={{ padding: '80px 48px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Selected Work
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>
                  Featured <em>Projects</em>
                </h2>
              </div>
              <Link href="/portfolio" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.32)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '2px' }}>
                See All →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {projects.map(p => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '14px' }}>
              Get in touch
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 300, lineHeight: 1.1, color: '#fff', marginBottom: '14px' }}>
              Let's build something <em>remarkable</em>.
            </h2>
            <div className="divider" />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.8, marginBottom: '32px' }}>
              Available for freelance projects and full-time opportunities.
            </p>
            <a href={`mailto:${profile?.email ?? 'innorh45@gmail.com'}`} className="btn-primary">
              Start a Conversation
            </a>
          </div>
          <CTALinks profile={profile} />
        </div>
      </section>

    </div>
  )
}