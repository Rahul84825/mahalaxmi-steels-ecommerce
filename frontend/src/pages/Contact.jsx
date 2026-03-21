import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock, Send, Loader2,
  User, MessageSquare, AlertCircle, Truck, Info, CheckCircle2
} from "lucide-react";
import { api } from "../utils/api";

// ── Field Wrapper ─────────────────────────────────────────────────────────────
const Field = ({ icon: Icon, label, required, error, children }) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-2">
      <Icon className="w-3.5 h-3.5 text-blue-600" />
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1 tracking-wide">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

// ── Input class helper ────────────────────────────────────────────────────────
const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 outline-none
   ${hasError 
      ? "bg-rose-50 border-rose-300 text-rose-900 focus:ring-4 focus:ring-rose-100 placeholder:text-rose-300" 
      : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 placeholder:text-slate-400 hover:border-slate-300 shadow-inner"
   }`;

// ── Main Contact Page ─────────────────────────────────────────────────────────
const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    return e;
  };

  // ── Handle Change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Handle Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      await api.post("/api/contact", {
        name:    form.name,
        email:   form.email,
        phone:   form.phone ? `+91${form.phone}` : "",
        subject: "Store Enquiry from Contact Page",
        message: form.message,
      });
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Contact error:", err);
      setErrors({ submit: err.message || "Something went wrong. Please try again or call us directly." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-50 min-h-screen">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Contact Us</h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
            We’re here to help with your orders and queries. Reach out to us through any of the channels below.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── LEFT: Store Info & Quick Links ── */}
          <div className="flex flex-col gap-4">
            
            {/* Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-2 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">Quick Support</h3>
                <p className="text-[13px] text-blue-800/80 leading-relaxed">
                  For bulk orders, return requests, or urgent product inquiries, contact us directly on WhatsApp or phone for the fastest response.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <a href="tel:+919561878293" className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <Phone className="w-4 h-4" /> Call Now
              </a>
              <a href="https://wa.me/919561878293" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <MessageSquare className="w-4 h-4" /> WhatsApp Us
              </a>
              <a href="mailto:mahalaxmisteels08@gmail.com" className="sm:col-span-2 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm py-3.5 rounded-xl transition-all duration-300 shadow-sm">
                <Mail className="w-4 h-4" /> Email Support
              </a>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Store Location</p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">Mahalaxmi Steels & Home Appliance</p>
                  <p className="text-[13px] text-slate-500 mt-1">Ekta Nagar, Akurdi Gaothan, Pune, Maharashtra 411035</p>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 border border-blue-100">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Area</p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">Within 20 KM</p>
                  <p className="text-[13px] text-slate-500 mt-1">We safely deliver appliances and kitchenware across Pimpri-Chinchwad.</p>
                </div>
              </div>
              
              <div className="h-px bg-slate-100 w-full" />

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0 border border-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Working Hours</p>
                  <p className="text-sm font-bold text-slate-900 leading-snug">Mon – Sun: 9:00 AM – 10:00 PM</p>
                  <p className="text-[13px] text-slate-500 mt-1">Open every day to serve your home needs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Send a Message</h2>
            <p className="text-sm text-slate-500 mb-8">Prefer writing? Drop your details below and we'll call you back.</p>

            {errors.submit && (
              <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </div>
            )}
            
            {success && (
              <div className="mb-6 px-4 py-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Your message has been sent successfully. Our team will contact you shortly!
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 gap-5">

                <Field icon={User} label="Full Name" required error={errors.name}>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" className={inputClass(errors.name)} />
                </Field>

                <Field icon={Phone} label="Phone Number" required error={errors.phone}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold select-none">+91</span>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="98765 43210" maxLength={10} className={`${inputClass(errors.phone)} pl-12`} />
                  </div>
                </Field>

                <Field icon={Mail} label="Email Address" required error={errors.email}>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" className={inputClass(errors.email)} />
                </Field>

                <Field icon={MessageSquare} label="Your Message" required error={errors.message}>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="How can we help you?"
                    className={`${inputClass(errors.message)} resize-none`}
                  />
                </Field>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-md shadow-blue-600/20 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:translate-y-0"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Message...</> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </div>

        </div>

        {/* ── Google Maps Map Embed ── */}
        <div className="mt-16">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Find Us on the Map</h2>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-[350px] bg-slate-100 flex items-center justify-center relative">
            <p className="absolute text-slate-400 text-sm font-medium z-0 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Map Embed Area
            </p>
            <iframe
              title="Mahalaxmi Steels and Home Appliance Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d236.26597118488425!2d73.77872675657274!3d18.65252551471866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e89355ae2d%3A0x423742e2b19d30e3!2sMahalaxmi%20steel%20and%20Home%20appliances!5e0!3m2!1sen!2sin!4v1773241762037!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full z-10 opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
          </div>
        </div>

      </div>
    </main>
  );
};

export default Contact;