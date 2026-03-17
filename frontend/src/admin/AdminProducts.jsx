import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  ToggleLeft,
  ToggleRight,
  Package,
  Star,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";

const AdminProducts = () => {
  const { products, categories, deleteProduct, toggleStock, toggleFeatured, toggleBestseller, toggleIsNew } = useProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getId = (p) => p._id || p.id;

  const getCategoryName = (cat) => {
    if (!cat) return "-";
    if (typeof cat === "object") return cat.name || cat.label || "-";
    const found = categories?.find((c) => (c._id || c.id) === cat || c.id === cat);
    return found ? found.name || found.label : cat;
  };

  const filtered = useMemo(() => {
    return (products || [])
      .filter((p) => {
        if (filterCat === "all") return true;
        const catId = typeof p.category === "object" ? p.category?._id || p.category?.id : p.category;
        return catId === filterCat;
      })
      .filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()));
  }, [products, filterCat, search]);

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
  };

  const badgeClass = (active, tone) => {
    if (active && tone === "featured") return "bg-amber-50 text-amber-700 border-amber-300";
    if (active && tone === "bestseller") return "bg-orange-50 text-orange-700 border-orange-300";
    if (active && tone === "new") return "bg-blue-50 text-blue-700 border-blue-300";
    return "bg-white text-slate-400 border-slate-200 hover:text-slate-700";
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage inventory, product tags, and storefront visibility.</p>
        </div>
        <button
          onClick={() => navigate("/admin/products/add")}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 min-w-60 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-3 text-sm font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 text-slate-700 min-w-50"
        >
          <option value="all">All Categories</option>
          {(categories || []).map((c) => (
            <option key={c._id || c.id} value={c._id || c.id}>
              {c.name || c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Package className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700 mb-1">No products found</p>
                      <p className="text-xs text-slate-500">Try changing the category filter or search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const id = getId(product);
                  const preview = product.image || product.images?.[0] || "";
                  const featured = product.is_featured ?? product.featured;
                  const bestseller = product.is_bestseller ?? product.bestseller;
                  const isNew = product.is_new ?? product.isNew;

                  return (
                    <tr key={id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {preview && preview.startsWith("http") ? (
                              <img src={preview} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl opacity-70">{preview || "📦"}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 max-w-55 truncate" title={product.name}>{product.name}</p>
                            <p className="text-xs text-slate-400">{(product.images || []).length} image(s)</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-slate-200/60">
                          {getCategoryName(product.category)}
                        </span>
                      </td>

                      <td className="px-6 py-3">
                        <p className="font-black text-slate-900">₹{(product.price || 0).toLocaleString("en-IN")}</p>
                        {!!(product.mrp || product.originalPrice) && (
                          <p className="text-xs text-slate-400 line-through">₹{(product.mrp || product.originalPrice).toLocaleString("en-IN")}</p>
                        )}
                      </td>

                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggleStock(id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition-all border ${
                            product.inStock
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {product.inStock ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </button>
                      </td>

                      <td className="px-6 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => toggleFeatured(id)}
                            className={`flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${badgeClass(featured, "featured")}`}
                            title="Toggle featured"
                          >
                            <Star className="w-3 h-3" /> Featured
                          </button>
                          <button
                            onClick={() => toggleBestseller(id)}
                            className={`flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${badgeClass(bestseller, "bestseller")}`}
                            title="Toggle bestseller"
                          >
                            <BadgeCheck className="w-3 h-3" /> Bestseller
                          </button>
                          <button
                            onClick={() => toggleIsNew(id)}
                            className={`flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${badgeClass(isNew, "new")}`}
                            title="Toggle new"
                          >
                            <Sparkles className="w-3 h-3" /> New
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => navigate(`/admin/products/edit/${id}`)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">This action permanently removes the product from the catalog.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
