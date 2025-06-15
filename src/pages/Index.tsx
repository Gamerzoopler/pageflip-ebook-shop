import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { UserMenu } from "@/components/auth/UserMenu";
import { FeaturedBooks } from "@/components/FeaturedBooks";
import { EbookGrid } from "@/components/EbookGrid";
import { PaymentModal } from "@/components/PaymentModal";
import { TemporaryAccess } from "@/components/TemporaryAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { Search, BookOpen, Users, Award, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<{
    id: string;
    title: string;
    price: number;
    author: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showTemporaryAccess, setShowTemporaryAccess] = useState(true);
  
  const { data: categories } = useCategories();

  useEffect(() => {
    // Show welcome message for temporary access
    toast.success("🎉 You have 5 minutes of free access to all ebooks!", {
      duration: 5000,
    });
  }, []);

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  const handlePurchaseRequired = (ebook: { id: string; title: string; price: number; author: string; }) => {
    setSelectedEbook(ebook);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedEbook(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleAccessExpired = () => {
    setShowTemporaryAccess(false);
    toast.info("Free access period has ended. Purchase required for downloads.");
  };

  return (
    <div className="min-h-screen bg-background">
      {showTemporaryAccess && (
        <TemporaryAccess onAccessExpired={handleAccessExpired}>
          <></>
        </TemporaryAccess>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Digital Library</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <Link to="/downloads">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    My Downloads
                  </Button>
                </Link>
              )}
              
              {user ? (
                <UserMenu />
              ) : (
                <Button onClick={() => setIsAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Explore thousands of digital books across all genres. Download instantly and read anywhere.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for books, authors, or genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg border-0 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300"
                />
              </div>
            </form>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge
              variant={selectedCategory === "" ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory("")}
            >
              All Categories
            </Badge>
            {categories?.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">10,000+</span>
              </div>
              <p className="text-lg">Books Available</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">50,000+</span>
              </div>
              <p className="text-lg">Happy Readers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 mr-2" />
                <span className="text-3xl font-bold">500+</span>
              </div>
              <p className="text-lg">Award Winners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Books
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the best books across all genres
            </p>
          </div>
          
          <FeaturedBooks 
            onAuthRequired={handleAuthRequired}
            onPurchaseRequired={handlePurchaseRequired}
          />
        </div>
      </section>

      {/* All Books */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse All Books
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our complete collection of digital books
            </p>
          </div>
          
          <EbookGrid 
            onAuthRequired={handleAuthRequired}
            onPurchaseRequired={handlePurchaseRequired}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="text-xl font-bold">Digital Library</span>
              </div>
              <p className="text-gray-400">
                Your gateway to unlimited digital reading. Discover, download, and enjoy books anytime, anywhere.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Books</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Releases</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Social Media</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reviews</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 Digital Library. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      {selectedEbook && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          ebook={selectedEbook}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Index;
