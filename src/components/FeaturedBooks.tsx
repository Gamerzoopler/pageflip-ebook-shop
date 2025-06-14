
import { useFeaturedEbooks } from "@/hooks/useEbooks";
import { EbookCard } from "./EbookCard";

interface FeaturedBooksProps {
  onAuthRequired: () => void;
  onPurchaseRequired: (ebook: { id: string; title: string; price: number; author: string; }) => void;
}

export const FeaturedBooks = ({ onAuthRequired, onPurchaseRequired }: FeaturedBooksProps) => {
  const { data: featuredBooks, isLoading, error } = useFeaturedEbooks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading featured books: {error.message}</p>
      </div>
    );
  }

  if (!featuredBooks || featuredBooks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No featured books available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredBooks.map((ebook) => (
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
