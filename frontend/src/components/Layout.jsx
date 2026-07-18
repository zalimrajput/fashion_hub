import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  MessagesSquare,
  BrainCircuit,
  Settings,
  Bot,
  LogOut,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/conversations", label: "Conversations", icon: MessagesSquare },
  { to: "/training", label: "Train AI", icon: BrainCircuit },
  { to: "/ai-tester", label: "AI Tester", icon: Bot },
  { to: "/export", label: "Export", icon: Download },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      <aside className="w-64 shrink-0 bg-sidebar text-white flex flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="font-display text-2xl tracking-tight">FashionHub</p>
          <p className="text-xs text-white/50 mt-1 uppercase tracking-[0.2em]">
            Sales Console
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{admin?.fullName || "Admin"}</p>
          <p className="text-xs text-white/50 truncate mb-3">{admin?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
