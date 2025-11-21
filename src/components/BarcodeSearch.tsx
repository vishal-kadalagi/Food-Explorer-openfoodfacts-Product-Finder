import { Barcode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const BarcodeSearch = () => {
  const [barcode, setBarcode] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (barcode.trim()) {
      navigate(`/product/${barcode}`);
    } else {
      toast.error("Please enter a barcode");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-3 w-full group">
      <div className="relative flex-1">
        <Barcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
        <Input
          type="text"
          placeholder="Enter barcode..."
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-12 h-14 bg-card/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-all duration-300 text-base backdrop-blur-sm hover:bg-card/80 shadow-sm"
        />
      </div>
      <Button 
        onClick={handleSearch} 
        className="h-14 px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/20 to-primary-foreground/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <Search className="h-5 w-5 relative z-10" />
      </Button>
    </div>
  );
};
