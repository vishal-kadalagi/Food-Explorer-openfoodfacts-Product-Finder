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
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

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

  const sortProducts = (products: Product[]) => {
    return [...products].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return (a.product_name || "").localeCompare(b.product_name || "");
        case "name-desc":
          return (b.product_name || "").localeCompare(a.product_name || "");
        case "grade-asc":
          return (a.nutrition_grades || "z").localeCompare(b.nutrition_grades || "z");
        case "grade-desc":
          return (b.nutrition_grades || "a").localeCompare(a.nutrition_grades || "a");
        case "created-asc":
          return new Date(a.created_t || 0).getTime() - new Date(b.created_t || 0).getTime();
        case "created-desc":
          return new Date(b.created_t || 0).getTime() - new Date(a.created_t || 0).getTime();
        case "popularity":
          // Use completeness as a proxy for popularity since the API doesn't provide a direct popularity field
          return (b.completeness || 0) - (a.completeness || 0);
        default:
          return 0;
      }
    });
  };

  const sortedProducts = sortProducts(products);

  return (
    // Enhanced live animated food background container with multiple themes
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

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen bg-background/20 backdrop-blur-sm">
        {/* Enhanced Header with multi-colored themes */}
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border/30 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-3 animate-slide-up">
              <div className="relative">
                {/* Animated logo with multiple color themes */}
                <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
                  <Package className="h-8 w-8 text-primary animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-md animate-pulse-glow"></div>
                </div>
              </div>
              <div className="flex flex-col">
                {/* Multi-colored animated title with gradient text */}
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
                  Food Explorer
                </h1>
                <p className="text-[10px] text-muted-foreground mt-0.5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  Discover delicious foods with detailed nutritional information
                </p>
              </div>
            </div>
            
            {/* Enhanced search section with animations and colored borders */}
            <div className="grid gap-2 md:grid-cols-2 animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <div className="border border-primary/20 rounded-lg p-0.5 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-sm hover:shadow-md transition-all duration-300">
                <SearchBar onSearch={setSearchTerm} />
              </div>
              <div className="border border-secondary/20 rounded-lg p-0.5 bg-gradient-to-r from-secondary/5 to-accent/5 shadow-sm hover:shadow-md transition-all duration-300">
                <BarcodeSearch />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-4">
          {/* Enhanced Filters & Sort with animations */}
          <div className="flex flex-col md:flex-row gap-2 mb-4 animate-slide-up" style={{ animationDelay: "0.7s" }}>
            <div className="border border-primary/20 rounded-lg p-0.5 bg-gradient-to-r from-primary/5 to-secondary/5 shadow-xs hover:shadow-sm transition-all duration-300 flex-grow">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            <div className="border border-secondary/20 rounded-lg p-0.5 bg-gradient-to-r from-secondary/5 to-accent/5 shadow-xs hover:shadow-sm transition-all duration-300 flex-grow">
              <SortMenu sortOption={sortOption} onSortChange={setSortOption} />
            </div>
          </div>
          
          {/* Enhanced Stats Card */}
          {totalProducts > 0 && (
            <div className="mb-4 animate-slide-up" style={{ animationDelay: "0.9s" }}>
              <Card className="p-2 border-border bg-card/70 backdrop-blur-md shadow-sm rounded-lg border border-primary/20">
                <p className="text-center text-xs text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{products.length}</span> of{' '}
                  <span className="font-bold text-foreground">{totalProducts.toLocaleString()}</span> products
                </p>
              </Card>
            </div>
          )}

          {/* Enhanced Products Grid */}
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
            <>
              {/* Featured products row with enhanced animations */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-6">
                {sortedProducts.slice(0, 6).map((product, index) => (
                  <div 
                    key={product.code} 
                    className="animate-slide-up transform transition-all duration-300 hover:scale-105"
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
                    <span className="text-muted-foreground font-bold text-sm px-3 py-1 bg-card/60 backdrop-blur-md rounded-full border border-border/20 shadow-xs whitespace-nowrap">
                    </span>
                    <Separator className="flex-grow h-px bg-gradient-to-r from-accent/20 via-secondary/20 to-primary/20" />
                  </div>
                
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-6">
                    {sortedProducts.slice(6).map((product, index) => (
                      <div 
                        key={product.code} 
                        className="animate-slide-up transform transition-all duration-300 hover:scale-105"
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

              {/* Enhanced Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-6 mb-6">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    size="sm"
                    className="min-w-[200px] relative overflow-hidden group shadow-md hover:shadow-primary/30 transition-all duration-500 px-4 py-2 text-base font-bold rounded-lg border border-primary/30 hover:border-primary/60 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 hover:from-primary/20 hover:via-secondary/20 hover:to-primary/20 transform hover:scale-105"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 rounded-lg" />
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading More...
                      </>
                    ) : (
                      "Load More Foods"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
