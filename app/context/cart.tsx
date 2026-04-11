"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

export type CartItem = {
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number | null; // null = LBP price only
  priceLbp: number | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "UPDATE_QTY"; restaurantId: string; name: string; qty: number }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const idx = state.items.findIndex(
        (i) =>
          i.restaurantId === action.item.restaurantId &&
          i.name === action.item.name,
      );
      if (idx >= 0) {
        const updated = [...state.items];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return { ...state, items: updated };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }],
      };
    }
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) =>
              !(
                i.restaurantId === action.restaurantId &&
                i.name === action.name
              ),
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.restaurantId === action.restaurantId && i.name === action.name
            ? { ...i, quantity: action.qty }
            : i,
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQty: (restaurantId: string, name: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("anfeh-cart");
      if (saved) {
        dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("anfeh-cart", JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce(
    (s, i) => s + (i.price ?? 0) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        addItem: (item) => dispatch({ type: "ADD", item }),
        updateQty: (restaurantId, name, qty) =>
          dispatch({ type: "UPDATE_QTY", restaurantId, name, qty }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        openCart: () => dispatch({ type: "OPEN" }),
        closeCart: () => dispatch({ type: "CLOSE" }),
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
