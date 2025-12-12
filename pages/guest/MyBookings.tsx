import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, getRooms, updateBookingStatus, updateBookingDetails } from '../../services/mockDb';
import { Booking, RoomType } from '../../types';
import { Calendar, BedDouble, CheckCircle, Clock, XCircle, RefreshCw, CheckCheck, History, AlertTriangle, Loader2, Pencil, LogOut, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ImageWithSkeleton } from '../../components/ImageWithSkeleton';
import { ReviewModal } from '../../components/ReviewModal';
import { saveReview, getReviews } from '../../services/mockDb';
import { Review } from '../../types';
import { EditBookingModal } from '../../components/EditBookingModal';
import { ConfirmationModal } from '../../components/ConfirmationModal';

// Helper to ensure check-out is after check-in
const getNextDay = (dateStr: string) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'CONFIRMED': 
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-1 ring-emerald-600/20';
    case 'PENDING': 
      return 'bg-amber-100 text-amber-800 border-amber-200 ring-1 ring-amber-600/20';
    case 'CANCELLED': 
    case 'REJECTED': 
      return 'bg-red-100 text-red-800 border-red-200 ring-1 ring-red-600/20';
    case 'COMPLETED': 
      return 'bg-blue-100 text-blue-800 border-blue-200 ring-1 ring-blue-600/20';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200 ring-1 ring-gray-500/20';
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
  onEdit: (booking: Booking) => void;
  onReview: (booking: Booking) => void;
  onCheckout: (id: string) => void;
  onCheckOutChange: (id: string, newDate: string) => void;
  isHistory?: boolean;
  canReview?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  rooms, 
  onCancel, 
  onEdit, 
  onReview, 
  onCheckout,
  onCheckOutChange,
  isHistory = false, 
  canReview = false
}) => {
  const room = rooms.find(r => r.id === booking.roomId);
  const isCancellable = ['PENDING', 'CONFIRMED'].includes(booking.status);
  
  // Cutoff Logic: 24h before Check-in
  const canEdit = React.useMemo(() => {
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) return false;
    
    // Parse Date strictly
    const checkInDate = new Date(booking.checkIn); 
    const now = new Date();
    
    const timeDiff = checkInDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    // Allow edit only if more than 24 hours remaining
    return hoursDiff >= 24; 
  }, [booking.checkIn, booking.status]);

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
            <div className="flex flex-col items-end gap-1">
               <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(booking.status)}`}>
                 {getStatusIcon(booking.status)}
                 {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
               </span>
               {booking.paymentStatus === 'PAID' && (
                 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PAID</span>
               )}
            </div>
          </div>
          
          {!isHistory && booking.status === 'PENDING' && (
            <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
              <Clock size={16} className="mt-0.5 shrink-0"/>
              <p>Your reservation is awaiting confirmation from the hotel staff. You will be notified once processed.</p>
            </div>
          )}
          {!isHistory && booking.status === 'REJECTED' && (
             <div className="flex items-start gap-2 text-sm text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
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
          
          {/* Editable Check Out */}
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100 relative group'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1">
              Check Out
              {canEdit && <Pencil size={10} className="text-emerald-500 opacity-50" />}
            </p>
            {canEdit ? (
              <input 
                type="date"
                className="mt-1 w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-1 shadow-sm transition-all cursor-pointer hover:border-emerald-300"
                value={booking.checkOut}
                min={getNextDay(booking.checkIn)}
                onChange={(e) => {
                   if (e.target.value) onCheckOutChange(booking.id, e.target.value);
                }}
                title="Change check-out date"
              />
            ) : (
              <p className={`font-semibold mt-1 ${isHistory ? 'text-gray-500' : 'text-gray-900'}`}>{booking.checkOut}</p>
            )}
          </div>

          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Price</p>
            <p className={`font-bold mt-1 ${isHistory ? 'text-gray-500' : 'text-emerald-600'}`}>NPR {booking.totalPrice.toLocaleString()}</p>
          </div>
          <div className={`p-3 rounded-xl border ${isHistory ? 'bg-transparent border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Guest</p>
            <p className={`font-semibold mt-1 truncate ${isHistory ? 'text-gray-500' : 'text-gray-900'}`} title={booking.guestName}>{booking.guestName}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 flex-wrap">
             {canEdit && (
               <Button
                 variant="secondary"
                 size="sm"
                 onClick={() => onEdit(booking)}
                 className="rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200"
                 title="Edit full booking details (Available up to 24h before check-in)"
               >
                 <Pencil size={14} className="mr-2" /> Full Edit
               </Button>
             )}

             {/* Checkout Button for Confirmed Bookings */}
             {!isHistory && booking.status === 'CONFIRMED' && (
               <Button
                 size="sm"
                 onClick={() => onCheckout(booking.id)}
                 className="rounded-lg shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
               >
                 <LogOut size={16} className="mr-2" /> Check Out
               </Button>
             )}

             {canReview && (
               <Button 
                  size="sm"
                  onClick={() => onReview(booking)}
                  className="rounded-lg shadow-sm bg-amber-500 hover:bg-amber-600 border-none text-white"
               >
                  <span className="flex items-center gap-2">Write Review</span>
               </Button>
             )}
        
            {isCancellable && !isHistory && (
                 <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => onCancel(booking.id)}
                    className="rounded-lg shadow-sm border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all duration-300"
                 >
                    <AlertTriangle size={16} className="mr-2" /> Cancel Booking
                 </Button>
            )}
        </div>
      </div>
    </div>
  );
};

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  // Checkout Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [bookingToCheckout, setBookingToCheckout] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [userReviewForBooking, setUserReviewForBooking] = useState<Review | undefined>(undefined);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<{booking: Booking, room: RoomType} | null>(null);

  // Quick Date Change State
  const [dateUpdateData, setDateUpdateData] = useState<{id: string, newDate: string, oldPrice: number, newPrice: number} | null>(null);
  const [isDateUpdateModalOpen, setIsDateUpdateModalOpen] = useState(false);
  const [isProcessingDateUpdate, setIsProcessingDateUpdate] = useState(false);

  const fetchData = async (showGlobalLoading = true) => {
    if (user) {
      if (showGlobalLoading) setIsLoading(true);
      const [userBookings, allRooms, allReviews] = await Promise.all([
        getUserBookings(user.id),
        getRooms(),
        getReviews()
      ]);
      // Sort by created date descending
      setBookings(userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setRooms(allRooms);
      setReviews(allReviews);
      if (showGlobalLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, [user]);

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (bookingToCancel) {
      setIsProcessingCancel(true);
      await updateBookingStatus(bookingToCancel, 'CANCELLED');
      await fetchData(false);
      setIsProcessingCancel(false);
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCheckoutClick = (bookingId: string) => {
    setBookingToCheckout(bookingId);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (bookingToCheckout) {
      setIsProcessingCheckout(true);
      
      // Capture the booking object before it's moved to history/updated
      const booking = bookings.find(b => b.id === bookingToCheckout);
      
      await updateBookingStatus(bookingToCheckout, 'COMPLETED');
      await fetchData(false);
      
      setIsProcessingCheckout(false);
      setIsCheckoutModalOpen(false);
      setBookingToCheckout(null);

      // Automatically navigate to Review Page (Modal) after successful checkout
      if (booking) {
         setSelectedBookingForReview({ ...booking, status: 'COMPLETED' });
         setUserReviewForBooking(undefined);
         setIsReviewModalOpen(true);
      }
    }
  };

  const handleEditClick = (booking: Booking) => {
    const room = rooms.find(r => r.id === booking.roomId);
    if (room) {
      setSelectedBookingForEdit({ booking, room });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSave = async (checkIn: string, checkOut: string) => {
    if (selectedBookingForEdit) {
      await updateBookingDetails(selectedBookingForEdit.booking.id, { checkIn, checkOut });
      await fetchData(false);
    }
  };

  // --- New Logic for Inline Check-out Date Change ---
  const handleCheckOutChange = (id: string, newDate: string) => {
    const booking = bookings.find(b => b.id === id);
    const room = rooms.find(r => r.id === booking?.roomId);
    if (!booking || !room) return;

    const start = new Date(booking.checkIn);
    const end = new Date(newDate);
    
    // Safety: Date input min attribute handles UI, but double check logic
    if (end <= start) return;

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const base = nights * room.pricePerNight;
    const tax = base * 0.13;
    const newPrice = Math.floor(base + tax);

    setDateUpdateData({
      id,
      newDate,
      oldPrice: booking.totalPrice,
      newPrice
    });
    setIsDateUpdateModalOpen(true);
  };

  const confirmDateUpdate = async () => {
    if (!dateUpdateData) return;
    setIsProcessingDateUpdate(true);
    
    // Retrieve current checkIn from booking list to be safe
    const booking = bookings.find(b => b.id === dateUpdateData.id);
    if (booking) {
        await updateBookingDetails(dateUpdateData.id, { checkIn: booking.checkIn, checkOut: dateUpdateData.newDate });
        await fetchData(false);
    }
    
    setIsProcessingDateUpdate(false);
    setIsDateUpdateModalOpen(false);
    setDateUpdateData(null);
  };
  // --------------------------------------------------

  const handleReviewClick = (booking: Booking) => {
    const existing = reviews.find(r => r.bookingId === booking.id);
    setSelectedBookingForReview(booking);
    setUserReviewForBooking(existing);
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (rating: number, comment: string) => {
    if (!user || !selectedBookingForReview) return;
    
    await saveReview({
      id: userReviewForBooking?.id || '', // Empty ID tells service to create new
      bookingId: selectedBookingForReview.id,
      roomId: selectedBookingForReview.roomId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    });
    
    // Refresh data
    const updatedReviews = await getReviews();
    setReviews(updatedReviews);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  const checkReviewEligibility = (booking: Booking) => {
    if (booking.status !== 'COMPLETED') return false;
    // Check if within 7 days of checkout
    const checkoutDate = new Date(booking.checkOut);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - checkoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
                <Button className="shadow-lg shadow-emerald-600/20">Book Another Room</Button>
            </Link>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/50 max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't made any reservations with us yet. Explore our luxury residences and book your stay today.</p>
          <Link to="/">
            <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
              Browse Rooms
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Section 1: Active Bookings */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                 <Calendar size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Current & Upcoming</h2>
              {activeBookings.length > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
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
                    onCancel={handleCancelClick}
                    onEdit={handleEditClick}
                    onReview={() => {}} // Can't review active bookings
                    onCheckout={handleCheckoutClick}
                    onCheckOutChange={handleCheckOutChange}
                    isHistory={false}
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
                      onCancel={handleCancelClick}
                      onEdit={() => {}} // Can't edit history
                      onReview={handleReviewClick}
                      onCheckout={() => {}} // Can't checkout history
                      onCheckOutChange={() => {}} // Can't change history check-out
                      canReview={checkReviewEligibility(b)}
                      isHistory={true} 
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={selectedBookingForReview}
          existingReview={userReviewForBooking}
          onSave={handleSaveReview}
        />
      )}

      {/* Edit Booking Modal */}
      {selectedBookingForEdit && (
        <EditBookingModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          booking={selectedBookingForEdit.booking}
          room={selectedBookingForEdit.room}
          onSave={handleEditSave}
        />
      )}

      {/* Confirmation Modal for Cancellation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel Booking"
        isProcessing={isProcessingCancel}
      />

      {/* Confirmation Modal for Checkout */}
      <ConfirmationModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleConfirmCheckout}
        title="Confirm Check Out"
        message="Are you sure you want to checkout?"
        confirmLabel="Yes, Check Out"
        isProcessing={isProcessingCheckout}
      />

      {/* Confirmation Modal for Check-out Date Change */}
      <ConfirmationModal
        isOpen={isDateUpdateModalOpen}
        onClose={() => { setIsDateUpdateModalOpen(false); setDateUpdateData(null); }}
        onConfirm={confirmDateUpdate}
        title="Update Check-Out Date?"
        message={dateUpdateData ? `Do you want to change your check-out date to ${dateUpdateData.newDate}? The total price will update from NPR ${dateUpdateData.oldPrice.toLocaleString()} to NPR ${dateUpdateData.newPrice.toLocaleString()}.` : ''}
        confirmLabel="Yes, Update Booking"
        isProcessing={isProcessingDateUpdate}
      />
    </div>
  );
};
