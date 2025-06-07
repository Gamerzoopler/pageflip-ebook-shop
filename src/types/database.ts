
export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string | null;
  price: number;
  cover_image_url: string | null;
  file_url: string | null;
  category_id: string | null;
  rating: number | null;
  pages: number | null;
  language: string | null;
  published_date: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  categories?: Category;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}
