import { useState } from "react";
import { PlusCircle, Pencil, Trash2, X, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useProducts } from "../context/ProductContext";

const CATEGORIES = [
  { id: "steel", label: "Stainless Steel" },
  { id: "copper", label: "Copper Utensils" },
  { id: "brass", label: "Pital (Brass)" },
  { id: "pooja", label: "Pooja Essentials" },
  { id: "appliances", label: "Home Appliances" },
];

const BG_OPTIONS = [
  { label: "Slate",  value: "from-slate-700 to-slate-900",   accent: "bg-slate-500" },
  { label: "Orange", value: "from-orange-500 to-orange-700", accent: "bg-orange-400" },
  { label: "Rose",   value: "from-rose-500 to-rose-700",     accent: "bg-rose-400" },
  { label: "Blue",   value: "from-blue-600 to-blue-800",     accent: "bg-blue-500" },
  { label: "Emerald",value: "from-emerald-500 to-emerald-700", accent: "bg-emerald-400" },
  { label: "Purple", value: "from-purple-600 to-purple-800", accent: "bg-purple-500" },
];

const EMPTY_OFFER = {
  title: "", subtitle: "", badge: "", discount: "",
  category: "steel", icon: "🥘", active: true,
  bg: "from-blue-600 to-blue-800", accent: "bg-blue-500",
};

const OfferModal = ({ offer, onSave, onClose }) => {
  const [form, setForm] = useState(offer || EMPTY_OFFER);
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!(form.title || "").trim()) e.title = "Title is required";
    if (!(form.discount || "").trim()) e.discount = "Discount text is required";
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
      <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-slate-900/20 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {offer ? "Edit Offer" : "Create New Offer"}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Promotion Title <span className="text-rose-500">*</span></label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Diwali Mega Sale" className={inputClass(errors.title)} />
              {errors.title && <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.title}</p>}
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Subtitle description</label>
              <input type="text" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Up to 40% off on all SS cookware" className={inputClass()} />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Badge Tag</label>
              <input type="text" value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="e.g. Limited Time" className={inputClass()} />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Discount Text <span className="text-rose-500">*</span></label>
              <input type="text" value={form.discount} onChange={(e) => set("discount", e.target.value)} placeholder="e.g. 40% OFF" className={inputClass(errors.discount)} />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Target Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass()}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="🎁" className={`${inputClass()} text-lg px-2`} />
            </div>
          </div>

          {/* Color Selection */}
          <div className="pt-2">
            <label className="block text-[13px] font-bold text-slate-700 mb-2">Card Theme</label>
            <div className="flex flex-wrap gap-3">
              {BG_OPTIONS.map((bg) => {
                const isSelected = form.bg === bg.value;
                return (
                  <button
                    key={bg.value}
                    onClick={() => { set("bg", bg.value); set("accent", bg.accent); }}
                    title={bg.label}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${bg.value} flex items-center justify-center transition-all duration-300
                      ${isSelected ? "ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-md" : "hover:scale-110 opacity-80 hover:opacity-100"}`}
                  >
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Offer Status</p>
              <p className="text-[11px] font-medium text-slate-500">Visible to customers on the homepage</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.active} onChange={() => set("active", !form.active)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Save className="w-4 h-4" />
          {offer ? "Save Changes" : "Publish Offer"}
        </button>
      </div>
    </div>
  );
};

const AdminOffers = () => {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOffer } = useProducts();
  const [modal, setModal]           = useState(null); // null | "add" | offer object
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = (form) => {
    if (modal === "add") addOffer(form);
    else updateOffer(modal.id, form);
  };

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Offers & Deals</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">{offers.length} promotional campaigns active</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          New Offer
        </button>
      </div>

      {/* ── Offer Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className={`bg-gradient-to-br ${offer.bg} rounded-[1.5rem] p-6 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-xl`}>
            {/* Ambient Background Circles */}
            <div className={`absolute -right-8 -bottom-8 w-40 h-40 ${offer.accent} rounded-full opacity-30 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <div className={`absolute top-4 right-4 w-16 h-16 ${offer.accent} rounded-full opacity-20 blur-xl`} />

            {/* Status & Icon */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              {offer.badge ? (
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-white/20">
                  {offer.badge}
                </span>
              ) : (
                <div />
              )}
              <span className="text-4xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">{offer.icon}</span>
            </div>

            {/* Content */}
            <div className="relative z-10 mb-6">
              <h3 className="text-white font-extrabold text-xl leading-tight mb-1">{offer.title}</h3>
              <p className="text-white/80 text-[13px] font-medium line-clamp-2 min-h-[36px]">{offer.subtitle}</p>
              <p className="text-white font-black text-3xl mt-3 tracking-tight drop-shadow-sm">{offer.discount}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10 relative z-10">
              <button
                onClick={() => toggleOffer(offer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${offer.active ? "bg-white text-slate-900 shadow-sm" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"}`}
              >
                <div className={`w-2 h-2 rounded-full ${offer.active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {offer.active ? "Active" : "Hidden"}
              </button>
              
              <button onClick={() => setModal(offer)} className="ml-auto p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm border border-white/10" title="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteConfirm(offer.id)} className="p-2 bg-white/10 hover:bg-rose-500 text-white rounded-xl transition-colors backdrop-blur-sm border border-white/10" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add New Placeholder Card */}
        <button
          onClick={() => setModal("add")}
          className="rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 p-8 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-blue-600 transition-all duration-300 min-h-[260px] group"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-110 transition-transform duration-300">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Create New Offer</span>
        </button>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <OfferModal
          offer={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-slate-900/20 p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">
              Delete Offer?
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to permanently delete this offer? It will be removed from the homepage immediately.
            </p>
            
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                Cancel
              </button>
              <button onClick={() => { deleteOffer(deleteConfirm); setDeleteConfirm(null); }}
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

export default AdminOffers;