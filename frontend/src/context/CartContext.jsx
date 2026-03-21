import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  // ── Derive a stable storage key per user ──────────────────────────
  // - Logged in  → "cart_<userId>"   (each user gets their own cart)
  // - Guest      → "cart_guest"      (shared guest cart)
  // We wait until auth is done loading before reading from storage
  const getCartKey = (u) => u ? `cart_${u._id || u.id}` : "cart_guest";

  // Track the last loaded key so we know when to reload
  const loadedKeyRef = useRef(null);

  const [cartItems, setCartItems] = useState([]);

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

  // ── Add to cart ───────────────────────────────────────────────────
  const addToCart = (product, variant = null) => {
    setCartItems((prev) => {
      const productId = product._id || product.id;
      const variantId = variant?._id || variant?.id || null;
      
      // For variant products, key is product+variant. For regular, just product
      const cartItemKey = variantId ? `${productId}-${variantId}` : productId;
      
      const existingIndex = prev.findIndex((item) => {
        const itemKey = item.variant_id 
          ? `${item._id || item.id}-${item.variant_id}`
          : (item._id || item.id);
        return itemKey === cartItemKey;
      });
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity = Math.min(updated[existingIndex].quantity + 1, 10);
        return updated;
      }
      
      // Use variant price if available, otherwise product price
      const price = variant?.price ?? product.price;
      const stock = variant?.stock ?? product.stock;
      
      return [
        ...prev,
        {
          ...product,
          variant_id: variantId,
          variant: variant || null,
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
    setCartItems((prev) =>
      prev.map((item) =>
        (item._id || item.id) === id
          ? { ...item, quantity: Math.min(newQty, 10) }
          : item
      )
    );
  };

  // ── Remove item ───────────────────────────────────────────────────
  const removeFromCart = (id) =>
    setCartItems((prev) => {
      const next = prev.filter((item) => (item._id || item.id) !== id);
      return next;
    });

  // ── Clear entire cart ─────────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ── Derived values ────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Math.round(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const isInCart  = (id) => cartItems.some((item) => (item._id || item.id) === id);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      isInCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
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