import { useMemo, useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useProducts } from "../context/ProductContext";

const EMPTY_FORM = { name: "", isFeatured: false };

const BrandModal = ({ brand, onSave, onClose }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(brand || {}),
    name: brand?.name || "",
    isFeatured: brand?.isFeatured ?? brand?.showInNavbar ?? false,
  }));
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const submit = () => {
    if (!(form.name || "").trim()) {
      setErrors({ name: "Brand name is required" });
      return;
    }

    onSave({
      name: String(form.name || "").trim(),
      isFeatured: !!form.isFeatured,
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
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{brand ? "Edit Brand" : "Add Brand"}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Brand Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Prestige"
              className={inputClass(errors.name)}
            />
            {errors.name && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.name}</p>}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Show in Navbar</p>
              <p className="text-[11px] font-medium text-slate-500">Featured brands appear in navbar dropdown</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!form.isFeatured}
                onChange={() => set("isFeatured", !form.isFeatured)}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all"
        >
          <Save className="w-4 h-4" /> {brand ? "Save Changes" : "Create Brand"}
        </button>
      </div>
    </div>
  );
};

const AdminBrands = () => {
  const { brands, addBrand, updateBrand, deleteBrand, toggleBrandFeatured } = useProducts();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sortedBrands = useMemo(
    () => [...(brands || [])].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || String(a.name).localeCompare(String(b.name))),
    [brands]
  );

  const handleSave = (payload) => {
    if (modal === "add") {
      addBrand(payload);
      return;
    }
    updateBrand(modal._id || modal.id, payload);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Brands</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage dynamic brands for the navbar dropdown.</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedBrands.map((brand) => {
          const id = brand._id || brand.id;
          const featured = !!(brand.isFeatured ?? brand.showInNavbar);

          return (
            <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{brand.name}</h3>
                <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => setModal(brand)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(brand)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => toggleBrandFeatured(id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border w-fit ${
                  featured ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-300"
                }`}
              >
                {featured ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                {featured ? "Show in Navbar" : "Hidden from Navbar"}
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <BrandModal
          brand={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 p-6 sm:p-8 max-w-sm w-full text-center">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Brand?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              This will remove <span className="font-bold text-slate-800">{deleteConfirm.name}</span> from brand management.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteBrand(deleteConfirm._id || deleteConfirm.id);
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

export default AdminBrands;
