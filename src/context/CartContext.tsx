import React, { useReducer, useContext, useEffect } from "react";
import type { Product } from "@/api/openFoodApi";

export type CartItem = {
  code: string;
  name: string;
  image?: string;
  brand?: string;
  quantity: number;
};

export type Order = {
  id: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  email: string;
};

type State = {
  items: CartItem[];
  orders: Order[];
};

type Action =
  | { type: "initialize"; payload: State }
  | { type: "add"; payload: { product: Product; qty?: number } }
  | { type: "remove"; payload: { code: string } }
  | { type: "update"; payload: { code: string; qty: number } }
  | { type: "clear" }
  | { type: "addOrder"; payload: Order };

const STORAGE_KEY = "food_explorer_cart";
const ORDERS_STORAGE_KEY = "food_explorer_orders";

const initialState: State = { items: [], orders: [] };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "initialize":
      return action.payload;
    case "add": {
      const { product, qty = 1 } = action.payload;
      const existing = state.items.find((i) => i.code === product.code);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.code === product.code ? { ...i, quantity: i.quantity + qty } : i,
          ),
        };
      }

      const item: CartItem = {
        code: product.code,
        name: product.product_name || product.product_name_en || "Unnamed Product",
        image: product.image_url || product.image_front_url || undefined,
        brand: product.brands,
        quantity: qty,
      };

      return { ...state, items: [...state.items, item] };
    }
    case "remove": {
      return { ...state, items: state.items.filter((i) => i.code !== action.payload.code) };
    }
    case "update": {
      return {
        ...state,
        items: state.items.map((i) => (i.code === action.payload.code ? { ...i, quantity: action.payload.qty } : i)),
      };
    }
    case "clear":
      return { ...state, items: [] };
    case "addOrder": {
      const newOrders = [...state.orders, action.payload];
      // Keep only the last 10 orders
      if (newOrders.length > 10) {
        newOrders.shift();
      }
      return { ...state, orders: newOrders };
    }
    default:
      return state;
  }
};

const CartStateContext = React.createContext<State | undefined>(undefined);
const CartDispatchContext = React.createContext<React.Dispatch<Action> | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      // Load cart items
      const raw = localStorage.getItem(STORAGE_KEY);
      const ordersRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
      
      // Load both cart and orders data
      let cartData = { items: [], orders: [] };
      
      if (raw) {
        const parsed = JSON.parse(raw);
        cartData.items = parsed.items || [];
      }
      
      if (ordersRaw) {
        cartData.orders = JSON.parse(ordersRaw) || [];
      }
      
      dispatch({ type: "initialize", payload: cartData });
    } catch (e) {
      console.error("Error loading cart data:", e);
      // Initialize with empty state if there's an error
      dispatch({ type: "initialize", payload: initialState });
    }
  }, []);

  useEffect(() => {
    try {
      // Save cart items
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, orders: state.orders }));
      
      // Save order history
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders));
    } catch (e) {
      console.error("Error saving cart data:", e);
    }
  }, [state]);

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCart = () => {
  const state = useContext(CartStateContext);
  const dispatch = useContext(CartDispatchContext);

  if (!state || !dispatch) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const add = (product: Product, qty = 1) => dispatch({ type: "add", payload: { product, qty } });
  const remove = (code: string) => dispatch({ type: "remove", payload: { code } });
  const update = (code: string, qty: number) => dispatch({ type: "update", payload: { code, qty } });
  const clear = () => dispatch({ type: "clear" });
  const addOrder = (order: Order) => dispatch({ type: "addOrder", payload: order });

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  return { items: state.items, orders: state.orders, add, remove, update, clear, addOrder, totalItems };
};

export default CartProvider;