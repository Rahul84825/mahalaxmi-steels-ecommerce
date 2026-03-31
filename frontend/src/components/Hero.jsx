import { useState, useCallback, memo } from "react";
import {
  Search, ShoppingCart, ArrowRight, Star, BadgeCheck,
  FileText, Store, CheckCircle2, ShoppingBag,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DeliveryNotice } from "./DeliveryNotice";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { calculateFinalPrice } from "../utils/priceCalculator";

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toText = (value, fallback = "") => {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.label === "string") return value.label;
    if (typeof value.name === "string") return value.name;
  }
  return fallback;
};

// ── Reusable ProductCard ─────────────────────────────────────────────
export const ProductCard = memo(({ product, onCartOpen }) => {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const alreadyInCart = isInCart(product._id || product.id);
  const outOfStock = !product.inStock && product.stock === 0;

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation(); // don't navigate on button click
      if (outOfStock || adding) return;

      setAdding(true);
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
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "!rounded-2xl !text-sm !font-medium",
        }
      );

      // Open cart drawer after a tiny delay so toast renders first
      setTimeout(() => {
        setAdding(false);
        if (onCartOpen) onCartOpen();
      }, 300);
    },
    [product, addToCart, outOfStock, adding, onCartOpen]
  );

  const handleCardClick = useCallback(() => {
    navigate(`/product/${product._id || product.id}`);
  }, [navigate, product]);

  const savedAmount = product.originalPrice - product.price;

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white p-4 sm:p-5 rounded-3xl sm:rounded-4xl shadow-xl sm:shadow-2xl shadow-slate-200/80 border border-slate-100
                 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-100/60 hover:border-blue-100
                 transition-all duration-300 w-full max-w-85 sm:max-w-100 flex flex-col group cursor-pointer"
    >
      {/* Image Area */}
      <div className="relative bg-slate-50 overflow-hidden aspect-square rounded-[1.25rem] sm:rounded-3xl w-full shrink-0 flex items-center justify-center mb-4 sm:mb-5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 transition-transform duration-500">
            <span className="text-5xl sm:text-6xl drop-shadow-sm">{product.emoji || "🛍️"}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10 items-start">
          <span className="bg-blue-600/95 text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider uppercase shadow-sm">
            Popular
          </span>
          {product.discount > 0 && (
            <span className="bg-rose-500/95 text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider shadow-sm">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-[1.25rem] sm:rounded-3xl">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="px-1 sm:px-2 flex flex-col flex-1">
        <p className="text-[9px] sm:text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 sm:mb-2">
          {product.category}
        </p>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-2 sm:mb-3">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${
                  i < Math.floor(product.rating) ? "text-amber-400" : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400">
            ({product.reviewCount} Reviews)
          </span>
        </div>

        {/* Pricing */}
        <div className="flex flex-wrap items-end gap-1.5 sm:gap-2 mt-auto mb-4 sm:mb-5">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs sm:text-sm font-medium text-slate-400 line-through mb-0.5">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
          {savedAmount > 0 && (
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ml-auto border border-emerald-100">
              Save ₹{savedAmount.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold
            transition-all duration-200 shadow-lg active:scale-95
            ${outOfStock
              ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              : alreadyInCart
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10 hover:-translate-y-0.5"
                : "bg-slate-900 hover:bg-blue-700 text-white shadow-slate-900/10 hover:-translate-y-0.5"
            }
            ${adding ? "scale-95 opacity-80" : ""}
          `}
        >
          <ShoppingCart className={`w-4 h-4 ${adding ? "animate-bounce" : ""}`} />
          {outOfStock
            ? "Out of Stock"
            : alreadyInCart
              ? "Added to Cart ✓"
              : adding
                ? "Adding..."
                : "Add to Cart"
          }
        </button>

        {/* Stock status */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${outOfStock ? "text-rose-400" : "text-emerald-500"}`} />
          <p className="text-[10px] sm:text-xs font-bold text-slate-600">
            {outOfStock ? "Currently out of stock" : "In Stock & Ready to Ship"}
          </p>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

// ── Main Hero Component ──────────────────────────────────────────────
const Hero = memo(({ onCartOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { products } = useProducts();
  const heroProduct = products.find((p) => p?.isHero) || products[0] || null;

  // NEW: Calculate pricing from variant-based structure
  const getHeroProductPricing = (product) => {
    if (!product) return { price: 0, originalPrice: 0, discount: 0 };
    
    const defaultVariant = (product.variants && product.variants[0]) || {};
    const originalPrice = toNumber(defaultVariant.originalPrice ?? defaultVariant.price ?? product.originalPrice ?? product.mrp ?? product.price ?? 0, 0);
    const discountPercent = toNumber(defaultVariant.discountPercent ?? 0, 0);
    const price = originalPrice > 0 ? calculateFinalPrice(originalPrice, discountPercent) : 0;
    const discount = discountPercent > 0 ? Math.round(discountPercent) : 0;
    
    return { price, originalPrice, discount };
  };

  const heroPricing = getHeroProductPricing(heroProduct);

  const safeHeroProduct = heroProduct
    ? {
        ...heroProduct,
        name: toText(heroProduct.name, "Featured Product"),
        image: toText(heroProduct.image || heroProduct.images?.[0], ""),
        category: toText(heroProduct.category, "Featured"),
        price: heroPricing.price,
        originalPrice: heroPricing.originalPrice,
        rating: toNumber(heroProduct.rating, 0),
        reviewCount: toNumber(heroProduct.reviewCount || heroProduct.reviews, 0),
        discount: heroPricing.discount,
        stock: toNumber(heroProduct.stock, 0),
        inStock:
          typeof heroProduct.inStock === "boolean"
            ? heroProduct.inStock
            : toNumber(heroProduct.stock, 0) > 0,
      }
    : null;

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (!(searchQuery || "").trim()) return;
      navigate(`/products?search=${encodeURIComponent((searchQuery || "").trim())}`);
    },
    [searchQuery, navigate]
  );

  return (
    <section className="relative bg-slate-50 overflow-hidden section-shell pt-8 sm:pt-12 md:pt-16">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12 lg:gap-8 items-center">

          {/* ── Left Content ── */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">

            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-sm">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              <span>Trusted by 10,000+ Happy Homes</span>
            </div>

            <h1 className="text-[var(--text-display)] font-extrabold text-slate-900 mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              Premium Quality <br className="hidden sm:block" />
              <span className="text-blue-600 bg-clip-text">Kitchen & Pooja Essentials</span>
            </h1>

            <p className="section-subtitle text-base sm:text-lg mb-8 sm:mb-10 max-w-xl px-2 sm:px-0">
              Discover our finest collection of durable stainless steel utensils,
              traditional copper idols, and reliable home appliances. Quality crafted for your everyday life.
            </p>

            {/* ── Integrated Search Form ── */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-lg mb-8 sm:mb-10 px-1 sm:px-0"
            >
              <div className="relative flex items-center bg-white rounded-full shadow-lg shadow-slate-200/50 border border-slate-100 p-1 sm:p-1.5 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all duration-200">
                <Search className="absolute left-3.5 sm:left-5 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search utensils, copper items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-10 sm:pl-14 pr-2 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-700 font-medium outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="btn-primary px-4 sm:px-8 py-2.5 sm:py-3.5 text-sm shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center lg:justify-start mb-10 sm:mb-12 px-1 sm:px-0">
              <NavLink
                to="/products"
                className="btn-primary px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center gap-2 group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <NavLink
                to="/products"
                className="btn-secondary px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base flex items-center justify-center"
              >
                View Catalog
              </NavLink>
            </div>

            {/* ── Delivery Notice ── */}
            <DeliveryNotice className="w-full mb-8 sm:mb-10" />

            {/* ── Trust Features ── */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 sm:gap-x-8 gap-y-3 sm:gap-y-4 pt-5 sm:pt-6 border-t border-slate-200/60 w-full">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">Authentic Products</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">GST Billing Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">Store Pickup Available</span>
              </div>
            </div>
          </div>

          {/* ── Right Content (Hero Product Card) ── */}
          <div className="relative lg:mt-0 flex justify-center items-center px-2 sm:px-4 lg:px-0">
            {/* Soft backdrop blur */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-100/50 to-transparent rounded-full blur-3xl scale-90 pointer-events-none" />

            {safeHeroProduct ? (
              <ProductCard product={safeHeroProduct} onCartOpen={onCartOpen} />
            ) : (
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-85 sm:max-w-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Star className="w-7 h-7 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No hero product set</h3>
                <p className="text-sm text-slate-500">Choose a featured item from the admin products page.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;