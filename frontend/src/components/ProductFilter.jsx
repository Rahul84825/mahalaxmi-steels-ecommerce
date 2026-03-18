import { useState } from "react";
import { ChevronDown, Search, X, Heart, PackageCheck } from "lucide-react";
import { useProducts } from "../context/ProductContext";

// ── Static filter config ───────────────────────────────────────────
export const SORT_OPTIONS = [
  { id: "default",    label: "Default"          },
  { id: "price_asc",  label: "Price: Low → High" },
  { id: "price_desc", label: "Price: High → Low" },
  { id: "newest",     label: "Newest First"      },
  { id: "popular",    label: "Most Popular"      },
];

export const PRICE_RANGES = [
  { id: "all",       label: "All Prices",      min: 0,    max: Infinity },
  { id: "0-500",     label: "Under ₹500",      min: 0,    max: 500      },
  { id: "500-1000",  label: "₹500 – ₹1,000",   min: 500,  max: 1000     },
  { id: "1000-2500", label: "₹1,000 – ₹2,500", min: 1000, max: 2500     },
  { id: "2500+",     label: "Above ₹2,500",    min: 2500, max: Infinity  },
];

// ── Reusable Dropdown ──────────────────────────────────────────────
const FilterDropdown = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel   = options.find((o) => o.id === value)?.label || label;
  const isActive        = value !== "all" && value !== "default";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 whitespace-nowrap
          ${isActive
            ? "bg-blue-700 text-white border-blue-700 shadow-md shadow-blue-700/25"
            : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700"
          }`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-xl min-w-45 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => { onChange(option.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${value === option.id
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Main ProductFilter ─────────────────────────────────────────────
const ProductFilter = ({ filters, onChange, totalResults }) => {
  const { categories } = useProducts();
  const activeCategories = (categories || []).filter((c) => c.is_active ?? c.isActive ?? c.active);

  const categoryOptions = [
    { id: "all", label: "All Categories" },
    ...activeCategories.map((c) => ({
      id:    c._id || c.id,
      label: c.label || c.name,
    })),
  ];

  const hasActiveFilters =
    filters.category   !== "all"     ||
    filters.priceRange !== "all"     ||
    filters.sortBy     !== "default" ||
    filters.inStockOnly ||
    filters.wishlistOnly;

  const clearAll = () =>
    onChange({ category: "all", priceRange: "all", sortBy: "default", inStockOnly: false, wishlistOnly: false, search: "" });

  const activeCategoryLabel =
    categoryOptions.find((c) => c.id === filters.category)?.label || filters.category;

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-16 md:top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        {/* ── Single filter row ── */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Inline search */}
          <label className="relative flex-1 min-w-40 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Search within results..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-colors"
            />
          </label>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Category */}
          <FilterDropdown
            label="Category"
            value={filters.category}
            options={categoryOptions}
            onChange={(val) => onChange({ ...filters, category: val })}
          />

          {/* Price */}
          <FilterDropdown
            label="Price"
            value={filters.priceRange}
            options={PRICE_RANGES}
            onChange={(val) => onChange({ ...filters, priceRange: val })}
          />

          {/* Sort */}
          <FilterDropdown
            label="Sort"
            value={filters.sortBy}
            options={SORT_OPTIONS}
            onChange={(val) => onChange({ ...filters, sortBy: val })}
          />

          {/* In Stock toggle — compact */}
          <button
            onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
            title="In Stock Only"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap
              ${filters.inStockOnly
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"
              }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In Stock</span>
          </button>

          {/* Wishlist toggle — compact */}
          <button
            onClick={() => onChange({ ...filters, wishlistOnly: !filters.wishlistOnly })}
            title="Wishlist Only"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap
              ${filters.wishlistOnly
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600"
              }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
          </button>

          {/* Clear + count */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {totalResults !== undefined && (
              <span className="text-xs text-gray-400 font-medium">{totalResults} found</span>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-all duration-150"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Active filter pills (only visible when filters are active) ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
            {filters.category !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {activeCategoryLabel}
                <button onClick={() => onChange({ ...filters, category: "all" })} className="hover:text-blue-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.priceRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {PRICE_RANGES.find((p) => p.id === filters.priceRange)?.label}
                <button onClick={() => onChange({ ...filters, priceRange: "all" })} className="hover:text-blue-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.sortBy !== "default" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                {SORT_OPTIONS.find((s) => s.id === filters.sortBy)?.label}
                <button onClick={() => onChange({ ...filters, sortBy: "default" })} className="hover:text-blue-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                In Stock
                <button onClick={() => onChange({ ...filters, inStockOnly: false })} className="hover:text-green-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {filters.wishlistOnly && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-full border border-rose-100">
                Saved
                <button onClick={() => onChange({ ...filters, wishlistOnly: false })} className="hover:text-rose-900 ml-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;