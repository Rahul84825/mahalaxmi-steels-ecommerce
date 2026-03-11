import { NavLink } from "react-router-dom";
import { Truck, Clock, MapPin, Phone, Mail, ArrowLeft, Package, CheckCircle } from "lucide-react";

const SHIPPING_POINTS = [
  {
    icon: MapPin,
    title: "Local Delivery Area",
    desc: "We provide delivery services within Akurdi, Pimpri-Chinchwad, and nearby areas in Pune. For deliveries outside this region, please contact us directly to discuss availability.",
  },
  {
    icon: Clock,
    title: "Processing Time",
    desc: "Orders are processed within 1–2 business days after confirmation. You will receive a call or message once your order is ready for dispatch.",
  },
  {
    icon: Truck,
    title: "Delivery Timeline",
    desc: "Local deliveries are typically completed within 2–4 business days of order processing. Delivery time may vary during festive seasons or high-demand periods.",
  },
  {
    icon: Package,
    title: "Order Tracking",
    desc: "Once your order is dispatched, you will be notified via phone call or WhatsApp with estimated delivery details. For any updates, feel free to contact us.",
  },
  {
    icon: CheckCircle,
    title: "Delivery Charges",
    desc: "Delivery within Akurdi and nearby areas is free for orders above ₹999. For orders below ₹999, a nominal delivery charge of ₹79 may apply. Self-pickup from our store is always free.",
  },
];

const ShippingPolicy = () => (
  <main className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <NavLink to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </NavLink>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center ring-1 ring-blue-100">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Shipping Policy</h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
          Everything you need to know about how we deliver your orders from our store to your doorstep.
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">

        <div className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            At <strong className="text-slate-900">Mahalaxmi Steels and Home Appliance</strong>, we are committed to delivering your products safely and on time. We primarily serve customers in Akurdi, Pimpri-Chinchwad, and surrounding areas in Pune.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Customers can also visit our shop at <strong className="text-slate-900">Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune, Maharashtra 411035</strong> for self-pickup.
          </p>
        </div>

        <div className="space-y-5">
          {SHIPPING_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Questions about delivery?</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Reach out to us anytime for delivery-related queries:
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <a href="tel:+919561878293" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              <Phone className="w-4 h-4" /> +91 95618 78293
            </a>
            <a href="mailto:mahalaxmisteels08@gmail.com" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              <Mail className="w-4 h-4" /> mahalaxmisteels08@gmail.com
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
          Last updated: March 2026 · Mahalaxmi Steels and Home Appliance
        </p>
      </div>
    </div>
  </main>
);

export default ShippingPolicy;
