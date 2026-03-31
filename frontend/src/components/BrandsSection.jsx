import { BadgeCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const getBrandLogoUrl = (brand = {}) => {
  if (brand.logo && String(brand.logo).startsWith("http")) return brand.logo;
  const token = String(brand.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (!token) return "";
  return `https://logo.clearbit.com/${token}.com`;
};

const BrandsSection = () => {
  const navigate = useNavigate();
  const { brands, loading } = useProducts();

  const featuredBrands = (brands || []).filter((brand) => brand.isFeatured ?? brand.showInNavbar);
  const displayBrands = featuredBrands.length ? featuredBrands : brands || [];

  return (
    <section className="section-shell bg-slate-50/60 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="eyebrow mb-2">
              <BadgeCheck className="w-4 h-4" />
              Brands
            </p>
            <h2 className="section-title">Shop by Brand</h2>
            <p className="section-subtitle mt-2">Find your favorite trusted brands in one place with a clean visual catalog.</p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 sm:h-28 rounded-2xl bg-slate-200/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {displayBrands.map((brand) => {
              const id = brand._id || brand.id;
              const label = brand.name || "Brand";
              const logo = getBrandLogoUrl(brand);

              return (
                <button
                  key={id}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(label)}`)}
                  className="group h-24 sm:h-28 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-0.5 transition-all duration-300 px-4"
                >
                  <div className="w-full h-full flex items-center justify-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {logo ? (
                        <img
                          src={logo}
                          alt={`${label} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement?.classList.add("bg-blue-50");
                          }}
                        />
                      ) : (
                        <span className="text-sm font-black text-blue-700">{label.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="min-w-0 text-left">
                      <p className="text-sm sm:text-base font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {label}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-500 transition-colors">View products</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandsSection;
