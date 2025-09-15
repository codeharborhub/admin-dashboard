/*
  # Comprehensive Admin Dashboard Schema

  1. New Tables
    - `users` - User management with profiles
    - `services` - Service offerings management
    - `testimonials` - Customer testimonials
    - `blog_posts` - Blog/news management
    - `analytics_events` - Track user interactions
    - `notifications` - System notifications
    - `settings` - Application settings

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for admin access
    - Secure data with proper constraints

  3. Sample Data
    - Insert sample data for testing
*/

-- Users table for customer management
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_company text,
  rating integer CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id uuid REFERENCES auth.users(id),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  user_agent text,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for admin access
CREATE POLICY "Admin can manage users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin can manage services" ON services FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin can manage testimonials" ON testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin can manage blog posts" ON blog_posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin can view analytics" ON analytics_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage notifications" ON notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin can manage settings" ON settings FOR ALL TO authenticated USING (true);

-- Public policies for certain data
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Public can view active services" ON services FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT TO anon USING (status = 'approved');

-- Insert sample data
INSERT INTO users (full_name, email, phone, status) VALUES
  ('Rahul Sharma', 'rahul.sharma@email.com', '+91-9876543210', 'active'),
  ('Priya Patel', 'priya.patel@email.com', '+91-9876543211', 'active'),
  ('Amit Kumar', 'amit.kumar@email.com', '+91-9876543212', 'inactive'),
  ('Sneha Singh', 'sneha.singh@email.com', '+91-9876543213', 'active'),
  ('Vikash Gupta', 'vikash.gupta@email.com', '+91-9876543214', 'blocked');

INSERT INTO services (title, description, price, category, features) VALUES
  ('Website Development', 'Complete responsive website development with modern design', 25000.00, 'Web Development', 
   ARRAY['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly']),
  ('Digital Marketing', 'Comprehensive digital marketing strategy and execution', 15000.00, 'Marketing',
   ARRAY['Social Media Marketing', 'Google Ads', 'Content Marketing', 'Analytics']),
  ('E-commerce Solution', 'Full-featured online store with payment integration', 35000.00, 'E-commerce',
   ARRAY['Payment Gateway', 'Inventory Management', 'Order Tracking', 'Admin Panel']),
  ('Mobile App Development', 'Native and cross-platform mobile application development', 45000.00, 'Mobile Development',
   ARRAY['iOS & Android', 'Cross Platform', 'API Integration', 'Push Notifications']);

INSERT INTO testimonials (client_name, client_company, rating, message, status) VALUES
  ('Rajesh Mehta', 'Mehta Enterprises', 5, 'Excellent service! Ajay delivered our website on time and exceeded expectations.', 'approved'),
  ('Sunita Agarwal', 'Agarwal Textiles', 5, 'Professional work and great communication throughout the project.', 'approved'),
  ('Manoj Verma', 'Verma Industries', 4, 'Good quality work, would recommend for digital marketing services.', 'approved'),
  ('Kavita Joshi', 'Joshi Consultancy', 5, 'Amazing results with our e-commerce platform. Sales increased by 200%!', 'pending');

INSERT INTO blog_posts (title, slug, content, excerpt, status, published_at) VALUES
  ('Top 10 Web Development Trends in 2024', 'web-development-trends-2024', 
   'Web development is constantly evolving. Here are the top trends shaping the industry in 2024...', 
   'Discover the latest web development trends that will dominate 2024', 'published', now() - interval '5 days'),
  ('Digital Marketing Strategies for Small Businesses', 'digital-marketing-small-business',
   'Small businesses need effective digital marketing strategies to compete in today''s market...', 
   'Learn effective digital marketing strategies tailored for small businesses', 'published', now() - interval '10 days'),
  ('The Future of E-commerce in India', 'future-ecommerce-india',
   'E-commerce in India is growing rapidly. Let''s explore what the future holds...', 
   'Exploring the future landscape of e-commerce in the Indian market', 'draft', null);

INSERT INTO analytics_events (event_type, event_data) VALUES
  ('page_view', '{"page": "/", "referrer": "google.com"}'),
  ('contact_form_submit', '{"form": "contact", "service": "web_development"}'),
  ('service_inquiry', '{"service": "digital_marketing", "source": "website"}'),
  ('blog_view', '{"post": "web-development-trends-2024", "time_spent": 120}');

INSERT INTO notifications (title, message, type) VALUES
  ('New Contact Submission', 'You have received a new contact form submission from Rahul Sharma', 'info'),
  ('Service Inquiry', 'New inquiry for Digital Marketing services', 'success'),
  ('System Update', 'Dashboard has been updated with new features', 'info'),
  ('Payment Received', 'Payment of ₹25,000 received for Website Development project', 'success');

INSERT INTO settings (key, value, description) VALUES
  ('site_title', '"Ajay Online – Digital Mitra"', 'Website title'),
  ('contact_email', '"ajaydhangar49@gmail.com"', 'Primary contact email'),
  ('phone_number', '"+91-9876543210"', 'Primary phone number'),
  ('business_hours', '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "10:00-16:00", "sunday": "closed"}', 'Business operating hours'),
  ('social_media', '{"facebook": "https://facebook.com/ajayonline", "twitter": "https://twitter.com/ajayonline", "linkedin": "https://linkedin.com/in/ajayonline", "instagram": "https://instagram.com/ajayonline"}', 'Social media links');