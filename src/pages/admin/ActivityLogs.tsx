import React, { useState } from "react";
// AdminLayout is provided by App routes; avoid double-wrapping
import LoadingSpinner from "../../components/LoadingSpinner";
import { Clock, Filter, RefreshCw } from "lucide-react";

interface ActivityLog {
  userId?: string;
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  statusCode?: number;
  duration: number;
  message?: string;
}

/**
 * Admin - Activity Logs Page
 * 
 * Displays all system activities, login attempts, and user actions
 * Useful for security monitoring and audit trails
 */
const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterUserId, setFilterUserId] = useState("");
  const [limit, setLimit] = useState(100);

  React.useEffect(() => {
    fetchLogs();
  }, [filterMethod, filterUserId, limit]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filterMethod !== "all" && { method: filterMethod }),
        ...(filterUserId && { userId: filterUserId }),
      });

      const response = await fetch(`/api/admin/activity-logs?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch activity logs");
      const data = await response.json();
      setLogs(data.data || []);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-700";
      case "POST":
        return "bg-green-100 text-green-700";
      case "PUT":
        return "bg-yellow-100 text-yellow-700";
      case "PATCH":
        return "bg-purple-100 text-purple-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "text-gray-500";
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 300 && status < 400) return "text-blue-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <>
        <LoadingSpinner message="Loading activity logs..." />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock size={28} />
              Activity Logs
            </h1>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter by Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Method
              </label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* Filter by User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="Filter by user ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>Last 500</option>
                <option value={1000}>Last 1000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Total Entries: <span className="font-bold">{logs.length}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Duration (ms)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-US")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs break-words">
                        {log.message ? log.message : (log as any).params ? JSON.stringify((log as any).params) : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(
                            log.method
                          )}`}
                        >
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {log.path}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.userId || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {log.ip}
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${getStatusColor(log.statusCode)}`}>
                        {log.statusCode || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.duration}ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityLogs;
