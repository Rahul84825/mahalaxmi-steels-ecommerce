import { LayoutGrid, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const FALLBACK_EMOJI = ["🍳", "🥘", "🔥", "🥄", "⚡"];

const Categories = ({ activeCategory = "all", onCategoryChange }) => {
  const navigate = useNavigate();
  const { categories, products, loading, error } = useProducts();
  const activeCategories = (categories || []).filter((c) => {
    const isActive = c.is_active ?? c.isActive ?? c.active;
    if (!isActive) return false;

    const categoryId = String(c.id || c._id || "");
    const categorySlug = String(c.slug || "").toLowerCase();

    return (products || []).some((product) => {
      const rawCategory = product.category || product.category_id;
      const productCategoryId = String(rawCategory?._id || rawCategory?.id || rawCategory || "");
      const productCategorySlug = String(rawCategory?.slug || "").toLowerCase();
      return productCategoryId === categoryId || (categorySlug && productCategorySlug === categorySlug);
    });
  });

  const handleSelect = (catId) => {
    if (onCategoryChange) {
      onCategoryChange(catId);
      return;
    }
    navigate(catId === "all" ? "/products" : `/products?category=${catId}`);
  };

  const resolveCategoryImage = (category) => {
    const categoryId = String(category.id || category._id || "");
    const categorySlug = String(category.slug || "").toLowerCase();

    const matchedProduct = (products || []).find((product) => {
      const rawCategory = product.category || product.category_id;
      const productCategoryId = String(rawCategory?._id || rawCategory?.id || rawCategory || "");
      const productCategorySlug = String(rawCategory?.slug || "").toLowerCase();

      return productCategoryId === categoryId || (categorySlug && productCategorySlug === categorySlug);
    });

    return matchedProduct?.images?.[0] || matchedProduct?.image || category.image || "";
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-44 sm:h-52 rounded-2xl bg-slate-200/70 animate-pulse" />
      ))}
    </div>
  );

  return (
    <section className="section-shell bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="eyebrow mb-2">
              <LayoutGrid className="w-4 h-4" />
              Categories
            </p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle mt-2">Explore product families with rich visual cards and quick access to top collections.</p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {activeCategories.map((category, index) => {
              const id = category.id || category._id;
              const label = category.label || category.name || "Category";
              const image = resolveCategoryImage(category);
              const isActive = activeCategory === id;
              const fallbackEmoji = FALLBACK_EMOJI[index % FALLBACK_EMOJI.length];

              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`relative group h-44 sm:h-52 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center
                    ${isActive 
                      ? "border-blue-400 ring-2 ring-blue-300 shadow-xl shadow-blue-200/40" 
                      : "border-slate-200 hover:border-slate-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/50"
                    }`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 bg-slate-100 overflow-hidden">
                    {image && image.startsWith("http") ? (
                      <>
                        <img
                          src={image}
                          alt={label}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        {/* Gradient overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-transparent opacity-80 group-hover:opacity-65 transition-opacity duration-300" />
                      </>
                    ) : (
                      <>
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <span className="text-6xl sm:text-7xl opacity-40 transition-transform duration-300 group-hover:scale-110">{fallbackEmoji}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      </>
                    )}
                  </div>

                  {/* Content - Category Name */}
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-4 sm:p-5 z-10">
                    <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight drop-shadow-lg">
                      {label}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm font-semibold mt-1 drop-shadow-md group-hover:text-white/95 transition-opacity duration-300 inline-flex items-center gap-1">
                      Explore
                      <ArrowRight className="w-3.5 h-3.5" />
                    </p>
                  </div>

                  {/* Hover overlay accent */}
                  <div className={`absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-300 rounded-2xl pointer-events-none ${isActive ? "bg-blue-500/10" : ""}`} />
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
