import { memo, useState } from "react";
import { Eye, Heart, Star, Plus, Minus, ShoppingCart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel } from "../utils/category";

const ProductCard = ({ product, onQuickView, compact = false }) => {
  const [imgError, setImgError] = useState(false);

  const navigate = useNavigate();
  const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart();
  const { categories, wishlist, toggleWishlist } = useProducts();

  const productId    = String(product._id || product.id);
  const isWishlisted = wishlist.includes(productId);

  // ── Sync quantity from global cart state ───────────────────────────
  const cartItem = cartItems.find((i) => String(i._id || i.id) === productId);
  const cartQty  = cartItem?.quantity || 0;
  const inCart   = cartQty > 0;

  // ── Pricing ────────────────────────────────────────────────────────
  const mrp      = product.mrp || product.originalPrice || 0;
  const price    = product.price || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // ── Image ──────────────────────────────────────────────────────────
  const primaryImage =
    (Array.isArray(product.images) ? product.images[0] : "") ||
    product.image || "";
  const hasRealImage = primaryImage && primaryImage.startsWith("http") && !imgError;

  const categoryLabel = getCategoryLabel(product.category, categories);
  const hasRating     = product.rating > 0;
  const maxAllowed    = product.stock ? Math.min(10, product.stock) : 10;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    toast.success(
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4 shrink-0" />
        <span>
          <span className="font-semibold">{product.name}</span> added to cart!
        </span>
      </div>,
      {
        position: "bottom-right",
        autoClose: 2000,
        className: "!rounded-2xl !text-sm",
      }
    );
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartQty >= maxAllowed) return;
    updateQuantity(productId, cartQty + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartQty <= 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, cartQty - 1);
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${productId}`)}
      className="group cursor-pointer flex flex-col relative overflow-hidden rounded-2xl bg-white
                 shadow-sm ring-1 ring-slate-200/80
                 transition-all duration-300
                 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/50 hover:ring-blue-200"
    >

      {/* ── Image Area ─────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-slate-50">
        {hasRealImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/60 text-6xl
                          transition-transform duration-500 ease-out group-hover:scale-105">
            {primaryImage && !primaryImage.startsWith("http") ? primaryImage : "📦"}
          </div>
        )}

        {/* Discount badge — top left */}
        {discount > 0 && (
          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm">
              {discount}% OFF
            </span>
          </div>
        )}

        {/* Sold out overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-bold text-white shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Action icons — top right */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5
                        opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                        transition-all duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(productId); }}
            aria-label="Toggle wishlist"
            className={`h-8 w-8 rounded-full border bg-white shadow-sm transition-all active:scale-90
              ${isWishlisted
                ? "border-red-200 text-red-500"
                : "border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"
              }`}
          >
            <Heart className={`mx-auto h-3.5 w-3.5 ${isWishlisted ? "fill-red-500" : ""}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              aria-label="Quick view"
              className="h-8 w-8 rounded-full border border-slate-200 bg-white shadow-sm
                         text-slate-400 hover:text-slate-700 transition-all active:scale-90"
            >
              <Eye className="mx-auto h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Card Body ──────────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3.5" : "p-4"}`}>

        {/* Category */}
        {categoryLabel && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-blue-500">
            {categoryLabel}
          </p>
        )}

        {/* Product name */}
        <h3 className="mb-2 line-clamp-2 text-[14px] font-semibold leading-snug text-slate-800
                       transition-colors group-hover:text-slate-900 sm:text-[15px]">
          {product.name}
        </h3>

        {/* Rating */}
        {hasRating && (
          <div className="mb-3 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${
                    s <= Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-200"
                  }`}
                />
              ))}
            </div>
            {product.reviews > 0 && (
              <span className="text-[11px] font-medium text-slate-400">
                ({product.reviews})
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-auto mb-3.5 flex items-end gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {mrp > price && (
            <span className="mb-0.5 text-sm font-medium text-slate-400 line-through">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
          {discount > 0 && (
            <span className="ml-auto rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5
                             text-[10px] font-bold text-emerald-700">
              Save ₹{Math.round(mrp - price).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* ── Add to Cart  ↔  Quantity Stepper ─────────────────────── */}
        {!product.inStock ? (
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center
                          text-sm font-semibold text-slate-400 cursor-not-allowed">
            Out of Stock
          </div>
        ) : inCart ? (
          /* Quantity stepper — shown after item is in cart */
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between rounded-xl border-2 border-blue-600 bg-white overflow-hidden"
          >
            <button
              onClick={handleDecrement}
              className="flex h-11 w-12 items-center justify-center text-blue-600
                         hover:bg-blue-50 transition-colors active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4 stroke-[2.5]" />
            </button>

            <span className="flex-1 text-center text-base font-black text-slate-900 select-none">
              {cartQty}
            </span>

            <button
              onClick={handleIncrement}
              disabled={cartQty >= maxAllowed}
              className="flex h-11 w-12 items-center justify-center text-blue-600
                         hover:bg-blue-50 transition-colors active:scale-90
                         disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Add to Cart button — shown before item is in cart */
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 rounded-xl
                       bg-slate-900 py-3 text-sm font-bold text-white
                       hover:bg-blue-700 hover:-translate-y-0.5
                       transition-all duration-200 shadow-sm shadow-slate-900/10
                       active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ProductCard);