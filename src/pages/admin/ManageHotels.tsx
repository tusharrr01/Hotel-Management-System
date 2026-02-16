import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
// AdminLayout is provided by App routes; avoid double-wrapping
import LoadingSpinner from "../../components/LoadingSpinner";
import { Trash2, MapPin, Star, Search, Eye, X } from "lucide-react";
import useAppContext from "../../hooks/useAppContext";

interface HotelData {
  _id: string;
  name: string;
  city: string;
  country: string;
  pricePerNight: number;
  starRating: number;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalBookings?: number;
  totalRevenue?: number;
  isActive?: boolean;
  isApproved?: boolean;
  lastRejectionReason?: string | null;
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalHotels: number;
}

interface BookingInfo {
  _id: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalCost: number;
  status: string;
}

/**
 * Hotel Details Modal - Shows comprehensive hotel information
 */
const HotelDetailsModal: React.FC<{
  hotel: HotelData;
  onClose: () => void;
}> = ({ hotel, onClose }) => {
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch detailed hotel info including bookings
  React.useEffect(() => {
    setLoadingDetails(true);
    const token = localStorage.getItem('session_id');
    
    fetch(`/api/admin/hotels/${hotel._id}/details`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('Hotel details response:', data);
        if (data.success) {
          console.log('Hotel owner data:', data.data.owner);
          console.log('Current booking data:', data.data.currentBooking);
          setHotelDetails(data.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch hotel details:', err);
      })
      .finally(() => setLoadingDetails(false));
  }, [hotel._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin size={16} /> {hotel.city}, {hotel.country}
            </p>
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
          {loadingDetails ? (
            <p className="text-center text-gray-500 py-8">Loading hotel details...</p>
          ) : hotelDetails ? (
            <>
              {/* Hotel Basic Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Price/Night</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    ${hotel.pricePerNight.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Rating</p>
                  <p className="flex items-center gap-1 mt-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-900">{hotel.starRating}</span>
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Status</p>
                  <p className="text-xl font-bold mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      hotel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {hotel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Approval</p>
                  <p className="text-xl font-bold mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      hotel.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hotel.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Hotel Owner Information */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Hotel Owner Details</h3>
                {hotelDetails.owner ? (
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-blue-200 flex items-center justify-center font-bold text-blue-700 text-xl flex-shrink-0">
                        {(hotelDetails.owner.firstName || 'O')?.charAt(0) || 'O'}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Name</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {hotelDetails.owner.firstName && hotelDetails.owner.lastName
                              ? `${hotelDetails.owner.firstName} ${hotelDetails.owner.lastName}`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Email</p>
                            <p className="text-sm text-gray-700 mt-1">{hotelDetails.owner.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Member Since</p>
                            <p className="text-sm text-gray-700 mt-1">
                              {hotelDetails.owner.joinedDate
                                ? new Date(hotelDetails.owner.joinedDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="bg-white rounded p-3">
                          <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Total Hotels Owned</p>
                          <p className="text-2xl font-bold text-blue-600 mt-1">{hotelDetails.owner.totalHotels ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-500">Loading owner details...</div>
                )}
              </div>

              {/* Booking Statistics */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-900">{hotelDetails.totalBookings || 0}</p>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Total Bookings</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-900">{hotelDetails.confirmedBookings || 0}</p>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Confirmed</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-900">
                      ${(hotelDetails.totalRevenue || 0).toLocaleString('en-US', { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      })}
                    </p>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mt-1">Total Revenue</p>
                  </div>
                </div>
              </div>

              {/* Current Booking Status */}
              {hotelDetails.currentBooking ? (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Currently Booked</h3>
                  <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                          <p className="text-sm font-semibold text-green-700">Hotel is Currently Occupied</p>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Guest Name</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{hotelDetails.currentBooking.guestName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Guest Email</p>
                            <p className="text-sm text-gray-700 mt-1">{hotelDetails.currentBooking.guestEmail}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Check-In</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {new Date(hotelDetails.currentBooking.checkIn).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="bg-white p-2 rounded">
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Check-Out</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">
                                {new Date(hotelDetails.currentBooking.checkOut).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Booking Status</h3>
                  <div className="bg-gray-50 p-5 rounded-lg border-2 border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-700">No Active Bookings</p>
                    <p className="text-xs text-gray-600 mt-2">Hotel is currently available</p>
                  </div>
                </div>
              )}

              {/* Hotel Facilities */}
              {hotelDetails.amenities && Object.keys(hotelDetails.amenities).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(hotelDetails.amenities).map(([key, value]: any) => (
                      <div key={key} className={`p-3 rounded-lg border text-sm ${
                        value ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Bookings */}
              {hotelDetails.recentBookings && hotelDetails.recentBookings.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  <div className="space-y-3">
                    {hotelDetails.recentBookings.slice(0, 5).map((booking: BookingInfo) => (
                      <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{booking.guestName}</p>
                          <p className="text-xs text-gray-600 mb-1">{booking.guestEmail}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            ${booking.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            booking.status === 'confirmed' ? 'text-green-700' : booking.status === 'completed' ? 'text-blue-700' : 'text-orange-700'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel Description */}
              {hotelDetails.description && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {hotelDetails.description}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">Failed to load hotel details</p>
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
 * Admin - Manage Hotels Page
 * 
 * Features:
 * - View all hotels with pagination
 * - Search hotels by name, city, or country
 * - Delete hotels
 * - View hotel details and statistics
 */
const ManageHotels: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { showToast } = useAppContext();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ["hotels", page, limit, search],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/hotels?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch hotels");
      const result = await response.json();
      return result;
    }
  );

  const deleteHotelMutation = useMutation(
    async (hotelId: string) => {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("session_id")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete hotel");
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["hotels"]);
        showToast({
          title: "Hotel deleted",
          description: "Hotel and all associated bookings have been removed",
          type: "SUCCESS",
        });
        setShowConfirmModal(false);
        setSelectedHotel(null);
      },
      onError: () => {
        showToast({
          title: "Error",
          description: "Failed to delete hotel",
          type: "ERROR",
        });
      },
    }
  );

    const approveHotelMutation = useMutation(
      async (hotelId: string) => {
        const response = await fetch(`/api/admin/hotels/${hotelId}/approve`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("session_id")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to approve hotel");
        return response.json();
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["hotels"]);
          showToast({
            title: "Hotel approved",
            description: "Hotel has been approved and is now active",
            type: "SUCCESS",
          });
        },
        onError: () => {
          showToast({
            title: "Error",
            description: "Failed to approve hotel",
            type: "ERROR",
          });
        },
      }
    );

    const rejectHotelMutation = useMutation(
      async ({ hotelId, reason }: { hotelId: string; reason?: string }) => {
        const response = await fetch(`/api/admin/hotels/${hotelId}/reject`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("session_id")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) throw new Error("Failed to reject hotel");
        return response.json();
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["hotels"]);
          showToast({
            title: "Hotel rejected",
            description: "Hotel has been rejected and deactivated",
            type: "SUCCESS",
          });
          setRejectReason("");
          setShowRejectModal(false);
          setSelectedHotel(null);
        },
        onError: () => {
          showToast({
            title: "Error",
            description: "Failed to reject hotel",
            type: "ERROR",
          });
        },
      }
    );

    const setActiveMutation = useMutation(
      async ({ hotelId, isActive }: { hotelId: string; isActive: boolean }) => {
        const response = await fetch(`/api/admin/hotels/${hotelId}/active`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("session_id")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        });

        if (!response.ok) throw new Error("Failed to update hotel active status");
        return response.json();
      },
      {
        onSuccess: (_, vars) => {
          queryClient.invalidateQueries(["hotels"]);
          showToast({
            title: `Hotel ${vars.isActive ? "activated" : "deactivated"}`,
            description: `Hotel has been ${vars.isActive ? "activated" : "deactivated"}`,
            type: "SUCCESS",
          });
        },
        onError: () => {
          showToast({
            title: "Error",
            description: "Failed to update hotel status",
            type: "ERROR",
          });
        },
      }
    );

  const handleDelete = () => {
    if (!selectedHotel) return;
    deleteHotelMutation.mutate(selectedHotel._id);
  };

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const openRejectModal = (hotel: HotelData) => {
    setSelectedHotel(hotel);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedHotel) return;
    rejectHotelMutation.mutate({ hotelId: selectedHotel._id, reason: rejectReason });
  };

  if (isLoading) {
    return (
      <>
        <LoadingSpinner message="Loading hotels..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Failed to load hotels. Please try again later.
        </div>
      </>
    );
  }

  const hotels = data?.data || [];
  const pagination: PaginationData = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalHotels: 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Manage Hotels
          </h1>

          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by hotel name, city, or country..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Total Hotels: <span className="font-bold">{pagination.totalHotels}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Hotel Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price/Night
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rejection
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hotels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hotels found
                    </td>
                  </tr>
                ) : (
                  hotels.map((hotel: HotelData) => (
                    <tr key={hotel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {hotel.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>
                            {hotel.city}, {hotel.country}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                            {hotel.userId.firstName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {hotel.userId.firstName} {hotel.userId.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {hotel.userId.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span>{hotel.starRating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {formatCurrency(hotel.pricePerNight)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {hotel.totalBookings || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {hotel.lastRejectionReason ? (
                          <span title={hotel.lastRejectionReason} className="text-sm text-red-700">
                            {hotel.lastRejectionReason}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setShowDetailsModal(true);
                            }}
                            className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View Details
                          </button>

                          {!hotel.isApproved && (
                            <button
                              onClick={() => approveHotelMutation.mutate(hotel._id)}
                              disabled={approveHotelMutation.isLoading}
                              className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {hotel.isApproved && (
                            <button
                              onClick={() => openRejectModal(hotel)}
                              disabled={rejectHotelMutation.isLoading}
                              className="px-3 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                            >
                              Reject
                            </button>
                          )}

                          {hotel.isActive ? (
                            <button
                              onClick={() => setActiveMutation.mutate({ hotelId: hotel._id, isActive: false })}
                              disabled={setActiveMutation.isLoading}
                              className="px-3 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveMutation.mutate({ hotelId: hotel._id, isActive: true })}
                              disabled={setActiveMutation.isLoading}
                              className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
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
      {showConfirmModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Hotel
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedHotel.name}</strong>?
              This action will also remove all associated bookings and cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteHotelMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteHotelMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reject Hotel</h2>
            <p className="text-gray-600 mb-4">
              Provide an optional reason for rejecting <strong>{selectedHotel.name}</strong>.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-28"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectHotelMutation.isLoading}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50"
              >
                {rejectHotelMutation.isLoading ? "Rejecting..." : "Reject Hotel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Details Modal */}
      {showDetailsModal && selectedHotel && (
        <HotelDetailsModal
          hotel={selectedHotel}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
};

export default ManageHotels;
