import { supabase } from '@/lib/supabase'
import type { Profile, Skill, Experience } from '@/lib/supabase'

async function getData() {
  const [profileRes, skillsRes, expRes] = await Promise.all([
    supabase.from('profile').select('*').single(),
    supabase.from('skills').select('*').order('order_index'),
    supabase.from('experience').select('*').order('order_index'),
  ])
  return {
    profile: profileRes.data as Profile | null,
    skills: (skillsRes.data ?? []) as Skill[],
    experience: (expRes.data ?? []) as Experience[],
  }
}

export const revalidate = 60
const categoryOrder = ['Frontend', 'Backend', 'DevOps', 'Other']

export default async function AboutPage() {
  const { profile, skills, experience } = await getData()

  const grouped = categoryOrder.reduce((acc, cat) => {
    const items = skills.filter(s => s.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<string, Skill[]>)

  const connectLinks = [
    { label: 'Email', href: `mailto:${profile?.email}`, value: profile?.email },
    profile?.whatsapp ? { label: 'WhatsApp', href: `https://wa.me/${profile.whatsapp}`, value: `+${profile.whatsapp}` } : null,
    profile?.phone ? { label: 'Call', href: `tel:${profile.phone}`, value: profile.phone } : null,
    { label: 'GitHub', href: profile?.github_url, value: '@INNOCENT-010' },
    { label: 'LinkedIn', href: profile?.linkedin_url, value: 'innocent-amaechi' },
  ].filter(Boolean) as { label: string; href: string; value: string }[]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 48px) clamp(60px, 10vw, 120px)' }}>

        {/* Header — stacks on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 6vw, 80px)', alignItems: 'start', marginBottom: 'clamp(48px, 8vw, 90px)' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>About</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 8vw, 5rem)', fontWeight: 300, lineHeight: 0.95, color: '#fff', marginBottom: '6px' }}>
              Amaechi
            </h1>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 8vw, 5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
              Innocent
            </h1>
            <div className="divider" />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.85rem, 2.5vw, 0.92rem)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, fontWeight: 300 }}>
              {profile?.bio}
            </p>
          </div>

          <div>
            {profile?.profile_image_url && (
              <div style={{ marginBottom: '20px', overflow: 'hidden', aspectRatio: '3/4', maxHeight: '380px' }}>
                <img src={profile.profile_image_url} alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'grayscale(15%) brightness(0.88)' }} />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
              {[
                { label: 'Location', value: profile?.location },
                { label: 'Status', value: profile?.available ? 'Available' : 'Unavailable', green: profile?.available },
                { label: 'Role', value: profile?.title },
                { label: 'Focus', value: 'Full Stack' },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px 16px', background: 'var(--ink)' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: item.green ? '#4ade80' : 'rgba(255,255,255,0.7)', fontWeight: 400 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <section style={{ marginBottom: 'clamp(48px, 8vw, 80px)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>Expertise</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', marginBottom: '16px', fontWeight: 300 }}>{cat}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map(skill => (
                    <div key={skill.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>{skill.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>{skill.proficiency}%</span>
                      </div>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: `${skill.proficiency}%`, background: 'rgba(255,255,255,0.4)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        {experience.length > 0 && (
          <section style={{ marginBottom: 'clamp(48px, 8vw, 80px)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>Experience</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
              {experience.map(exp => (
                <div key={exp.id} style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 28px)', background: 'var(--ink)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(12px, 3vw, 40px)' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: '4px' }}>{exp.company}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
                      {exp.start_date} — {exp.current ? 'Present' : exp.end_date}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 300, color: '#fff', marginBottom: '5px' }}>{exp.role}</h3>
                    {exp.description && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, fontWeight: 300 }}>{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connect */}
        <section>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Connect</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {connectLinks.map(link => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                className="link-hover"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{link.label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>{link.value}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}