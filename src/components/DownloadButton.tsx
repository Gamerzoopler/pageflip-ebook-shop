
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDownloads } from "@/hooks/useDownloads";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface DownloadButtonProps {
  fileUrl: string | null;
  title: string;
  ebookId: string;
  price: number;
  author: string;
  onAuthRequired: () => void;
  onPurchaseRequired: (ebook: { id: string; title: string; price: number; author: string; }) => void;
}

export const DownloadButton = ({ 
  fileUrl, 
  title, 
  ebookId, 
  price, 
  author, 
  onAuthRequired, 
  onPurchaseRequired 
}: DownloadButtonProps) => {
  const { user } = useAuth();
  const { trackDownload } = useDownloads();
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase.functions.invoke('validate-purchase', {
          body: { ebookId }
        });

        if (!error && data?.hasPurchased) {
          setHasPurchased(true);
        }
      } catch (error) {
        console.error('Error checking purchase status:', error);
      }
    };

    checkPurchaseStatus();
  }, [user, ebookId]);

  const handleDownload = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!hasPurchased) {
      onPurchaseRequired({
        id: ebookId,
        title,
        price,
        author
      });
      return;
    }

    if (!fileUrl) {
      toast.error("Download not available");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!user) return 'Sign in to Buy';
    if (hasPurchased) return 'Download';
    return `Buy for $${price.toFixed(2)}`;
  };

  const getButtonIcon = () => {
    if (hasPurchased) return <Download className="w-4 h-4 mr-2" />;
    return <ShoppingCart className="w-4 h-4 mr-2" />;
  };

  return (
    <Button 
      onClick={handleDownload}
      variant={hasPurchased ? "default" : "outline"}
      size="sm"
      className="w-full"
      disabled={loading}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
};
