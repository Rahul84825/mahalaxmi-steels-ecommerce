import { useMemo, useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { api } from "../utils/api";

const OFFER_TYPES = [
  { id: "banner", label: "Banner Promotion" },
  { id: "category", label: "Category Offer" },
  { id: "product", label: "Product Offer" },
];

const BG_OPTIONS = [
  { label: "Slate", value: "from-slate-700 to-slate-900", accent: "bg-slate-500" },
  { label: "Blue", value: "from-blue-600 to-blue-800", accent: "bg-blue-500" },
  { label: "Emerald", value: "from-emerald-500 to-emerald-700", accent: "bg-emerald-400" },
  { label: "Orange", value: "from-orange-500 to-orange-700", accent: "bg-orange-400" },
  { label: "Rose", value: "from-rose-500 to-rose-700", accent: "bg-rose-400" },
];

const EMPTY_OFFER = {
  title: "",
  description: "",
  badge: "",
  discountPercent: 0,
  discount: "",
  image: "",
  offerType: "banner",
  targetProduct: "",
  targetCategory: "",
  priority: 0,
  isActive: true,
  icon: "🎁",
  bg: "from-blue-600 to-blue-800",
  accent: "bg-blue-500",
};

const OfferModal = ({ offer, products, categories, onSave, onClose }) => {
  const [form, setForm] = useState(() => ({
    ...EMPTY_OFFER,
    ...(offer || {}),
    id: offer?._id || offer?.id,
    targetProduct: offer?.targetProduct?._id || offer?.targetProduct || "",
    targetCategory: offer?.targetCategory || offer?.category || "",
    discountPercent: Number(offer?.discountPercent || 0),
    priority: Number(offer?.priority || 0),
    isActive: offer?.isActive !== undefined ? !!offer.isActive : offer?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!(form.title || "").trim()) e.title = "Title is required";
    if (form.discountPercent < 0 || form.discountPercent > 100) e.discountPercent = "Discount must be between 0 and 100";
    if (form.offerType === "product" && !form.targetProduct) e.targetProduct = "Select a product";
    if (form.offerType === "category" && !form.targetCategory) e.targetCategory = "Select a category";
    return e;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image." }));
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

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      ...form,
      discountPercent: Number(form.discountPercent || 0),
      discount: form.discount || `${Number(form.discountPercent || 0)}% OFF`,
      priority: Number(form.priority || 0),
      category: form.targetCategory || "",
      active: !!form.isActive,
    };

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message || "Failed to save offer" }));
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 text-sm font-medium border rounded-xl focus:outline-none focus:bg-white focus:ring-4 transition-all shadow-inner ${
      hasError
        ? "border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-100"
        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-300 focus:ring-blue-50"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {offer ? "Edit Offer" : "Create New Offer"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass(errors.title)} placeholder="Weekend Kitchen Mega Sale" />
              {errors.title && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.title}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputClass(errors.description)} resize-none`} rows={3} placeholder="Short, high-impact offer copy for homepage banner" />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Offer Type</label>
              <select value={form.offerType} onChange={(e) => set("offerType", e.target.value)} className={inputClass(errors.offerType)}>
                {OFFER_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Priority</label>
              <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} className={inputClass(errors.priority)} placeholder="0" />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Discount %</label>
              <input type="number" value={form.discountPercent} onChange={(e) => set("discountPercent", e.target.value)} className={inputClass(errors.discountPercent)} placeholder="30" />
              {errors.discountPercent && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.discountPercent}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Badge</label>
              <input value={form.badge} onChange={(e) => set("badge", e.target.value)} className={inputClass(errors.badge)} placeholder="Limited Time" />
            </div>

            {form.offerType === "product" && (
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Linked Product</label>
                <select value={form.targetProduct} onChange={(e) => set("targetProduct", e.target.value)} className={inputClass(errors.targetProduct)}>
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.targetProduct && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.targetProduct}</p>}
              </div>
            )}

            {form.offerType === "category" && (
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Linked Category</label>
                <select value={form.targetCategory} onChange={(e) => set("targetCategory", e.target.value)} className={inputClass(errors.targetCategory)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.label}</option>
                  ))}
                </select>
                {errors.targetCategory && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.targetCategory}</p>}
              </div>
            )}
          </div>

          <div className="pt-2">
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Banner Image</label>
            {form.image ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <img src={form.image} alt="Offer banner" className="w-full h-40 object-cover" />
                <button onClick={() => set("image", "")} className="absolute top-2 right-2 bg-white/90 text-rose-600 px-2.5 py-1 rounded-lg text-xs font-bold">
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 bg-slate-50 text-slate-600 text-sm font-semibold">
                {uploading ? <><ImageIcon className="w-4 h-4 animate-pulse" /> Uploading...</> : <><UploadCloud className="w-4 h-4" /> Upload Banner</>}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
            {errors.image && (
              <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.image}
              </p>
            )}
          </div>

          <div className="pt-2">
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Card Theme</label>
            <div className="flex flex-wrap gap-2">
              {BG_OPTIONS.map((bg) => {
                const selected = form.bg === bg.value;
                return (
                  <button
                    key={bg.value}
                    onClick={() => {
                      set("bg", bg.value);
                      set("accent", bg.accent);
                    }}
                    className={`w-9 h-9 rounded-full bg-linear-to-br ${bg.value} transition-all ${selected ? "ring-2 ring-offset-2 ring-slate-400" : "opacity-80 hover:opacity-100"}`}
                    title={bg.label}
                  >
                    {selected ? <CheckCircle2 className="w-4 h-4 text-white mx-auto" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Offer Active</p>
              <p className="text-[11px] font-medium text-slate-500">Frontend reflects this immediately</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={() => set("isActive", !form.isActive)} />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {errors.submit ? <p className="mt-4 text-xs font-bold text-rose-600">{errors.submit}</p> : null}

        <button onClick={handleSave} disabled={saving} className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-bold transition-all">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : offer ? "Save Changes" : "Publish Offer"}
        </button>
      </div>
    </div>
  );
};

const AdminOffers = () => {
  const { offers, products, categories, addOffer, updateOffer, deleteOffer, toggleOffer, refresh } = useProducts();
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [deleting, setDeleting] = useState(false);

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0)),
    [offers]
  );

  const getId = (o) => o._id || o.id;

  const handleSave = async (form) => {
    try {
      if (modal === "add") {
        await addOffer(form);
        setStatus({ type: "success", message: "Offer created successfully." });
      } else {
        await updateOffer(getId(modal), form);
        setStatus({ type: "success", message: "Offer updated successfully." });
      }
      await refresh();
      return true;
    } catch (err) {
      console.error("Offer save failed", err);
      setStatus({ type: "error", message: err.message || "Failed to save offer." });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await deleteOffer(deleteConfirm);
      await refresh();
      setStatus({ type: "success", message: "Offer deleted successfully." });
    } catch (err) {
      console.error("Offer delete failed", err);
      setStatus({ type: "error", message: err.message || "Failed to delete offer." });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Offers Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Create, prioritize, and target promotions across banner/product/category offers</p>
        </div>
        <button onClick={() => setModal("add")} className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all">
          <PlusCircle className="w-4 h-4" /> New Offer
        </button>
      </div>

      {status.message ? (
        <div
          className={`mb-5 px-4 py-3 rounded-xl text-sm font-semibold ${
            status.type === "error"
              ? "bg-rose-50 text-rose-700 border border-rose-100"
              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedOffers.map((offer) => {
          const id = getId(offer);
          const active = offer.isActive !== undefined ? offer.isActive : offer.active;
          const discountLabel = offer.discount || (offer.discountPercent ? `${offer.discountPercent}% OFF` : "Special Offer");
          return (
            <div key={id} className={`bg-linear-to-br ${offer.bg || "from-blue-700 to-blue-900"} rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl`}>
              <div className={`absolute -right-8 -bottom-8 w-40 h-40 ${offer.accent || "bg-blue-500"} rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

              <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  {offer.offerType || "banner"}
                </span>
                <span className="text-white/90 text-xs font-bold">Priority: {offer.priority || 0}</span>
              </div>

              {offer.image ? (
                <img src={offer.image} alt={offer.title} className="relative z-10 w-full h-28 object-cover rounded-xl mb-4 border border-white/20" />
              ) : null}

              <div className="relative z-10 mb-5">
                <h3 className="text-white font-extrabold text-xl leading-tight mb-1">{offer.title}</h3>
                <p className="text-white/80 text-[13px] font-medium line-clamp-2 min-h-9">{offer.description || offer.subtitle}</p>
                <p className="text-white font-black text-3xl mt-3 tracking-tight">{discountLabel}</p>
              </div>

              <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-white/10">
                <button onClick={() => toggleOffer(id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${active ? "bg-white text-slate-900" : "bg-white/15 text-white border border-white/20"}`}>
                  {active ? "Active" : "Inactive"}
                </button>

                <button onClick={() => setModal(offer)} className="ml-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirm(id)} className="p-2 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition-colors border border-white/10" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <OfferModal
          offer={modal === "add" ? null : modal}
          products={products}
          categories={categories}
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
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Offer?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">This offer will be removed from the storefront immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffers;
