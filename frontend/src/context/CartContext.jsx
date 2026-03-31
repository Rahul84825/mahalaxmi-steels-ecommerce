import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { calculateFinalPrice } from "../utils/priceCalculator";

const CartContext = createContext(null);
const BUY_NOW_STORAGE_KEY = "buyNow_item";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getProductId = (item = {}) => String(item._id || item.id || item.product_id || "");
const getVariantId = (variant = null) => {
  if (!variant) return null;
  const id = variant._id || variant.id || variant.variant_id || null;
  return id ? String(id) : null;
};

const getCompositeKey = (productId, variantId = null) => `${String(productId)}::${variantId || "base"}`;

const normalizeVariant = (variant = {}, index = 0) => {
  const id = String(variant.id || variant._id || variant.variant_id || `v-${index}`);
  const label = String(variant.label || variant.name || `Variant ${index + 1}`);
  const originalPrice = toNumber(variant.originalPrice ?? variant.price, 0);
  const discountPercent = toNumber(variant.discountPercent ?? 0, 0);
  const finalPrice = calculateFinalPrice(originalPrice, discountPercent);
  const stock = Math.max(0, Math.floor(toNumber(variant.stock, 0)));
  
  return { ...variant, id, label, originalPrice, discountPercent, finalPrice, stock };
};

const getProductVariants = (product = {}) => {
  if (!Array.isArray(product.variants)) return [];
  return product.variants
    .map((variant, index) => normalizeVariant(variant, index))
    .filter((variant) => variant.label && Number.isFinite(variant.finalPrice));
};

const getMaxAllowed = (stockValue) => {
  const stock = Math.max(0, Math.floor(toNumber(stockValue, 0)));
  if (stock <= 0) return 0;
  return Math.min(10, stock);
};

const resolveVariantForProduct = (product = {}, options = {}) => {
  const variants = getProductVariants(product);
  if (!variants.length) return null;

  const requestedVariantId = options.variantId ? String(options.variantId) : getVariantId(options.variant);
  if (requestedVariantId) {
    const byId = variants.find((variant) => String(variant.id) === requestedVariantId);
    if (byId) return byId;
  }

  return variants[0];
};

const normalizePersistedCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const productId = getProductId(item);
      if (!productId) return null;
      const variantId = item.variant_id ? String(item.variant_id) : getVariantId(item.variant);
      const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));
      // Use finalPrice if available, fallback to price for backward compat
      const finalPrice = toNumber(item.finalPrice ?? item.price, 0);
      const stock = Math.max(0, Math.floor(toNumber(item.stock, 0)));

      return {
        ...item,
        product_id: productId,
        variant_id: variantId,
        quantity,
        finalPrice,
        stock,
      };
    })
    .filter(Boolean);
};

