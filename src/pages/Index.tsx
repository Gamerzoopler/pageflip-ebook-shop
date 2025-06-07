
import { useState } from "react";
import { ShoppingCart, BookOpen, Search, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEbooks, useFeaturedEbooks } from "@/hooks/useEbooks";
import { useCategories } from "@/hooks/useCategories";
import { Ebook } from "@/types/database";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<Ebook[]>([]);
  const { toast } = useToast();

  const { data: allEbooks = [], isLoading: ebooksLoading, error: ebooksError } = useEbooks();
  const { data: featuredEbooks = [], isLoading: featuredLoading } = useFeaturedEbooks();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Create categories list with "All" option
  const categoryOptions = ["All", ...categories.map(cat => cat.name)];

  const filteredBooks = allEbooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || book.categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (book: Ebook) => {
    if (!cartItems.find(item => item.id === book.id)) {
      setCartItems([...cartItems, book]);
      toast({
        title: "Added to cart!",
        description: `"${book.title}" has been added to your cart.`,
      });
    } else {
      toast({
        title: "Already in cart",
        description: `"${book.title}" is already in your cart.`,
        variant: "destructive"
      });
    }
  };

  const removeFromCart = (bookId: string) => {
    setCartItems(cartItems.filter(item => item.id !== bookId));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (ebooksError) {
    console.error('Error loading ebooks:', ebooksError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">BookVault</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartItems.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-6">
              Discover Your Next Great Read
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Explore thousands of digital books across every genre. Download instantly and start reading today.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
              Browse Collection
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Books</h3>
          {featuredLoading ? (
            <div className="text-center">Loading featured books...</div>
          ) : featuredEbooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEbooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={book.cover_image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
                      alt={book.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.is_featured && (
                      <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900">{book.title}</CardTitle>
                    <CardDescription className="text-gray-600">by {book.author}</CardDescription>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{book.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{book.description || 'No description available'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">${book.price}</span>
                      </div>
                      <Badge variant="secondary">{book.categories?.name || 'Uncategorized'}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => addToCart(book)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No featured books available</div>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoriesLoading ? (
            <div className="text-center">Loading categories...</div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryOptions.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="mb-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Books Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Books</h3>
          {ebooksLoading ? (
            <div className="text-center">Loading books...</div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={book.cover_image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
                      alt={book.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-gray-900 line-clamp-2">{book.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">by {book.author}</CardDescription>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{book.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">${book.price}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{book.categories?.name || 'Uncategorized'}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      onClick={() => addToCart(book)}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              {searchTerm || selectedCategory !== "All" ? "No books found matching your criteria" : "No books available"}
            </div>
          )}
        </div>
      </section>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <section className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-xl border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Cart Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{item.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">${item.price}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold">
                  <span>Total: ${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Checkout
              </Button>
            </CardFooter>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-bold">BookVault</span>
              </div>
              <p className="text-gray-400 text-sm">Your premier destination for digital books and ebooks.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Returns</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>My Library</li>
                <li>Profile</li>
                <li>Orders</li>
                <li>Wishlist</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 BookVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
