import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const BUY_NOW_STORAGE_KEY = "buyNow_item";

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const getItemKey = (itemId) => `${itemId}`;

  // ── Derive a stable storage key per user ──────────────────────────
  // - Logged in  → "cart_<userId>"   (each user gets their own cart)
  // - Guest      → "cart_guest"      (shared guest cart)
  // We wait until auth is done loading before reading from storage
  const getCartKey = (u) => u ? `cart_${u._id || u.id}` : "cart_guest";

  // Track the last loaded key so we know when to reload
  const loadedKeyRef = useRef(null);

  const [cartItems, setCartItems] = useState([]);
  const [buyNowItem, setBuyNowItem] = useState(null);

  // ── Load cart whenever the user changes (login / logout / refresh) ─
  useEffect(() => {
    // Wait for auth to finish resolving — avoids loading guest cart then immediately
    // replacing it with the user cart, which would cause a flicker
    if (authLoading) return;

    const key = getCartKey(user);

    // Skip if we already loaded for this key (prevents unnecessary re-reads)
    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;

    try {
      const stored = localStorage.getItem(key);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
  }, [user, authLoading]);

  // ── Persist cart to localStorage on every change ──────────────────
  useEffect(() => {
    // Don't write while auth is still loading — key isn't stable yet
    if (authLoading) return;
    // Don't write before we've loaded from storage at least once
    if (loadedKeyRef.current === null) return;

    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, user, authLoading]);

  // ── Load / persist buy-now item (kept separate from cart) ───────
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BUY_NOW_STORAGE_KEY);
      setBuyNowItem(stored ? JSON.parse(stored) : null);
    } catch {
      setBuyNowItem(null);
    }
  }, []);

  useEffect(() => {
    try {
      if (buyNowItem) {
        localStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));
      } else {
        localStorage.removeItem(BUY_NOW_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write errors
    }
  }, [buyNowItem]);

  // ── Add to cart ───────────────────────────────────────────────────
  const addToCart = (product) => {
    setCartItems((prev) => {
      const productId = product._id || product.id;
      
      const cartItemKey = productId;
      
      const existingIndex = prev.findIndex((item) => {
        const itemKey = item._id || item.id;
        return itemKey === cartItemKey;
      });
      
      const maxAllowed = product.stock ? Math.min(10, product.stock) : 10;
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(updated[existingIndex].quantity + 1, maxAllowed);
        return updated;
      }
      
      const price = product.price;
      const stock = product.stock;
      
      return [
        ...prev,
        {
          ...product,
          product_id: productId,
          quantity: 1,
          price,
          stock,
          originalPrice: product.originalPrice || product.mrp || product.price,
          inStock: stock > 0,
        },
      ];
    });
  };

  // ── Change quantity ───────────────────────────────────────────────
  const updateQuantity = (id, newQty) => {
    if (newQty < 1) { removeFromCart(id); return; }
    const targetKey = getItemKey(id);
    setCartItems((prev) =>
      prev.map((item) => {
        if (getItemKey(item._id || item.id) === targetKey) {
          const maxAllowed = item.stock ? Math.min(10, item.stock) : 10;
          return { ...item, quantity: Math.min(newQty, maxAllowed) };
        }
        return item;
      })
    );
  };

  // ── Remove item ───────────────────────────────────────────────────
  const removeFromCart = (id) =>
    setCartItems((prev) => {
      const targetKey = getItemKey(id);
      const next = prev.filter((item) => getItemKey(item._id || item.id) !== targetKey);
      return next;
    });

  // ── Clear entire cart ─────────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ── Buy now helpers (isolated from cart) ─────────────────────────
  const setBuyNow = (product, quantity = 1) => {
    if (!product) return;

    const parsedQty = Number(quantity);
    const safeQty = Number.isFinite(parsedQty) && parsedQty > 0 ? Math.floor(parsedQty) : 1;
    const maxAllowed = product.stock ? Math.min(10, product.stock) : 10;

    setBuyNowItem({
      product: {
        ...product,
        product_id: product._id || product.id,
        originalPrice: product.originalPrice || product.mrp || product.price,
      },
      quantity: Math.min(safeQty, maxAllowed),
    });
  };

  const updateBuyNowQuantity = (newQty) => {
    setBuyNowItem((prev) => {
      if (!prev?.product) return prev;
      const parsedQty = Number(newQty);
      const qty = Number.isFinite(parsedQty) && parsedQty > 0 ? Math.floor(parsedQty) : 1;
      const stock = Number(prev.product.stock ?? 0);
      const maxAllowed = stock > 0 ? Math.min(10, stock) : 10;
      return {
        ...prev,
        quantity: Math.min(qty, maxAllowed),
      };
    });
  };

  const clearBuyNowItem = () => setBuyNowItem(null);

  // ── Derived values ────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const isInCart  = (id) => {
    const targetKey = getItemKey(id);
    return cartItems.some((item) => getItemKey(item._id || item.id) === targetKey);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      buyNowItem,
      cartCount,
      cartTotal,
      isInCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      setBuyNow,
      updateBuyNowQuantity,
      clearBuyNowItem,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};