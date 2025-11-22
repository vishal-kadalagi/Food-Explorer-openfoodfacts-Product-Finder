import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductByBarcode, Product } from "@/api/openFoodApi";
// Button already imported earlier; keep single import
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Loader2, Package, Info, AlertTriangle, Leaf, Wheat, Milk, Globe, Minimize, Maximize } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCategoryName } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

const getNutritionGradeBadgeClass = (grade?: string) => {
  if (!grade) return "bg-muted text-muted-foreground";
  const upperGrade = grade.toUpperCase();
  const gradeMap: Record<string, string> = {
    A: "bg-grade-a text-white shadow-xl border-2 border-green-400 animate-pulse-glow",
    B: "bg-grade-b text-white shadow-xl border-2 border-yellow-400",
    C: "bg-grade-c text-white shadow-xl border-2 border-orange-400",
    D: "bg-grade-d text-white shadow-xl border-2 border-red-400",
    E: "bg-grade-e text-white shadow-xl border-2 border-red-700",
  };
  return gradeMap[upperGrade] || "bg-muted text-muted-foreground";
};

const getNutritionGradeDescription = (grade?: string) => {
  if (!grade) return "Unknown";
  const upperGrade = grade.toUpperCase();
  const descriptions: Record<string, string> = {
    A: "Very good nutritional quality",
    B: "Good nutritional quality",
    C: "Average nutritional quality",
    D: "Poor nutritional quality",
    E: "Very poor nutritional quality",
  };
  return descriptions[upperGrade] || "Unknown";
};

const getNovaGroupDescription = (group?: number) => {
  const descriptions: Record<number, { title: string; description: string; color: string }> = {
    1: {
      title: "Unprocessed or minimally processed foods",
      description: "Foods that have not been altered or have been altered as little as possible, such as fresh fruits, vegetables, grains, meat, milk.",
      color: "bg-green-500"
    },
    2: {
      title: "Processed culinary ingredients",
      description: "Substances extracted from group 1 foods or from nature, such as oils, butter, sugar, salt.",
      color: "bg-yellow-500"
    },
    3: {
      title: "Processed foods",
      description: "Products made by adding salt, oil, sugar or other group 2 substances to group 1 foods, such as canned vegetables, fruits in syrup.",
      color: "bg-orange-500"
    },
    4: {
      title: "Ultra-processed food and drink products",
      description: "Products made mostly from substances not usually used in cooking, such as flavors, colors, sweeteners, and other industrial additives.",
      color: "bg-red-500"
    }
  };
  
  return group ? descriptions[group] : null;
};

const getEcoscoreBadgeClass = (grade?: string) => {
  if (!grade) return "bg-muted text-muted-foreground";
  const upperGrade = grade.toUpperCase();
  const gradeMap: Record<string, string> = {
    A: "bg-grade-a text-white shadow-xl border-2 border-green-400 animate-pulse-glow",
    B: "bg-grade-b text-white shadow-xl border-2 border-yellow-400",
    C: "bg-grade-c text-white shadow-xl border-2 border-orange-400",
    D: "bg-grade-d text-white shadow-xl border-2 border-red-400",
    E: "bg-grade-e text-white shadow-xl border-2 border-red-700",
  };
  return gradeMap[upperGrade] || "bg-muted text-muted-foreground";
};

const getDietaryBadges = (product: Product) => {
  const badges = [];
  
  // Vegan check
  if (product.ingredients_text?.toLowerCase().includes('vegan') || 
      product.labels?.toLowerCase().includes('vegan')) {
    badges.push({ icon: Leaf, label: 'Vegan', color: 'bg-green-500' });
  }
  
  // Gluten-free check
  if (product.labels?.toLowerCase().includes('gluten free')) {
    badges.push({ icon: Wheat, label: 'Gluten Free', color: 'bg-amber-500' });
  }
  
  // Dairy-free check
  if (product.allergens?.toLowerCase().includes('milk') === false) {
    badges.push({ icon: Milk, label: 'Dairy Free', color: 'bg-blue-500' });
  }
  
  return badges;
};

