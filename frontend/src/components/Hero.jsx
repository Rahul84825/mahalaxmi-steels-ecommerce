import { useState, useCallback, memo } from "react";
import {
  Search, ShoppingCart, ArrowRight, Star, BadgeCheck, FileText, Store, CheckCircle2
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { DeliveryNotice } from "./DeliveryNotice";

const Hero = memo(() => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!(searchQuery || "").trim()) return;
    navigate(`/products?search=${encodeURIComponent((searchQuery || "").trim())}`);
  }, [searchQuery, navigate]);

  return (
    <section className="relative bg-slate-50 overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 md:pt-20 md:pb-28">
      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-300/20 rounded-full mix-blend-multiply filter blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 sm:gap-12 lg:gap-8 items-center">
          
          {/* ── Left Content ── */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-sm">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
              <span>Trusted by 10,000+ Happy Homes</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 sm:mb-6 leading-[1.15] tracking-tight">
              Premium Quality <br className="hidden sm:block" />
              <span className="text-blue-600 bg-clip-text">Kitchen & Pooja Essentials</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 mb-8 sm:mb-10 max-w-xl leading-relaxed px-2 sm:px-0">
              Discover our finest collection of durable stainless steel utensils,
              traditional copper idols, and reliable home appliances. Quality crafted for your everyday life.
            </p>

            {/* ── Integrated Search Form ── */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-lg mb-8 sm:mb-10 px-1 sm:px-0"
            >
              <div className="relative flex items-center bg-white rounded-full shadow-lg shadow-slate-200/50 border border-slate-100 p-1 sm:p-1.5 focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all duration-200">
                <Search className="absolute left-3.5 sm:left-5 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search utensils, copper items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-10 sm:pl-14 pr-2 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-700 font-medium outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors duration-200 shadow-md shrink-0 active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center lg:justify-start mb-10 sm:mb-12 px-1 sm:px-0">
              <NavLink
                to="/products"
                className="bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <NavLink
                to="/products"
                className="bg-white text-slate-700 border border-slate-200 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold hover:border-blue-600 hover:text-blue-600 hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                View Catalog
              </NavLink>
            </div>

            {/* ── Delivery Notice ── */}
            <DeliveryNotice className="w-full mb-8 sm:mb-10" />

            {/* ── Trust Features ── */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 sm:gap-x-8 gap-y-3 sm:gap-y-4 pt-5 sm:pt-6 border-t border-slate-200/60 w-full">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">Authentic Products</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">GST Billing Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">Store Pickup Available</span>
              </div>
            </div>
          </div>

          {/* ── Right Content (Hero Featured Card) ── */}
          <div className="relative lg:mt-0 flex justify-center items-center px-2 sm:px-4 lg:px-0">
            {/* Soft backdrop blur for the card to sit on */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-100/50 to-transparent rounded-full blur-3xl scale-90"></div>
            
            <div className="relative bg-white p-4 sm:p-5 rounded-3xl sm:rounded-4xl shadow-xl sm:shadow-2xl shadow-slate-200/80 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 w-full max-w-85 sm:max-w-100 flex flex-col group">
              
              {/* Image Area */}
              <div className="relative bg-slate-50 overflow-hidden aspect-square rounded-[1.25rem] sm:rounded-3xl w-full shrink-0 flex items-center justify-center mb-4 sm:mb-5">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <span className="text-5xl sm:text-6xl drop-shadow-sm">🪔</span>
                </div>

                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10 items-start">
                  <span className="bg-blue-600/95 text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider uppercase shadow-sm">
                    Featured
                  </span>
                  <span className="bg-rose-500/95 text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full tracking-wider shadow-sm">
                    15% OFF
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-1 sm:px-2 flex flex-col flex-1">
                <p className="text-[9px] sm:text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 sm:mb-2">
                  Pooja Essentials
                </p>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-2 sm:mb-3">
                  Pure Copper Ganesh Idol Set
                </h3>
                
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400">(128 Reviews)</span>
                </div>

                <div className="flex flex-wrap items-end gap-1.5 sm:gap-2 mt-auto mb-4 sm:mb-5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">₹1,299</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-400 line-through mb-0.5">₹1,550</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ml-auto border border-emerald-100">
                    Save ₹251
                  </span>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-600 transition-colors duration-200 shadow-lg shadow-slate-900/10">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>

                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600">In Stock & Ready to Ship</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
export default Hero;