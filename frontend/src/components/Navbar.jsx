import { useState, useRef, useCallback, memo, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Search,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";

// ── onCartOpen prop added — called when cart icon is clicked ─────────
const Navbar = memo(({ onCartOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { wishlist } = useProducts();
  const { user, logout, loading } = useAuth();

  const isProductsPage = location.pathname === "/products";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setSearchQuery(q);
  }, [location.search]);

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-xl text-base font-bold transition-colors duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!(searchQuery || "").trim()) return;
    navigate(`/products?search=${encodeURIComponent((searchQuery || "").trim())}`);
    setMobileSearchOpen(false);
  }, [searchQuery, navigate]);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val === "") {
      navigate("/products");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }, [logout, navigate]);

  const handleUserMenuBlur = useCallback((e) => {
    if (!userMenuRef.current?.contains(e.relatedTarget)) {
      setUserMenuOpen(false);
    }
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const toggleMobileSearch = useCallback(() => setMobileSearchOpen((o) => !o), []);

  // ── Cart button handler — opens drawer if onCartOpen provided ───────
  const handleCartClick = useCallback((e) => {
    if (onCartOpen) {
      e.preventDefault();
      onCartOpen();
    }
    // if no onCartOpen prop, NavLink navigates normally to /cart
  }, [onCartOpen]);

  const renderDesktopAuth = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse border border-slate-200" />
          <div className="w-24 h-10 rounded-full bg-slate-100 animate-pulse border border-slate-200" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="relative" ref={userMenuRef} onBlur={handleUserMenuBlur}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-300 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:shadow-lg transition-all duration-300">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate group-hover:text-blue-600 transition-colors">
              {user.name}
            </span>
          </button>

          <div
            className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 transition-all duration-150 origin-top-right ${
              userMenuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            <div className="px-3 py-2 mb-1 border-b border-slate-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Account</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            </div>

            {user.role === "admin" && (
              <button
                onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors mt-1"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-500" />
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors mt-1"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <NavLink
          to="/login"
          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
          aria-label="Login"
        >
          <User className="w-5 h-5" />
        </NavLink>
        <NavLink
          to="/signup"
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-blue-600 shadow-md hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Sign Up
        </NavLink>
      </div>
    );
  };

  const renderMobileAuth = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3">
          <div className="h-12 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="h-12 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
        </div>
      );
    }

    if (user) {
      return (
        <>
          <div className="px-4 py-3 text-sm text-slate-500 bg-slate-50 rounded-xl mb-2">
            Signed in as <span className="font-bold text-slate-900 block">{user.name}</span>
          </div>
          {user.role === "admin" && (
            <button
              onClick={() => { navigate("/admin"); setMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin Panel
            </button>
          )}
          <button
            onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </>
      );
    }

    return (
      <div className="flex flex-col gap-3 mt-2">
        <NavLink
          to="/login"
          onClick={() => setMenuOpen(false)}
          className="text-center px-4 py-3.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Log In
        </NavLink>
        <NavLink
          to="/signup"
          onClick={() => setMenuOpen(false)}
          className="text-center px-4 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
        >
          Create Account
        </NavLink>
      </div>
    );
  };

  // ── Shared cart button — reused in desktop + mobile ──────────────
  const CartButton = ({ className = "", iconSize = "w-5 h-5" }) => (
    <NavLink
      to="/cart"
      onClick={handleCartClick}
      className={`relative rounded-full transition-all duration-300 ${className}`}
      aria-label="Cart"
    >
      <ShoppingCart className={iconSize} />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </NavLink>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">

          {/* ── Brand ── */}
          <NavLink to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-blue-900/20 transition-transform duration-200">
              <span className="text-white font-black text-base sm:text-lg drop-shadow-sm">M</span>
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight block truncate group-hover:text-blue-600 transition-colors">
                MahaLaxmi Steel
              </span>
              <p className="text-blue-400/80 text-[10px] sm:text-xs font-semibold tracking-wide uppercase leading-tight">
                & Home Appliance
              </p>
            </div>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <ul className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <li><NavLink to="/" className={navLinkClass} end>Home</NavLink></li>
            <li><NavLink to="/products" className={navLinkClass}>Products</NavLink></li>
            <li><NavLink to="/about" className={navLinkClass}>About Us</NavLink></li>
            <li><NavLink to="/contact" className={navLinkClass}>Contact</NavLink></li>
          </ul>

          {/* ── Desktop Search (only on /products) ── */}
          <div
            className={`hidden md:flex flex-1 max-w-sm transition-opacity duration-200 ${
              isProductsPage ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none w-0"
            }`}
          >
            {isProductsPage && (
              <form onSubmit={handleSearch} className="w-full relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search appliances, steelware..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-medium text-slate-700 bg-slate-100/80 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); navigate("/products"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>
            )}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Wishlist */}
            <NavLink
              to="/products?wishlist=1"
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-300 relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlist.length > 99 ? "99+" : wishlist.length}
                </span>
              )}
            </NavLink>

            {/* ── Cart icon → opens drawer ── */}
            <CartButton className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 mr-2 hover:-translate-y-0.5" />

            {renderDesktopAuth()}
          </div>

          {/* ── Mobile: Search + Cart + Hamburger ── */}
          <div className="flex items-center gap-1 md:hidden flex-shrink-0">
            {isProductsPage && (
              <button
                onClick={toggleMobileSearch}
                className={`p-2 rounded-full transition-colors ${mobileSearchOpen ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
                aria-label="Toggle search"
              >
                {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            )}

            {/* Wishlist */}
            <NavLink
              to="/products?wishlist=1"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlist.length > 99 ? "99+" : wishlist.length}
                </span>
              )}
            </NavLink>

            {/* ── Mobile Cart icon → opens drawer ── */}
            <CartButton className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50" iconSize="w-5 h-5" />

            {/* Hamburger */}
            <button
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-full"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <div className="space-y-1.5">
                <span className={`block w-5 h-0.5 bg-current rounded-full transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block w-5 h-0.5 bg-current rounded-full transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-current rounded-full transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Search Bar ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-150 ease-out ${
          mobileSearchOpen && isProductsPage
            ? "max-h-24 opacity-100 border-t border-slate-100 bg-slate-50/50"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-3 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              autoFocus={mobileSearchOpen}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); navigate("/products"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-150 ease-out bg-white shadow-lg ${
          menuOpen ? "max-h-[500px] opacity-100 border-t border-slate-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          <NavLink to="/" end onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>Home</NavLink>
          <NavLink to="/products" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>Products</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>About</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)} className={mobileNavLinkClass}>Contact</NavLink>

          <div className="pt-5 mt-2 border-t border-slate-100 flex flex-col">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Account</p>
            {renderMobileAuth()}
          </div>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;