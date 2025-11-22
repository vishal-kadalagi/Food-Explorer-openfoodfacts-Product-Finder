import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { UIDrawerProvider } from "@/context/UIDrawerContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CartProvider>
        <UIDrawerProvider>
          <BrowserRouter>
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:barcode" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UIDrawerProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;