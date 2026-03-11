import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  Shield, Truck, RefreshCw, Headphones, Award, BadgeCheck,
  Clock, Zap, TrendingUp, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useProducts } from "../context/ProductContext";

const WHY_US = [
  { icon: Shield,     title: "Quality Steel Utensils",   desc: "Premium stainless steel kitchenware built to last for years",     color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: Truck,      title: "Free Delivery",             desc: "Free shipping on orders above ₹999 across Pimpri-Chinchwad",   color: "text-green-600",  bg: "bg-green-50"  },
  { icon: RefreshCw,  title: "Kitchen Essentials",        desc: "Everything your kitchen needs — from cookware to appliances",  color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Headphones, title: "Dedicated Support",         desc: "Local Akurdi-based team available Mon–Sat for assistance",    color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Award,      title: "Durable Cookware",          desc: "Heavy-duty pots, pans & kadais for everyday cooking",        color: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: BadgeCheck, title: "Affordable Appliances",     desc: "Home appliances at the best prices in Pimpri-Chinchwad",     color: "text-red-600",    bg: "bg-red-50"    },
];

const SectionHeader = ({ eyebrow, title, subtitle, linkLabel, onLink }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-5">
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-0.5 bg-blue-600 rounded-full"></span>
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{eyebrow}</p>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{title}</h2>
      {subtitle && <p className="text-base text-slate-500">{subtitle}</p>}
    </div>
    {linkLabel && (
      <button onClick={onLink}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-full transition-all duration-300 whitespace-nowrap group">
        {linkLabel}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    )}
  </div>
);

const ScrollRow = ({ children }) => {
  const ref = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });

  return (
    <div className="relative group/row -mx-4 sm:mx-0">
      {canLeft && (
        <button onClick={() => scroll("left")}
          className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <div ref={ref} onScroll={updateArrows}
        className="flex gap-5 overflow-x-auto px-4 sm:px-1 pb-8 pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll("right")}
          className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-110">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// ── 1. DEALS & OFFERS ─────────────────────────────────────────────────────────
const DealsSection = () => {
  const navigate = useNavigate();
  const { offers } = useProducts();
  const activeOffers = offers?.filter((o) => o.active) || [];
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 42, s: 17 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");
  if (activeOffers.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Limited Time" title="Deals & Offers"
          subtitle="Prices drop at midnight — grab yours before they're gone"
          linkLabel="All Deals" onLink={() => navigate("/products")}
        />
        
        {/* Countdown Timer */}
        <div className="flex items-center gap-4 mb-8 bg-white w-fit px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide">Ends in:</span>
          </div>
          <div className="flex items-center gap-2">
            {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-slate-900 text-white text-base font-bold w-10 h-10 rounded-xl flex items-center justify-center tabular-nums shadow-inner">
                  {val}
                </div>
                {i < 2 && <span className="text-slate-400 font-bold text-lg animate-pulse">:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Deal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOffers.map((deal) => (
            <div key={deal._id || deal.id}
              onClick={() => navigate(`/products?category=${deal.category || ""}`)}
              className={`bg-gradient-to-br ${deal.bg || "from-blue-700 to-blue-900"} rounded-3xl p-8 cursor-pointer group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden relative border border-white/10`}>
              
              {/* Decorative background circles */}
              <div className={`absolute -right-8 -bottom-8 w-40 h-40 ${deal.accent || "bg-blue-500"} rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
              <div className={`absolute top-4 right-4 w-16 h-16 ${deal.accent || "bg-blue-400"} rounded-full opacity-20 blur-xl`} />
              
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-6 border border-white/20 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />{deal.badge || "Special Promo"}
              </span>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{deal.icon || "🎁"}</span>
                <span className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
                  {deal.discount}{typeof deal.discount === "number" ? "% OFF" : ""}
                </span>
              </div>
              
              <h3 className="text-white font-extrabold text-xl leading-tight mb-2">{deal.title}</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">{deal.description || deal.subtitle}</p>
              
              <div className="mt-auto inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold py-2.5 px-5 rounded-full transition-all duration-300">
                Shop Deal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── 2. BEST SELLERS ───────────────────────────────────────────────────────────
const BestSellersSection = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const bestSellers = [...(products || [])]
    .filter((p) => p.inStock)
    .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 6);

  if (bestSellers.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Top Picks" title="Best Sellers"
          subtitle="Most loved products by our customers this month"
          linkLabel="View All" onLink={() => navigate("/products")}
        />
        
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.slice(0, 4).map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
        </div>
        
        <div className="sm:hidden">
          <ScrollRow>
            {bestSellers.map((p) => (
              <div key={p._id || p.id} className="flex-shrink-0 w-[260px]">
                <ProductCard product={p} />
              </div>
            ))}
          </ScrollRow>
        </div>

        <div className="mt-8 flex items-center justify-center sm:justify-start gap-3 bg-green-50 w-fit px-4 py-2.5 rounded-full border border-green-100 mx-auto sm:mx-0">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm text-slate-600 font-medium">
            Over <span className="text-green-700 font-bold">2,400+ orders</span> delivered this month
          </span>
        </div>
      </div>
    </section>
  );
};

// ── 3. NEW ARRIVALS ───────────────────────────────────────────────────────────
const NewArrivalsSection = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newArrivals = (products || []).filter(
    (p) => p.featured || (p.createdAt && new Date(p.createdAt).getTime() > thirtyDaysAgo)
  );

  if (newArrivals.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Just Landed" title="New Arrivals"
          subtitle="Fresh stock and latest appliances added this week"
          linkLabel="See All New" onLink={() => navigate("/products?sortBy=newest")}
        />
        
        <ScrollRow>
          {newArrivals.map((p) => (
            <div key={p._id || p.id} className="flex-shrink-0 w-60 sm:w-72">
              <ProductCard product={p} />
            </div>
          ))}
        </ScrollRow>

        <div className="mt-4 flex items-center gap-3 px-2">
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> New
          </span>
          <span className="text-sm text-slate-500 font-medium">Items added within the last 30 days</span>
        </div>
      </div>
    </section>
  );
};

// ── 4. WHY CHOOSE US ──────────────────────────────────────────────────────────
const WhyChooseUsSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Our Promise</p>
          <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Choose Mahalaxmi Steels?</h2>
        <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Serving homes in Akurdi and Pimpri-Chinchwad with quality kitchenware and affordable home appliances. We prioritize durability, trust, and your satisfaction above all.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
        {WHY_US.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Modern Stats Banner */}
      <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full opacity-50 blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-blue-500/30">
          {[
            { value: "2+",     label: "Years in Business"  },
            { value: "500+",   label: "Happy Customers"    },
            { value: "200+",   label: "Products Available" },
            { value: "4.8/5",  label: "Average Rating"     },
          ].map((stat, i) => (
            <div key={i} className={`text-center ${i % 2 !== 0 && i < 2 ? 'border-l-0 sm:border-l' : ''}`}>
              <p className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-sm">{stat.value}</p>
              <p className="text-sm sm:text-base text-blue-100 font-medium tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ── Main Export ───────────────────────────────────────────────────────────────
const FeaturedSection = () => (
  <div className="flex flex-col w-full">
    <DealsSection />
    <BestSellersSection />
    <NewArrivalsSection />
    <WhyChooseUsSection />
  </div>
);

export default FeaturedSection;