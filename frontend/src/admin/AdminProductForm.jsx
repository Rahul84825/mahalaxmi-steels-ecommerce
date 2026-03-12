import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import { useProducts } from "../context/ProductContext";

const EMPTY_FORM = {
  name: "", category: "", price: "", mrp: "",
  description: "", image: "", inStock: true,
  featured: false, brand: "", stock: "", tags: "",
};

const AdminProductForm = ({ mode = "add" }) => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { products, categories, addProduct, updateProduct } = useProducts();

  const token = localStorage.getItem("token");

  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saved, setSaved]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError]       = useState("");

  const formPopulated = useRef(false);

  useEffect(() => {
    if (mode === "edit" && id && !formPopulated.current) {
      const product = products.find((p) => (p._id || p.id) === id);
      if (product) {
        setForm({
          name:        product.name        || "",
          category:    product.category?._id || product.category || "",
          price:       product.price       || "",
          mrp:         product.mrp || product.originalPrice || "",
          description: product.description || "",
          image:       product.image       || "",
          inStock:     product.inStock     ?? true,
          featured:    product.featured    ?? false,  
          brand:       product.brand       || "",
          stock:       product.stock       || "",
          tags:        (product.tags || []).join(", "),
        });
        formPopulated.current = true;  
      }
    }
  }, [mode, id, products]);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!(form.name || "").trim())                              e.name     = "Product name is required";
    if (!form.price || isNaN(form.price) || +form.price <= 0) e.price = "Enter a valid price";
    if (!form.category)                                 e.category = "Category is required";
    return e;
  };

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadError("Image must be under 5MB.");           return; }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => setUploadProgress((p) => (p < 85 ? p + 10 : p)), 200);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res  = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/upload`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      set("image", data.url);
      setUploadProgress(100);
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  }

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      ...form,
      price:         +form.price,
      mrp:           +form.mrp || +form.price,
      originalPrice: +form.mrp || +form.price,
      stock:         +form.stock || 0,
      tags:          (form.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      inStock:  form.inStock,
      featured: form.featured,
    };

    setSubmitting(true);
    try {
      if (mode === "add") {
        await addProduct(payload);
      } else {
        await updateProduct(id, payload);
      }
      setSaved(true);
      setTimeout(() => navigate("/admin/products"), 1000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const discount =
    form.price && form.mrp && (+form.mrp > +form.price)
      ? Math.round(((+form.mrp - +form.price) / +form.mrp) * 100)
      : 0;

  const inputClass = (hasError) =>
    `w-full px-4 py-3 text-sm font-medium border rounded-xl focus:outline-none focus:bg-white focus:ring-4 transition-all shadow-inner
     ${hasError 
        ? "border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-100 placeholder:text-rose-300" 
        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-300 focus:ring-blue-50 placeholder:text-slate-400 hover:border-slate-300"
     }`;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === "add" ? "Add New Product" : "Edit Product"}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {mode === "add" ? "Fill in the details to list a new item" : "Update product information"}
          </p>
        </div>
      </div>

      {/* ── Main Form Card ── */}
      <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">

        {errors.submit && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errors.submit}
          </div>
        )}

        {/* ── Image Upload ── */}
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Product Image</label>
          
          {form.image && form.image.startsWith("http") ? (
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
              <img src={form.image} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <label className="cursor-pointer bg-white text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:scale-105 transition-transform shadow-lg">
                  Change Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <button type="button" onClick={() => set("image", "")}
                  className="bg-rose-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-rose-600 hover:scale-105 transition-transform shadow-lg">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block group">
              <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                uploading ? "border-blue-400 bg-blue-50/50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 bg-slate-50"
              }`}>
                {uploading ? (
                  <div className="space-y-4 max-w-xs mx-auto">
                    <div className="text-blue-600 text-sm font-bold flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> Uploading...
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-sm font-bold text-slate-700">Click to upload image</div>
                    <div className="text-xs font-medium text-slate-400 mt-1">High quality JPG, PNG, WEBP — max 5MB</div>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}
          {uploadError && <p className="text-[11px] font-bold text-rose-500 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {uploadError}</p>}
        </div>

        {/* ── Basic Info ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Stainless Steel Kadai 3L" className={inputClass(errors.name)} />
            {errors.name && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass(errors.category)}>
              <option value="" disabled>Select category</option>
              {(categories || []).map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.label || c.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Brand</label>
            <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Prestige" className={inputClass(false)} />
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Sale Price (₹) <span className="text-rose-500">*</span></label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="899" className={inputClass(errors.price)} />
            {errors.price && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Original MRP (₹)</label>
            <input type="number" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} placeholder="1199" className={inputClass(false)} />
          </div>
        </div>

        {discount > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold">
            <Tag className="w-4 h-4 text-emerald-500" />
            {discount}% Discount Applied <span className="text-emerald-600 font-medium ml-1">(Customer saves ₹{(+form.mrp - +form.price).toLocaleString("en-IN")})</span>
          </div>
        )}

        {/* ── Details ── */}
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief product description..." rows={4} className={`${inputClass(false)} resize-none`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Stock Quantity</label>
            <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="50" className={inputClass(false)} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Search Tags <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider ml-1">(Comma Separated)</span></label>
            <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="kadai, steel, cooking" className={inputClass(false)} />
          </div>
        </div>

        {/* ── Toggles ── */}
        <div className="flex flex-col sm:flex-row gap-6 pt-4 border-t border-slate-100">
          {[
            { key: "inStock", label: "In Stock Status", desc: "Available for purchase", color: "peer-checked:bg-emerald-500" },
            { key: "featured", label: "Featured Product", desc: "Highlight on homepage", color: "peer-checked:bg-blue-600" },
          ].map(({ key, label, desc, color }) => (
            <div key={key} className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
              <div>
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-[11px] font-medium text-slate-500">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-auto">
                <input type="checkbox" className="sr-only peer" checked={form[key]} onChange={() => set(key, !form[key])} />
                <div className={`w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${color}`}></div>
              </label>
            </div>
          ))}
        </div>

        {/* ── Submit ── */}
        <button
          onClick={handleSubmit}
          disabled={saved || submitting}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg 
            ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20"
            : submitting ? "bg-slate-300 text-white cursor-not-allowed shadow-none"
            : "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-900/10 hover:shadow-blue-600/20 hover:-translate-y-0.5"
          }`}
        >
          {submitting ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving to Database...</>
          ) : saved ? (
            <><CheckCircle2 className="w-5 h-5" /> Saved Successfully!</>
          ) : (
            <><Save className="w-5 h-5" /> {mode === "add" ? "Publish Product" : "Save Changes"}</>
          )}
        </button>

      </div>
    </div>
  );
};

export default AdminProductForm;