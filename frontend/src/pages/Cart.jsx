import { useNavigate, Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw, ChevronRight, PackageX, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel } from "../utils/category";

const CATEGORY_COLORS = {
  "Stainless Steel": "bg-slate-50 text-slate-600 border-slate-100",
  "Copper Utensils":  "bg-orange-50 text-orange-600 border-orange-100",
  "Pooja Essentials": "bg-rose-50 text-rose-500 border-rose-100",
  "Pital (Brass)":    "bg-amber-50 text-amber-600 border-amber-100",
  "Home Appliances":  "bg-blue-50 text-blue-600 border-blue-100",
};

const EMOJI_MAP = { "Stainless Steel": "🥘", "Copper Utensils": "🏺", "Pooja Essentials": "🪔", "Pital (Brass)": "✨", "Home Appliances": "🔌" };

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { categories } = useProducts();
  const id = item._id || item.id;
  const variantId = item.variant_id || null;
  const originalPrice = item.originalPrice || item.mrp || item.price;
  const savings = Math.round(originalPrice - item.price);
  const discountPct = originalPrice > item.price ? Math.round((savings / originalPrice) * 100) : 0;

  const categoryLabel = getCategoryLabel(item.category, categories);
  const hasRealImage = item.image && item.image.startsWith("http");

  return (
    <div className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* ── Image ── */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
        {hasRealImage ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display="none"; e.target.parentNode.innerHTML=`<span class="text-4xl opacity-80">${EMOJI_MAP[categoryLabel] || "🛒"}</span>`; }} />
        ) : item.image && !item.image.startsWith("http") ? (
          <span className="text-4xl opacity-80">{item.image}</span>
        ) : (
          <span className="text-4xl opacity-80">{EMOJI_MAP[categoryLabel] || "🛒"}</span>
        )}
      </div>

      {/* ── Details ── */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <div>
            {categoryLabel && (
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[categoryLabel] || "bg-slate-50 border-slate-100 text-slate-500"}`}>
                {categoryLabel}
              </span>
            )}
            <h3 className="mt-2 text-sm sm:text-base font-semibold text-slate-800 leading-snug line-clamp-2">
              {item.name}
            </h3>
            {item.variant?.label && (
              <p className="mt-1 text-xs font-semibold text-blue-700 bg-blue-50 inline-flex px-2 py-0.5 rounded-full border border-blue-100">
                Variant: {item.variant.label}
              </p>
            )}
          </div>
          <button onClick={() => removeFromCart(id, variantId)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex-shrink-0" title="Remove item">
            <Trash2 size={16} />
          </button>
        </div>

        {/* ── Pricing ── */}
        <div className="mt-2 sm:mt-3 flex items-center gap-2.5 flex-wrap">
          <span className="text-lg font-bold text-slate-800">
            ₹{(item.price * item.quantity).toLocaleString()}
          </span>
          {originalPrice > item.price && (
            <span className="text-sm font-medium text-slate-400 line-through">
              ₹{(originalPrice * item.quantity).toLocaleString()}
            </span>
          )}
          {discountPct > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md ml-auto sm:ml-0">
              {discountPct}% OFF
            </span>
          )}
        </div>
        
        {/* ── Controls & Status ── */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-full h-8 shadow-sm">
            <button onClick={() => updateQuantity(id, item.quantity - 1, variantId)} disabled={item.quantity <= 1} className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Minus size={14} /></button>
            <span className="text-sm font-medium text-slate-700 min-w-[32px] text-center select-none">{item.quantity}</span>
            <button onClick={() => updateQuantity(id, item.quantity + 1, variantId)} disabled={item.quantity >= 10} className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Plus size={14} /></button>
          </div>

          <div className="flex flex-col items-end">
             {item.quantity > 1 && <p className="text-[11px] text-slate-400 mb-0.5">₹{item.price.toLocaleString()} each</p>}
             {item.inStock ? <span className="text-[11px] text-emerald-600 font-medium">✓ In Stock</span> : <span className="text-[11px] text-rose-500 font-medium">Out of Stock</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-20 sm:py-28 text-center px-4">
    <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mb-5">
      <PackageX size={32} className="text-blue-400/80" />
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
    <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">
      Looks like you haven't added anything yet. Explore our collection of beautiful home essentials.
    </p>
    <Link to="/products" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-full hover:bg-blue-700 transition-all duration-300 font-medium shadow-md shadow-blue-600/20 hover:-translate-y-0.5">
      <ShoppingBag size={18} /> Browse Products
    </Link>
  </div>
);

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount } = useCart();

  const originalTotal  = Math.round(cartItems.reduce((sum, item) => sum + (item.originalPrice || item.mrp || item.price) * item.quantity, 0));
  const totalSavings   = Math.round(originalTotal - cartTotal);
  const deliveryCharge = cartTotal >= 999 ? 0 : cartTotal === 0 ? 0 : 79;
  const finalTotal     = Math.round(cartTotal + deliveryCharge);

  if (cartItems.length === 0) {
    return <div className="min-h-[80vh] bg-slate-50/50 flex items-center justify-center"><EmptyCart /></div>;
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* ── Header ── */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Shopping Cart</h1>
            <span className="bg-blue-50 text-blue-600 border border-blue-100 text-xs font-medium px-3 py-1 rounded-full">
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* ── Cart Items List ── */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {totalSavings > 0 && (
              <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 text-emerald-700 px-5 py-3.5 rounded-2xl text-sm font-medium">
                <Tag size={16} className="text-emerald-500" /> 
                <span>You're saving <span className="font-semibold">₹{totalSavings.toLocaleString()}</span> on this order 🎉</span>
              </div>
            )}
            {cartItems.map((item) => <CartItem key={`${item._id || item.id}-${item.variant_id || "base"}`} item={item} />)}
          </div>

          {/* ── Order Summary (Sticky) ── */}
          <div className="sticky top-24 flex flex-col gap-5">
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7">
              <h3 className="text-lg font-bold text-slate-800 mb-5">Order Summary</h3>
              
              <div className="flex flex-col gap-3.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-slate-800">₹{cartTotal.toLocaleString()}</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Product Discount</span>
                    <span className="font-medium">− ₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-slate-600 items-center">
                  <span>Delivery Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium text-slate-800">₹{deliveryCharge}</span>
                  )}
                </div>
                
                {deliveryCharge > 0 && (
                  <p className="text-[11px] text-blue-600 bg-blue-50/50 rounded-lg px-3 py-2 mt-1">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for FREE delivery!
                  </p>
                )}
                
                <div className="border-t border-slate-100 mt-2 pt-4 flex justify-between items-end">
                  <span className="text-base font-semibold text-slate-800">Total Amount</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-800">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button onClick={() => navigate("/checkout")} className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                Proceed to Checkout <ChevronRight size={16} />
              </button>
              
              <p className="mt-4 text-xs text-center text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} /> Secure checkout & genuine products
              </p>
            </div>

            {/* ── Trust Badges ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-col gap-3.5">
                {[
                  { Icon: ShieldCheck, color: "text-blue-500", text: "100% Genuine & Authentic" },
                  { Icon: Truck, color: "text-emerald-500", text: "Free delivery above ₹999" },
                  { Icon: RotateCcw, color: "text-amber-500", text: "Easy returns & local support" }
                ].map(({ Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
                    <Icon size={16} className={`${color} opacity-80`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;