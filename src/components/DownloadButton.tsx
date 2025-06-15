
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  
  // Check if temporary access is active (5 minutes from page load)
  const [hasTemporaryAccess, setHasTemporaryAccess] = React.useState(() => {
    const startTime = localStorage.getItem('temporaryAccessStart');
    if (!startTime) {
      localStorage.setItem('temporaryAccessStart', Date.now().toString());
      return true;
    }
    const elapsed = Date.now() - parseInt(startTime);
    return elapsed < 5 * 60 * 1000; // 5 minutes
  });

  React.useEffect(() => {
    const startTime = localStorage.getItem('temporaryAccessStart');
    if (startTime) {
      const timer = setTimeout(() => {
        setHasTemporaryAccess(false);
        localStorage.removeItem('temporaryAccessStart');
        toast.info("Temporary access expired. Purchase required for downloads.");
      }, 5 * 60 * 1000 - (Date.now() - parseInt(startTime)));

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = async () => {
    console.log('Download button clicked', { user, hasTemporaryAccess, fileUrl });
    
    if (!user) {
      console.log('User not authenticated, showing auth modal');
      onAuthRequired();
      return;
    }

    if (!fileUrl) {
      toast.error("Download file not available");
      return;
    }

    // Allow download if temporary access is active
    if (hasTemporaryAccess) {
      console.log('Temporary access active, allowing download');
      toast.success(`Downloading ${title} (Free Access)`);
      
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
        toast.error("Failed to download file");
      }
      return;
    }

    // Regular purchase flow if no temporary access
    console.log('No temporary access, requiring purchase');
    onPurchaseRequired({
      id: ebookId,
      title,
      price,
      author
    });
  };

  const getButtonText = () => {
    if (hasTemporaryAccess) {
      return price > 0 ? `Download Free (Usually $${price.toFixed(2)})` : "Download Free";
    }
    return price > 0 ? `Download - $${price.toFixed(2)}` : "Download";
  };

  const getButtonIcon = () => {
    return hasTemporaryAccess ? Download : (price > 0 ? Lock : Download);
  };

  const ButtonIcon = getButtonIcon();

  return (
    <Button 
      onClick={handleDownload} 
      className={`w-full ${hasTemporaryAccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
      size="sm"
    >
      <ButtonIcon className="w-4 h-4 mr-2" />
      {getButtonText()}
    </Button>
  );
};
