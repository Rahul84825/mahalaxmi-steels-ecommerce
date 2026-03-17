import { LayoutGrid, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const GRADIENTS = [
  "from-slate-100 via-slate-50 to-white",
  "from-blue-100 via-cyan-50 to-white",
  "from-orange-100 via-amber-50 to-white",
  "from-emerald-100 via-teal-50 to-white",
  "from-rose-100 via-pink-50 to-white",
];

const FALLBACK_EMOJI = ["🍳", "🥘", "🔥", "🥄", "⚡"];

const Categories = ({ activeCategory = "all", onCategoryChange }) => {
  const navigate = useNavigate();
  const { categories, products, loading, error } = useProducts();
  const activeCategories = (categories || []).filter((c) => c.is_active ?? c.isActive ?? c.active);

  const handleSelect = (catId) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
      return;
    }
    navigate(catId === "all" ? "/products" : `/products?category=${catId}`);
  };

  const resolveCategoryImage = (category, index) => {
    const categoryId = category.id || category._id;
    const imageFromProduct = (products || []).find((p) => {
      const productCategory = typeof p.category === "object" ? p.category?._id || p.category?.id : p.category;
      return productCategory === categoryId && (p.image || p.images?.[0]);
    });

    return imageFromProduct?.image || imageFromProduct?.images?.[0] || category.image || "";
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-44 rounded-3xl bg-slate-200/70 animate-pulse" />
      ))}
    </div>
  );

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-2">
              <LayoutGrid className="w-4 h-4" />
              Categories
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Shop by Category</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">Browse cookware, pressure cookers, gas stoves, utensils, and appliances in one tap.</p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-sm font-bold transition-all"
          >
            View Full Catalog
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-6 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            Could not load categories right now. Please refresh and try again.
          </div>
        )}

        {loading ? (
          renderSkeleton()
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {activeCategories.map((category, index) => {
              const id = category.id || category._id;
              const label = category.label || category.name || "Category";
              const image = resolveCategoryImage(category, index);
              const isActive = activeCategory === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`group relative rounded-3xl overflow-hidden border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isActive ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200"}`}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${GRADIENTS[index % GRADIENTS.length]}`} />

                  <div className="relative z-10 p-4 sm:p-5 h-full min-h-42.5 flex flex-col justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-white/60 shadow-sm overflow-hidden flex items-center justify-center text-3xl">
                      {image && image.startsWith("http") ? (
                        <img src={image} alt={label} className="w-full h-full object-cover" />
                      ) : (
                        <span>{category.icon || FALLBACK_EMOJI[index % FALLBACK_EMOJI.length]}</span>
                      )}
                    </div>

                    <div>
                      <p className="text-slate-900 font-extrabold text-base leading-tight">{label}</p>
                      <p className="text-slate-500 text-xs mt-1">Tap to explore products</p>
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

export default Categories;
