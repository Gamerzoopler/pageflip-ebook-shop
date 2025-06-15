
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sampleEbooks = [
  {
    title: "The Art of Programming",
    author: "Sarah Johnson",
    description: "A comprehensive guide to modern programming techniques and best practices for software development.",
    price: 29.99,
    cover_image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop",
    category_name: "Technology",
    rating: 4.8,
    pages: 320,
    language: "English",
    is_featured: true
  },
  {
    title: "Digital Marketing Mastery",
    author: "Mark Thompson",
    description: "Learn the latest digital marketing strategies to grow your business and reach your target audience effectively.",
    price: 24.99,
    cover_image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop",
    category_name: "Business",
    rating: 4.6,
    pages: 285,
    language: "English",
    is_featured: false
  },
  {
    title: "Mindful Living",
    author: "Dr. Emily Chen",
    description: "Discover the power of mindfulness and how to incorporate it into your daily life for better mental health.",
    price: 19.99,
    cover_image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
    category_name: "Health",
    rating: 4.9,
    pages: 240,
    language: "English",
    is_featured: true
  },
  {
    title: "The Science of Cooking",
    author: "Chef Roberto Martinez",
    description: "Explore the scientific principles behind cooking and learn how to create amazing dishes with precision.",
    price: 34.99,
    cover_image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop",
    category_name: "Cooking",
    rating: 4.7,
    pages: 350,
    language: "English",
    is_featured: false
  },
  {
    title: "Investment Strategies for Beginners",
    author: "Michael Davis",
    description: "A practical guide to building wealth through smart investment decisions and financial planning.",
    price: 27.99,
    cover_image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
    category_name: "Finance",
    rating: 4.5,
    pages: 290,
    language: "English",
    is_featured: true
  },
  {
    title: "Creative Writing Workshop",
    author: "Lisa Anderson",
    description: "Unlock your creative potential with exercises and techniques to improve your writing skills.",
    price: 22.99,
    cover_image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=600&fit=crop",
    category_name: "Education",
    rating: 4.4,
    pages: 265,
    language: "English",
    is_featured: false
  },
  {
    title: "Home Gardening Guide",
    author: "Tom Wilson",
    description: "Everything you need to know about starting and maintaining a beautiful home garden.",
    price: 18.99,
    cover_image_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop",
    category_name: "Lifestyle",
    rating: 4.3,
    pages: 220,
    language: "English",
    is_featured: false
  },
  {
    title: "Photography Fundamentals",
    author: "Anna Rodriguez",
    description: "Master the basics of photography with this comprehensive guide to composition, lighting, and technique.",
    price: 31.99,
    cover_image_url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=600&fit=crop",
    category_name: "Arts",
    rating: 4.8,
    pages: 310,
    language: "English",
    is_featured: true
  }
];

export const generateSampleEbooks = async () => {
  try {
    console.log('Starting to generate sample ebooks...');
    
    // First, get or create categories
    const categoryMap = new Map();
    
    for (const ebook of sampleEbooks) {
      if (!categoryMap.has(ebook.category_name)) {
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', ebook.category_name)
          .single();
        
        if (existingCategory) {
          categoryMap.set(ebook.category_name, existingCategory.id);
        } else {
          const { data: newCategory, error } = await supabase
            .from('categories')
            .insert({ name: ebook.category_name, description: `Books about ${ebook.category_name.toLowerCase()}` })
            .select('id')
            .single();
          
          if (error) {
            console.error('Error creating category:', error);
            continue;
          }
          
          categoryMap.set(ebook.category_name, newCategory.id);
        }
      }
    }
    
    // Then create ebooks
    for (const ebook of sampleEbooks) {
      const { data: existingEbook } = await supabase
        .from('ebooks')
        .select('id')
        .eq('title', ebook.title)
        .single();
      
      if (!existingEbook) {
        const { error } = await supabase
          .from('ebooks')
          .insert({
            title: ebook.title,
            author: ebook.author,
            description: ebook.description,
            price: ebook.price,
            cover_image_url: ebook.cover_image_url,
            category_id: categoryMap.get(ebook.category_name),
            rating: ebook.rating,
            pages: ebook.pages,
            language: ebook.language,
            is_featured: ebook.is_featured,
            file_url: `https://example.com/files/${ebook.title.replace(/\s+/g, '_').toLowerCase()}.pdf`
          });
        
        if (error) {
          console.error('Error creating ebook:', ebook.title, error);
        } else {
          console.log('Created ebook:', ebook.title);
        }
      }
    }
    
    toast.success('Sample ebooks generated successfully!');
    console.log('Sample ebooks generation completed');
  } catch (error) {
    console.error('Error generating sample ebooks:', error);
    toast.error('Failed to generate sample ebooks');
  }
};
