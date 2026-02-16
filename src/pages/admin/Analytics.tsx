import React, { useState } from "react";
import { useQuery } from "react-query";
// AdminLayout is provided by App routes; avoid double-wrapping
import LoadingSpinner from "../../components/LoadingSpinner";
import { Users, Calendar } from "lucide-react";

interface BookingAnalytics {
  bookingTrends: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

interface UserAnalytics {
  usersByRole: Array<{
    _id: string;
    count: number;
  }>;
  registrationTrends: Array<{
    _id: string;
    count: number;
  }>;
}

/**
 * Admin - Analytics Page
 * 
 * Displays:
 * - Booking trends and status distribution
 * - User registration trends
 * - User distribution by role
 */
const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d");

  const { data: bookingData, isLoading: bookingLoading } =
    useQuery<BookingAnalytics>(
      ["bookingAnalytics", dateRange],
      async () => {
        const now = new Date();
        const startDate = new Date();

        if (dateRange === "7d") {
          startDate.setDate(now.getDate() - 7);
        } else if (dateRange === "30d") {
          startDate.setMonth(now.getMonth() - 1);
        } else if (dateRange === "90d") {
          startDate.setMonth(now.getMonth() - 3);
        } else if (dateRange === "1y") {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
        });

        const response = await fetch(
          `/api/admin/analytics/bookings?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("session_id")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch booking analytics");
        const result = await response.json();
        return result.data;
      }
    );

  const { data: userData, isLoading: userLoading } = useQuery<UserAnalytics>(
    "userAnalytics",
    async () => {
      const response = await fetch("/api/admin/analytics/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user analytics");
      const result = await response.json();
      return result.data;
    }
  );

  if (bookingLoading || userLoading) {
    return (
      <>
        <LoadingSpinner message="Loading analytics..." />
      </>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Platform Analytics
          </h1>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "1y"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "7d"
                  ? "Last 7 days"
                  : range === "30d"
                  ? "Last 30 days"
                  : range === "90d"
                  ? "Last 90 days"
                  : "Last Year"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Booking Trends
            </h2>
            {bookingData?.bookingTrends && bookingData.bookingTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto">
                  {bookingData.bookingTrends.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(item._id).toLocaleDateString("en-US")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.count} bookings
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* Booking Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Booking Status Distribution
            </h2>
            {bookingData?.statusDistribution &&
            bookingData.statusDistribution.length > 0 ? (
              <div className="space-y-4">
                {bookingData.statusDistribution.map((item, index) => {
                  const total = bookingData.statusDistribution.reduce(
                    (sum, s) => sum + s.count,
                    0
                  );
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const colors = {
                    confirmed: "bg-green-500",
                    pending: "bg-yellow-500",
                    cancelled: "bg-red-500",
                  };

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {item._id}
                        </p>
                        <span className="text-sm font-bold text-gray-700">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${
                            colors[item._id as keyof typeof colors] ||
                            "bg-blue-500"
                          } h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* User Registration Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Registration Trends
              </h2>
            </div>
            {userData?.registrationTrends &&
            userData.registrationTrends.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {userData.registrationTrends.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0"
                  >
                    <p className="text-sm text-gray-600">
                      {new Date(item._id).toLocaleDateString("en-US")}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (item.count / 10) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-10 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>

          {/* User Distribution by Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Users by Role
              </h2>
            </div>
            {userData?.usersByRole && userData.usersByRole.length > 0 ? (
              <div className="space-y-4">
                {userData.usersByRole.map((item, index) => {
                  const total = userData.usersByRole.reduce(
                    (sum, r) => sum + r.count,
                    0
                  );
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const colors = {
                    user: "bg-blue-500",
                    hotel_owner: "bg-green-500",
                    admin: "bg-red-500",
                  };

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {item._id === "hotel_owner"
                            ? "Hotel Owner"
                            : item._id.charAt(0).toUpperCase() +
                              item._id.slice(1)}
                        </p>
                        <span className="text-sm font-bold text-gray-700">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={
                            colors[item._id as keyof typeof colors] ||
                            "bg-gray-400"
                          }
                          style={{
                            height: "8px",
                            width: `${percentage}%`,
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
