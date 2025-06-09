
import { FeaturedBooks } from "@/components/FeaturedBooks";
import { EbookGrid } from "@/components/EbookGrid";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCategories } from "@/hooks/useCategories";
import { useRealtimeDownloads } from "@/hooks/useRealtimeDownloads";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();
  
  // Enable realtime downloads for authenticated users
  useRealtimeDownloads();

  const handleAuthRequired = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Digital Library</h1>
              <p className="text-gray-600 mt-1">Discover amazing ebooks and expand your knowledge</p>
            </div>
            <div className="flex items-center gap-4">
              {!loading && (
                user ? (
                  <UserMenu />
                ) : (
                  <Button onClick={() => setAuthModalOpen(true)}>
                    Sign In
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                All Books
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Featured Books Section */}
        {!selectedCategory && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Books</h2>
            <FeaturedBooks onAuthRequired={handleAuthRequired} />
          </section>
        )}

        {/* All Books Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory ? 'Filtered Books' : 'All Books'}
          </h2>
          <EbookGrid onAuthRequired={handleAuthRequired} />
        </section>
      </main>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
