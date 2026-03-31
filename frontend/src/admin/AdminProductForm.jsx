import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Tag, AlertCircle, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { api } from "../utils/api";

const EMPTY_FORM = {
  name: "", category: "", original_price: "", discount_percentage: "",
  description: "", image: "", images: [], inStock: true,
  brand: "", stock: "", tags: "", isHero: false,
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
          original_price: product.original_price || product.mrp || product.originalPrice || "",
          discount_percentage: product.discount_percentage ?? (
            (product.mrp || product.originalPrice) && product.price && (product.mrp || product.originalPrice) > product.price
              ? Math.round((((product.mrp || product.originalPrice) - product.price) / (product.mrp || product.originalPrice)) * 100)
              : 0
          ),
          description: product.description || "",
          image:       product.images?.[0] || product.image || "",
          images:      product.images?.length ? product.images : (product.image ? [product.image] : []),
          inStock:     product.inStock     ?? true,
          brand:       product.brand       || "",
          stock:       product.stock       || "",
          tags:        (product.tags || []).join(", "),
          isHero:      !!product.isHero,
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
    if (!form.original_price || isNaN(form.original_price) || +form.original_price <= 0) e.original_price = "Enter a valid original price";
    if (form.discount_percentage !== "" && (isNaN(form.discount_percentage) || +form.discount_percentage < 0 || +form.discount_percentage > 100)) e.discount_percentage = "Discount must be between 0 and 100";
    if (!form.category)                                 e.category = "Category is required";
    return e;
  };

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
    if (invalid) {
      setUploadError("Only image files under 5MB are allowed.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    const step = Math.max(5, Math.floor(90 / files.length));
    const interval = setInterval(() => setUploadProgress((p) => (p < 90 ? p + step : p)), 220);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));

      const data = await api.upload("/api/upload/multiple", formData, token);
      const uploadedUrls = (data.images || []).map((img) => img.url).filter(Boolean);

      if (!uploadedUrls.length) throw new Error("Upload failed");

      setForm((prev) => {
        const merged = [...(prev.images || []), ...uploadedUrls].filter(Boolean);
        return {
          ...prev,
          images: merged,
          image: merged[0] || "",
        };
      });
      setUploadProgress(100);
    } catch (err) {
      setUploadError("Upload failed: " + err.message);
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  }

  async function handleImageUpload(e) {
    await uploadFiles(e.target.files);
    e.target.value = "";
  }

  const removeImageAt = (index) => {
    setForm((prev) => {
      const nextImages = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        image: nextImages[0] || "",
      };
    });
  };

  const setPrimaryImage = (index) => {
    setForm((prev) => {
      const imgs = [...(prev.images || [])];
      if (!imgs[index]) return prev;
      const [primary] = imgs.splice(index, 1);
      const nextImages = [primary, ...imgs];
      return {
        ...prev,
        images: nextImages,
        image: primary,
      };
    });
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      ...form,
      original_price: +form.original_price,
      discount_percentage: +form.discount_percentage || 0,
      final_price:   finalPrice,
      price:         finalPrice,
      mrp:           +form.original_price,
      originalPrice: +form.original_price,
      stock:         +form.stock || 0,
      tags:          (form.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      image:         (form.images || [])[0] || "",
      images:        form.images || [],
      inStock:      form.inStock,
      isHero:       !!form.isHero,
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

  const calcFinalPrice = () => {
    const orig = +form.original_price || 0;
    const disc = +form.discount_percentage || 0;
    return Math.round(orig - (orig * disc / 100));
  };
  const finalPrice = calcFinalPrice();

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">

        {errors.submit && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errors.submit}
          </div>
        )}

        {/* ── Image Upload ── */}
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">Product Images</label>
          
          {!!(form.images || []).length ? (
            <div className="space-y-3">
              <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={form.images[0]} alt="Primary preview" className="w-full h-full object-contain mix-blend-multiply" />
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">Primary</div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(form.images || []).map((img, index) => (
                  <div key={`${img}-${index}`} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img src={img} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover" />
                    <div className="absolute inset-0 bg-slate-900/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 px-1">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-white text-slate-800"
                        >
                          Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageAt(index)}
                        className="text-[10px] font-bold px-2 py-1 rounded-md bg-rose-500 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 border border-slate-300 hover:border-blue-400 rounded-xl px-4 py-2.5 bg-white text-slate-700 text-sm font-semibold">
                <UploadCloud className="w-4 h-4" /> Add More Images
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
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
                    <div className="text-sm font-bold text-slate-700">Click to upload product images</div>
                    <div className="text-xs font-medium text-slate-400 mt-1">Upload multiple JPG, PNG, WEBP files (max 5MB each)</div>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Original Price (MRP) ₹ <span className="text-rose-500">*</span></label>
            <input type="number" value={form.original_price} onChange={(e) => set("original_price", e.target.value)} placeholder="1199" className={inputClass(errors.original_price)} />
            {errors.original_price && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.original_price}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Discount (%)</label>
            <input type="number" value={form.discount_percentage} onChange={(e) => set("discount_percentage", e.target.value)} placeholder="10" className={inputClass(errors.discount_percentage)} />
            {errors.discount_percentage && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{errors.discount_percentage}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Final Price (Sale) ₹</label>
            <div className="w-full px-4 py-3 text-sm font-bold border border-slate-200 bg-slate-100 text-slate-600 rounded-xl shadow-inner select-none">
              {finalPrice > 0 ? `₹${finalPrice.toLocaleString("en-IN")}` : "-"}
            </div>
          </div>
        </div>

        {form.discount_percentage > 0 && finalPrice > 0 && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-bold">
            <Tag className="w-4 h-4 text-emerald-500" />
            {form.discount_percentage}% Discount Applied <span className="text-emerald-600 font-medium ml-1">(Customer saves ₹{Math.round((+form.original_price || 0) - finalPrice).toLocaleString("en-IN")})</span>
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

        {/* ── Stock Toggle ── */}
        <div className="flex flex-col gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-4 w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-sm font-bold text-slate-900">In Stock Status</p>
              <p className="text-[11px] font-medium text-slate-500">Available for purchase</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input type="checkbox" className="sr-only peer" checked={form.inStock} onChange={() => set("inStock", !form.inStock)} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-sm font-bold text-slate-900">📌 Feature this product in the Hero section</p>
              <p className="text-[11px] font-medium text-slate-500">Only one hero product is active at a time</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input type="checkbox" className="sr-only peer" checked={!!form.isHero} onChange={() => set("isHero", !form.isHero)} />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
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