import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart,
  Truck, ShieldCheck, RotateCcw, Minus, Plus,
  ChevronRight, PackageX, Zap,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { api } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { getCategoryLabel, getCategorySlug } from "../utils/category";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

const ProductNotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <PackageX className="w-16 h-16 text-gray-300 mb-4" />
    <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
    <p className="text-gray-500 mb-6">This product doesn't exist or may have been removed.</p>
    <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Products
    </Link>
  </div>
);

const ProductDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, setBuyNow }   = useCart();
  const { categories, markProductViewed }  = useProducts();
  const { user } = useAuth();

  const [product, setProduct]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);

  useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (!product) return;
    markProductViewed(product._id || product.id);
  }, [product, markProductViewed]);

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setImgErrors({});
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) {
      setSelectedVariantId(null);
      return;
    }
    const firstVariantId = String(variants[0].id || variants[0]._id || variants[0].variant_id || "");
    setSelectedVariantId(firstVariantId || null);
    setQty(1);
  }, [product]);

  // ── Real-time Synchronization ─────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
    });

    socket.on("product_updated", (updatedProduct) => {
      if (String(updatedProduct._id || updatedProduct.id) === String(id)) {
        setProduct(updatedProduct);
      }
    });

    socket.on("product_deleted", (deletedId) => {
      if (String(deletedId) === String(id)) {
        setError(true);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  // ── Fallback: Refetch on Window Focus ─────────────────────────────
  useEffect(() => {
    const onFocus = () => fetchProduct(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [id]);

  async function fetchProduct(quiet = false) {
    if (!quiet) { setLoading(true); setError(false); }
    try {
      const data = await api.get(`/api/products/${id}`);
      const p = data.product || data;
      setProduct(p);
      document.title = `${p.name} — Mahalaxmi Steels`;
      const categoryId = p.category?._id || p.category;
      if (categoryId) {
        const rel = await api.get(`/api/products?category=${categoryId}&limit=5`);
        const relProducts = rel.products || rel.data || [];
        setRelated(relProducts.filter((r) => (r._id || r.id) !== (p._id || p.id)).slice(0, 4));
      }
    } catch { if (!quiet) setError(true); }
    finally { if (!quiet) setLoading(false); }
  }

  const normalizedVariants = (Array.isArray(product?.variants) ? product.variants : [])
    .map((variant, index) => {
      const idValue = variant.id || variant._id || variant.variant_id || `v-${index}`;
      const priceValue = Number(variant.price);
      const stockValue = Number(variant.stock);
      return {
        ...variant,
        id: String(idValue),
        label: variant.label || variant.name || `Variant ${index + 1}`,
        price: Number.isFinite(priceValue) ? priceValue : Number(product?.price || 0),
        stock: Number.isFinite(stockValue) ? Math.max(0, Math.floor(stockValue)) : Math.max(0, Math.floor(Number(product?.stock || 0))),
      };
    })
    .filter((variant) => variant.label);

  const selectedVariant = normalizedVariants.find((variant) => variant.id === String(selectedVariantId)) || normalizedVariants[0] || null;

  const productStock = selectedVariant ? Number(selectedVariant.stock ?? 0) : Number(product?.stock ?? 0);
  const selectedVariantKey = selectedVariant ? String(selectedVariant.id) : null;
  const cartQty = (cartItems || [])
    .filter((item) => {
      const sameProduct = String(item._id || item.id) === String(product?._id || product?.id);
      if (!sameProduct) return false;
      const itemVariantId = item.variant_id ? String(item.variant_id) : null;
      if (selectedVariantKey === null) return itemVariantId === null;
      return itemVariantId === selectedVariantKey;
    })
    .reduce((sum, item) => sum + (item.quantity || 1), 0);
  const remainingStock = Math.max(0, productStock - cartQty);

  const handleAddToCart = () => {
    if (remainingStock <= 0) {
      alert("Max items already added to cart");
      return;
    }
    
    const currentQty = Number(qty) || 1;
    if (currentQty > remainingStock) {
      alert(`Only ${remainingStock} items available`);
      return;
    }

    addToCart(product, {
      quantity: currentQty,
      variantId: selectedVariantKey,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!displayInStock || remainingStock <= 0 || Number(qty) < 1 || Number(qty) > remainingStock) {
      return;
    }

    setBuyNowLoading(true);
    setBuyNow(product, Number(qty) || 1, { variantId: selectedVariantKey });
    setShowCheckoutToast(true);

    setTimeout(() => {
      setShowCheckoutToast(false);
      if (user) {
        navigate("/checkout");
      } else {
        navigate("/login?redirect=/checkout");
      }
      setBuyNowLoading(false);
    }, 450);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (error || !product) return <ProductNotFound />;

  // Build gallery
  const allImages = [];
  if (product.image && product.image.startsWith("http") && !allImages.includes(product.image)) {
    allImages.push(product.image);
  }
  if (product.images?.length) {
    product.images.forEach((img) => {
      if (img && img.startsWith("http") && !allImages.includes(img)) allImages.push(img);
    });
  }

  const hasImages = allImages.length > 0;
  const safeActiveImg = activeImg >= 0 && activeImg < allImages.length ? activeImg : 0;
  const currentSrc = hasImages && !imgErrors[safeActiveImg] ? allImages[safeActiveImg] : null;
  const isEmojiImage = product.image && !product.image.startsWith("http");

  const displayPrice = Math.round(selectedVariant?.price ?? product.price ?? 0);
  const displayMrp = Math.round(product.mrp ?? product.originalPrice ?? displayPrice);
  const discount = displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0;
  const savings = displayMrp > displayPrice ? Math.round(displayMrp - displayPrice) : 0;
  const categoryLabel = getCategoryLabel(product.category, categories);
  const categorySlug  = getCategorySlug(product.category, categories);
  const specs = product.specifications
    ? Object.entries(product.specifications).map(([label, value]) => ({ label, value }))
    : [];

  const displayStock = productStock;
  const displayInStock = (product.inStock ?? true) && displayStock > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {showCheckoutToast && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-[fadeIn_180ms_ease-out]">
            Proceeding to checkout
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          {categoryLabel && <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/products?category=${categorySlug}`} className="hover:text-blue-600 transition-colors">{categoryLabel}</Link>
          </>}
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium truncate max-w-40">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="flex flex-col gap-3">
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden aspect-square flex items-center justify-center group">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">-{discount}%</span>}
              {!displayInStock && <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Sold Out</span>}
              </div>
              {currentSrc ? (
                <img src={currentSrc} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" loading="lazy" onError={() => setImgErrors((p) => ({ ...p, [safeActiveImg]: true }))} />
              ) : isEmojiImage ? (
                <span className="text-[120px] select-none">{product.image}</span>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl">📦</div>
              )}
            </div>
            {hasImages && allImages.length > 1 ? (
              <div className="flex gap-2">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded-xl border-2 overflow-hidden bg-white transition-colors ${activeImg === i ? "border-blue-500" : "border-gray-200 hover:border-blue-300"}`}>
                    <img src={!imgErrors[i] ? img : "/placeholder.jpg"} alt={`${product.name} ${i+1}`} className="w-full h-full object-cover" onError={() => setImgErrors((p) => ({ ...p, [i]: true }))} />
                  </button>
                ))}
              </div>
            ) : isEmojiImage ? (
              <div className="flex gap-2">
                {[1,2,3].map((i) => (
                  <div key={i} className={`w-20 h-20 rounded-xl border-2 bg-white flex items-center justify-center cursor-pointer ${i === 1 ? "border-blue-500" : "border-gray-200 hover:border-blue-300"}`}>
                    <span className="text-3xl opacity-60">{product.image}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {categoryLabel && <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{categoryLabel}</span>}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">₹{displayPrice.toLocaleString("en-IN")}</span>
              {displayMrp > displayPrice && (
                <span className="text-lg text-gray-400 line-through">₹{displayMrp.toLocaleString("en-IN")}</span>
              )}
            </div>
            {savings > 0 && <p className="text-sm font-semibold text-green-600 mb-4">You save ₹{savings.toLocaleString("en-IN")} ({discount}% off)</p>}

            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${displayInStock ? "bg-green-500" : "bg-red-400"}`} />
              <span className={`text-sm font-semibold ${displayInStock ? "text-green-600" : "text-red-500"}`}>
                {displayInStock ? `In Stock${displayStock ? ` - ${displayStock} available` : ""}` : "Out of Stock"}
              </span>
            </div>

            {product.description && <p className="text-sm text-gray-600 leading-relaxed mb-6 border-t border-gray-100 pt-5">{product.description}</p>}

            {normalizedVariants.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Variant:</p>
                <div className="flex flex-wrap gap-2">
                  {normalizedVariants.map((variant) => {
                    const isSelected = String(selectedVariant?.id) === String(variant.id);
                    const variantOutOfStock = variant.stock <= 0;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(String(variant.id));
                          setQty(1);
                        }}
                        disabled={variantOutOfStock}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : variantOutOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {variant.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {displayInStock && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, (Number(q) || 1) - 1))} disabled={qty <= 1 || remainingStock <= 0} className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, Math.min(remainingStock, 10))}
                    value={remainingStock <= 0 ? 0 : qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setQty(val);
                      else setQty("");
                    }}
                    onBlur={() => {
                      const val = Number(qty);
                      if (!val || val < 1) setQty(1);
                      else if (val > Math.max(1, Math.min(remainingStock, 10))) setQty(Math.max(1, Math.min(remainingStock, 10)));
                    }}
                    disabled={remainingStock <= 0}
                    className="w-14 text-center text-sm font-bold text-gray-800 border-x border-gray-200 py-2 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button onClick={() => setQty((q) => Math.min(Math.max(1, Math.min(remainingStock, 10)), (Number(q) || 0) + 1))} disabled={qty >= Math.min(remainingStock, 10) || remainingStock <= 0} className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-gray-400">Max {Math.min(displayStock, 10)} per order</span>
              </div>
            )}
            {displayInStock && qty > 1 && <p className="text-xs text-gray-500 mb-4">Total: <span className="font-bold text-gray-800">₹{(displayPrice * qty).toLocaleString("en-IN")}</span></p>}

            {displayInStock && remainingStock <= 0 ? (
              <p className="text-sm font-semibold text-rose-500 mb-4">
                You already added {cartQty} items (maximum available).
              </p>
            ) : displayInStock && Number(qty) > remainingStock && (
              <p className="text-sm font-semibold text-rose-500 mb-4">
                Only {remainingStock} left in stock.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <button
                onClick={handleAddToCart}
                disabled={!displayInStock || remainingStock <= 0 || Number(qty) > remainingStock || Number(qty) < 1}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-300
                  ${added ? "bg-green-500 text-white scale-95" : displayInStock && remainingStock > 0 && Number(qty) <= remainingStock && Number(qty) >= 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {added ? `Added ${qty > 1 ? `(${qty})` : ""} to Cart!` : !displayInStock ? "Out of Stock" : remainingStock <= 0 ? "Max items added" : Number(qty) > remainingStock ? `Only ${remainingStock} left` : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buyNowLoading || !displayInStock || remainingStock <= 0 || Number(qty) > remainingStock || Number(qty) < 1}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-300
                  ${displayInStock && remainingStock > 0 && Number(qty) <= remainingStock && Number(qty) >= 1 ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                {buyNowLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    {!displayInStock ? "Out of Stock" : "Buy Now"}
                  </>
                )}
              </button>
            </div>
            <button onClick={() => navigate(-1)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3">
              {[{ icon: ShieldCheck, label: "100% Genuine", bg: "bg-blue-50", color: "text-blue-600" },
                { icon: Truck, label: "Free Delivery ₹999+", bg: "bg-green-50", color: "text-green-600" },
                { icon: RotateCcw, label: "7-Day Returns", bg: "bg-orange-50", color: "text-orange-500" }
              ].map(({ icon: Icon, label, bg, color }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center`}><Icon className={`w-4 h-4 ${color}`} /></div>
                  <span className="text-[11px] text-gray-500 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {specs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
            <div className="divide-y divide-gray-50">
              {specs.map((spec, i) => (
                <div key={i} className="flex py-3 gap-4">
                  <span className="text-sm text-gray-500 font-medium w-40 shrink-0">{spec.label}</span>
                  <span className="text-sm text-gray-800 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Related Products</h2>
              <Link to={`/products?category=${categorySlug}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
