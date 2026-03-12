import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, Tag, AlertCircle } from "lucide-react";
import { useProducts } from "../context/ProductContext";

const EMPTY_FORM = { id: "", label: "", icon: "🥘", description: "" };

const CategoryModal = ({ category, onSave, onClose, existingIds }) => {
  const initial = category
    ? {
        id:          category.id          || "",
        label:       category.label       || category.name || "",
        icon:        category.icon        || "🥘",
        description: category.description || "",
      }
    : EMPTY_FORM;

  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});
  const isEdit              = !!category;

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!(form.label || "").trim()) e.label = "Category name is required";
    if (!isEdit) {
      if (!(form.id || "").trim()) e.id = "Category ID is required";
      if (!/^[a-z0-9_-]+$/.test(form.id)) e.id = "ID must be lowercase letters/numbers/hyphens only";
      if (existingIds.includes(form.id)) e.id = "This ID already exists";
    }
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    onClose();
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 text-sm font-medium border rounded-xl focus:outline-none focus:bg-white focus:ring-4 transition-all shadow-inner
     ${hasError 
        ? "border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-100 placeholder:text-rose-300" 
        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-300 focus:ring-blue-50 placeholder:text-slate-400 hover:border-slate-300"
     }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 transition-opacity">
      <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-slate-900/20 w-full max-w-md p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* ID — only for new */}
          {!isEdit && (
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                Category ID <span className="text-rose-500">*</span>
                <span className="ml-1 text-slate-400 font-medium text-[11px] uppercase tracking-wide">(Lowercase)</span>
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) =>
                  set("id", e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, ""))
                }
                placeholder="e.g. cookware"
                className={inputClass(errors.id)}
              />
              {errors.id && (
                <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.id}
                </p>
              )}
            </div>
          )}

          {/* Label */}
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
              Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              placeholder="e.g. Stainless Steel"
              className={inputClass(errors.label)}
            />
            {errors.label && (
              <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.label}
              </p>
            )}
          </div>

          {/* Icon & Description Row */}
          <div className="grid grid-cols-[80px_1fr] gap-4">
            {/* Icon */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 truncate">Emoji</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="🥘"
                className={`${inputClass(false)} text-center text-lg px-2`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Short Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Optional description..."
                className={inputClass(false)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" />
          {isEdit ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useProducts();
  const [modal, setModal]               = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (form) => {
    if (modal === "add") {
      addCategory(form);
    } else {
      updateCategory(modal.id, form);
    }
  };

  const handleDelete = (cat) => {
    deleteCategory(cat.id);
    setDeleteConfirm(null);
  };

  const productCount = (cat) =>
    products.filter((p) => {
      const pCat = typeof p.category === "object"
        ? (p.category?._id || p.category?.id)
        : p.category;
      return pCat === (cat._id || cat.id) || pCat === cat.id;
    }).length;

  return (
    <div className="animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage product classifications</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* ── Category Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div key={cat._id || cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col group">
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="drop-shadow-sm">{cat.icon || "📦"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{cat.label || cat.name}</h3>
                  <p className="mt-0.5 inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono font-medium border border-slate-200/60">
                    id: {cat.id}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => setModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(cat)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {cat.description ? (
              <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                {cat.description}
              </p>
            ) : (
              <div className="flex-1 mb-4" />
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
                <span className="font-bold text-slate-800">{productCount(cat)}</span> Products
              </span>
            </div>
          </div>
        ))}

        {/* Add Category Dashed Button */}
        <button onClick={() => setModal("add")}
          className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 p-5 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-600 transition-all duration-300 min-h-[160px] group">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-110 transition-transform duration-300">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold">Create New Category</span>
        </button>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <CategoryModal
          category={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          existingIds={categories.map((c) => c.id).filter(Boolean)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-slate-900/20 p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              Delete Category?
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteConfirm.label || deleteConfirm.name}"</span>? This action cannot be undone.
            </p>
            
            {productCount(deleteConfirm) > 0 && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-snug">
                  Warning: <span className="font-bold">{productCount(deleteConfirm)} products</span> are currently using this category.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-rose-600/20">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;