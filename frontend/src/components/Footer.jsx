import { NavLink } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock,
  Instagram, MessageCircle,
  Utensils, Shield, Truck, RefreshCw,
  ChevronRight,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Home",         to: "/"         },
  { label: "All Products", to: "/products" },
  { label: "About Us",     to: "/about"    },
  { label: "Contact Us",   to: "/contact"  },
  { label: "My Cart",      to: "/cart"     },
];

const SUPPORT_LINKS = [
  { label: "Shipping Policy",     to: "/shipping-policy"   },
  { label: "Returns & Exchanges", to: "/returns-exchanges"  },
  { label: "Terms & Conditions",  to: "/terms-conditions"   },
  { label: "Privacy Policy",      to: "/privacy-policy"     },
];

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Address",
    value: "Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune 411035",
    href: "https://maps.app.goo.gl/i7VqYRV4YFvNRdTc8",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 95618 78293",
    href: "tel:+919561878293",
  },
  {
    icon: Mail,
    label: "Email",
    value: "mahalaxmisteels08@gmail.com",
    href: "mailto:mahalaxmisteels08@gmail.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sun: 9:00 AM – 10:00 PM",
  },
];

const TRUST_BADGES = [
  { icon: Shield,    label: "Genuine Products" },
  { icon: Truck,     label: "Free Delivery"    },
  { icon: RefreshCw, label: "Easy Returns"     },
];

const SOCIAL = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: "https://wa.me/919561878293",
    hoverClass: "hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/mahalaxmisteels",
    hoverClass: "hover:bg-pink-600 hover:text-white hover:border-pink-600 hover:shadow-lg hover:shadow-pink-600/20",
  },
];

// ── Footer Component ──────────────────────────────────────────────────────────
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 overflow-hidden">
      
      {/* ── Ambient Glows ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-blue-900/10 blur-[100px] pointer-events-none rounded-full" />

      {/* ── DARK TOP SECTION ─────────────────────────────────────────────── */}
      <div className="relative z-10 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">

          {/* Brand Row + Trust Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">

            {/* Brand */}
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 shadow-md shadow-blue-900/20 transition-all duration-300">
              <span className="text-white font-black text-lg drop-shadow-sm">M</span>
            </div>
              <div>
                <p className="text-white font-extrabold text-xl leading-tight tracking-tight">
                  Mahalaxmi Steels
                </p>
                <p className="text-blue-400/80 text-xs font-semibold tracking-wide uppercase mt-0.5">
                  & Home Appliance
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800 backdrop-blur-sm px-4 py-2.5 rounded-full text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors duration-300"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main 4-col Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pt-12">

            {/* Col 1 — About + Social (Wider) */}
            <div className="sm:col-span-2 lg:col-span-4 lg:pr-8">
              <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
                Your trusted destination for quality stainless steel utensils, kitchen essentials, durable cookware, and affordable home appliances. Proudly serving Akurdi and the Pimpri-Chinchwad community.
              </p>

              <div className="flex items-center gap-3">
                {SOCIAL.map(({ icon: Icon, label, href, hoverClass }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 
                                flex items-center justify-center text-slate-400 
                                transition-all duration-300 hover:-translate-y-1 ${hoverClass}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </a>
                ))}
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-3">
                  Connect with us
                </span>
              </div>
            </div>

            {/* Col 2 — Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {QUICK_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 group font-medium"
                    >
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
                      <span className="-ml-5 group-hover:ml-0 transition-all duration-300">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Support */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
                Support
              </h4>
              <ul className="space-y-3">
                {SUPPORT_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 group font-medium"
                    >
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500" />
                      <span className="-ml-5 group-hover:ml-0 transition-all duration-300">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-6">
                Contact Us
              </h4>
              <ul className="space-y-5">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3.5 group">
                    <div className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:border-blue-500/30 group-hover:bg-blue-900/20 transition-colors duration-300">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors duration-200"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-300 leading-relaxed max-w-[200px]">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── LIGHT BOTTOM SECTION ─────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left font-medium">
              © {year}{" "}
              <span className="font-bold text-slate-900">
                Mahalaxmi Steels and Home Appliance
              </span>
              . All rights reserved.
            </p>
            <p className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-1.5">
              Made with <span className="text-rose-500 animate-pulse">❤️</span> in Maharashtra
            </p>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;