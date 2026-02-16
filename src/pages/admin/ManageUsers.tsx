import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
// AdminLayout is provided by App routes; avoid double-wrapping
import LoadingSpinner from "../../components/LoadingSpinner";
import { CheckCircle, XCircle, Search, Eye, Crown, X } from "lucide-react";
import useAppContext from "../../hooks/useAppContext";

interface UserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "hotel_owner" | "admin";
  isActive: boolean;
  createdAt: string;
  totalBookings?: number;
  totalSpent?: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

interface HotelOwned {
  _id: string;
  name: string;
  totalBookings?: number;
  isActive: boolean;
}

/**
 * User Details Modal - Shows role-specific information
 * For regular users: Shows profile, booking history
 * For hotel owners: Shows profile + list of owned hotels
 * For admins: Shows admin info
 */
const UserDetailsModal: React.FC<{
  user: UserResponse;
  onClose: () => void;
}> = ({ user, onClose }) => {
  const [hotelOwnerHotels, setHotelOwnerHotels] = useState<HotelOwned[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  // Fetch hotels for hotel owner users
  React.useEffect(() => {
    if (user.role === "hotel_owner") {
      setLoadingHotels(true);
      const token = localStorage.getItem('session_id');
      console.log('Fetching hotels for user:', user._id, 'with token:', !!token);
      
      fetch(`/api/admin/hotel-owner/${user._id}/hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Hotels API response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Hotels response data:', data);
          if (data.success) {
            setHotelOwnerHotels(data.data?.hotels || []);
          } else {
            console.error('API returned error:', data.message);
            setHotelOwnerHotels([]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch hotel owner hotels:', err);
          setHotelOwnerHotels([]);
        })
        .finally(() => setLoadingHotels(false));
    }
  }, [user._id, user.role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic User Information */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Role</p>
              <p className="mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "hotel_owner"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.role === "hotel_owner"
                    ? "Hotel Owner"
                    : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Status</p>
              <p className="flex items-center gap-2 mt-2">
                {user.isActive ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-green-700 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <span className="text-red-700 font-medium">Inactive</span>
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Joined</p>
              <p className="text-gray-900 mt-2 font-medium">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          {/* For Regular Users: Show booking statistics */}
          {user.role === "user" && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {user.totalBookings ?? 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Spent</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ${(user.totalSpent ?? 0).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* For Hotel Owners: Show owned hotels */}
          {user.role === "hotel_owner" && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Hotels Owned</h3>
              {loadingHotels ? (
                <p className="text-center text-gray-500 py-4">Loading hotels...</p>
              ) : hotelOwnerHotels.length > 0 ? (
                <div className="space-y-3">
                  {hotelOwnerHotels.map(hotel => (
                    <div
                      key={hotel._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{hotel.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Bookings: <span className="font-semibold">{hotel.totalBookings ?? 0}</span>
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            hotel.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {hotel.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No hotels found</p>
              )}
            </div>
          )}

          {/* For Admins: Additional info */}
          {user.role === "admin" && (
            <div className="border-t pt-4 bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-900 font-medium">
                ⚠️ This is an admin user with full system access
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Admin - Manage Users Page
 * 
 * Features:
 * - View all users with pagination (including admins)
 * - Filter by role (user, hotel_owner, admin)
 * - Search users by name or email
 * - View user details (bookings, spent, registration date)
 * - Change user roles
 * - Block/Unblock users
 * - Delete users
 */
const ManageUsers: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "toggle" | "changeRole">("delete");
  const [newRole, setNewRole] = useState<"user" | "hotel_owner" | "admin">("user");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { showToast } = useAppContext();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ["users", page, limit, role, search],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role !== "all" && { role }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");
      const result = await response.json();
      return result;
    }
  );

  const toggleUserMutation = useMutation(
    async (userId: string) => {
      const user = data?.data.find((u: UserResponse) => u._id === userId);
      const newStatus = !user?.isActive;

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update user status");
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
        showToast({
          title: "User status updated",
          description: `User has been ${selectedUser?.isActive ? "deactivated" : "activated"}`,
          type: "SUCCESS",
        });
        setShowConfirmModal(false);
        setSelectedUser(null);
      },
      onError: () => {
        showToast({
          title: "Error",
          description: "Failed to update user status",
          type: "ERROR",
        });
      },
    }
  );

  const deleteUserMutation = useMutation(
    async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
        showToast({
          title: "User deleted",
          description: "User and associated data have been removed",
          type: "SUCCESS",
        });
        setShowConfirmModal(false);
        setSelectedUser(null);
      },
      onError: () => {
        showToast({
          title: "Error",
          description: "Failed to delete user",
          type: "ERROR",
        });
      },
    }
  );

  const changeRoleMutation = useMutation(
    async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to change user role");
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"]);
        showToast({
          title: "Role updated",
          description: `User role has been changed to ${newRole === "hotel_owner" ? "Hotel Owner" : newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
          type: "SUCCESS",
        });
        setShowConfirmModal(false);
        setSelectedUser(null);
      },
      onError: () => {
        showToast({
          title: "Error",
          description: "Failed to change user role",
          type: "ERROR",
        });
      },
    }
  );

  const handleConfirmAction = () => {
    if (!selectedUser) return;

    if (confirmAction === "delete") {
      deleteUserMutation.mutate(selectedUser._id);
    } else if (confirmAction === "toggle") {
      toggleUserMutation.mutate(selectedUser._id);
    } else if (confirmAction === "changeRole") {
      changeRoleMutation.mutate(selectedUser._id);
    }
  };

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to reset password");
      return response.json();
    },
    {
      onSuccess: (data: any) => {
        showToast({
          title: "Password reset",
          description: `Temporary password: ${data.data?.tempPassword || "(not returned)"}`,
          type: "SUCCESS",
        });
        queryClient.invalidateQueries(["users"]);
      },
      onError: () => {
        showToast({
          title: "Error",
          description: "Failed to reset password",
          type: "ERROR",
        });
      },
    }
  );

  if (isLoading) {
    return (
      <>
        <LoadingSpinner message="Loading users..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Failed to load users. Please try again later.
        </div>
      </>
    );
  }

  const users = data?.data || [];
  const pagination: PaginationData = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Manage Users
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Regular User</option>
              <option value="hotel_owner">Hotel Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Total Users: <span className="font-bold">{pagination.totalUsers}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: UserResponse) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "hotel_owner"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "hotel_owner"
                            ? "Hotel Owner"
                            : user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.isActive ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle size={16} />
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-700">
                            <XCircle size={16} />
                            <span>Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("en-US")}
                      </td>
                      {/* Actions - Only show for non-admin users */}
                      {user.role !== "admin" && (
                        <td className="px-6 py-4 text-sm space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailsModal(true);
                              }}
                              className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Change Role */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setNewRole(user.role === "admin" ? "user" : user.role);
                                setConfirmAction("changeRole");
                                setShowConfirmModal(true);
                              }}
                              className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                              title="Change Role"
                            >
                              <Crown size={14} />
                            </button>

                            {/* Block/Unblock */}
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setConfirmAction("toggle");
                                setShowConfirmModal(true);
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                user.isActive
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                              title={user.isActive ? "Block User" : "Unblock User"}
                            >
                              {user.isActive ? "Block" : "Unblock"}
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => resetPasswordMutation.mutate(user._id)}
                              className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                              title="Reset Password"
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      )}
                      {/* Empty cell for admin users (no actions) */}
                      {user.role === "admin" && (
                        <td className="px-6 py-4 text-sm text-gray-500">
                          -
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(pagination.totalPages, page + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {confirmAction === "changeRole" ? "Change User Role" : "Confirm Action"}
            </h2>

            {confirmAction === "changeRole" ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Change role for <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>:
                </p>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "user" | "hotel_owner")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Regular User</option>
                  <option value="hotel_owner">Hotel Owner</option>
                </select>
                <p className="text-xs text-gray-500 mt-3">
                  Current role: <strong>{selectedUser.role === "hotel_owner" ? "Hotel Owner" : selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</strong>
                </p>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                {confirmAction === "delete"
                  ? `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}? This action cannot be undone.`
                  : `Are you sure you want to ${selectedUser.isActive ? "block" : "unblock"} this user?`}
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={toggleUserMutation.isLoading || deleteUserMutation.isLoading || changeRoleMutation.isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {toggleUserMutation.isLoading || deleteUserMutation.isLoading || changeRoleMutation.isLoading
                  ? "Processing..."
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal - Enhanced */}
      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
};

export default ManageUsers;
