import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, ShoppingBag, MapPin, CreditCard, Smartphone,
  Banknote, ChevronRight, CheckCircle2, Truck, ShieldCheck,
  RotateCcw, Edit2,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { checkDeliveryEligibility, MAX_DELIVERY_RADIUS_KM } from "../utils/delivery";
import { DeliveryNotice } from "../components/DeliveryNotice";

const STEPS = ["Address", "Payment", "Confirm"];

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const isRenderableImage = (src) =>
  typeof src === "string" &&
  /^(https?:\/\/|\/|data:image\/)/i.test(src.trim());

const normalizePhone = (phone = "") => phone.replace(/[^\d+]/g, "");
const isValidIndianPhone = (phone = "") =>
  /^(\+91)?[6-9]\d{9}$/.test(normalizePhone(phone).replace(/^\+91/, ""));

// ── Step Bar ──────────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((step, i) => (
      <div key={step} className="flex items-center">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
            ${i < current ? "bg-blue-600 border-blue-600 text-white" : i === current ? "bg-white border-blue-600 text-blue-600" : "bg-white border-gray-200 text-gray-400"}`}>
            {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-[10px] font-semibold mt-1 ${i === current ? "text-blue-600" : i < current ? "text-blue-400" : "text-gray-400"}`}>{step}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-all ${i < current ? "bg-blue-600" : "bg-gray-200"}`} />
        )}
      </div>
    ))}
  </div>
);

// ── Address Field ─────────────────────────────────────────────────────────────
const AddressField = ({ label, name, placeholder, required, half, value, onChange, error }) => (
  <div className={half ? "col-span-1" : "col-span-2"}>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ── Address Form ──────────────────────────────────────────────────────────────
const AddressForm = ({ data, onChange, errors }) => {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Delivery Address</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <AddressField label="Full Name"                  name="name"     placeholder="Rajesh Kumar"                        required half value={data.name || ""}     onChange={(e) => set("name", e.target.value)}     error={errors.name} />
        <AddressField label="Phone Number"               name="phone"    placeholder="+91 98765 43210"                    required half value={data.phone || ""}    onChange={(e) => set("phone", e.target.value)}    error={errors.phone} />
        <AddressField label="Email"                      name="email"    placeholder="you@email.com"                      required       value={data.email || ""}    onChange={(e) => set("email", e.target.value)}    error={errors.email} />
        <AddressField label="Address Line 1"             name="address1" placeholder="Flat / House No, Building, Street"  required       value={data.address1 || ""} onChange={(e) => set("address1", e.target.value)} error={errors.address1} />
        <AddressField label="Address Line 2 (optional)"  name="address2" placeholder="Area, Colony, Landmark"                            value={data.address2 || ""} onChange={(e) => set("address2", e.target.value)} error={errors.address2} />
        <AddressField label="City"                       name="city"     placeholder="Pune"                               required half value={data.city || ""}     onChange={(e) => set("city", e.target.value)}     error={errors.city} />
        <AddressField label="Pincode"                    name="pincode"  placeholder="411035"                             required half value={data.pincode || ""}  onChange={(e) => set("pincode", e.target.value)}  error={errors.pincode} />
        <AddressField label="State"                      name="state"    placeholder="Maharashtra"                        required half value={data.state || ""}    onChange={(e) => set("state", e.target.value)}    error={errors.state} />
        <AddressField label="Country"                    name="country"  placeholder="India"                              required half value={data.country || ""}  onChange={(e) => set("country", e.target.value)}  error={errors.country} />
      </div>
    </div>
  );
};

// ── Payment Form ──────────────────────────────────────────────────────────────
const UPI_ID = import.meta.env.VITE_SHOP_UPI_ID || "rahul@oksbi";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives",         icon: Banknote,   color: "text-orange-600", bg: "bg-orange-50" },
  { id: "upi", label: "Pay with UPI",     desc: "Pay via GPay, PhonePe, Paytm, BHIM", icon: Smartphone, color: "text-green-600",  bg: "bg-green-50"  },
];

const PaymentForm = ({ selected, onSelect, errors, orderTotal }) => (
  <div>
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
        <CreditCard className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Payment Method</h3>
    </div>
    <div className="space-y-3">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isSelected = selected === method.id;
        return (
          <div key={method.id}>
            <button
              onClick={() => onSelect(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-200 bg-white"}`}
            >
              <div className={`w-10 h-10 ${method.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${method.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{method.label}</p>
                <p className="text-xs text-gray-500">{method.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-blue-500" : "border-gray-300"}`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
            </button>

            {isSelected && method.id === "cod" && (
              <div className="mt-2 ml-14 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                <p className="text-xs text-orange-700 font-medium">₹50 COD handling fee applies. Pay in cash when delivered.</p>
              </div>
            )}

            {isSelected && method.id === "upi" && (
              <div className="mt-3 ml-14 space-y-3">
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-green-800 font-semibold mb-2">Scan QR code or tap the button below to pay via UPI</p>
                  <div className="flex justify-center mb-3">
                    <QRCodeSVG
                      value={`upi://pay?pa=${UPI_ID}&pn=Mahalaxmi%20Steels&am=${orderTotal}&cu=INR`}
                      size={180}
                      className="rounded-lg border border-green-200"
                    />
                  </div>
                  <a
                    href={`upi://pay?pa=${UPI_ID}&pn=Mahalaxmi%20Steels&am=${orderTotal}&cu=INR`}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pay ₹{orderTotal.toLocaleString("en-IN")} via UPI
                  </a>
                  <p className="text-[11px] text-green-600 mt-2 text-center">UPI ID: {UPI_ID}</p>
                </div>
                <p className="text-xs text-gray-500">After paying, place your order and enter the UPI Transaction ID on the next screen.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
    {errors.payment && <p className="text-xs text-red-500 mt-2">{errors.payment}</p>}
  </div>
);

// ── Order Summary ─────────────────────────────────────────────────────────────
const OrderSummary = ({ cartItems, cartTotal, codFee = 0 }) => {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];
  const originalTotal = Math.round(safeItems.reduce(
    (s, i) => s + toNumber(i.originalPrice || i.mrp || i.price) * toNumber(i.quantity ?? i.qty ?? 1, 1),
    0
  ));
  const safeCartTotal = toNumber(cartTotal);
  const savings = Math.round(originalTotal - safeCartTotal);
  const delivery = safeCartTotal >= 999 ? 0 : 79;
  const total = Math.round(safeCartTotal + delivery + toNumber(codFee));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-base font-bold text-gray-800 mb-4">
        Order Summary{" "}
        <span className="ml-2 text-xs text-gray-400 font-normal">
          ({safeItems.reduce((s, i) => s + toNumber(i.quantity ?? i.qty ?? 1, 1), 0)} items)
        </span>
      </h3>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {safeItems.map((item) => {
          const imageSrc = item.images?.[0] || item.image || item.imageUrl || item.product?.images?.[0] || item.product?.image || "";
          const canRender = isRenderableImage(imageSrc);
          const qty = toNumber(item.quantity ?? item.qty ?? 1, 1);
          const linePrice = Math.round(toNumber(item.price) * qty);
          return (
            <div key={item._id || item.id} className="flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                {canRender ? (
                  <img src={imageSrc} alt={item.name || "Product"} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                ) : (
                  <span className="text-lg">🛒</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {qty}</p>
              </div>
              <p className="text-xs font-bold text-gray-900 flex-shrink-0">₹{linePrice.toLocaleString("en-IN")}</p>
            </div>
          );
        })}
      </div>
      <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{safeCartTotal.toLocaleString("en-IN")}</span></div>
        {savings > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>− ₹{savings.toLocaleString("en-IN")}</span></div>}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          {delivery === 0 ? <span className="text-green-600 font-medium">FREE</span> : <span>₹{delivery}</span>}
        </div>
        {codFee > 0 && <div className="flex justify-between text-orange-600"><span>COD Fee</span><span>₹{codFee}</span></div>}
        <div className="flex justify-between font-bold text-base text-gray-900 border-t border-dashed border-gray-200 pt-2">
          <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
};

// ── Order Confirmation ────────────────────────────────────────────────────────
const OrderConfirmation = ({ orderId, dbOrderId, address = {}, paymentMethod = "", totalAmount = 0, onSubmitUpiTxn }) => {
  // Use the total already calculated by checkout and stored in the order — do NOT recalculate.
  const total = toNumber(totalAmount);

  const [upiTxnId, setUpiTxnId]     = useState("");
  const [txnSubmitted, setTxnSubmitted] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const handleTxnSubmit = async () => {
    if (!(upiTxnId || "").trim()) return;
    setSubmitting(true);
    try {
      await onSubmitUpiTxn(dbOrderId, (upiTxnId || "").trim());
      setTxnSubmitted(true);
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
      <p className="text-gray-500 text-sm mb-1">Thank you, {address.name || "Customer"}!</p>
      <p className="text-gray-500 text-sm mb-6">
        Your order <span className="font-bold text-gray-800">#{orderId || "Pending"}</span> has been confirmed.
      </p>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left mb-5 space-y-3 text-sm">
        {[
          ["Order ID",    `#${orderId}`],
          ["Amount",      `₹${total.toLocaleString("en-IN")}`],
          ["Payment",     paymentMethod === "cod" ? "Cash on Delivery" : "UPI"],
          ["Deliver to",  `${address.address1}, ${address.city} — ${address.pincode}`],
          ["Est. Delivery", "3–5 Business Days"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right max-w-[200px]">{value}</span>
          </div>
        ))}
      </div>

      {/* UPI Transaction ID form */}
      {paymentMethod === "upi" && !txnSubmitted && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-5 text-left">
          <h4 className="text-sm font-bold text-green-800 mb-2">Enter UPI Transaction ID</h4>
          <p className="text-xs text-green-700 mb-3">Please enter the UPI transaction/reference ID from your payment app to confirm your payment.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={upiTxnId}
              onChange={(e) => setUpiTxnId(e.target.value)}
              placeholder="e.g. 412345678901"
              className="flex-1 px-3 py-2.5 text-sm border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleTxnSubmit}
              disabled={submitting || !(upiTxnId || "").trim()}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      )}
      {paymentMethod === "upi" && txnSubmitted && (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-800">UPI Transaction ID submitted successfully!</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mb-6">
        Confirmation will be sent to <span className="font-medium text-gray-600">{address.email}</span>
      </p>
      <div className="flex justify-center gap-6 mb-8">
        {[
          { icon: ShieldCheck, label: "Genuine",     bg: "bg-blue-50",   color: "text-blue-600"   },
          { icon: Truck,       label: "Fast Ship",   bg: "bg-green-50",  color: "text-green-600"  },
          { icon: RotateCcw,   label: "Easy Return", bg: "bg-orange-50", color: "text-orange-500" },
        ].map(({ icon: Icon, label, bg, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 ${bg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/products" className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
        <Link to="/" className="flex-1 flex items-center justify-center border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

// ── Login Wall ────────────────────────────────────────────────────────────────
const LoginWall = ({ onLogin }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
      <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Please sign in</h2>
      <p className="text-slate-500 mb-6">You need an account to continue to checkout.</p>
      <button
        type="button"
        onClick={onLogin}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Go to Login
      </button>
    </div>
  </div>
);

// ── Main Checkout Component ───────────────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { placeOrder, submitUpiTxnId } = useProducts();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  // ── State ─────────────────────────────────────────────────────────
  const [step,                   setStep]                   = useState(0);
  const [address,                setAddress]                = useState({ name: "", phone: "", email: "", address1: "", address2: "", city: "", pincode: "", state: "Maharashtra", country: "India" });
  const [paymentMethod,          setPayment]                = useState("");
  const [errors,                 setErrors]                 = useState({});
  const [placing,                setPlacing]                = useState(false);
  const [checkingDelivery,       setCheckingDelivery]       = useState(false);
  const [deliveryDistance,       setDeliveryDistance]       = useState(null);
  const [confirmedOrderId,       setConfirmedOrderId]       = useState("");
  const [confirmedDbOrderId,     setConfirmedDbOrderId]     = useState("");
  const [confirmedCartTotal,     setConfirmedCartTotal]     = useState(0);
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState("");

  // ── Pre-fill from logged-in user ──────────────────────────────────
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        name:     prev.name     || user.name           || "",
        email:    prev.email    || user.email          || "",
        phone:    prev.phone    || user.phone          || "",
        address1: prev.address1 || user.address?.line1   || "",
        city:     prev.city     || user.address?.city    || "",
        pincode:  prev.pincode  || user.address?.pincode || "",
        state:    prev.state    || user.address?.state   || "Maharashtra",
      }));
    }
  }, [user]);

  // ── Derived values (must be before any returns) ───────────────────
  const codFee       = paymentMethod === "cod" ? 50 : 0;
  const safeCartTotal = toNumber(cartTotal);
  const currentTotal  = safeCartTotal + (safeCartTotal >= 999 ? 0 : 79) + codFee;

  // ── Validate delivery radius ──────────────────────────────────
  const validateDeliveryRadius = async () => {
    setCheckingDelivery(true);
    try {
      const result = await checkDeliveryEligibility(
        address.pincode,
        address.city,
        address.state
      );
      setDeliveryDistance(result.distance);
      if (!result.withinRadius) {
        return {
          delivery: `Sorry! Your location is approximately ${result.distance} KM from our store. We currently deliver only within ${MAX_DELIVERY_RADIUS_KM} KM of our store in Akurdi, Pune.`,
        };
      }
      return {};
    } catch {
      // If geocoding fails, allow the order (backend will re-check)
      return {};
    } finally {
      setCheckingDelivery(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────────
  const validateAddress = () => {
    const e = {};
    if (!(address.name || "").trim())    e.name    = "Full name is required";
    if (!(address.phone || "").trim())   e.phone   = "Phone number is required";
    else if (!isValidIndianPhone(address.phone)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (!(address.email || "").trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(address.email)) e.email = "Enter a valid email";
    if (!(address.address1 || "").trim()) e.address1 = "Address is required";
    if (!(address.city || "").trim())    e.city    = "City is required";
    if (!(address.pincode || "").trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(address.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!(address.state || "").trim())   e.state   = "State is required";
    return e;
  };

  // ── Place Order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (safeCartItems.length === 0) {
      setErrors({ submit: "Your cart is empty." });
      return;
    }

    setPlacing(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const order = await placeOrder({
        cartItems: safeCartItems,
        address,
        paymentMethod,
      });

      const dbOrderId = order?._id || order?.id;
      const resolvedOrderId = order?.orderId || dbOrderId || `TEMP-${Date.now()}`;
      const resolvedTotal   = toNumber(order?.total, 0) || currentTotal;

      setConfirmedOrderId(resolvedOrderId);
      setConfirmedDbOrderId(dbOrderId);
      setConfirmedCartTotal(resolvedTotal);
      setConfirmedPaymentMethod(paymentMethod);

      clearCart();
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Something went wrong while placing your order. Please try again.";
      setErrors({ submit: message });
    } finally {
      setPlacing(false);
    }
  };

  // ── Next Step Handler ─────────────────────────────────────────────
  const handleNext = async () => {
    if (step === 0) {
      const e = validateAddress();
      if (Object.keys(e).length > 0) {
        setErrors((prev) => ({ ...prev, ...e }));
        return;
      }
      setErrors((prev) => {
        const { name, phone, email, address1, city, pincode, state, delivery, ...rest } = prev;
        return rest;
      });

      // Check delivery radius
      const deliveryErrors = await validateDeliveryRadius();
      if (Object.keys(deliveryErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...deliveryErrors }));
        return;
      }

      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (step === 1) {
      const e = {};
      if (!paymentMethod) e.payment = "Please select a payment method";
      if (Object.keys(e).length > 0) {
        setErrors((prev) => ({ ...prev, ...e }));
        return;
      }
      setErrors((prev) => {
        const { payment, ...rest } = prev;
        return rest;
      });
      await handlePlaceOrder();
    }
  };

  // ── Guards (AFTER all hooks and function definitions) ─────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginWall onLogin={() => navigate("/login?redirect=/checkout", { replace: true })} />;
  }

  if (safeCartItems.length === 0 && step < 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-50">
        <ShoppingBag className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

        {step < 2 && (
          <div className="mb-6">
            <button
              onClick={() => step === 0 ? navigate("/cart") : setStep(0)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Back to Cart" : "Back to Address"}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        )}

        {step < 2 && <StepBar current={step} />}

        {step === 2 ? (
          <OrderConfirmation
            orderId={confirmedOrderId}
            dbOrderId={confirmedDbOrderId}
            address={address}
            paymentMethod={confirmedPaymentMethod || paymentMethod}
            totalAmount={confirmedCartTotal}
            onSubmitUpiTxn={submitUpiTxnId}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ── Left: Form Panel ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              {step === 0 && (
                <AddressForm data={address} onChange={setAddress} errors={errors} />
              )}

              {step === 0 && (
                <>
                  <DeliveryNotice className="mt-5" />
                  {errors.delivery && (
                    <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <span className="text-lg flex-shrink-0">❌</span>
                      <p className="text-sm font-medium text-red-700">{errors.delivery}</p>
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  {/* Address summary */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{address.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {address.address1}{address.address2 ? `, ${address.address2}` : ""}, {address.city} — {address.pincode}
                        </p>
                        <p className="text-xs text-gray-500">{address.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(0)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <PaymentForm
                    selected={paymentMethod}
                    onSelect={setPayment}
                    errors={errors}
                    orderTotal={currentTotal}
                  />
                </>
              )}

              {errors.submit && (
                <p className="mt-4 text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  {errors.submit}
                </p>
              )}

              <button
                onClick={handleNext}
                disabled={placing || checkingDelivery}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {placing || checkingDelivery ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {checkingDelivery ? "Checking Delivery Area..." : "Placing Order..."}
                  </>
                ) : step === 0 ? (
                  <>Continue to Payment <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Place Order · ₹{currentTotal.toLocaleString("en-IN")} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="sticky top-[88px]">
              <OrderSummary
                cartItems={safeCartItems}
                cartTotal={safeCartTotal}
                codFee={codFee}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;