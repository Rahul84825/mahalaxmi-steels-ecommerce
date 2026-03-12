import { useState, useEffect } from "react";
import { PackageX, RefreshCcw } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductFilter, { PRICE_RANGES } from "./ProductFilter";
import { useProducts } from "../context/ProductContext";

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col animate-pulse">
    {/* Mock Image Area */}
    <div className="bg-slate-200/60 aspect-square w-full" />
    
    {/* Mock Content Area */}
    <div className="p-5 flex flex-col gap-4 flex-1">
      <div className="space-y-2.5">
        <div className="h-4 bg-slate-200/60 rounded-full w-4/5" />
        <div className="h-3 bg-slate-200/60 rounded-full w-1/2" />
      </div>
      
      {/* Push to bottom */}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="h-6 bg-slate-200/60 rounded-full w-1/3" />
        <div className="h-10 w-10 bg-slate-200/60 rounded-full" />
      </div>
    </div>
  </div>
);

const EmptyState = ({ onClear, isSearch, query }) => (
  <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh] py-12 px-4">
    <div className="bg-white p-10 sm:p-14 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center max-w-lg w-full">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <PackageX className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
        {isSearch ? `No results for "${query}"` : "No products found"}
      </h3>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm">
        {isSearch 
          ? "We couldn't find anything matching your search. Try checking for typos or using broader terms." 
          : "We couldn't find any products matching your current filters. Try adjusting them to see more results."}
      </p>
      <button 
        onClick={onClear}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        {isSearch ? "Browse All Products" : (
          <>
            <RefreshCcw className="w-4 h-4" /> Clear All Filters
          </>
        )}
      </button>
    </div>
  </div>
);

export const DEFAULT_FILTERS = {
  category:    "all",
  priceRange:  "all",
  sortBy:      "default",
  inStockOnly: false,
  search:      "",
};

const ProductGrid = ({ initialFilters }) => {
  const { products, loading } = useProducts();
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });

  // Sync filters when URL params change (e.g. navigating from Hero search)
  useEffect(() => {
    if (initialFilters) {
      setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
    }
  }, [initialFilters]);

  const filteredProducts = products
    .filter((p) => filters.category === "all" || p.category === filters.category ||
      // support populated category object from MongoDB
      p.category?.slug === filters.category || p.category?.name?.toLowerCase() === filters.category)
    .filter((p) => {
      if (filters.priceRange === "all") return true;
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange);
      return range ? p.price >= range.min && p.price < range.max : true;
    })
    .filter((p) => !filters.inStockOnly || p.inStock)
    .filter((p) => {
      if (!(filters.search || "").trim()) return true;
      const q = (filters.search || "").toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (typeof p.category === "string" ? p.category : p.category?.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => (t || "").toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price_asc":  return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "newest":     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "popular":    return (b.reviews || 0) - (a.reviews || 0);
        default:           return 0;
      }
    });

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* The ProductFilter component acts as the sticky header/sidebar for filtering.
        Its design handles the container layout internally based on your architecture.
      */}
      <ProductFilter
        filters={filters}
        onChange={setFilters}
        totalResults={loading ? undefined : filteredProducts.length}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : filteredProducts.length === 0
            ? <EmptyState onClear={clearFilters} isSearch={!!(filters.search || "")} query={filters.search || ""} />
            : filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;