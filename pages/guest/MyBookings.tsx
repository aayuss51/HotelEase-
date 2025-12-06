import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, getRooms, updateBookingStatus } from '../../services/mockDb';
import { Booking, RoomType } from '../../types';
import { Calendar, BedDouble, CheckCircle, Clock, XCircle, RefreshCw, CheckCheck, History, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ImageWithSkeleton } from '../../components/ImageWithSkeleton';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'CONFIRMED': 
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    case 'PENDING': 
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    case 'CANCELLED': 
    case 'REJECTED': 
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
    case 'COMPLETED': 
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
    default: 
      return 'bg-gray-50 text-gray-700 border-gray-200 ring-1 ring-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'CONFIRMED': return <CheckCircle size={14} className="stroke-[2.5]" />;
    case 'PENDING': return <Clock size={14} className="stroke-[2.5]" />;
    case 'CANCELLED': 
    case 'REJECTED': return <XCircle size={14} className="stroke-[2.5]" />;
    case 'COMPLETED': return <CheckCheck size={14} className="stroke-[2.5]" />;
    default: return <Clock size={14} className="stroke-[2.5]" />;
  }
};

interface BookingCardProps {
  booking: Booking;
  rooms: RoomType[];
  onCancel: (id: string) => void;
  isHistory?: boolean;
  isCancelling?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, rooms, onCancel, isHistory = false, isCancelling = false }) => {
  const room = rooms.find(r => r.id === booking.roomId);
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(booking.status);

  return (
    <div className={`rounded-2xl p-6 border transition-all flex flex-col md:flex-row gap-6 ${isHistory ? 'bg-white/60 border-gray-200 opacity-90' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'}`}>
      {/* Room Image */}
      <div className={`w-full md:w-56 h-40 rounded-xl overflow-hidden bg-gray-200 shrink-0 relative group ${isHistory ? 'grayscale opacity-75' : ''}`}>
        {room ? (
          <ImageWithSkeleton src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BedDouble size={24} />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-sm tracking-wider">
          ID: {booking.id}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className={`text-xl font-bold ${isHistory ? 'text-gray-600' : 'text-gray-900'}`}>{room?.name || `Room #${booking.roomId}`}</h3>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
            </span>
          </div>
          
          {!isHistory && booking.status === 'PENDING' && (
            <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
              <Clock size={16} className="mt-0.5 shrink-0"/>
              <p>Your reservation is awaiting confirmation from the hotel staff. You will be notified once processed.</p>
            </div>
          )}
          {!isHistory && booking.status === 'REJECTED' && (
             <div className="flex items-start gap-2 text-sm text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-200 mb-4">
               <XCircle size={16} className="mt-0.5 shrink-0"/>
               <p>Unfortunately, this reservation was not approved. Please contact support or try different dates.</p>
             </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Check In</p>
            <p className={`font-semibold mt-1 ${isHistory ? 'text-gray-500' : 'text-gray-900'}`}>{booking.checkIn}</p>
          </div>
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Check Out</p>
            <p className={`font-semibold mt-1 ${isHistory ? 'text-gray-500' : 'text-gray-900'}`}>{booking.checkOut}</p>
          </div>
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Price</p>
            <p className={`font-bold mt-1 ${isHistory ? 'text-gray-500' : 'text-blue-600'}`}>NPR {booking.totalPrice.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Guest</p>
            <p className={`font-semibold mt-1 truncate ${isHistory ? 'text-gray-500' : 'text-gray-900'}`} title={booking.guestName}>{booking.guestName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {isCancellable && !isHistory && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onCancel(booking.id)}
                  disabled={isCancelling}
                  className="rounded-lg shadow-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                  {isCancelling ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} className="mr-2" /> Cancel Booking
                    </>
                  )}
              </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchData = useCallback(async (showGlobalLoading = true) => {
    if (user) {
      if (showGlobalLoading) setIsLoading(true);
      const [userBookings, allRooms] = await Promise.all([
        getUserBookings(user.id),
        getRooms()
      ]);
      // Sort by created date descending
      setBookings(userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setRooms(allRooms);
      if (showGlobalLoading) setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation? This action cannot be undone.")) {
      setCancellingId(bookingId);
      await updateBookingStatus(bookingId, 'CANCELLED');
      // Refresh data in background without triggering full page loader
      await fetchData(false);
      setCancellingId(null);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 animate-pulse">Updating your reservations...</p>
      </div>
    );
  }

  // Filter Bookings
  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));
  const historyBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(b.status));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in min-h-[80vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-500 mt-2">Manage your upcoming and past stays.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRefresh} className="gap-2 bg-white border border-gray-200 shadow-sm hover:bg-gray-50">
                <RefreshCw size={16} /> Refresh
            </Button>
            <Link to="/">
                <Button className="shadow-lg shadow-blue-600/20">Book Another Room</Button>
            </Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/50 max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't made any reservations with us yet. Explore our luxury residences and book your stay today.</p>
          <Link to="/">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              Browse Rooms
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Section 1: Active Bookings */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                 <Calendar size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Current & Upcoming</h2>
              {activeBookings.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {activeBookings.length}
                </span>
              )}
            </div>
            
            {activeBookings.length > 0 ? (
              <div className="grid gap-6">
                {activeBookings.map(b => (
                  <BookingCard 
                    key={b.id} 
                    booking={b} 
                    rooms={rooms} 
                    onCancel={handleCancel}
                    isHistory={false}
                    isCancelling={cancellingId === b.id}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-400">
                <p>No active reservations at the moment.</p>
              </div>
            )}
          </section>

          {/* Section 2: Booking History (Distinct Section) */}
          {historyBookings.length > 0 && (
            <section className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gray-100 rounded-[32px] p-8 border border-gray-200 shadow-inner">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-gray-200 text-gray-600 rounded-lg">
                    <History size={20} />
                  </div>
                  <div className="flex flex-col">
                      <h2 className="text-xl font-bold text-gray-700">Booking History</h2>
                      <p className="text-sm text-gray-500">Archive of completed stays and cancellations.</p>
                  </div>
                  <span className="bg-gray-300 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full ml-auto">
                    {historyBookings.length}
                  </span>
                </div>
                
                <div className="grid gap-6">
                  {historyBookings.map(b => (
                    <BookingCard 
                      key={b.id} 
                      booking={b} 
                      rooms={rooms} 
                      onCancel={handleCancel}
                      isHistory={true} 
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};