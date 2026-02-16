import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
// Dashboard is rendered inside AdminLayout (provided by App routes)
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  hotelOwners: number;
  activeUsers: number;
  totalRevenue: number;
  topHotels: Array<{
    _id: string;
    hotelName: string;
    bookingCount: number;
    totalRevenue: number;
  }>;
  recentBookings: Array<{
    _id: string;
    guestName: string;
    hotelName: string;
    checkInDate: string;
    checkOutDate: string;
    totalCost: number;
    status: string;
  }>;
}

/**
 * Admin Dashboard Page - Modern Analytics View
 * 
 * Displays:
 * - Key performance metrics with trend indicators
 * - System overview cards
 * - Top performing hotels
 * - Recent bookings
 * - Analytics charts and visualizations
 */
const AdminDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  // Use Vite env var `VITE_API_URL` to point to backend in dev, fallback to relative `/api`.
  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || "/api";

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardStats, Error>(
    "adminDashboard",
    async () => {
      try {
        const token = localStorage.getItem("session_id");
        if (!token) {
          throw new Error("No authentication token found. Please login again.");
        }

        // Step 1: Test if backend is responding
        console.log("🔍 Step 1: Testing backend health...");
        const statusResponse = await fetch(`${API_BASE}/status`);
        const statusContentType = statusResponse.headers.get("content-type") || "";
        let statusData: any = null;
        if (statusContentType.includes("application/json")) {
          statusData = await statusResponse.json();
        } else {
          const raw = await statusResponse.text();
          console.warn("⚠️ Non-JSON response from /api/status:", raw.substring(0, 300));
          setDebugInfo((prev: any) => ({ ...prev, backendHealthRaw: raw.substring(0, 300) }));
          if (!statusResponse.ok) {
            throw new Error(`Backend health check failed (status ${statusResponse.status})`);
          }
        }
        console.log("✅ Backend is responding:", statusData ?? "non-json response");
        setDebugInfo((prev: any) => ({ ...prev, backendHealth: statusData ?? null }));

        // Step 2: Test if admin routes are registered
        console.log("🔍 Step 2: Testing admin routes...");
        const adminTestResponse = await fetch(`${API_BASE}/admin/test`);
        const adminTestContentType = adminTestResponse.headers.get("content-type") || "";
        let adminTestData: any = null;
        if (adminTestContentType.includes("application/json")) {
          adminTestData = await adminTestResponse.json();
        } else {
          const raw = await adminTestResponse.text();
          console.warn("⚠️ Non-JSON response from /api/admin/test:", raw.substring(0, 300));
          setDebugInfo((prev: any) => ({ ...prev, adminRoutesRaw: raw.substring(0, 300) }));
          if (!adminTestResponse.ok) {
            throw new Error(`Admin routes test failed (status ${adminTestResponse.status})`);
          }
        }
        console.log("✅ Admin routes available:", adminTestData ?? "non-json response");
        setDebugInfo((prev: any) => ({ ...prev, adminRoutesTest: adminTestData ?? null }));

        // Step 3: Fetch dashboard data with full debugging
        console.log("📊 Step 3: Fetching dashboard data...");
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type");
        console.log("📥 Dashboard response - Status:", response.status, "Content-Type:", contentType);

        // Check if response is HTML (error page) instead of JSON
        if (contentType && contentType.includes("text/html")) {
          const htmlSnippet = await response.text();
          console.error("❌ HTML Response received:", htmlSnippet.substring(0, 500));
          setDebugInfo((prev: any) => ({ ...prev, htmlError: htmlSnippet.substring(0, 500) }));
          throw new Error(
            `Server returned HTML instead of JSON (Status: ${response.status}). Please check the server logs.`
          );
        }

        if (response.status === 401) {
          throw new Error("Your session has expired. Please login again.");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to access the admin dashboard. Make sure you are logged in as an admin.");
        }
        if (response.status === 404) {
          throw new Error(
            "Admin dashboard API endpoint not found. This suggests the admin routes may not be properly registered in the backend."
          );
        }
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(
            errData.message || `Server error: ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("✅ Dashboard data received successfully");
        
        if (!result.success || !result.data) {
          throw new Error("Invalid response format from server");
        }
        return result.data;
      } catch (err: any) {
        console.error("❌ Dashboard fetch error:", err);
        setDebugInfo((prev: any) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    {
      retry: 0,
    }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message="Loading admin dashboard..." />
        </div>
      </>
    );
  }

  if (error || !dashboardData) {
    const errorMessage = error ? (error as Error).message : "Unknown error occurred";
    return (
      <>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-red-900">Failed to Load Dashboard</h2>
                  <p className="text-red-700 mt-2 mb-4">{errorMessage}</p>
                  <div className="space-y-2 text-sm text-red-800">
                    <p>💡 <strong>Troubleshooting steps:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Check your internet connection</li>
                      <li>Verify you are logged in as an admin</li>
                      <li>Make sure the backend server is running (check terminal for errors)</li>
                      <li>Clear your browser cache and try again</li>
                      <li>Check the browser console (F12) for detailed error logs</li>
                      <li>Contact support if the problem persists</li>
                    </ul>
                  </div>

                  {/* Debug Information */}
                  {debugInfo && (
                    <details className="mt-6 cursor-pointer">
                      <summary className="font-semibold text-red-900 hover:text-red-700">
                        🔧 Debug Information (click to expand)
                      </summary>
                      <div className="mt-4 p-4 bg-red-100 rounded border border-red-300 font-mono text-xs text-red-900 overflow-x-auto">
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                      </div>
                    </details>
                  )}

                  <button
                    onClick={() => refetch()}
                    className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                  >
                    ↻ Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const stats = dashboardData as DashboardStats;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Prepare chart data
  const hotelChartData = stats.topHotels.map((hotel) => ({
    name: hotel.hotelName.substring(0, 12),
    bookings: hotel.bookingCount,
    revenue: hotel.totalRevenue,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">System overview and key metrics</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/users" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition">
              <div className="text-blue-600">
                <Users size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Users Management</p>
                <p className="text-xs text-gray-500">View, search, and manage users</p>
              </div>
            </Link>

            <Link to="/admin/hotels" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition">
              <div className="text-emerald-600">
                <Building2 size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Hotels Management</p>
                <p className="text-xs text-gray-500">Approve, edit, or remove hotels</p>
              </div>
            </Link>

            <Link to="/admin/activity-logs" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition">
              <div className="text-purple-600">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Activity Logs</p>
                <p className="text-xs text-gray-500">Audit trail and admin actions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Key Metrics - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Users className="text-blue-600" size={28} />}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.activeUsers} active`}
            trend="up"
            bgColor="bg-blue-50"
          />
          <MetricCard
            icon={<Building2 className="text-emerald-600" size={28} />}
            title="Total Hotels"
            value={stats.totalHotels.toLocaleString()}
            subtitle={`${stats.hotelOwners} owners`}
            trend="up"
            bgColor="bg-emerald-50"
          />
          <MetricCard
            icon={<TrendingUp className="text-purple-600" size={28} />}
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            subtitle="Active bookings"
            trend="up"
            bgColor="bg-purple-50"
          />
          <MetricCard
            icon={<CreditCard className="text-amber-600" size={28} />}
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle="All time"
            trend="up"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Hotels Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Top Hotels Performance</h2>
              <p className="text-sm text-gray-600 mt-1">Bookings and revenue</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hotelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">User Distribution</h2>
              <p className="text-sm text-gray-600 mt-1">By role</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Regular Users", value: stats.totalUsers - stats.hotelOwners },
                    { name: "Hotel Owners", value: stats.hotelOwners },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[COLORS[0], COLORS[1]].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hotels Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Building2 size={24} className="text-blue-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Top Hotels</h2>
                <p className="text-sm text-gray-600 mt-1">Ranked by bookings</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hotel Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Avg per Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topHotels.map((hotel, idx) => (
                  <tr key={hotel._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{hotel.hotelName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{hotel.bookingCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                      {formatCurrency(hotel.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCurrency(hotel.totalRevenue / (hotel.bookingCount || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Activity size={24} className="text-purple-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                <p className="text-sm text-gray-600 mt-1">Latest transactions</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guest</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hotel</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dates</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cost</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{booking.hotelName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(booking.totalCost)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Metric Card Component - Modern KPI Display
 */
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  bgColor,
}) => {
  return (
    <div className={`${bgColor} rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <div className="flex items-center gap-2 mt-3">
              {trend === "up" && (
                <ArrowUp size={16} className="text-emerald-600" />
              )}
              {trend === "down" && (
                <ArrowDown size={16} className="text-red-600" />
              )}
              <p className="text-xs text-gray-600">{subtitle}</p>
            </div>
          )}
        </div>
        <div className="text-2xl ml-4">{icon}</div>
      </div>
    </div>
  );
};

/**
 * Status Badge Component
 */
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    pending: "bg-amber-100 text-amber-700 border border-amber-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
    completed: "bg-blue-100 text-blue-700 border border-blue-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default AdminDashboard;
