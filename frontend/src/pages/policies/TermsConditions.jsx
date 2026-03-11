import { NavLink } from "react-router-dom";
import { FileText, ArrowLeft, Phone, Mail, AlertTriangle, Scale, ShoppingBag, Globe, Ban } from "lucide-react";

const SECTIONS = [
  {
    icon: ShoppingBag,
    title: "Products & Pricing",
    content: [
      "All products listed on our website are subject to availability. We reserve the right to limit quantities or discontinue any product without prior notice.",
      "Prices displayed on the website are in Indian Rupees (₹) and may change without prior notice. The price at the time of order placement will be honored for that order.",
      "While we make every effort to display product images and descriptions accurately, actual products may vary slightly in color or appearance due to photography and screen settings.",
    ],
  },
  {
    icon: Scale,
    title: "Orders & Payments",
    content: [
      "By placing an order, you confirm that the information provided is accurate and that you are authorized to use the selected payment method.",
      "We reserve the right to cancel or refuse any order if we suspect fraudulent activity, pricing errors, or stock unavailability.",
      "Payment must be completed at the time of order placement for online payments. Cash on Delivery (COD) orders must be paid upon delivery.",
    ],
  },
  {
    icon: Globe,
    title: "Website Usage",
    content: [
      "All content on this website, including text, images, logos, and graphics, is the property of Mahalaxmi Steels and Home Appliance and is protected under applicable copyright laws.",
      "You may not reproduce, distribute, or use any content from this website for commercial purposes without our written consent.",
      "You agree to use this website only for lawful purposes and in a manner that does not infringe upon the rights of others.",
    ],
  },
  {
    icon: Ban,
    title: "Restrictions & Termination",
    content: [
      "We reserve the right to restrict or terminate your access to the website if we believe you are misusing the platform or violating these terms.",
      "Any attempt to hack, disrupt, or interfere with the website's functionality may result in legal action.",
      "We may update these Terms & Conditions at any time. Continued use of the website constitutes acceptance of the revised terms.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Limitation of Liability",
    content: [
      "Mahalaxmi Steels and Home Appliance shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.",
      "Our liability is limited to the purchase price of the product in question. We are not responsible for delays caused by events beyond our control.",
      "These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Pune, Maharashtra.",
    ],
  },
];

const TermsConditions = () => (
  <main className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <NavLink to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </NavLink>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center ring-1 ring-amber-100">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
          Please read these terms carefully before using our website or making a purchase.
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">

        <div className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to <strong className="text-slate-900">Mahalaxmi Steels and Home Appliance</strong>. These Terms & Conditions govern your use of our website and the purchase of products from our store. By accessing or using our website, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our store is located at <strong className="text-slate-900">Ekta Nagar, Akurdi Gaothan, Dattawadi, Akurdi, Pune, Pimpri-Chinchwad, Maharashtra 411035</strong> and is owned and operated by <strong className="text-slate-900">Sakharam Choudhary</strong>.
          </p>
        </div>

        {SECTIONS.map(({ icon: Icon, title, content }) => (
          <div key={title}>
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Icon className="w-4 h-4 text-blue-600" /> {title}
            </h2>
            <ul className="space-y-2">
              {content.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Questions about these terms?</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
            If you have any questions or concerns about these Terms & Conditions, please reach out:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="tel:+919561878293" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              <Phone className="w-4 h-4" /> +91 95618 78293
            </a>
            <a href="mailto:mahalaxmisteels08@gmail.com" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
              <Mail className="w-4 h-4" /> mahalaxmisteels08@gmail.com
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
          Last updated: March 2026 · Mahalaxmi Steels and Home Appliance
        </p>
      </div>
    </div>
  </main>
);

export default TermsConditions;
