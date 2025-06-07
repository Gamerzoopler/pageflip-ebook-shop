
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ebook } from "@/types/database";

export const useEbooks = () => {
  return useQuery({
    queryKey: ['ebooks'],
    queryFn: async () => {
      console.log('Fetching ebooks from Supabase...');
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ebooks:', error);
        throw error;
      }

      console.log('Fetched ebooks:', data);
      return data as Ebook[];
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
