import React, { createContext, useContext, useState } from "react";

type UIDrawerContextType = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const UIDrawerContext = createContext<UIDrawerContextType | undefined>(undefined);

export const UIDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <UIDrawerContext.Provider value={{ isCartOpen, openCart, closeCart }}>
      {children}
    </UIDrawerContext.Provider>
  );
};

export const useUIDrawer = () => {
  const context = useContext(UIDrawerContext);
  if (!context) {
    throw new Error("useUIDrawer must be used within a UIDrawerProvider");
  }
  return context;
};