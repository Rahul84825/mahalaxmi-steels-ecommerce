import { NavLink } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock,
  Shield, Truck, RefreshCw, Headphones,
  Heart, Star, Users, Award,
  ArrowRight, CheckCircle,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "2+",   label: "Years in Business", icon: Award   },
  { value: "500+", label: "Happy Customers",   icon: Users   },
  { value: "200+", label: "Products Available",icon: Star    },
  { value: "4.8★", label: "Average Rating",    icon: Heart   },
];

const VALUES = [
  {
    icon: Shield,
    title: "Quality First",
    desc: "Every product we sell is hand-picked and quality checked. We never compromise on the materials we offer to your family.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Heart,
    title: "Customer is Family",
    desc: "We treat every customer like a guest at home. Your satisfaction is not just our goal — it's our commitment.",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    icon: CheckCircle,
    title: "Honest Pricing",
    desc: "No hidden charges, no inflated MRPs. We offer the fairest prices in the market because we believe in long-term relationships.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const WHY_US = [
  { icon: Shield,     label: "100% Genuine Products",       color: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: Truck,      label: "Free Delivery above ₹999",    color: "text-emerald-600",bg: "bg-emerald-50"  },
  { icon: RefreshCw,  label: "Easy 7-Day Returns",          color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Headphones, label: "Friendly Local Support",      color: "text-orange-600", bg: "bg-orange-50" },
  { icon: Star,       label: "Curated Quality Products",    color: "text-amber-500",  bg: "bg-amber-50"  },
  { icon: Heart,      label: "Trusted by 500+ Families",    color: "text-rose-500",   bg: "bg-rose-50"   },
];

const TIMELINE = [
  {
    year: "2022",
    title: "The Beginning",
    desc: "Sakharam Choudhary founded Mahalaxmi Steels and Home Appliance in Akurdi, Pune with a carefully curated collection of stainless steel utensils and kitchen essentials.",
  },
  {
    year: "2023",
    title: "Growing Family",
    desc: "Within our first year, over 200 families in Akurdi and Pimpri-Chinchwad trusted us for their kitchen needs. We expanded to include Pital (Brass) items, Pooja Essentials, and home appliances.",
  },
  {
    year: "2024",
    title: "500+ Happy Homes",
    desc: "Today we proudly serve 500+ happy customers across Pimpri-Chinchwad and have grown our product range to include modern home appliances alongside our traditional offerings.",
  },
];

// ── About Page ────────────────────────────────────────────────────────────────
const About = () => {
  return (
    <main className="bg-slate-50 min-h-screen">

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Subtle Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-blue-600/50 border border-blue-500/50 text-blue-100 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5">
              <Star className="w-3 h-3 fill-current" /> Our Story
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-[1.15] tracking-tight">
              A Family Store Built on <br />
              <span className="text-blue-300">Trust & Quality</span>
            </h1>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              From a local shop in Akurdi, Pune to 500+ happy homes —
              Mahalaxmi Steels and Home Appliance is more than a store. It's a promise by Sakharam Choudhary to every
              family we serve in the Pimpri-Chinchwad community.
            </p>
            <NavLink
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 text-sm rounded-full hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Shop Our Collection
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 text-white py-8 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-slate-800">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <div key={label} className={`text-center ${i % 2 === 0 ? 'border-none lg:border-solid' : 'border-slate-800'} ${i === 0 ? 'border-none' : ''}`}>
                <div className="flex justify-center mb-2">
                  <Icon className="w-4 h-4 text-blue-400 opacity-80" />
                </div>
                <p className="text-2xl font-black text-white mb-0.5 tracking-tight">
                  {value}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* Left — Story text */}
            <div className="max-w-lg">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                How We Started
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-5 tracking-tight">
                Born from a love for quality kitchenware
              </h2>
              <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                <p>
                  Mahalaxmi Steels and Home Appliance was started by <strong className="text-slate-900">Sakharam Choudhary</strong> with a simple dream — to bring
                  premium quality stainless steel utensils, kitchen essentials, cookware,
                  and reliable home appliances to the families of
                  Akurdi and Pimpri-Chinchwad at honest, affordable prices.
                </p>
                <p>
                  Located at <strong className="text-slate-900">Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune</strong>, we started small, but our commitment to quality and our
                  personal approach to every customer quickly earned us the
                  trust of the community. Today, over <strong className="text-slate-900">
                  500+ families</strong> across Pimpri-Chinchwad rely on us for their
                  kitchen and home needs.
                </p>
                <p>
                  Every product we stock is handpicked with care — from
                  durable stainless steel kadais and cookware to everyday kitchen essentials
                  and modern home appliances. We take pride
                  in knowing that our products serve households every single day.
                </p>
              </div>
            </div>

            {/* Right — Timeline */}
            <div className="relative pt-2">
              <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-100" />
              <div className="space-y-6">
                {TIMELINE.map((item, i) => (
                  <div key={i} className="relative flex gap-5 pl-0.5">
                    {/* Dot */}
                    <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_0_4px_white]">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    {/* Content */}
                    <div className="bg-slate-50 hover:bg-white rounded-2xl p-4 flex-1 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md mb-2">
                        {item.year}
                      </span>
                      <h3 className="font-bold text-slate-900 mb-1.5 text-sm group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MEET THE OWNER ───────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row group hover:shadow-lg transition-shadow duration-300">

              {/* Owner Avatar */}
              <div className="sm:w-48 bg-slate-100 border-r border-slate-100 flex flex-col items-center justify-center p-6 flex-shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm mb-3 group-hover:scale-105 transition-transform duration-500">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <div className="text-center relative z-10">
                  <h2 className="text-sm font-bold text-slate-900">Sakharam Choudhary</h2>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Founder & Owner</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-6 sm:p-8 flex flex-col justify-center flex-1 relative">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <span className="w-4 h-[2px] bg-blue-600 rounded-full"></span> 
                  Behind the Brand
                </p>
                <blockquote className="text-sm text-slate-600 leading-relaxed italic relative">
                  <span className="absolute -top-2 -left-2 text-4xl text-slate-100 font-serif leading-none select-none">"</span>
                  <span className="relative z-10">
                    I started Mahalaxmi Steels and Home Appliance because I believe every family in Akurdi
                    and Pimpri-Chinchwad deserves durable, high-quality products at affordable prices.
                    Our customers are not just buyers — they are part of the Mahalaxmi family.
                    Every smile and every satisfied customer keeps me going.
                  </span>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR MISSION & VALUES ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
              What Drives Us
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Our Mission & Values
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              Everything we do is rooted in three core beliefs that have guided
              us since day one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ring-1 ring-black/5`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                Our Promise
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Why Families Choose Us
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {WHY_US.map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-4 flex flex-col items-center text-center border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-snug">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP LOCATION ────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
              Find Us
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Visit Our Shop
            </h2>
            <p className="text-sm text-slate-500">
              Come visit us in person — we'd love to help you find the perfect product for your home.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">

            {/* Contact Cards */}
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: MapPin, label: "Address", value: "Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune, Maharashtra 411035",
                  color: "text-blue-600", bg: "bg-blue-50", href: "https://maps.app.goo.gl/i7VqYRV4YFvNRdTc8",
                },
                {
                  icon: Phone, label: "Phone", value: "+91 95618 78293", href: "tel:+919561878293",
                  color: "text-emerald-600", bg: "bg-emerald-50",
                },
                {
                  icon: Mail, label: "Email", value: "mahalaxmisteels08@gmail.com", href: "mailto:mahalaxmisteels08@gmail.com",
                  color: "text-blue-600", bg: "bg-blue-50",
                },
                {
                  icon: Clock, label: "Hours", value: "Mon – Sun: 9:00 AM – 10:00 PM",
                  color: "text-amber-600", bg: "bg-amber-50",
                },
              ].map(({ icon: Icon, label, value, href, color, bg }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-black/5`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-slate-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm min-h-[320px] bg-slate-100 flex items-center justify-center relative group">
              {/* Replace src with real Maps URL. The placeholder text will hide when iframe loads */}
              <p className="absolute text-slate-400 text-sm font-medium z-0 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Map Embed Area
              </p>
              <iframe
                title="Mahalaxmi Steels and Home Appliance Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d236.26597118488425!2d73.77872675657274!3d18.65252551471866!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e89355ae2d%3A0x423742e2b19d30e3!2sMahalaxmi%20steel%20and%20Home%20appliances!5e0!3m2!1sen!2sin!4v1773241762037!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1.5 tracking-tight">
              Ready to shop with us?
            </h2>
            <p className="text-slate-400 text-sm">
              Browse our full collection of premium home essentials.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink
              to="/contact"
              className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors"
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-900 bg-white rounded-full hover:bg-blue-50 transition-colors shadow-sm"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </section>

    </main>
  );
};

export default About;