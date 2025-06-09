
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserDownload {
  id: string;
  user_id: string;
  ebook_id: string;
  downloaded_at: string;
  ebooks?: {
    id: string;
    title: string;
    author: string;
    cover_image_url: string | null;
    file_url: string | null;
  };
}

export const useDownloads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const downloadsQuery = useQuery({
    queryKey: ['user-downloads', user?.id],
    queryFn: async (): Promise<UserDownload[]> => {
      if (!user) return [];
      
      // Use any type temporarily until database types are updated
      const { data, error } = await (supabase as any)
        .from('user_downloads')
        .select(`
          *,
          ebooks (
            id,
            title,
            author,
            cover_image_url,
            file_url
          )
        `)
        .eq('user_id', user.id)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const trackDownloadMutation = useMutation({
    mutationFn: async (ebookId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Use any type temporarily until database types are updated
      const { error } = await (supabase as any)
        .from('user_downloads')
        .upsert({
          user_id: user.id,
          ebook_id: ebookId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-downloads'] });
    },
    onError: (error) => {
      console.error('Error tracking download:', error);
    },
  });

  return {
    downloads: downloadsQuery.data || [],
    isLoading: downloadsQuery.isLoading,
    trackDownload: trackDownloadMutation.mutate,
  };
};
