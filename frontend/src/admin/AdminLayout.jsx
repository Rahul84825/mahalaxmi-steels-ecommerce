import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, Tag,
  ShoppingBag, Store, LogOut, ChevronLeft, Menu, Percent,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

const NAV_ITEMS = [
  { to: "/admin",            label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/admin/orders",     label: "Orders",      icon: ShoppingBag },
  { to: "/admin/products",   label: "Products",    icon: Package,     end: true },
  { to: "/admin/products/add", label: "Add Product", icon: PlusCircle },
  { to: "/admin/categories", label: "Categories",  icon: Tag },
  { to: "/admin/offers",     label: "Offers & Deals", icon: Percent },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout, user } = useAuth();
  const orderSoundRef = useRef(null);

  // ── Global new-order notification sound (all admin pages) ──────────────────
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    // Single reusable Audio instance — no duplicate sounds
    const sound = new Audio("/sounds/zomato_ring_5.mp3");
    sound.loop = true;
    orderSoundRef.current = sound;

    const stopSound = () => {
      if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
      }
    };

    // Stop looping sound when admin returns to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) stopSound();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
    });

    socket.on("newOrder", () => {
      // If the admin tab is hidden, loop the sound until they return
      if (document.hidden) {
        sound.currentTime = 0;
        sound.loop = true;
        sound.play().catch(() => {});
      } else {
        // Tab is active — play once so the admin hears it immediately
        sound.loop = false;
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[AdminLayout] Notification socket error:", err.message);
    });

    return () => {
      stopSound();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.disconnect();
    };
  }, [user?.role]);

  // Custom active check so /admin/products/add doesn't highlight "Products"
  const isActive = (item) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const navLinkClass = (item) => {
    const active = isActive(item);
    return `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 group relative
      ${active 
        ? "bg-blue-50/80 text-blue-700 font-bold" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
      }`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 ${mobile ? "w-[280px]" : collapsed ? "w-[80px]" : "w-[260px]"} transition-all duration-300`}>
      
      {/* ── Header ── */}
      <div className={`flex items-center ${collapsed && !mobile ? 'justify-center' : 'justify-between'} px-5 py-5 border-b border-slate-100 min-h-[72px]`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm shadow-blue-900/20">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-extrabold text-slate-900 leading-none tracking-tight">Mahalaxmi</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Panel</p>
            </div>
          </div>
        )}
        
        {/* Collapse Button (Desktop Only) */}
        {!mobile && (
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all ${collapsed ? "" : "ml-2"}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.to}
              onClick={() => { navigate(item.to); mobile && setMobileOpen(false); }}
              className={navLinkClass(item) + ` ${collapsed && !mobile ? 'justify-center px-0' : 'w-full text-left'}`}
              title={collapsed && !mobile ? item.label : undefined}
            >
              {/* Active Indicator Line */}
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} strokeWidth={active ? 2.5 : 2} />
              
              {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Footer Actions ── */}
      <div className="px-4 py-5 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-3 ${collapsed && !mobile ? 'justify-center w-10 h-10 mx-auto px-0' : 'w-full px-3 py-2.5'} rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all`}
          title={collapsed && !mobile ? "View Store" : undefined}
        >
          <Store className="w-4.5 h-4.5 flex-shrink-0" />
          {(!collapsed || mobile) && <span>View Store Live</span>}
        </button>
        
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 ${collapsed && !mobile ? 'justify-center w-10 h-10 mx-auto px-0' : 'w-full px-3 py-2.5'} rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all`}
          title={collapsed && !mobile ? "Logout" : undefined}
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Secure Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0 relative z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={() => setMobileOpen(false)} 
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-300">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* Mobile Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 h-16 flex items-center gap-4 flex-shrink-0 shadow-sm md:hidden">
          <button 
            className="p-2 -ml-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors" 
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">M</span>
            </div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">Admin</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
              <span className="text-xs font-bold text-blue-700">A</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content Injection */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;