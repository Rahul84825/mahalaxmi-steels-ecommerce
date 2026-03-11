import { NavLink } from "react-router-dom";
import { RefreshCw, ArrowLeft, Phone, Mail, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const ELIGIBLE = [
  "The product arrived damaged, broken, or defective.",
  "You received the wrong item or a different variant than ordered.",
  "The product has a manufacturing defect that affects its use.",
];

const NOT_ELIGIBLE = [
  "The product has been used, washed, or altered in any way.",
  "The original packaging, tags, or labels are missing or damaged.",
  "The return request is made after the 2-day window.",
  "The product was damaged due to misuse after delivery.",
];

const STEPS = [
  { step: "1", title: "Contact Us", desc: "Reach out via phone (+91 95618 78293) or email (mahalaxmisteels08@gmail.com) within 2 days of receiving your order." },
  { step: "2", title: "Share Details", desc: "Provide your order details and photos of the damaged or defective product for quick verification." },
  { step: "3", title: "Return the Product", desc: "Once approved, bring the product back to our store in its original packaging, or we'll arrange a pickup for local orders." },
  { step: "4", title: "Get Replacement", desc: "After inspection, we will provide a replacement product. If the same product is unavailable, a store credit or refund will be offered." },
];

const ReturnsExchange = () => (
  <main className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <NavLink to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </NavLink>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center ring-1 ring-purple-100">
            <RefreshCw className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Returns & Exchanges</h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
          We want you to be fully satisfied with your purchase. Here's how we handle returns and replacements.
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">

        {/* Overview */}
        <div className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            At <strong className="text-slate-900">Mahalaxmi Steels and Home Appliance</strong>, owned by <strong className="text-slate-900">Sakharam Choudhary</strong>, we stand behind the quality of every product we sell. If you receive a damaged or defective item, we offer a hassle-free replacement within 2 days of delivery.
          </p>
        </div>

        {/* Return Window */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">2-Day Return Window</h3>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              All return or exchange requests must be made within <strong>2 days</strong> of receiving the product. Requests made after this window will not be accepted.
            </p>
          </div>
        </div>

        {/* Eligible */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Eligible for Return / Exchange
          </h2>
          <ul className="space-y-2">
            {ELIGIBLE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[13px] text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Not Eligible */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" /> Not Eligible for Return / Exchange
          </h2>
          <ul className="space-y-2">
            {NOT_ELIGIBLE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[13px] text-slate-600 leading-relaxed">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-5">How to Request a Return</h2>
          <div className="space-y-4">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Need help with a return?</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
            Visit our store or contact us for quick resolution:
          </p>
          <p className="text-[13px] text-slate-600 mb-2">
            <strong>Store:</strong> Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune, Maharashtra 411035
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
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

export default ReturnsExchange;
