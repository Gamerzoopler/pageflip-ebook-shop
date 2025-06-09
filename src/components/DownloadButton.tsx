
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  fileUrl: string | null;
  title: string;
}

export const DownloadButton = ({ fileUrl, title }: DownloadButtonProps) => {
  const handleDownload = async () => {
    if (!fileUrl) {
      toast.error("Download not available");
      return;
    }

    try {
      console.log(`Downloading: ${title}`);
      
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
      Download PDF
    </Button>
  );
};
