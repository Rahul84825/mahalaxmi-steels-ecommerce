import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, Home, Search as SearchIcon } from "lucide-react";
import ProductGrid, { DEFAULT_FILTERS } from "../components/ProductGrid";
import { useProducts } from "../context/ProductContext";
import { getCategoryLabel, sanitizeCategoryQueryValue } from "../utils/category";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories }    = useProducts();

  const rawCategory = searchParams.get("category");
  const urlCategory = sanitizeCategoryQueryValue(rawCategory);
  const urlSort     = searchParams.get("sortBy")   || "default";
  const urlSearch   = searchParams.get("search")   || "";
  const urlWishlist = searchParams.get("wishlist") === "1";

  const [initialFilters, setInitialFilters] = useState({
    ...DEFAULT_FILTERS,
    category: urlCategory,
    sortBy:   urlSort,
    search:   urlSearch,
    wishlistOnly: urlWishlist,
  });

  useEffect(() => {
    const normalizedRawCategory = String(rawCategory || "").trim().toLowerCase();
    const hasInvalidCategoryToken =
      rawCategory !== null &&
      (normalizedRawCategory === "[object object]" || normalizedRawCategory === "");

    if (!hasInvalidCategoryToken) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    setSearchParams(nextParams, { replace: true });
  }, [rawCategory, searchParams, setSearchParams]);

  useEffect(() => {
    setInitialFilters({
      ...DEFAULT_FILTERS,
      category: sanitizeCategoryQueryValue(searchParams.get("category")),
      sortBy:   searchParams.get("sortBy")   || "default",
      search:   searchParams.get("search")   || "",
      wishlistOnly: searchParams.get("wishlist") === "1",
    });
  }, [searchParams]);

  const categoryName = !urlCategory || urlCategory === "all"
    ? null
    : getCategoryLabel(urlCategory, categories) || "";

  const [productCount, setProductCount] = useState(null);

  return (
    <main className="bg-slate-50 min-h-screen flex flex-col">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200/80 pt-3 pb-4 sm:pt-4 sm:pb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5 font-medium" aria-label="Breadcrumb">
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Home className="w-3 h-3" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link to="/products" className={`hover:text-blue-600 transition-colors ${!categoryName && !urlSearch ? 'text-blue-600 font-semibold pointer-events-none' : ''}`}>
              Products
            </Link>
            {categoryName && !urlSearch && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-700 font-semibold truncate max-w-30 sm:max-w-none">{categoryName}</span>
              </>
            )}
            {urlSearch && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-700 font-semibold">Search Results</span>
              </>
            )}
          </nav>

          {/* Title row */}
          <div className="flex items-baseline gap-2.5 sm:gap-3">
            {urlSearch ? (
              <>
                <SearchIcon className="w-5 h-5 text-blue-600 shrink-0 mb-0.5" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Results for "<span className="text-blue-600">{urlSearch}</span>"
                </h1>
              </>
            ) : (
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
                {urlCategory === "all" ? "All Products" : categoryName || "Products"}
              </h1>
            )}
            {productCount !== null && (
              <span className="text-sm text-slate-500 font-semibold shrink-0">{productCount} items</span>
            )}
          </div>

        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="flex-1 w-full">
        <ProductGrid initialFilters={initialFilters} onCountChange={setProductCount} />
      </div>
    </main>
  );
};

export default Products;