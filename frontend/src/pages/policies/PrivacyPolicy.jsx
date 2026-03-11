import { NavLink } from "react-router-dom";
import { Shield, ArrowLeft, Phone, Mail, Eye, Lock, Database, UserCheck, Bell } from "lucide-react";

const SECTIONS = [
  {
    icon: Database,
    title: "Information We Collect",
    content: [
      "When you place an order or contact us, we may collect your name, email address, phone number, and delivery address.",
      "We may also collect basic browsing data such as pages visited and time spent on our website to improve your shopping experience.",
      "We do not collect sensitive financial information. All payment processing is handled by secure third-party payment gateways.",
    ],
  },
  {
    icon: Eye,
    title: "How We Use Your Information",
    content: [
      "To process and fulfill your orders, including delivery and customer support.",
      "To communicate with you about your orders, promotions, or important updates.",
      "To improve our website, product offerings, and customer service based on feedback and browsing patterns.",
    ],
  },
  {
    icon: Lock,
    title: "Data Protection",
    content: [
      "Your personal information is stored securely and is only accessible to authorized personnel at Mahalaxmi Steels and Home Appliance.",
      "We use industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.",
      "We will never sell, rent, or share your personal information with third parties for their marketing purposes.",
    ],
  },
  {
    icon: UserCheck,
    title: "Third-Party Sharing",
    content: [
      "We may share your information with trusted delivery partners solely for the purpose of fulfilling your order.",
      "We may disclose information if required by law or to protect the rights and safety of our business and customers.",
      "We do not share your data with any third-party advertisers or marketing agencies.",
    ],
  },
  {
    icon: Bell,
    title: "Your Rights",
    content: [
      "You can request to view, update, or delete your personal information at any time by contacting us.",
      "You may opt out of promotional communications by replying 'STOP' or contacting us directly.",
      "If you have concerns about how your data is handled, please reach out and we will address them promptly.",
    ],
  },
];

const PrivacyPolicy = () => (
  <main className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-white border-b border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <NavLink to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </NavLink>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center ring-1 ring-emerald-100">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
          Your privacy matters to us. Here's how we collect, use, and protect your personal information.
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-10">

        <div className="space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900">Mahalaxmi Steels and Home Appliance</strong>, owned by <strong className="text-slate-900">Sakharam Choudhary</strong>, is committed to protecting the privacy of our customers. This Privacy Policy explains what information we collect and how we use it when you visit our website or make a purchase.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            By using our website, you agree to the practices described in this policy.
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
          <h3 className="text-sm font-bold text-slate-900 mb-2">Privacy concerns?</h3>
          <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
            If you have any questions about this Privacy Policy or how we handle your data, contact us:
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

export default PrivacyPolicy;
