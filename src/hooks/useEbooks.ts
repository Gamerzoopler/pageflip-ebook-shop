
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ebook } from "@/types/database";

export const useEbooks = (page: number = 1, pageSize: number = 12, searchTerm?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['ebooks', page, pageSize, searchTerm, categoryId],
    queryFn: async () => {
      console.log('Fetching ebooks from Supabase...', { page, pageSize, searchTerm, categoryId });
      
      let query = supabase
        .from('ebooks')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `, { count: 'exact' })
        .eq('is_active', true);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching ebooks:', error);
        throw error;
      }

      console.log('Fetched ebooks:', data);
      return {
        data: data as Ebook[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
};

export const useFeaturedEbooks = () => {
  return useQuery({
    queryKey: ['featured-ebooks'],
    queryFn: async () => {
      console.log('Fetching featured ebooks from Supabase...');
      const { data, error } = await supabase
        .from('ebooks')
        .select(`
          *,
          categories (
            id,
            name,
            description
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured ebooks:', error);
        throw error;
      }

      console.log('Fetched featured ebooks:', data);
      return data as Ebook[];
    },
  });
};
