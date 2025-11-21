import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Search for products..." }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="relative w-full group">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-12 h-14 bg-card/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 text-base backdrop-blur-sm hover:bg-card/80 shadow-sm"
      />
      {searchTerm && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
          Searching...
        </div>
      )}
    </div>
  );
};
