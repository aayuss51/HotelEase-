import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus } from '../../services/mockDb';
import { Booking } from '../../types';
import { Check, X, Loader2, Filter } from 'lucide-react';

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
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>
          <p className="text-gray-500 text-sm mt-1">Overview of all guest reservations</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 p-1 bg-gray-100/50 rounded-2xl">
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map(f => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  relative rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ease-out border flex items-center justify-center
                  ${isActive 
                    ? 'px-6 py-3 bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105 ring-4 ring-blue-50 z-10' 
                    : 'px-5 py-2.5 bg-white border-transparent text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-md hover:scale-105 shadow-sm border-gray-200'
                  }
                `}
              >
                {f === 'ALL' ? 'All Bookings' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">#{booking.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{booking.guestName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Room {booking.roomId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                       <span className="font-medium">{booking.checkIn}</span>
                       <span className="text-xs text-gray-400">to {booking.checkOut}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm
                      ${booking.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-200' : 
                        booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-red-50 text-red-700 border-red-200'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')} 
                          className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors" 
                          title="Approve"
                        >
                          <Check size={16} /> <span className="text-xs">Approve</span>
                        </button>
                        <button 
                          onClick={() => handleStatusChange(booking.id, 'REJECTED')} 
                          className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors" 
                          title="Reject"
                        >
                          <X size={16} /> <span className="text-xs">Reject</span>
                        </button>
                      </div>
                    )}
                    {booking.status === 'CONFIRMED' && (
                       <button onClick={() => handleStatusChange(booking.id, 'COMPLETED')} className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline">Mark Completed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Filter className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-900 font-medium">No bookings found</p>
            <p className="text-gray-500 text-sm">Try changing the filter status.</p>
          </div>
        )}
      </div>
    </div>
  );
};