'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContactMessage } from '@/lib/supabase'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ read: true }).eq('id', id)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    load()
  }

  const unread = messages.filter(m => !m.read).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Messages</h1>
          {unread > 0 && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(200,241,53,0.15)', color: 'var(--accent)', borderRadius: '100px' }}>
              {unread} unread
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>Loading…</p>
      ) : messages.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>No messages yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {messages.map(m => (
            <div key={m.id} style={{
              padding: '20px 24px', border: `1px solid ${m.read ? 'rgba(255,255,255,0.07)' : 'rgba(200,241,53,0.2)'}`,
              borderRadius: '8px', background: m.read ? 'rgba(255,255,255,0.01)' : 'rgba(200,241,53,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{m.name}</span>
                    {!m.read && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(200,241,53,0.15)', color: 'var(--accent)', borderRadius: '3px' }}>New</span>}
                  </div>
                  <a href={`mailto:${m.email}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>{m.email}</a>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '16px' }}>{m.message}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`mailto:${m.email}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', background: 'var(--accent)', color: '#0D0D0D', borderRadius: '4px', fontWeight: 600, textDecoration: 'none' }}>
                  Reply ↗
                </a>
                {!m.read && (
                  <button onClick={() => markRead(m.id)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                    Mark read
                  </button>
                )}
                <button onClick={() => del(m.id)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,100,100,0.5)', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
