import { useEffect, useCallback } from "react";
import { X, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCheckout = useCallback(() => {
    onClose();
    navigate("/checkout");
  }, [navigate, onClose]);

  const delivery = cartTotal >= 999 ? 0 : 79;
  const grandTotal = cartTotal + delivery;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Drawer Panel ── */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
            {cartCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Items List ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ShoppingCart className="w-9 h-9 text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-slate-700 mb-1">Your cart is empty</p>
                <p className="text-sm text-slate-400">Add some products to get started</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem key={item._id || item.id} item={item} />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        {cartItems.length > 0 && (
          <div className="shrink-0 border-t border-slate-100 px-5 py-4 space-y-3 bg-white">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-700">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery</span>
                {delivery === 0 ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : (
                  <span className="font-medium text-slate-700">₹{delivery}</span>
                )}
              </div>
              {delivery > 0 && (
                <p className="text-[11px] text-slate-400">
                  Add ₹{(999 - cartTotal).toLocaleString()} more for free delivery
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-slate-900/10 active:scale-95 text-sm"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;