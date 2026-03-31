import { Eye, Heart, ShoppingCart, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel } from "../utils/category";
import { calculateFinalPrice } from "../utils/priceCalculator";

const QuickViewModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories, wishlist, toggleWishlist } = useProducts();

  if (!product) return null;

  const id = String(product._id || product.id);
  const isWishlisted = wishlist.includes(id);
  const categoryLabel = getCategoryLabel(product.category, categories);
  
  // NEW: Use variant-based pricing from first/default variant
  const defaultVariant = (product.variants && product.variants[0]) || {};
  const originalPrice = Number(defaultVariant.originalPrice ?? defaultVariant.price ?? product.originalPrice ?? product.mrp ?? 0);
  const discountPercent = Number(defaultVariant.discountPercent ?? 0);
  const finalPrice = originalPrice > 0 ? calculateFinalPrice(originalPrice, discountPercent) : 0;
  
  const hasRating = (product.rating || 0) > 0;

  const imageSrc = product.image && product.image.startsWith("http") ? product.image : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close quick view"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/95 border border-slate-200 text-slate-600 hover:text-slate-900"
          aria-label="Close"
        >
          <X className="w-4 h-4 mx-auto" />
        </button>

        <div className="bg-slate-100/80 aspect-square md:aspect-auto">
          {imageSrc ? (
            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full min-h-[260px] flex items-center justify-center text-7xl">{product.image || "📦"}</div>
          )}
        </div>

        <div className="p-6 md:p-8 flex flex-col">
          {categoryLabel && (
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 mb-2">{categoryLabel}</p>
          )}

          <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3">{product.name}</h3>

          {hasRating && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
              {!!product.reviews && <span className="text-sm text-slate-500">({product.reviews} reviews)</span>}
            </div>
          )}

          {!!product.description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-4">{product.description}</p>
          )}

          <div className="flex items-end gap-2 mb-6 mt-auto">
            <span className="text-3xl font-black text-slate-900">₹{finalPrice.toLocaleString("en-IN")}</span>
            {originalPrice > finalPrice && (
              <span className="text-sm text-slate-400 line-through pb-1">₹{originalPrice.toLocaleString("en-IN")}</span>
            )}
            {discountPercent > 0 && (
              <span className="ml-auto text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1">
                {Math.round(discountPercent)}% OFF
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                addToCart(product);
                onClose();
              }}
              disabled={!product.inStock}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                product.inStock
                  ? "bg-slate-900 text-white hover:bg-blue-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(id)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold border transition ${
                isWishlisted
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>

            <button
              type="button"
              onClick={() => {
                navigate(`/products/${id}`);
                onClose();
              }}
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <Eye className="w-4 h-4" />
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
