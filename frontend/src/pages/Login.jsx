import { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const Login = () => {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(""); // for resend button
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const from = new URLSearchParams(location.search).get("redirect") || null;

  useEffect(() => {
    if (!authLoading && user) {
      navigate(from || (user.role === "admin" ? "/admin" : "/"), { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  // ── Google SDK ────────────────────────────────────────────────────
  const googleCallbackRef = useRef(null);

  const handleGoogleCallback = useCallback(async ({ credential }) => {
    if (!credential) {
      setErrors({ submit: "Google sign-in was cancelled. Please try again." });
      return;
    }
    setGoogleLoading(true);
    setErrors({});
    try {
      const loggedInUser = await loginWithGoogle(credential);
      navigate(from || (loggedInUser.role === "admin" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || "Google sign-in failed. Please try again." });
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, navigate, from]);

  useEffect(() => {
    googleCallbackRef.current = handleGoogleCallback;
  }, [handleGoogleCallback]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const stableCallback = (response) => googleCallbackRef.current?.(response);

    const initGoogle = () => {
      window.google?.accounts.id.initialize({ client_id: clientId, callback: stableCallback });
      const btnEl = document.getElementById("google-btn");
      if (btnEl) {
        window.google?.accounts.id.renderButton(btnEl, { theme: "outline", size: "large", width: "100%", text: "signin_with" });
      }
    };

    if (window.google?.accounts) { initGoogle(); return; }

    const script = document.createElement("script");
    script.src   = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload  = initGoogle;
    script.onerror = () => setErrors({ submit: "Failed to load Google Sign-In. Please use email login." });
    document.body.appendChild(script);

    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setUnverifiedEmail("");
    setResendSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setUnverifiedEmail("");
    setResendSuccess(false);
    try {
      const user = await login(form.email, form.password);
      navigate(from || (user.role === "admin" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(form.email);
        setErrors({ submit: "Please verify your email before signing in." });
      } else {
        setErrors({ submit: err.message || "Invalid email or password. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post("/api/auth/resend-verification", { email: unverifiedEmail });
      setResendSuccess(true);
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.message || "Failed to resend. Please try again." });
    } finally {
      setResending(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 outline-none
     ${hasError
        ? "bg-rose-50 border-rose-300 text-rose-900 focus:ring-4 focus:ring-rose-100 placeholder:text-rose-300"
        : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 placeholder:text-slate-400 hover:border-slate-300 shadow-inner"
     }`;

  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full max-w-5xl flex flex-col md:flex-row relative z-10">

        {/* ── LEFT: Branding Panel ── */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-900 relative items-center justify-center p-12 text-white flex-col overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/10">
              <span className="text-4xl drop-shadow-md">🥘</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Mahalaxmi Steels</h2>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-10">& Home Appliance</p>
            <div className="w-full border-t border-white/10 pt-8 space-y-5 text-left">
              {[
                { title: "2+ Years of Trust",         desc: "Serving homes since 2024"                   },
                { title: "500+ Happy Customers",    desc: "A growing family across Maharashtra"         },
                { title: "100% Genuine Products",      desc: "Quality checked & ISI certified"             },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-white/20 backdrop-blur-sm">
                    <span className="text-sm font-bold text-blue-300">✓</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                    <p className="text-xs text-blue-200/80">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="w-full md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-4 h-[2px] bg-blue-600 rounded-full"></span> Welcome Back
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Sign in to your account</h1>
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <NavLink to={`/signup${from ? `?redirect=${from}` : ""}`} className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
                Sign up free
              </NavLink>
            </p>
          </div>

          {from && (
            <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Please sign in to continue to checkout.
            </div>
          )}

          {/* Resend success */}
          {resendSuccess && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl font-bold flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-500" />
              Verification email sent! Please check your inbox.
            </div>
          )}

          {/* Error + resend button for unverified */}
          {errors.submit && (
            <div className="mb-4">
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                {errors.submit}
              </div>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-2 w-full flex items-center justify-center gap-2 text-sm font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {resending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    : <><Mail className="w-3.5 h-3.5" /> Resend Verification Email</>
                  }
                </button>
              )}
            </div>
          )}

          {/* Google Sign-In */}
          {hasGoogleClientId && (
            <>
              <div id="google-btn" className="w-full mb-5 min-h-[44px] flex justify-center" />
              {googleLoading && (
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 mb-5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Signing in with Google...
                </div>
              )}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">or continue with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </>
          )}

          {!hasGoogleClientId && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium flex flex-col gap-1 text-center">
              <span>Google Sign-In is not configured.</span>
              <span>Add <code className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">VITE_GOOGLE_CLIENT_ID</code> to your <code className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">.env</code></span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 mb-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address <span className="text-rose-500">*</span>
              </label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="rahul@example.com" className={inputClass(errors.email)} />
              {errors.email && <p className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-blue-600" /> Password <span className="text-rose-500">*</span>
                </label>
                <button type="button" className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline font-bold uppercase tracking-wide">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                  className={`${inputClass(errors.password)} pr-11 tracking-widest placeholder:tracking-normal`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-[11px] font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>}
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <input id="remember" type="checkbox" className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="remember" className="text-[13px] font-medium text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:translate-y-0">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><ShieldCheck className="w-4 h-4" /> Sign In securely</>}
            </button>
          </form>

          <p className="mt-8 text-[11px] font-medium text-center text-slate-500 leading-relaxed">
            By signing in, you agree to our{" "}
            <NavLink to="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</NavLink> and{" "}
            <NavLink to="/privacy" className="text-blue-600 font-bold hover:underline">Privacy Policy</NavLink>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;