const ProductDetailComponent = () => {
  const { barcode } = useParams<{ barcode: string }>();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!barcode) return;

      try {
        setLoading(true);
        const response = await getProductByBarcode(barcode);
        if (response.product) {
          setProduct(response.product);
        } else {
          toast.error("Product not found");
        }
      } catch (error) {
        toast.error("Failed to load product details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [barcode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-20 w-20 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Package className="h-24 w-24 text-muted-foreground mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-foreground mb-4">Product not found</h2>
        <Link to="/">
          <Button className="mt-4 px-6 py-3 text-lg rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105">
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = product.product_name || product.product_name_en || "Unnamed Product";
  const category = formatCategoryName(product.categories?.split(",")[0]?.trim() || "Not specified");
  const labels = product.labels?.split(",").slice(0, 5) || [];
  const countries = product.countries_tags?.slice(0, 3) || [];
  const packaging = product.packaging_tags?.slice(0, 3) || [];
  const additives = product.additives_tags?.slice(0, 10) || [];
  
  // Try multiple image sources as fallbacks
  const imageUrl = product.image_url || product.image_front_url || "";
  
  // Calculate completeness percentage
  const completeness = product.completeness ? Math.round(product.completeness * 100) : 0;
  
  // Get traces information
  const traces = product.traces_tags?.slice(0, 5) || [];
  
  // Get NOVA group information
  const novaGroupInfo = getNovaGroupDescription(product.nova_group);
  
  // Get ecoscore information
  const ecoscoreGrade = product.ecoscore_grade;
  
  // Get allergen information
  const allergens = product.allergens_tags?.slice(0, 10) || [];
  
  // Get dietary badges
  const dietaryBadges = getDietaryBadges(product);
  
  // Check for warnings
  const hasManyAdditives = (product.additives_n || 0) > 10;
  const hasLowNutritionGrade = product.nutrition_grades && ['d', 'e'].includes(product.nutrition_grades.toLowerCase());
  const isUltraProcessed = product.nova_group === 4;

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
        {/* Header */}
        <header className="bg-card/90 backdrop-blur-lg border-b border-border/30 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-lg hover:bg-accent/50 transition-all duration-300 group text-xs animate-slide-up">
                <ArrowLeft className="mr-1 h-3 w-3 group-hover:-translate-x-0.5 transition-transform duration-300" />
                Back to Products
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            {/* Enhanced Product Image with View Button */}
            <div className="relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl animate-slide-up">
              <div className="relative bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className={`w-full object-contain p-4 transition-all duration-700 ${isImageExpanded ? 'h-auto' : 'h-64'} hover:scale-105 cursor-pointer`}
                    onClick={() => setIsImageExpanded(!isImageExpanded)}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package class="h-16 w-16 opacity-20 animate-pulse" />
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                    <Package className="h-16 w-16 opacity-20 animate-pulse" />
                  </div>
                )}
                
                {/* View Button Overlay */}
                <div className="absolute bottom-4 right-4">
                  <Button 
                    onClick={() => setIsImageExpanded(!isImageExpanded)}
                    className="bg-primary/80 hover:bg-primary text-primary-foreground backdrop-blur-sm shadow-lg rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                  >
                    {isImageExpanded ? (
                      <>
                        <Minimize className="h-4 w-4 mr-1" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <Maximize className="h-4 w-4 mr-1" />
                        Expand View
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Animated Barcode Display */}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full border border-primary/20 shadow-sm animate-pulse-glow">
                  <span className="text-sm font-mono font-bold flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-primary animate-pulse"></span>
                    {barcode}
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Product Info */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h1 className="text-3xl font-extrabold text-foreground mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-slide-up">
                  {displayName}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    onClick={() => {
                      try {
                        if (product) {
                          add(product, 1);
                          toast.success("Added to cart");
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    size="sm"
                  >
                    Add to Cart
                  </Button>
                </div>
                {product.brands && (
                  <p className="text-xl font-bold text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>{product.brands}</p>
                )}
                <p className="text-lg text-primary/90 font-bold capitalize mt-2 animate-slide-up" style={{ animationDelay: '0.5s' }}>{category}</p>
              
                {/* Barcode Display */}
                {barcode && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-xl border border-primary/20 shadow-sm animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary animate-bounce" />
                      Barcode Information
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-mono font-bold text-foreground">{barcode}</span>
                      <Badge variant="secondary" className="text-sm font-bold py-1 px-3 rounded-full shadow-sm">
                        EAN / EAN-13
                      </Badge>
                    </div>
                  </div>
                )}
                
                {/* Enhanced Dietary Badges */}
                {dietaryBadges.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4 animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    {dietaryBadges.map((badge, index) => {
                      const Icon = badge.icon;
                      return (
                        <Badge 
                          key={index} 
                          className={`${badge.color} text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-transform duration-300 animate-slide-up transform`}
                          style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{badge.label}</span>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                {/* Enhanced Nutrition Grade */}
                <Card className="border border-border/30 p-3 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-primary animate-bounce" />
                    Nutrition Grade
                  </h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        className={cn(
                          "font-bold text-2xl px-4 py-2 cursor-help flex items-center gap-2 shadow-lg rounded-xl transition-all duration-300 hover:scale-105",
                          getNutritionGradeBadgeClass(product.nutrition_grades)
                        )}
                      >
                        {product.nutrition_grades ? product.nutrition_grades.toUpperCase() : "UNKNOWN"}
                        <Info className="h-4 w-4" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-card border border-primary/30 shadow-lg rounded-xl text-sm font-bold animate-fade-in">
                      <p>
                        {product.nutrition_grades ? (
                          <>
                            {product.nutrition_grades.toUpperCase()} - {getNutritionGradeDescription(product.nutrition_grades)}
                          </>
                        ) : (
                          "No nutrition grade available for this product"
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Card>
              
                {/* Enhanced NOVA Group */}
                {novaGroupInfo && (
                  <Card className="border border-border/30 p-3 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-primary animate-bounce" />
                      Processing Level
                    </h3>
                    <div className="flex items-start gap-2">
                      <div className={`w-3 h-3 rounded-full mt-1 ${novaGroupInfo.color} animate-pulse`}></div>
                      <div>
                        <h4 className="font-bold text-foreground text-lg">Group {product.nova_group}</h4>
                        <p className="text-sm text-muted-foreground">{novaGroupInfo.title}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
              
              {/* Enhanced Ecoscore and Data Completeness */}
              <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.9s' }}>
                {/* Enhanced Ecoscore */}
                {ecoscoreGrade && (
                  <Card className="border border-border/30 p-3 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary animate-bounce" />
                      Eco-score
                    </h3>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          className={cn(
                            "font-bold text-xl px-4 py-2 cursor-help shadow-lg rounded-xl transition-all duration-300 hover:scale-105",
                            getEcoscoreBadgeClass(ecoscoreGrade)
                          )}
                        >
                          {ecoscoreGrade.toUpperCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-card border border-primary/30 shadow-lg rounded-xl text-sm font-bold animate-fade-in">
                        <p>
                          Environmental impact score of the product
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Card>
                )}
              
                {/* Enhanced Data Completeness */}
                <Card className="border border-border/30 p-3 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary animate-bounce" />
                    Data Completeness
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-secondary/30 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out animate-slide-up" 
                        style={{ width: `${completeness}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-foreground min-w-[40px]">{completeness}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
                    {completeness === 100 
                      ? "Complete" 
                      : completeness > 75 
                        ? "Mostly complete" 
                        : completeness > 50 
                          ? "Partially complete" 
                          : "Limited info"}
                  </p>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Enhanced Additional Info Sections */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
            <Separator className="my-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 h-px" />
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Labels */}
              {labels.length > 0 && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {labels.slice(0, 4).map((label, index) => (
                      <Badge key={index} variant="secondary" className="font-medium rounded-full px-3 py-1.5 shadow-sm text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${1.1 + index * 0.1}s` }}>
                        {label.trim()}
                      </Badge>
                    ))}
                    {labels.length > 4 && (
                      <Badge variant="outline" className="font-medium rounded-full px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.4s' }}>
                        +{labels.length - 4}
                      </Badge>
                    )}
                  </div>
                </Card>
              )}
            
              {/* Countries */}
              {countries.length > 0 && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Available In
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {countries.slice(0, 4).map((country, index) => (
                      <Badge key={index} variant="outline" className="font-medium rounded-full px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${1.2 + index * 0.1}s` }}>
                        {country.replace('en:', '').replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {countries.length > 4 && (
                      <Badge variant="outline" className="font-medium rounded-full px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.5s' }}>
                        +{countries.length - 4}
                      </Badge>
                    )}
                  </div>
                </Card>
              )}
            
              {/* Packaging */}
              {packaging.length > 0 && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Packaging
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {packaging.slice(0, 4).map((pkg, index) => (
                      <Badge key={index} variant="outline" className="font-medium rounded-full px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${1.3 + index * 0.1}s` }}>
                        {pkg.replace('en:', '').replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {packaging.length > 4 && (
                      <Badge variant="outline" className="font-medium rounded-full px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.6s' }}>
                        +{packaging.length - 4}
                      </Badge>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
          
          {/* Enhanced Ingredients and Additives Section */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <Separator className="my-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 h-px" />
          
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Enhanced Ingredients */}
              {product.ingredients_text && (
                <Card className="border border-border/30 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                  <div className="bg-primary/10 p-4 border-b border-border/30 rounded-t-xl">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-primary animate-bounce" />
                      Ingredients
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="bg-accent/10 rounded-lg p-4 border border-border/30">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm animate-fade-in">
                        {product.ingredients_text}
                      </p>
                    </div>
                    
                    {/* Enhanced Ingredients Count */}
                    {product.ingredients_n !== undefined && (
                      <div className="mt-4 flex items-center justify-between bg-accent/20 p-3 rounded-xl animate-slide-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '1.3s' }}>
                        <span className="font-semibold text-foreground text-base">Total Ingredients</span>
                        <Badge className="text-xl font-bold px-4 py-2 rounded-xl animate-bounce shadow-lg">
                          {product.ingredients_n}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            
              {/* Enhanced Additives */}
              {additives.length > 0 && (
                <Card className="border border-border/30 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                  <div className="bg-primary/10 p-4 border-b border-border/30 rounded-t-xl">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary animate-bounce" />
                      Additives
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {additives.slice(0, 10).map((additive, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="font-medium rounded-xl px-3 py-1.5 text-sm shadow-sm hover:scale-105 transition-transform duration-300 animate-slide-up"
                          style={{ animationDelay: `${1.4 + index * 0.05}s` }}
                        >
                          {additive.replace('en:', '').toUpperCase()}
                        </Badge>
                      ))}
                      {additives.length > 10 && (
                        <Badge variant="outline" className="font-medium rounded-xl px-3 py-1.5 border text-sm animate-slide-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '1.8s' }}>
                          +{additives.length - 10}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Enhanced Additives Count */}
                    {product.additives_n !== undefined && (
                      <div className="mt-4 flex items-center justify-between bg-accent/20 p-3 rounded-xl animate-slide-up hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '1.5s' }}>
                        <span className="font-semibold text-foreground text-base">Total Additives</span>
                        <Badge 
                          className={cn(
                            "text-xl font-bold px-4 py-2 rounded-xl animate-bounce shadow-lg",
                            product.additives_n > 10 ? "bg-destructive hover:bg-destructive/90" : ""
                          )}
                        >
                          {product.additives_n}
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
          
          {/* Enhanced Nutrition Facts Section */}
          {product.nutriments && (
            <div className="mt-8 animate-fade-in" style={{ animationDelay: '1.6s' }}>
              <Separator className="my-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 h-px" />
            
              <Card className="border border-border/30 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up">
                <div className="bg-primary/10 p-4 border-b border-border/30 rounded-t-xl">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary animate-bounce" />
                    Nutrition Facts (per 100g)
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.nutriments)
                      .filter(([key]) => {
                        // Filter out unit and serving size entries
                        return !key.endsWith('_unit') && 
                               !key.endsWith('_serving') && 
                               !key.includes('nutrition-score') &&
                               typeof product.nutriments![key] === 'number';
                      })
                      .map(([key, value], index) => {
                        // Format the key to be more readable
                        const formattedKey = key
                          .replace(/_/g, ' ')
                          .replace('100g', '')
                          .trim()
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ');
                        
                        // Get unit based on key
                        let unit = 'g';
                        if (key.includes('energy')) {
                          unit = 'kJ';
                        } else if (key.includes('kcal')) {
                          unit = 'kcal';
                        }
                        
                        // Skip if value is not a number
                        if (typeof value !== 'number') return null;
                        
                        return (
                          <div 
                            key={key} 
                            className="flex justify-between items-center p-3 bg-accent/10 rounded-lg border border-border/30 hover:bg-accent/20 transition-all duration-300 animate-slide-up hover:scale-[1.02]"
                            style={{ animationDelay: `${1.7 + index * 0.03}s` }}
                          >
                            <span className="font-semibold text-card-foreground text-sm">{formattedKey}</span>
                            <span className="font-bold text-primary text-sm">
                              {value} {unit}
                            </span>
                          </div>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {/* Enhanced Additional Information Cards */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '1.8s' }}>
            <Separator className="my-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 h-px" />
          
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Serving Size */}
              {product.serving_size && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                  <h4 className="font-bold text-foreground mb-2 text-sm">Serving Size</h4>
                  <p className="text-2xl font-bold text-primary animate-bounce">{product.serving_size}</p>
                  <p className="text-xs text-muted-foreground mt-1">Per serving</p>
                </Card>
              )}
            
              {/* Quantity */}
              {product.quantity && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                  <h4 className="font-bold text-foreground mb-2 text-sm">Quantity</h4>
                  <p className="text-2xl font-bold text-primary animate-bounce">{product.quantity}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total product</p>
                </Card>
              )}
            
              {/* Ingredients Count */}
              {product.ingredients_n !== undefined && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                  <h4 className="font-bold text-foreground mb-2 text-sm">Ingredients</h4>
                  <p className="text-2xl font-bold text-primary animate-bounce">{product.ingredients_n}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total ingredients</p>
                </Card>
              )}
            
              {/* Additives Count */}
              {product.additives_n !== undefined && (
                <Card className="border border-border/30 p-4 rounded-xl shadow-sm bg-gradient-to-br from-card to-accent/5 backdrop-blur-sm text-center transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                  <h4 className="font-bold text-foreground mb-2 text-sm">Additives</h4>
                  <p className="text-2xl font-bold text-primary animate-bounce">{product.additives_n}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total additives</p>
                </Card>
              )}
            </div>
          </div>
          
          {/* Enhanced Warnings */}
          {(hasManyAdditives || hasLowNutritionGrade || isUltraProcessed) && (
            <div className="mt-8 animate-fade-in" style={{ animationDelay: '2s' }}>
              <Separator className="my-6 bg-gradient-to-r from-destructive/20 via-warning/20 to-destructive/20 h-px" />
              <div className="mt-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive animate-bounce" />
                  Health Warnings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hasManyAdditives && (
                    <Card className="border border-destructive/30 bg-destructive/5 p-4 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                      <h4 className="font-bold text-destructive flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Many Additives
                      </h4>
                      <p className="text-muted-foreground mt-2 text-base animate-fade-in">
                        This product contains {(product.additives_n || 0)} additives.
                      </p>
                    </Card>
                  )}
                
                  {hasLowNutritionGrade && (
                    <Card className="border border-destructive/30 bg-destructive/5 p-4 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                      <h4 className="font-bold text-destructive flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Low Nutrition Quality
                      </h4>
                      <p className="text-muted-foreground mt-2 text-base animate-fade-in">
                        This product has a {product.nutrition_grades?.toUpperCase()} nutrition grade.
                      </p>
                    </Card>
                  )}
                
                  {isUltraProcessed && (
                    <Card className="border border-destructive/30 bg-destructive/5 p-4 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 animate-slide-up hover:scale-[1.02]">
                      <h4 className="font-bold text-destructive flex items-center gap-2 text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        Ultra-Processed
                      </h4>
                      <p className="text-muted-foreground mt-2 text-base animate-fade-in">
                        This product is ultra-processed (NOVA group 4).
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ProductDetail = () => (
  <TooltipProvider>
    <ProductDetailComponent />
  </TooltipProvider>
);

export default ProductDetail;