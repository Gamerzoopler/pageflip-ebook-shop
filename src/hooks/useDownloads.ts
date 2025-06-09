
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useDownloads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const downloadsQuery = useQuery({
    queryKey: ['user-downloads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
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
      return data;
    },
    enabled: !!user,
  });

  const trackDownloadMutation = useMutation({
    mutationFn: async (ebookId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
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
