import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Star, Settings, LogOut,
  Menu, X, ChevronRight, Building2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navConfig = {
  ADMIN: [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/stores", label: "Stores", icon: Store },
  ],
  USER: [
    { path: "/user/stores", label: "Browse Stores", icon: Store },
    { path: "/user/settings", label: "Settings", icon: Settings },
  ],
  STORE_OWNER: [
    { path: "/owner/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { path: "/owner/settings", label: "Settings", icon: Settings },
  ],
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const roleLabel = {
    ADMIN: "System Administrator",
    USER: "Normal User",
    STORE_OWNER: "Store Owner",
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={28} className="logo-icon" />
            <span className="logo-text">StoreRate</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user?.name?.split(" ").slice(0, 2).join(" ")}</p>
            <p className="user-role">{roleLabel[user?.role]}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="nav-chevron" />}
              </Link>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="user-avatar user-avatar--sm">{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="topbar-name">{user?.name?.split(" ").slice(0, 2).join(" ")}</span>
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
