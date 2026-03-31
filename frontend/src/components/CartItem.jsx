import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const id = item._id || item.id;
  const maxQty = item.stock ? Math.min(10, item.stock) : 10;

  return (
    <div className="flex gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 group">
      {/* Product Image */}
      <div className="w-16 h-16 shrink-0 bg-white rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span className="text-2xl hidden items-center justify-center w-full h-full">🛍️</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 leading-snug truncate">{item.name}</p>
        {item.variant?.label && (
          <p className="text-[10px] text-slate-400 mt-0.5">{item.variant.label}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => updateQuantity(id, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-800 min-w-[1.25rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(id, item.quantity + 1)}
              disabled={item.quantity >= maxQty}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 transition-colors active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Price */}
          <p className="text-sm font-black text-slate-900">
            ₹{(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(id)}
        className="self-start mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150 active:scale-90"
        aria-label="Remove item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default CartItem;