const normalizePersistedBuyNow = (item) => {
  if (!item?.product) return null;
  const productId = getProductId(item.product);
  if (!productId) return null;

  const variantId = item.variant_id ? String(item.variant_id) : getVariantId(item.variant || item.product?.variant);
  const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));

  return {
    ...item,
    product: {
      ...item.product,
      product_id: productId,
      variant_id: variantId,
    },
    variant: item.variant || item.product?.variant || null,
    variant_id: variantId,
    quantity,
  };
};

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
      setCartItems(stored ? normalizePersistedCartItems(JSON.parse(stored)) : []);
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
      setBuyNowItem(stored ? normalizePersistedBuyNow(JSON.parse(stored)) : null);
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
  const addToCart = (product, options = {}) => {
    setCartItems((prev) => {
      const productId = getProductId(product);
      if (!productId) return prev;

      const selectedVariant = resolveVariantForProduct(product, options);
      const selectedVariantId = getVariantId(selectedVariant);

      const quantityRequested = Math.max(1, Math.floor(toNumber(options.quantity, 1)));
      // Use finalPrice from normalized variant
      const resolvedFinalPrice = selectedVariant ? selectedVariant.finalPrice : 0;
      const resolvedOriginalPrice = selectedVariant ? selectedVariant.originalPrice : 0;
      const resolvedDiscountPercent = selectedVariant ? selectedVariant.discountPercent : 0;
      const resolvedStock = selectedVariant ? toNumber(selectedVariant.stock, toNumber(product.stock, 0)) : toNumber(product.stock, 0);
      const maxAllowed = getMaxAllowed(resolvedStock);
      
      if (maxAllowed <= 0) return prev;

      const itemKey = getCompositeKey(productId, selectedVariantId);
      const existingIndex = prev.findIndex((item) => getCompositeKey(getProductId(item), item.variant_id || null) === itemKey);

      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentQty = Math.max(1, Math.floor(toNumber(updated[existingIndex].quantity, 1)));
        updated[existingIndex].quantity = Math.min(currentQty + quantityRequested, maxAllowed);
        updated[existingIndex].stock = resolvedStock;
        updated[existingIndex].finalPrice = resolvedFinalPrice;
        updated[existingIndex].originalPrice = resolvedOriginalPrice;
        updated[existingIndex].discountPercent = resolvedDiscountPercent;
        updated[existingIndex].variant = selectedVariant || null;
        updated[existingIndex].variant_id = selectedVariantId;
        updated[existingIndex].inStock = resolvedStock > 0;
        return updated;
      }

      return [
        ...prev,
        {
          ...product,
          product_id: productId,
          variant: selectedVariant || null,
          variant_id: selectedVariantId,
          quantity: Math.min(quantityRequested, maxAllowed),
          finalPrice: resolvedFinalPrice,
          originalPrice: resolvedOriginalPrice,
          discountPercent: resolvedDiscountPercent,
          stock: resolvedStock,
          inStock: resolvedStock > 0,
        },
      ];
    });
  };

  // ── Change quantity ───────────────────────────────────────────────
  const updateQuantity = (id, newQty, variantId = null) => {
    const parsedQty = Math.floor(toNumber(newQty, 0));
    const targetProductId = getItemKey(id);
    const targetVariantId = variantId ? String(variantId) : null;

    if (parsedQty < 1) {
      removeFromCart(id, variantId);
      return;
    }

    setCartItems((prev) => {
      if (targetVariantId !== null) {
        return prev.map((item) => {
          const sameProduct = getItemKey(item._id || item.id) === targetProductId;
          const sameVariant = String(item.variant_id || "") === targetVariantId;
          if (sameProduct && sameVariant) {
            const maxAllowed = getMaxAllowed(item.stock);
            return { ...item, quantity: Math.min(parsedQty, Math.max(1, maxAllowed)) };
          }
          return item;
        });
      }

      const targetIndex = prev.findIndex((item) => getItemKey(item._id || item.id) === targetProductId);
      if (targetIndex < 0) return prev;

      const next = [...prev];
      const maxAllowed = getMaxAllowed(next[targetIndex].stock);
      next[targetIndex] = { ...next[targetIndex], quantity: Math.min(parsedQty, Math.max(1, maxAllowed)) };
      return next;
    });
  };

  // ── Remove item ───────────────────────────────────────────────────
  const removeFromCart = (id, variantId = null) =>
    setCartItems((prev) => {
      const targetProductId = getItemKey(id);
      const targetVariantId = variantId ? String(variantId) : null;

      if (targetVariantId !== null) {
        return prev.filter((item) => {
          const sameProduct = getItemKey(item._id || item.id) === targetProductId;
          if (!sameProduct) return true;
          return String(item.variant_id || "") !== targetVariantId;
        });
      }

      let removed = false;
      return prev.filter((item) => {
        if (removed) return true;
        const sameProduct = getItemKey(item._id || item.id) === targetProductId;
        if (!sameProduct) return true;
        removed = true;
        return false;
      });
    });

  // ── Clear entire cart ─────────────────────────────────────────────
  const clearCart = () => setCartItems([]);

  // ── Buy now helpers (isolated from cart) ─────────────────────────
  const setBuyNow = (product, quantity = 1, options = {}) => {
    if (!product) return;

    const parsedQty = Number(quantity);
    const safeQty = Number.isFinite(parsedQty) && parsedQty > 0 ? Math.floor(parsedQty) : 1;

    const selectedVariant = resolveVariantForProduct(product, options);
    const selectedVariantId = getVariantId(selectedVariant);
    const resolvedFinalPrice = selectedVariant ? selectedVariant.finalPrice : 0;
    const resolvedOriginalPrice = selectedVariant ? selectedVariant.originalPrice : 0;
    const resolvedDiscountPercent = selectedVariant ? selectedVariant.discountPercent : 0;
    const resolvedStock = selectedVariant ? toNumber(selectedVariant.stock, toNumber(product.stock, 0)) : toNumber(product.stock, 0);
    const maxAllowed = getMaxAllowed(resolvedStock);

    if (maxAllowed <= 0) return;

    setBuyNowItem({
      product: {
        ...product,
        product_id: getProductId(product),
        variant: selectedVariant || null,
        variant_id: selectedVariantId,
        finalPrice: resolvedFinalPrice,
        originalPrice: resolvedOriginalPrice,
        discountPercent: resolvedDiscountPercent,
        stock: resolvedStock,
      },
      variant: selectedVariant || null,
      variant_id: selectedVariantId,
      quantity: Math.min(safeQty, maxAllowed),
    });
  };

  const updateBuyNowQuantity = (newQty) => {
    setBuyNowItem((prev) => {
      if (!prev?.product) return prev;
      const parsedQty = Number(newQty);
      const qty = Number.isFinite(parsedQty) && parsedQty > 0 ? Math.floor(parsedQty) : 1;
      const stock = Number(prev.variant?.stock ?? prev.product.stock ?? 0);
      const maxAllowed = getMaxAllowed(stock);
      return {
        ...prev,
        quantity: Math.min(qty, Math.max(1, maxAllowed)),
      };
    });
  };

  const clearBuyNowItem = () => setBuyNowItem(null);

  // ── Derived values ────────────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // Use finalPrice for total calculation
  const cartTotal = Math.round(cartItems.reduce((sum, item) => sum + (item.finalPrice || item.price || 0) * item.quantity, 0));
  const isInCart  = (id, variantId = null) => {
    const targetProductId = getItemKey(id);
    const targetVariantId = variantId ? String(variantId) : null;
    return cartItems.some((item) => {
      const sameProduct = getItemKey(item._id || item.id) === targetProductId;
      if (!sameProduct) return false;
      if (targetVariantId === null) return true;
      return String(item.variant_id || "") === targetVariantId;
    });
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