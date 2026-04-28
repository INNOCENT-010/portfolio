import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

export type MediaItem = {
  url: string
  type: 'image' | 'video'
  name: string
}

export type Project = {
  id: string
  title: string
  description: string
  long_description?: string
  tech_stack: string[]
  github_url?: string
  live_url?: string
  image_url?: string
  media: MediaItem[]
  featured: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export type Skill = {
  id: string
  name: string
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Other'
  proficiency: number
  order_index: number
}

export type Experience = {
  id: string
  company: string
  role: string
  start_date: string
  end_date?: string
  current: boolean
  description?: string
  tech_stack: string[]
  order_index: number
}

export type Profile = {
  id: string
  name: string
  title: string
  bio?: string
  email?: string
  github_url?: string
  linkedin_url?: string
  whatsapp?: string
  phone?: string
  location?: string
  available: boolean
  hero_image_url?: string
  profile_image_url?: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  read: boolean
  created_at: string
}