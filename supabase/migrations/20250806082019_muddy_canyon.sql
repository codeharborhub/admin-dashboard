/*
  # Create contacts table for admin dashboard

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `phone` (text, required)
      - `service_needed` (text, required)
      - `message` (text, optional)
      - `created_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `contacts` table
    - Add policy for authenticated users to read all contacts
    - Add policy for public users to insert contacts (for form submissions)
*/

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  service_needed text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all contacts (admin only)
CREATE POLICY "Authenticated users can read all contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for public users to insert contacts (for contact form submissions)
CREATE POLICY "Anyone can insert contacts"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Insert some sample data for testing
INSERT INTO contacts (full_name, phone, service_needed, message) VALUES
  ('John Doe', '+91 98765 43210', 'Web Development', 'Need a business website with modern design'),
  ('Jane Smith', '+91 87654 32109', 'Digital Marketing', 'Looking for SEO and social media marketing services'),
  ('Raj Patel', '+91 76543 21098', 'Mobile App', 'Want to develop an e-commerce mobile application'),
  ('Priya Sharma', '+91 65432 10987', 'Graphic Design', 'Need logo design and branding for startup'),
  ('Alex Johnson', '+91 54321 09876', 'Web Development', 'Require a portfolio website with admin panel');