
import { useEbooks } from "@/hooks/useEbooks";
import { EbookCard } from "./EbookCard";
import { PaginationControls } from "./PaginationControls";
import { useEffect, useState } from "react";
import { generateAndUploadSamplePdfs } from "./PdfGenerator";
import { generateSampleEbooks } from "./SampleEbookGenerator";
import { toast } from "sonner";

interface EbookGridProps {
  onAuthRequired: () => void;
  onPurchaseRequired: (ebook: { id: string; title: string; price: number; author: string; }) => void;
  searchTerm?: string;
  selectedCategory?: string;
}

export const EbookGrid = ({ onAuthRequired, onPurchaseRequired, searchTerm, selectedCategory }: EbookGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  
  const { data: ebooksData, isLoading, error } = useEbooks(currentPage, pageSize, searchTerm, selectedCategory);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    // Generate sample content on component mount
    const generateContent = async () => {
      try {
        await generateSampleEbooks();
        await generateAndUploadSamplePdfs();
        console.log('Sample content generated successfully');
      } catch (error) {
        console.error('Error generating content:', error);
        toast.error('Failed to generate sample content');
      }
    };

    generateContent();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
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

  if (!ebooksData || ebooksData.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {searchTerm || selectedCategory ? 'No ebooks found matching your criteria' : 'No ebooks available'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, ebooksData.count)} of {ebooksData.count} books
        </p>
      </div>

      {/* Ebooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ebooksData.data.map((ebook) => (
          <EbookCard 
            key={ebook.id} 
            ebook={ebook} 
            onAuthRequired={onAuthRequired} 
            onPurchaseRequired={onPurchaseRequired}
          />
        ))}
      </div>

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={ebooksData.totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
