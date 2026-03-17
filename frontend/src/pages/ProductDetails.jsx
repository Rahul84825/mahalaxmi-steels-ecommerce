import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, Star, BadgeCheck,
  Truck, ShieldCheck, RotateCcw, Minus, Plus,
  ChevronRight, PackageX,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { api } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel, getCategorySlug } from "../utils/category";

const StarRating = ({ rating }) => (
  <div className="flex">
    {[1,2,3,4,5].map((star) => (
      <Star key={star} className={`w-4 h-4 ${star <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-300"}`} />
    ))}
  </div>
);

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
  const { addToCart }   = useCart();
  const { categories, markProductViewed }  = useProducts();

  const [product, setProduct]     = useState(null);
  const [related, setRelated]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const [qty, setQty]             = useState(1);
  const [added, setAdded]         = useState(false);

  useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    if (!product) return;
    markProductViewed(product._id || product.id);
  }, [product, markProductViewed]);

  async function fetchProduct() {
    setLoading(true); setError(false);
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
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  const handleAddToCart = () => {
    if (!product?.inStock) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (error || !product) return <ProductNotFound />;

  // Build gallery: primary `image` first, then unique valid entries from `images[]`
  const allImages = [];
  if (product.image && product.image.startsWith("http")) allImages.push(product.image);
  if (product.images?.length) {
    product.images.forEach((img) => {
      if (img && img.startsWith("http") && !allImages.includes(img)) allImages.push(img);
    });
  }
  const hasImages = allImages.length > 0;
  const currentSrc = hasImages && !imgErrors[activeImg] ? allImages[activeImg] : null;
  const isEmojiImage = product.image && !product.image.startsWith("http");
  const mrp = product.mrp || product.originalPrice || 0;
  const discount = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;
  const savings = mrp > product.price ? mrp - product.price : 0;
  const categoryLabel = getCategoryLabel(product.category, categories);
  const categorySlug  = getCategorySlug(product.category, categories);
  const specs = product.specifications
    ? Object.entries(product.specifications).map(([label, value]) => ({ label, value }))
    : [];

  // rating > 0 to avoid rendering "0"
  const hasRating = product.rating > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
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
                {(product.isNew || product.featured) && <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{product.isNew ? "NEW" : "FEATURED"}</span>}
                {discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">-{discount}%</span>}
                {!product.inStock && <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">Sold Out</span>}
              </div>
              {currentSrc ? (
                <img src={currentSrc} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onError={() => setImgErrors((p) => ({ ...p, [activeImg]: true }))} />
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

            {/* Rating — only show if rating > 0 */}
            {hasRating && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating} />
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                {product.reviews > 0 && <span className="text-sm text-gray-400">({product.reviews} reviews)</span>}
                {product.rating >= 4.7 && <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold"><BadgeCheck className="w-3.5 h-3.5" /> Top Rated</span>}
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString("en-IN")}</span>
              {mrp > product.price && (
                <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString("en-IN")}</span>
              )}
            </div>
            {savings > 0 && <p className="text-sm font-semibold text-green-600 mb-4">You save ₹{savings.toLocaleString("en-IN")} ({discount}% off)</p>}

            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-400"}`} />
              <span className={`text-sm font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                {product.inStock ? "In Stock — Ready to Ship" : "Out of Stock"}
              </span>
            </div>

            {product.description && <p className="text-sm text-gray-600 leading-relaxed mb-6 border-t border-gray-100 pt-5">{product.description}</p>}

            {product.inStock && (
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q-1))} disabled={qty<=1} className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="px-5 py-2 text-sm font-bold text-gray-800 border-x border-gray-200 min-w-12 text-center">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(10, q+1))} disabled={qty>=10} className="px-3 py-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-gray-400">Max 10 per order</span>
              </div>
            )}
            {product.inStock && qty > 1 && <p className="text-xs text-gray-500 mb-4">Total: <span className="font-bold text-gray-800">₹{(product.price * qty).toLocaleString("en-IN")}</span></p>}

            <button onClick={handleAddToCart} disabled={!product.inStock}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-bold transition-all duration-300 mb-3
                ${added ? "bg-green-500 text-white scale-95" : product.inStock ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
              <ShoppingCart className="w-5 h-5" />
              {added ? `Added ${qty > 1 ? `(${qty})` : ""} to Cart!` : product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
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