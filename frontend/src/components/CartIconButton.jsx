/**
 * CartIconButton
 * 
 * Drop this anywhere in your Navbar where the cart icon lives.
 * 
 * Usage:
 *   import CartIconButton from "./CartIconButton";
 *   <CartIconButton onClick={() => setCartOpen(true)} />
 */
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartIconButton = ({ onClick, className = "" }) => {
  const { cartCount } = useCart();

  return (
    <button
      onClick={onClick}
      aria-label={`Cart (${cartCount} items)`}
      className={`relative p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors active:scale-90 ${className}`}
    >
      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
      {cartCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-sm animate-in fade-in zoom-in duration-150">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );
};

export default CartIconButton;