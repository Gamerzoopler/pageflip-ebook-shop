
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDownloads } from "@/hooks/useDownloads";
import { supabase } from "@/integrations/supabase/client";

interface DownloadButtonProps {
  fileUrl: string | null;
  title: string;
  ebookId: string;
  onAuthRequired: () => void;
}

export const DownloadButton = ({ fileUrl, title, ebookId, onAuthRequired }: DownloadButtonProps) => {
  const { user } = useAuth();
  const { trackDownload } = useDownloads();

  const handleDownload = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!fileUrl) {
      toast.error("Download not available");
      return;
    }

    try {
      console.log(`Downloading: ${title}`);
      
      // Track download via edge function
      const { error: trackError } = await supabase.functions.invoke('track-download', {
        body: { ebookId }
      });

      if (trackError) {
        console.error('Error tracking download:', trackError);
        // Continue with download even if tracking fails
      }

      // Also track locally for realtime updates
      trackDownload(ebookId);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading "${title}"`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download file");
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline" 
      size="sm"
      className="w-full"
    >
      <Download className="w-4 h-4 mr-2" />
      {user ? 'Download PDF' : 'Sign in to Download'}
    </Button>
  );
};
