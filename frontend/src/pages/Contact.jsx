import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, PhoneCall, Mail, Clock,
  Send, Loader2, ChevronDown,
  User, AtSign, Phone, Tag, FileText, MessageSquare, AlertCircle
} from "lucide-react";
import { api } from "../utils/api";

// ── Data ──────────────────────────────────────────────────────────────────────
const ENQUIRY_OPTIONS = [
  { value: "",         label: "Select a product category"  },
  { value: "steel",      label: "Stainless Steel Utensils"   },
  { value: "copper",     label: "Copper Utensils"            },
  { value: "brass",      label: "Pital (Brass) Items"        },
  { value: "pooja",      label: "Pooja Essentials"           },
  { value: "appliances", label: "Home Appliances"            },
  { value: "bulk",       label: "Bulk / Wholesale Order"     },
  { value: "other",      label: "Other"                      },
];

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune, Pimpri-Chinchwad, Maharashtra 411035",
    sub: "Open Mon – Sat",
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "https://maps.app.goo.gl/i7VqYRV4YFvNRdTc8",
  },
  {
    icon: PhoneCall,
    label: "Call Us",
    value: "+91 95618 78293",
    sub: "Mon – Sun, 9AM – 10PM",
    href: "tel:+919561878293",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "mahalaxmisteels08@gmail.com",
    sub: "We reply within 24 hrs",
    href: "mailto:mahalaxmisteels08@gmail.com",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Sun: 9:00 AM – 10:00 PM",
    sub: "Open EveryDay",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

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
    name: "", email: "", phone: "", subject: "", enquiry: "", message: "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.enquiry)        e.enquiry = "Please select a product category";
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
        subject: `[${form.enquiry.toUpperCase()}] ${form.subject}`,
        message: form.message,
      });
      navigate("/");
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
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="w-4 h-[2px] bg-blue-600 rounded-full"></span> Get In Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Contact Us</h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
            Have a question about a product or want to place a bulk order?
            We're here to help — reach out and we'll get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-12 items-start">

          {/* ── LEFT: Contact Info Cards ── */}
          <div className="flex flex-col gap-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, href, color, bg }) => (
              <div key={label} className="bg-white rounded-[1.25rem] border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4 group">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ring-1 ring-black/5`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  {href ? (
                    <a href={href} className={`text-[13px] font-bold ${color} hover:underline break-all leading-snug`}>{value}</a>
                  ) : (
                    <p className="text-[13px] font-bold text-slate-900 leading-snug">{value}</p>
                  )}
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/919561878293"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm py-4 rounded-2xl transition-all duration-300 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Send us a Message</h2>
            <p className="text-sm text-slate-500 mb-8">Fill in the details below and we'll get back to you shortly.</p>

            {errors.submit && (
              <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <Field icon={User} label="Full Name" required error={errors.name}>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Rahul Sharma" className={inputClass(errors.name)} />
                </Field>

                <Field icon={AtSign} label="Email Address" required error={errors.email}>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@email.com" className={inputClass(errors.email)} />
                </Field>

                <Field icon={Phone} label="Phone Number" error={errors.phone}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold select-none">+91</span>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="98765 43210" maxLength={10} className={`${inputClass(errors.phone)} pl-12`} />
                  </div>
                </Field>

                <Field icon={Tag} label="Subject" required error={errors.subject}>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="e.g. Price enquiry for steel kadai" className={inputClass(errors.subject)} />
                </Field>

                <div className="sm:col-span-2">
                  <Field icon={FileText} label="Product Enquiry" required error={errors.enquiry}>
                    <div className="relative">
                      <select
                        name="enquiry"
                        value={form.enquiry}
                        onChange={handleChange}
                        className={`${inputClass(errors.enquiry)} appearance-none pr-10 ${!form.enquiry ? "text-slate-400" : "text-slate-900"}`}
                      >
                        {ENQUIRY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} disabled={opt.value === ""}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field icon={MessageSquare} label="Your Message" required error={errors.message}>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us what you're looking for, quantity needed, or any questions..."
                      className={`${inputClass(errors.message)} resize-none`}
                    />
                    <div className="flex justify-end mt-1.5">
                      <p className={`text-[10px] font-bold ${form.message.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                        {form.message.length} / 500
                      </p>
                    </div>
                  </Field>
                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:translate-y-0"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending Message...</> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>

              <p className="mt-5 text-[11px] font-medium text-center text-slate-500 max-w-sm mx-auto leading-relaxed">
                By submitting, you agree to our <a href="#" className="text-blue-600 font-bold hover:underline">Privacy Policy</a>. We never share your information.
              </p>
            </form>
          </div>

        </div>

        {/* ── Google Maps Embed ── */}
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-6 tracking-tight text-center">Find Us on Map</h2>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <iframe
              title="Mahalaxmi Steels and Home Appliance Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d236.26597118488425!2d73.77872675657274!3d18.65252551471866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e89355ae2d%3A0x423742e2b19d30e3!2sMahalaxmi%20steel%20and%20Home%20appliances!5e0!3m2!1sen!2sin!4v1773241762037!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://maps.app.goo.gl/i7VqYRV4YFvNRdTc8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Contact;