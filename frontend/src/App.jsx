import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

// Policy Pages
import ShippingPolicy from "./pages/policies/ShippingPolicy";
import ReturnsExchange from "./pages/policies/ReturnsExchange";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsConditions from "./pages/policies/TermsConditions";

// Admin
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminProductForm from "./admin/AdminProductForm";
import AdminOffers from "./admin/AdminOffers";
import AdminOrders from "./admin/AdminOrders";
import AdminCategories from "./admin/AdminCategories";

// Contexts
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";

// ── Pages where footer should NOT appear ─────────────────────────────────────
const NO_FOOTER_ROUTES = ["/cart", "/checkout", "/login", "/signup"];

// ── AdminGuard ────────────────────────────────────────────────────────────────
const AdminGuard = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

// ── Storefront layout — conditionally renders Footer ─────────────────────────
const StorefrontLayout = () => {
  const { cartCount } = useCart();
  const location      = useLocation();

  // Hide footer on cart, checkout, login, signup
  const showFooter = !NO_FOOTER_ROUTES.includes(location.pathname);

  return (
    <>
      <Navbar cartCount={cartCount} />
      <Outlet />
      {showFooter && <Footer />}
    </>
  );
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <Router>
    <ScrollToTop />
    <Routes>

      {/* Admin — protected, no Navbar/Footer */}
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index                    element={<AdminDashboard />} />
        <Route path="products"          element={<AdminProducts />} />
        <Route path="products/add"      element={<AdminProductForm mode="add" />} />
        <Route path="products/edit/:id" element={<AdminProductForm mode="edit" />} />
        <Route path="orders"            element={<AdminOrders />} />
        <Route path="categories"        element={<AdminCategories />} />
        <Route path="offers"            element={<AdminOffers />} />
      </Route>

      {/* Storefront */}
      <Route element={<StorefrontLayout />}>
        <Route path="/"             element={<Home />} />
        <Route path="/products"     element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart"         element={<Cart />} />
        <Route path="/checkout"     element={<Checkout />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/signup"       element={<Signup />} />
        <Route path="/about"        element={<About />} />
        <Route path="/contact"      element={<Contact />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/shipping-policy"   element={<ShippingPolicy />} />
        <Route path="/returns-exchanges"  element={<ReturnsExchange />} />
        <Route path="/privacy-policy"     element={<PrivacyPolicy />} />
        <Route path="/terms-conditions"   element={<TermsConditions />} />
        <Route path="*"             element={<NotFound />} />
      </Route>

    </Routes>
  </Router>
);

export default App;