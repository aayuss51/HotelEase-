import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../../services/mockDb';
import { Booking } from '../../types';
import { Check, X } from 'lucide-react';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setBookings(await getBookings());
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status);
    loadData();
  };

  const filteredBookings = bookings.filter(b => filter === 'ALL' || b.status === filter);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-500">#{booking.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{booking.guestName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">Room {booking.roomId}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-col">
                     <span>In: {booking.checkIn}</span>
                     <span>Out: {booking.checkOut}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusChange(booking.id, 'CONFIRMED')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Approve">
                        <Check size={18} />
                      </button>
                      <button onClick={() => handleStatusChange(booking.id, 'REJECTED')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                  {booking.status === 'CONFIRMED' && (
                     <button onClick={() => handleStatusChange(booking.id, 'COMPLETED')} className="text-blue-600 hover:underline text-xs">Complete Stay</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="p-10 text-center text-gray-500">No bookings found.</div>
        )}
      </div>
    </div>
  );
};