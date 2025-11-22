import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Trash, Package, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIDrawer } from "@/context/UIDrawerContext";

export const CartDrawer: React.FC = () => {
  const { items, totalItems, remove, update, clear } = useCart();
  const navigate = useNavigate();
  const { isCartOpen, closeCart } = useUIDrawer();

  const subtotalCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    // Close the drawer first
    closeCart();
    // Navigate to checkout after a short delay to ensure drawer closes
    setTimeout(() => {
      navigate("/checkout");
    }, 100);
  };

  const handleViewOrders = () => {
    // Close the drawer first
    closeCart();
    // Navigate to orders page after a short delay to ensure drawer closes
    setTimeout(() => {
      navigate("/orders");
    }, 100);
  };

  return (
    <Drawer open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <DrawerTrigger asChild>
        {/* Hidden trigger - we're using the header button now */}
        <div className="hidden" />
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <div className="flex justify-between items-center">
            <div>
              <DrawerTitle>Your Cart</DrawerTitle>
              <DrawerDescription>Items you added are stored in localStorage</DrawerDescription>
            </div>
            {items.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleViewOrders}
                className="gap-2 animate-pulse hover:animate-none transition-all duration-300"
              >
                <History className="h-4 w-4" />
                Orders
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground">Your cart is empty</div>
          ) : (
            items.map((item) => (
              <Card key={item.code} className="p-3 flex items-center gap-3">
                {item.image ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-muted/10 rounded flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold text-sm">{item.name}</div>
                  {item.brand && <div className="text-[11px] text-muted-foreground">{item.brand}</div>}
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => update(item.code, Math.max(1, item.quantity - 1))}>-</Button>
                    <div className="text-sm font-medium">{item.quantity}</div>
                    <Button size="sm" variant="outline" onClick={() => update(item.code, item.quantity + 1)}>+</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(item.code)} className="ml-auto text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total items</div>
              <div className="text-lg font-bold">{subtotalCount}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => clear()}>Clear</Button>
              <Button 
                onClick={handleCheckout} 
                disabled={items.length === 0}
                className="animate-bounce hover:animate-none transition-all duration-300"
              >
                Checkout
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;