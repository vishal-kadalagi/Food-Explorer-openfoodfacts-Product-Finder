import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { formatCategoryName } from "@/lib/utils";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) => {
  const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b));
  
  return (
    <div className="relative w-full">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="h-12 bg-card/70 border-border/50 hover:bg-card/90 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm shadow-md rounded-xl font-medium">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary/80 animate-pulse" />
            <SelectValue placeholder="All Categories" />
          </div>
        </SelectTrigger>
        <SelectContent 
          className="bg-popover/95 backdrop-blur-lg border-border/50 z-50 shadow-2xl rounded-xl max-h-60 overflow-y-auto animate-in fade-in-80 duration-300"
        >
          <SelectItem 
            value="all" 
            className="focus:bg-primary/10 py-2 px-3 rounded-lg m-1 transition-all duration-200 hover:bg-primary/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              All Categories
            </div>
          </SelectItem>
          {sortedCategories.map((category) => (
            <SelectItem 
              key={category} 
              value={category} 
              className="capitalize focus:bg-primary/10 py-2 px-3 rounded-lg m-1 transition-all duration-200 hover:bg-primary/20 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                {formatCategoryName(category)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};