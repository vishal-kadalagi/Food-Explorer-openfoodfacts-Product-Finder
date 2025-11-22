import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { BarcodeSearch } from "@/components/BarcodeSearch";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortMenu, SortOption } from "@/components/SortMenu";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  searchProducts,
  getProductsByCategory,
  getCategories,
  Product,
} from "@/api/openFoodApi";
import { Loader2, Package, History, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useUIDrawer } from "@/context/UIDrawerContext";

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { openCart } = useUIDrawer();

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(true);
  }, [searchTerm, selectedCategory]);

  const loadProducts = async (reset: boolean = false, pageParam?: number) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : pageParam ?? page;
      let response;

      if (searchTerm) {
        response = await searchProducts(searchTerm, currentPage);
      } else if (selectedCategory !== "all") {
        response = await getProductsByCategory(selectedCategory, currentPage);
      } else {
        response = await searchProducts("", currentPage);
      }

      const newProducts = response.products || [];
      
      if (reset) {
        setProducts(newProducts);
        setTotalProducts(response.count || 0);
      } else {
        // Remove duplicates based on barcode
        setProducts((prev) => {
          const existingCodes = new Set(prev.map((p) => p.code));
          const uniqueNewProducts = newProducts.filter((p) => !existingCodes.has(p.code));
          return [...prev, ...uniqueNewProducts];
        });
      }

      setHasMore(newProducts.length === 24);
    } catch (error) {
      toast.error("Failed to load products. Please check your connection and try again.");
      console.error(error);
      
      // Set hasMore to false to prevent infinite loading
      if (!reset) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadProducts(false, nextPage);
  };

  // Get sorted products based on sort option
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "name-asc") {
      return (a.product_name || a.product_name_en || "").localeCompare(b.product_name || b.product_name_en || "");
    } else if (sortOption === "name-desc") {
      return (b.product_name || b.product_name_en || "").localeCompare(a.product_name || a.product_name_en || "");
    } else if (sortOption === "grade-asc") {
      return (a.nutrition_grades || "z").localeCompare(b.nutrition_grades || "z");
    } else if (sortOption === "grade-desc") {
      return (b.nutrition_grades || "z").localeCompare(a.nutrition_grades || "z");
    }
    return 0;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* New dynamic food-themed background */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-orange-50 to-red-50"></div>
        
        {/* Food pattern background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 165, 0, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 80% 30%, rgba(76, 175, 80, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 40% 70%, rgba(244, 67, 54, 0.2) 0%, transparent 20%),
                              radial-gradient(circle at 70% 80%, rgba(255, 193, 7, 0.2) 0%, transparent 20%)`,
            backgroundSize: '600px 600px'
          }}></div>
        </div>
        
        {/* Floating food emojis */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={`emoji-${i}`}
              className="absolute animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 15}px`,
                animationDuration: `${Math.random() * 20 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.3,
                transform: `rotate(${Math.random() * 360}deg)`,
                filter: 'blur(0.5px)'
              }}
            >
              {['🍎', '🍕', '🥕', '🍇', '🍌', '🍔', '🍓', '🥝', '🍑', '🍒', '🥥', '🥦', '🥨', '🥞', '🍩'][Math.floor(Math.random() * 15)]
              }
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 min-h-screen bg-background/20 backdrop-blur-sm">
        {/* Header with cart and order history buttons */}
        <header className="bg-card/90 backdrop-blur-lg border-b border-border/30 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
              Food Discoverer
            </h1>
            
            {/* Buttons container */}
            <div className="flex gap-2 items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/orders")}
                className="relative animate-pulse hover:animate-none transition-all duration-300 gap-2"
              >
                <History className="h-5 w-5" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={openCart}
                className="relative gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="container mx-auto px-4 py-6">
          {/* Search and filters - arranged side by side */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBar onSearch={setSearchTerm} />
              </div>
              <div className="flex-1">
                <BarcodeSearch />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
              <SortMenu sortOption={sortOption} onSortChange={setSortOption} />
            </div>
          </div>

          {/* Enhanced Results header with unique design */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
                {searchTerm 
                  ? `Search Results for "${searchTerm}"` 
                  : selectedCategory !== "all" 
                    ? `${selectedCategory} Products` 
                    : "All Products"}
              </h2>
              <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30 shadow-sm animate-fade-in">
              <Package className="h-4 w-4 text-primary animate-bounce" />
              <span className="font-bold text-foreground">{totalProducts.toLocaleString()} products</span>
            </div>
          </div>

          {/* Enhanced Products Grid - Fixed to prevent horizontal scroll */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-base text-muted-foreground font-medium">Loading products...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No products found</h2>
              <p className="text-muted-foreground text-base">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* Featured products row with enhanced animations */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
                {sortedProducts.slice(0, 6).map((product, index) => (
                  <div 
                    key={product.code} 
                    className="animate-slide-up transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      animationDuration: "0.6s"
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              {/* Show remaining products in responsive grid */}
              {sortedProducts.length > 6 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Separator className="flex-grow h-px bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
                    <span className="text-muted-foreground font-bold text-sm px-3 py-1 bg-card/60 backdrop-blur-md rounded-full border border-border/20 shadow-xs whitespace-nowrap animate-pulse">
                      More Products
                    </span>
                    <Separator className="flex-grow h-px bg-gradient-to-r from-accent/20 via-secondary/20 to-primary/20" />
                  </div>
                
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
                    {sortedProducts.slice(6).map((product, index) => (
                      <div 
                        key={product.code} 
                        className="animate-slide-up transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                        style={{ 
                          animationDelay: `${(index % 12) * 0.03}s`,
                          animationDuration: "0.5s"
                        }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Enhanced Load More Button with unique design */}
              {hasMore && (
                <div className="flex justify-center mt-6 mb-6">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    size="lg"
                    className="min-w-[220px] relative overflow-hidden group shadow-lg hover:shadow-primary/40 transition-all duration-500 px-6 py-3 text-lg font-bold rounded-xl border-2 border-primary/50 hover:border-primary bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 hover:from-primary/20 hover:via-secondary/20 hover:to-primary/20 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl" />
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading More...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-5 w-5" />
                        Load More Foods
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;