-- ============================================================
-- INNOCENTDEV SUPABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  tech_stack text[] DEFAULT '{}',
  github_url text,
  live_url text,
  image_url text,
  featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Frontend', 'Backend', 'DevOps', 'Other')),
  proficiency integer DEFAULT 80 CHECK (proficiency BETWEEN 0 AND 100),
  order_index integer DEFAULT 0
);

-- Work experience table
CREATE TABLE IF NOT EXISTS experience (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company text NOT NULL,
  role text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  current boolean DEFAULT false,
  description text,
  tech_stack text[] DEFAULT '{}',
  order_index integer DEFAULT 0
);

-- Profile / about me (single row)
CREATE TABLE IF NOT EXISTS profile (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Amaechi Innocent',
  title text NOT NULL DEFAULT 'Full Stack Developer',
  bio text,
  email text,
  github_url text,
  linkedin_url text,
  location text,
  available boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read on portfolio data
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public can read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public can read experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Public can read profile" ON profile FOR SELECT USING (true);

-- Public insert on contact messages
CREATE POLICY "Public can send messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- Admin full access (uses service role key on server)
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin full access skills" ON skills FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin full access experience" ON experience FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin full access profile" ON profile FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin can read messages" ON contact_messages FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Admin can update messages" ON contact_messages FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO profile (name, title, bio, email, github_url, linkedin_url, location, available) VALUES (
  'Amaechi Innocent',
  'Full Stack Developer',
  'Hi there, I''m Innocent. Full-stack Developer. Currently I''m learning, building better versions and living my journey in tech. My expertise spans from frontend development with React/Next.js to backend systems with Python and Node.js. I focus on building scalable, maintainable applications with clean architecture and best practices.',
  'innorh45@gmail.com',
  'https://github.com/INNOCENT-010',
  'https://www.linkedin.com/in/innocent-amaechi-006b973a6/',
  'Remote / Global',
  true
);

INSERT INTO skills (name, category, proficiency, order_index) VALUES
  ('Next.js', 'Frontend', 90, 1),
  ('React', 'Frontend', 88, 2),
  ('TypeScript', 'Frontend', 82, 3),
  ('Tailwind CSS', 'Frontend', 85, 4),
  ('Python', 'Backend', 85, 5),
  ('Node.js', 'Backend', 80, 6),
  ('FastAPI', 'Backend', 78, 7),
  ('Supabase', 'Backend', 82, 8),
  ('Docker', 'DevOps', 72, 9),
  ('AWS', 'DevOps', 70, 10),
  ('CI/CD', 'DevOps', 68, 11);

INSERT INTO projects (title, description, long_description, tech_stack, github_url, live_url, featured, order_index) VALUES
  (
    'Portfolio Website',
    'Personal developer portfolio built with Next.js and Supabase, featuring a dynamic admin panel and clean modern design.',
    'A full-stack portfolio website with a Supabase-powered backend, admin panel for content management, and a fast Next.js frontend deployed on Vercel.',
    ARRAY['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    'https://github.com/INNOCENT-010/innocentdev',
    'https://innocentdev-omega.vercel.app',
    true,
    1
  ),
  (
    'Sample Project',
    'Add your projects via the admin panel at /admin — this is a placeholder you can delete.',
    'Use the admin panel to manage your real projects.',
    ARRAY['React', 'Node.js', 'PostgreSQL'],
    NULL,
    NULL,
    false,
    2
  );
