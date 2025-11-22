import { Product } from "@/api/openFoodApi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn, formatCategoryName, truncateText } from "@/lib/utils";
import { Package, Leaf, Wheat, Milk, Star, Flame } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const getNutritionGradeBadgeClass = (grade?: string) => {
  if (!grade) return "bg-muted text-muted-foreground";
  const upperGrade = grade.toUpperCase();
  const gradeMap: Record<string, string> = {
    A: "bg-grade-a text-white shadow-md shadow-green-500/30 border border-green-400",
    B: "bg-grade-b text-white shadow-md shadow-yellow-500/30 border border-yellow-400",
    C: "bg-grade-c text-white shadow-md shadow-orange-500/30 border border-orange-400",
    D: "bg-grade-d text-white shadow-md shadow-red-500/30 border border-red-400",
    E: "bg-grade-e text-white shadow-md shadow-red-700/30 border border-red-700",
  };
  return gradeMap[upperGrade] || "bg-muted text-muted-foreground";
};

const getDietaryIcons = (product: Product) => {
  const icons = [];
  
  // Vegan check
  if (product.ingredients_text?.toLowerCase().includes('vegan') || 
      product.labels?.toLowerCase().includes('vegan')) {
    icons.push({ icon: Leaf, label: 'Vegan' });
  }
  
  // Gluten-free check
  if (product.labels?.toLowerCase().includes('gluten free')) {
    icons.push({ icon: Wheat, label: 'Gluten Free' });
  }
  
  // Dairy-free check
  if (product.allergens?.toLowerCase().includes('milk') === false) {
    icons.push({ icon: Milk, label: 'Dairy Free' });
  }
  
  return icons;
};

const getAllergenWarnings = (product: Product) => {
  const warnings = [];
  
  if (product.allergens_tags?.includes('en:milk')) {
    warnings.push('Milk');
  }
  
  if (product.allergens_tags?.includes('en:gluten')) {
    warnings.push('Gluten');
  }
  
  if (product.allergens_tags?.includes('en:nuts')) {
    warnings.push('Nuts');
  }
  
  if (product.allergens_tags?.includes('en:soybeans')) {
    warnings.push('Soy');
  }
  
  if (product.allergens_tags?.includes('en:eggs')) {
    warnings.push('Eggs');
  }
  
  return warnings;
};

// New function to get product highlights
const getProductHighlights = (product: Product) => {
  const highlights = [];
  
  if (product.nutriments?.energy_100g !== undefined) {
    highlights.push({
      icon: Flame,
      label: `${Math.round(product.nutriments.energy_100g)} kJ`,
      type: 'energy'
    });
  }
  
  if (product.additives_n && product.additives_n > 0) {
    highlights.push({
      icon: Star,
      label: `${product.additives_n} additives`,
      type: 'additives'
    });
  }
  
  return highlights;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { add } = useCart();
  const displayName = truncateText(product.product_name || product.product_name_en || "Unnamed Product", 30);
  const category = formatCategoryName(product.categories?.split(",")[0]?.trim() || "Not specified");
  const ingredientsText = product.ingredients_text || "No ingredients listed";
  const ingredients = truncateText(ingredientsText, 60);
  const brands = truncateText(product.brands || "Brand not specified", 25);
  const quantity = product.quantity || "";
  const dietaryIcons = getDietaryIcons(product);
  const allergenWarnings = getAllergenWarnings(product);
  const highlights = getProductHighlights(product);
  
  // Try multiple image sources as fallbacks
  const imageUrl = product.image_url || product.image_front_url || "";

  return (
    <Link to={`/product/${product.code}`} className="block h-full group relative">
      <Card className="relative overflow-hidden border border-border/50 hover:border-primary/70 bg-card h-full transition-all duration-300 hover:shadow-md hover:shadow-primary/20 cursor-pointer transform hover:-translate-y-0.5 rounded-lg backdrop-blur-sm bg-gradient-to-br from-card to-accent/5 animate-slide-up">
        {/* Product Image Section */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out"
              loading="lazy"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Package class="h-5 w-5 opacity-20" />
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="h-5 w-5 opacity-20" />
            </div>
          )}
          
          {/* Nutrition Grade Badge */}
          <Badge
            className={cn(
              "absolute top-1 right-1 font-bold text-[9px] px-1 py-0.5 shadow-sm backdrop-blur-sm transition-all duration-300",
              getNutritionGradeBadgeClass(product.nutrition_grades)
            )}
          >
            {product.nutrition_grades ? product.nutrition_grades.toUpperCase() : "?"}
          </Badge>
          
          {/* Quick Highlights */}
          {highlights.length > 0 && (
            <div className="absolute bottom-1 left-1 flex gap-1">
              {highlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-1 py-0.5 rounded-full text-[8px] font-medium border border-border/30 shadow-xs"
                  >
                    <Icon className="h-1.5 w-1.5" />
                    <span>{highlight.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Product Info Section */}
        <div className="relative p-2 space-y-1">
          {/* Product Name */}
          <h3 className="font-bold text-xs line-clamp-1 text-card-foreground group-hover:text-primary transition-colors duration-300">
            {displayName}
          </h3>
          
          {/* Category */}
          <p className="text-[9px] font-semibold text-primary/70 uppercase tracking-wide">{category}</p>
          
          {/* Ingredients Preview */}
          <p className="text-[9px] text-muted-foreground/80 line-clamp-2 leading-tight">{ingredients}</p>
          
          {/* Brand and Quantity */}
          <div className="flex justify-between items-center pt-0.5">
            <p className="text-[9px] font-medium text-card-foreground truncate">{brands}</p>
            {quantity && (
              <Badge variant="outline" className="text-[8px] px-1 py-0">
                {quantity}
              </Badge>
            )}
          </div>
          
          {/* Barcode Display */}
          {product.code && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[8px] font-mono text-muted-foreground truncate">{product.code}</span>
              <Badge variant="secondary" className="text-[7px] px-1 py-0 rounded-full">
                EAN
              </Badge>
            </div>
          )}
          
          {/* Dietary Icons */}
          {dietaryIcons.length > 0 && (
            <div className="flex gap-1 pt-0.5">
              {dietaryIcons.map((dietary, index) => {
                const Icon = dietary.icon;
                return (
                  <div key={index} className="flex items-center gap-1 bg-accent/30 px-1 py-0.5 rounded-full border border-border/30">
                    <Icon className="h-2 w-2 text-primary" />
                    <span className="text-[8px] font-medium">{dietary.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Allergen Warnings */}
          {allergenWarnings.length > 0 && (
            <div className="flex flex-wrap gap-0.5 pt-0.5">
              {allergenWarnings.slice(0, 1).map((warning, index) => (
                <Badge key={index} variant="destructive" className="text-[8px] py-0 px-1 rounded-full">
                  {warning}
                </Badge>
              ))}
              {allergenWarnings.length > 1 && (
                <Badge variant="outline" className="text-[8px] py-0 px-1 rounded-full border-destructive/30 text-destructive">
                  +{allergenWarnings.length - 1}
                </Badge>
              )}
            </div>
          )}
        </div>
        {/* Add to cart button positioned over card - stop propagation to avoid navigating */}
        <div className="absolute top-2 left-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                add(product, 1);
                toast.success("Added to cart");
              } catch (err) {
                /* noop */
              }
            }}
          >
            {/* This button will be wired in below via hook */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </Card>
    </Link>
  );
};