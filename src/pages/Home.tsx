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
        default:
          return 0;
      }
    });
  };

  const sortedProducts = sortProducts(products);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8 animate-slide-up">
            <div className="relative">
              <Package className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Food Explorer
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Discover nutrition facts for thousands of products</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <SearchBar onSearch={setSearchTerm} />
            <BarcodeSearch />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Filters & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <SortMenu sortOption={sortOption} onSortChange={setSortOption} />
        </div>
        
        {/* Stats */}
        {totalProducts > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Card className="p-4 border-border bg-card/50 backdrop-blur-sm">
              <p className="text-center text-muted-foreground">
                Showing <span className="font-bold text-foreground">{products.length}</span> of{' '}
                <span className="font-bold text-foreground">{totalProducts.toLocaleString()}</span> products
              </p>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Package className="h-24 w-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No products found</h2>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product, index) => (
                <div 
                  key={product.code} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index % 12) * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-16">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  size="lg"
                  className="min-w-[200px] relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Products"
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
