import { useMemo, useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, AlertCircle, UploadCloud, ToggleLeft, ToggleRight } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { api } from "../utils/api";

const EMPTY_FORM = { name: "", image: "", is_active: true };

const CategoryModal = ({ category, onSave, onClose }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(category || {}),
    name: category?.name || category?.label || "",
    image: category?.image || category?.icon || "",
    is_active: category?.is_active ?? category?.isActive ?? category?.active ?? true,
  }));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("token");

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image file." }));
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const data = await api.upload("/api/upload", fd, token);
      set("image", data.url || "");
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message || "Image upload failed" }));
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!(form.name || "").trim()) {
      setErrors({ name: "Category name is required" });
      return;
    }
    onSave({
      name: (form.name || "").trim(),
      image: form.image || "",
      is_active: !!form.is_active,
    });
    onClose();
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 text-sm font-medium border rounded-xl focus:outline-none focus:bg-white focus:ring-4 transition-all ${
      hasError
        ? "border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-100"
        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-300 focus:ring-blue-50"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-md p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{category ? "Edit Category" : "Add Category"}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Category Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Cookware"
              className={inputClass(errors.name)}
            />
            {errors.name && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Category Image</label>
            {form.image ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <img src={form.image} alt="Category preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => set("image", "")}
                  className="absolute top-2 right-2 bg-white/90 text-rose-600 px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 bg-slate-50 text-slate-600 text-sm font-semibold">
                <UploadCloud className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Category Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            )}
            {errors.image && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.image}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Category Active</p>
              <p className="text-[11px] font-medium text-slate-500">Only active categories appear on storefront</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!form.is_active}
                onChange={() => set("is_active", !form.is_active)}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all"
        >
          <Save className="w-4 h-4" /> {category ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </div>
  );
};

const AdminCategories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, toggleCategory } = useProducts();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const linkedProductCount = (categoryId) => {
    return (products || []).filter((p) => {
      const pCat = typeof p.category === "object" ? p.category?._id || p.category?.id : p.category;
      return String(pCat) === String(categoryId);
    }).length;
  };

  const sortedCategories = useMemo(
    () => [...(categories || [])].sort((a, b) => Number(b.is_active ?? b.isActive ?? b.active) - Number(a.is_active ?? a.isActive ?? a.active)),
    [categories]
  );

  const handleSave = (payload) => {
    if (modal === "add") {
      addCategory(payload);
      return;
    }
    updateCategory(modal._id || modal.id, payload);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Categories</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage category catalog, images, and active status.</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedCategories.map((cat) => {
          const id = cat._id || cat.id;
          const active = cat.is_active ?? cat.isActive ?? cat.active;
          const linked = linkedProductCount(id);

          return (
            <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col group">
              <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 h-36 mb-4">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name || cat.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🏷️</div>
                )}
                <button
                  onClick={() => toggleCategory(id)}
                  className={`absolute top-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  {active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{cat.name || cat.label}</h3>
                <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => setModal(cat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-auto text-[11px] text-slate-500 font-medium uppercase tracking-widest">
                <span className="font-bold text-slate-800">{linked}</span> linked products
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <CategoryModal
          category={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 p-6 sm:p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              This will remove <span className="font-bold text-slate-800">{deleteConfirm.name || deleteConfirm.label}</span> if it is not linked to products.
            </p>

            {linkedProductCount(deleteConfirm._id || deleteConfirm.id) > 0 && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium leading-snug">
                  This category is linked to products. Reassign products before deleting.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCategory(deleteConfirm._id || deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
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

export default AdminCategories;
