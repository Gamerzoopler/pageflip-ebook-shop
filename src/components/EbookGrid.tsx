
import { useEbooks } from "@/hooks/useEbooks";
import { EbookCard } from "./EbookCard";
import { useEffect } from "react";
import { generateAndUploadSamplePdfs } from "./PdfGenerator";
import { toast } from "sonner";

interface EbookGridProps {
  onAuthRequired: () => void;
  onPurchaseRequired: (ebook: { id: string; title: string; price: number; author: string; }) => void;
}

export const EbookGrid = ({ onAuthRequired, onPurchaseRequired }: EbookGridProps) => {
  const { data: ebooks, isLoading, error } = useEbooks();

  useEffect(() => {
    // Generate and upload sample PDFs on component mount
    const uploadPdfs = async () => {
      try {
        await generateAndUploadSamplePdfs();
        console.log('Sample PDFs generated and uploaded successfully');
      } catch (error) {
        console.error('Error generating PDFs:', error);
        toast.error('Failed to generate sample PDFs');
      }
    };

    uploadPdfs();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading ebooks: {error.message}</p>
      </div>
    );
  }

  if (!ebooks || ebooks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No ebooks available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ebooks.map((ebook) => (
        <EbookCard 
          key={ebook.id} 
          ebook={ebook} 
          onAuthRequired={onAuthRequired} 
          onPurchaseRequired={onPurchaseRequired}
        />
      ))}
    </div>
  );
};
