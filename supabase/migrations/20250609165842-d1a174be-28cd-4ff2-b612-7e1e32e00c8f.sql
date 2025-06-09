
-- Add some additional categories if they don't exist
INSERT INTO categories (name, description) 
VALUES 
  ('Mystery', 'Thrilling mystery and detective stories'),
  ('Romance', 'Love stories and romantic novels'),
  ('Science Fiction', 'Futuristic and sci-fi adventures')
ON CONFLICT DO NOTHING;

-- Create a storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT DO NOTHING;

-- Create storage policies for the ebooks bucket
CREATE POLICY "Anyone can view ebook files" ON storage.objects
FOR SELECT USING (bucket_id = 'ebooks');

CREATE POLICY "Anyone can upload ebook files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ebooks');

CREATE POLICY "Anyone can update ebook files" ON storage.objects
FOR UPDATE USING (bucket_id = 'ebooks');

CREATE POLICY "Anyone can delete ebook files" ON storage.objects
FOR DELETE USING (bucket_id = 'ebooks');

-- Add 3 new books
INSERT INTO ebooks (
  title,
  author,
  description,
  price,
  cover_image_url,
  file_url,
  category_id,
  rating,
  pages,
  language,
  published_date,
  is_featured,
  is_active
) VALUES 
(
  'The Digital Detective',
  'Sarah Mitchell',
  'A gripping mystery set in the digital age where a tech-savvy detective must solve crimes using cutting-edge technology and old-fashioned intuition.',
  12.99,
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
  'https://sexupgaavdaaghqcritf.supabase.co/storage/v1/object/public/ebooks/the-digital-detective.pdf',
  (SELECT id FROM categories WHERE name = 'Mystery' LIMIT 1),
  4.2,
  320,
  'English',
  '2024-02-15',
  true,
  true
),
(
  'Hearts in Bloom',
  'Emily Rose',
  'A heartwarming romance about two unlikely souls who find love in a small-town flower shop during the spring season.',
  8.99,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
  'https://sexupgaavdaaghqcritf.supabase.co/storage/v1/object/public/ebooks/hearts-in-bloom.pdf',
  (SELECT id FROM categories WHERE name = 'Romance' LIMIT 1),
  4.7,
  240,
  'English',
  '2024-03-10',
  false,
  true
),
(
  'Quantum Horizons',
  'Dr. Marcus Chen',
  'An epic science fiction adventure exploring parallel universes, quantum physics, and the infinite possibilities of human consciousness.',
  15.99,
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=400&fit=crop',
  'https://sexupgaavdaaghqcritf.supabase.co/storage/v1/object/public/ebooks/quantum-horizons.pdf',
  (SELECT id FROM categories WHERE name = 'Science Fiction' LIMIT 1),
  4.9,
  450,
  'English',
  '2024-01-20',
  true,
  true
);
