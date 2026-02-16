import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAppContext from "../hooks/useAppContext";
import {
  BarChart3,
  Users,
  Building2,
  BarChart2,
  LogOut,
  Menu,
  X,
  Clock,
  LucideIcon,
} from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAppContext();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", path: "/admin/dashboard", icon: BarChart3 },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Hotels", path: "/admin/hotels", icon: Building2 },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart2 },
    { name: "Activity Logs", path: "/admin/activity-logs", icon: Clock },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout?.();
    navigate("/sign-in");
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          {/* Logo Section */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">HA</span>
              </div>
              {sidebarOpen && (
                <div>
                  <h3 className="font-semibold">Hotel Admin</h3>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <div className="p-3 border-t">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="w-full text-left text-xs text-gray-600 hover:text-gray-800"
            >
              {sidebarOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </aside>

        {/* Mobile Top Bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
              HA
            </div>
            <div className="text-lg font-semibold">Hotel Admin</div>
          </div>
          <button onClick={() => setMobileOpen((prev) => !prev)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-30 mt-14">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute top-14 left-0 w-64 bg-white border-r shadow-md">
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50"
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header (Desktop Only) */}
          <header className="hidden lg:block bg-white border-b">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {menuItems.find((m) => m.path === location.pathname)?.name ||
                  "Admin"}
              </h2>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">
                  {user
                    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`
                    : ""}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 flex items-center gap-2 hover:text-red-700"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto pt-16 lg:pt-0">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
