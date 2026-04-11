import { useState, useEffect, useCallback, memo } from "react";
import { ShoppingCart, Star, CheckCircle2, ShoppingBag } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DeliveryNotice } from "./DeliveryNotice";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { calculateFinalPrice, formatPrice } from "../utils/priceCalculator";
import { getHeroSlides } from "../services/heroSlides";

const FALLBACK_HERO_BACKGROUND_IMAGES = [
  "/hero/hero-slide-1.svg",
  "/hero/hero-slide-2.svg",
  "/hero/hero-slide-3.svg",
  "/hero/hero-slide-4.svg",
];

const HERO_SLIDE_INTERVAL_MS = 4000;

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

  const defaultVariant = Array.isArray(product.variants) && product.variants.length
    ? product.variants[0]
    : null;
  const defaultVariantId = defaultVariant?.id || defaultVariant?._id || defaultVariant?.variant_id || null;
  const resolvedStock = Number(defaultVariant?.stock ?? product.stock ?? 0);
  const resolvedInStock = typeof product.inStock === "boolean" ? product.inStock : resolvedStock > 0;

  const alreadyInCart = isInCart(product._id || product.id, defaultVariantId ? String(defaultVariantId) : null);
  const outOfStock = !resolvedInStock || resolvedStock <= 0;

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation(); // don't navigate on button click
      if (outOfStock || adding) return;

      setAdding(true);
      addToCart(product, defaultVariantId ? { variantId: String(defaultVariantId) } : {});

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
    [product, addToCart, outOfStock, adding, onCartOpen, defaultVariantId]
  );

  const handleCardClick = useCallback(() => {
    const productId = product._id || product.id;
    if (!productId) {
      console.warn("[Hero] Missing product id, skipping navigation", { product });
      return;
    }
    const nextRoute = `/product/${productId}`;
    console.debug("[Hero] Product card clicked", { productId: String(productId), route: nextRoute });
    navigate(nextRoute);
  }, [navigate, product]);

  const displayPrice = toNumber(product.price, 0);
  const displayOriginalPrice = toNumber(product.originalPrice, 0);
  const savedAmount = Math.max(0, displayOriginalPrice - displayPrice);

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-white p-3.5 sm:p-4.5 rounded-3xl sm:rounded-4xl shadow-xl sm:shadow-2xl shadow-slate-200/80 border border-slate-100
                 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-100/60 hover:border-blue-100
                 transition-all duration-300 w-full max-w-85 sm:max-w-100 flex flex-col group cursor-pointer"
    >
      {/* Image Area */}
      <div className="relative bg-slate-50 overflow-hidden aspect-square rounded-[1.25rem] sm:rounded-3xl w-full shrink-0 flex items-center justify-center mb-3 sm:mb-4">
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
            {formatPrice(displayPrice)}
          </span>
          {displayOriginalPrice > displayPrice && (
            <span className="text-xs sm:text-sm font-medium text-slate-400 line-through mb-0.5">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
          {savedAmount > 0 && (
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ml-auto border border-emerald-100">
              Save {formatPrice(savedAmount)}
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
  const [activeBackgroundIndex, setActiveBackgroundIndex] = useState(0);
  const [heroBackgroundImages, setHeroBackgroundImages] = useState([]);
  const { products, loading } = useProducts();
  const heroProduct = products.find((p) => p?.isHero) || products[0] || null;

  const resolvedBackgroundImages =
    heroBackgroundImages.length > 0 ? heroBackgroundImages : FALLBACK_HERO_BACKGROUND_IMAGES;

  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        const slides = await getHeroSlides();
        const dynamicImages = slides.map((slide) => slide.image).filter(Boolean);

        setHeroBackgroundImages(dynamicImages);
      } catch (error) {
        console.error("[Hero] Failed to load dynamic hero images", error);
      }
    };

    loadHeroImages();
  }, []);

  useEffect(() => {
    if (activeBackgroundIndex < resolvedBackgroundImages.length) return;
    setActiveBackgroundIndex(0);
  }, [activeBackgroundIndex, resolvedBackgroundImages.length]);

  useEffect(() => {
    if (resolvedBackgroundImages.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveBackgroundIndex((prev) => (prev + 1) % resolvedBackgroundImages.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [resolvedBackgroundImages.length]);

  const getHeroProductPricing = (product) => {
    if (!product) return { price: 0, originalPrice: 0, discount: 0 };

    const defaultVariant = (product.variants && product.variants[0]) || {};
    const originalPrice = toNumber(
      defaultVariant.originalPrice ?? defaultVariant.price ?? product.originalPrice ?? product.mrp ?? product.price ?? 0,
      0
    );
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

  return (
    <section className="relative overflow-hidden bg-slate-900 pt-6 pb-10 sm:pt-8 sm:pb-14">
      <div className="absolute inset-0 pointer-events-none z-0">
        {resolvedBackgroundImages.map((imageUrl, index) => (
          <div
            key={`${imageUrl}-${index}`}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === activeBackgroundIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-slate-950/60 pointer-events-none z-10" aria-hidden="true" />

      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {resolvedBackgroundImages.map((_, index) => (
          <button
            key={`hero-dot-${index}`}
            type="button"
            onClick={() => setActiveBackgroundIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeBackgroundIndex ? "w-6 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to hero background slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="relative z-30 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-center gap-7 sm:gap-8 lg:gap-12 min-h-[360px] sm:min-h-[430px] py-4 sm:py-6">
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-full max-w-md text-center lg:text-left">
              <div className="mb-5 sm:mb-6">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-orange-300 font-bold mb-4">
                  Trusted Quality For Every Home
                </p>
                <h1 className="font-extrabold leading-[1.05] text-white text-[clamp(2.2rem,4vw,3.8rem)]">
                  Steel & Home
                  <br />
                  <span className="text-orange-300">Appliances</span>
                </h1>
                <p className="mt-4 sm:mt-5 mx-auto lg:mx-0 max-w-sm text-sm sm:text-base leading-7 text-slate-100/80">
                  Premium steelware, kitchen essentials, and reliable home appliances for everyday use.
                </p>
                <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <NavLink
                    to="/products"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
                  >
                    Shop Now
                  </NavLink>
                  <NavLink
                    to="/products"
                    className="btn-secondary inline-flex items-center justify-center px-6 py-3 text-sm border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  >
                    View Catalog
                  </NavLink>
                </div>
              </div>
              <DeliveryNotice className="w-full mt-1 sm:mt-2" />
            </div>
          </div>

          <div className="relative flex justify-center items-center px-2 sm:px-4 lg:px-0 lg:pl-4 xl:pl-8">
            {loading ? (
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-85 sm:max-w-100 text-center animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100" />
                <div className="h-5 bg-slate-100 rounded w-2/3 mx-auto mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
              </div>
            ) : safeHeroProduct ? (
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