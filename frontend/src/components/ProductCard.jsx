import { memo, useState } from "react";
import { Eye, Heart, ShoppingCart, Star, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel } from "../utils/category";

const ProductCard = ({ product, onQuickView, compact = false }) => {
  const [addedToCart, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { categories, wishlist, toggleWishlist } = useProducts();

  const productId = String(product._id || product.id);
  const isWishlisted = wishlist.includes(productId);

  const mrp = product.mrp || product.originalPrice || 0;
  const primaryImage = product.image || (Array.isArray(product.images) ? product.images[0] : "") || "";
  const discount = mrp > product.price
    ? Math.round(((mrp - product.price) / mrp) * 100)
    : 0;

  const badges = [];
  if (discount > 0) badges.push({ label: `${discount}% OFF`, tone: "rose" });
  if (!product.inStock) badges.push({ label: "Sold Out", tone: "slate" });

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    addToCart(product);
  };

  const categoryLabel = getCategoryLabel(product.category, categories);
  const hasRealImage = primaryImage && primaryImage.startsWith("http") && !imgError;
  const hasRating = product.rating > 0;
  const cardPadding = compact ? "p-4" : "p-5";

  const badgeClass = {
    rose: "bg-rose-500/95 text-white",
    slate: "bg-slate-800/95 text-white",
  };

  return (
    <div
      onClick={() => navigate(`/products/${productId}`)}
      className="interactive-card overflow-hidden group cursor-pointer flex flex-col relative"
    >
      <div className="relative bg-slate-50 overflow-hidden aspect-square w-full shrink-0">
        {hasRealImage ? (
          <img
            src={primaryImage} alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700 ease-out bg-slate-100/50">
            {primaryImage && !primaryImage.startsWith("http")
              ? primaryImage
              : "📦"
            }
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
          {badges.slice(0, 2).map((badge) => (
            <span
              key={badge.label}
              className={`backdrop-blur-sm text-[10px] font-extrabold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm ${badgeClass[badge.tone]}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            aria-label="Toggle wishlist"
            className={`w-9 h-9 rounded-full border backdrop-blur-sm transition-all ${isWishlisted ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white/90 border-slate-200 text-slate-500 hover:text-rose-600"}`}
          >
            <Heart className={`w-4 h-4 mx-auto ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label="Quick view"
              className="w-9 h-9 rounded-full border bg-white/90 border-slate-200 text-slate-500 hover:text-blue-700"
            >
              <Eye className="w-4 h-4 mx-auto" />
            </button>
          )}
        </div>
      </div>

      <div className={`${cardPadding} flex flex-col flex-1`}>
        {categoryLabel && (
          <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-[0.18em] mb-2.5">
            {categoryLabel}
          </p>
        )}
        
        <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 mb-2.5 group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>

        {hasRating && (
          <div className={`flex items-center gap-2 ${compact ? "mb-3" : "mb-4"}`}>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-3.5 h-3.5 ${s <= Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}`} 
                />
              ))}
            </div>
            {product.reviews > 0 && (
              <span className="text-xs font-medium text-slate-400">({product.reviews})</span>
            )}
          </div>
        )}

        <div className={`flex flex-wrap items-end gap-2 mt-auto ${compact ? "mb-4" : "mb-5"}`}>
          <span className="price-main text-xl sm:text-[1.35rem]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {mrp > product.price && (
            <span className="text-sm font-medium text-slate-400 line-through mb-0.5">
              ₹{mrp.toLocaleString("en-IN")}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md ml-auto border border-emerald-100">
              Save ₹{(mrp - product.price).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300
            ${addedToCart 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[0.98]"
              : product.inStock 
                ? "bg-slate-900 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/20 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          {addedToCart ? (
            <>
              <Check className="w-4 h-4" /> Added to Cart
            </>
          ) : product.inStock ? (
            <>
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(ProductCard);