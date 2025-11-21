import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "name-asc" | "name-desc" | "grade-asc" | "grade-desc" | "created-asc" | "created-desc" | "popularity";

interface SortMenuProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const SortMenu = ({ sortOption, onSortChange }: SortMenuProps) => {
  // Function to format sort option names for better display
  const formatSortOption = (option: SortOption) => {
    switch (option) {
      case "name-asc": return "Name (A-Z)";
      case "name-desc": return "Name (Z-A)";
      case "grade-asc": return "Grade (A → E)";
      case "grade-desc": return "Grade (E → A)";
      case "created-asc": return "Oldest First";
      case "created-desc": return "Newest First";
      case "popularity": return "Most Popular";
      default: return option;
    }
  };
  
  const sortOptions: SortOption[] = [
    "name-asc",
    "name-desc",
    "grade-asc",
    "grade-desc",
    "created-asc",
    "created-desc",
    "popularity"
  ];
  
  return (
    <div className="relative w-full">
      <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="h-12 bg-card/70 border-border/50 hover:bg-card/90 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm shadow-md rounded-xl font-medium">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-primary/80 animate-pulse" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent 
          className="bg-popover/95 backdrop-blur-lg border-border/50 z-50 shadow-2xl rounded-xl max-h-60 overflow-y-auto animate-in fade-in-80 duration-300"
        >
          {sortOptions.map((option) => (
            <SelectItem 
              key={option} 
              value={option} 
              className="focus:bg-primary/10 py-2 px-3 rounded-lg m-1 transition-all duration-200 hover:bg-primary/20 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                {formatSortOption(option)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};