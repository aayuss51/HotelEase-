import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getRoom, createBooking, getFacilities } from '../../services/mockDb';
import { RoomType, Facility, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Calendar, Users, ArrowLeft, CheckCircle, Loader2, FileText, Printer, Clock, Share2, Copy, Check } from 'lucide-react';

export const BookingSummary: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const [room, setRoom] = useState<RoomType | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (roomId) {
        const [r, f] = await Promise.all([getRoom(roomId), getFacilities()]);
        if (r) setRoom(r);
        setFacilities(f);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [roomId]);

  const handleShare = async () => {
    if (!confirmedBooking || !room) return;

    const shareData = {
      title: 'Booking Confirmation - HotelEase',
      text: `My stay at HotelEase is confirmed!\n\nBooking Reference: #${confirmedBooking.id}\nRoom: ${room.name}\nDates: ${confirmedBooking.checkIn} to ${confirmedBooking.checkOut}\nTotal: NPR ${confirmedBooking.totalPrice.toLocaleString()}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareData.text);
        alert('Booking details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleCopyId = async () => {
    if (confirmedBooking) {
      try {
        await navigator.clipboard.writeText(confirmedBooking.id);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  // --- Success View ---
  if (confirmedBooking && room) {
    // Recalculate for display on receipt
    const startDate = new Date(confirmedBooking.checkIn);
    const endDate = new Date(confirmedBooking.checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const isPending = confirmedBooking.status === 'PENDING';
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in print:bg-white print:p-0">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-gray-100 relative overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
           {/* Decorative Background Element */}
           <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r print:hidden ${isPending ? 'from-amber-400 to-amber-600' : 'from-green-400 to-green-600'}`}></div>

           <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border print:hidden ${isPending ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
             {isPending ? <Clock className="text-amber-500" size={40} /> : <CheckCircle className="text-green-500" size={40} />}
           </div>
           
           <h1 className="text-3xl font-bold text-gray-900 mb-2">
             Booking Successful!
           </h1>
           <p className="text-gray-500 mb-8 print:hidden">
             {isPending 
               ? 'Your reservation request has been successfully submitted.' 
               : 'Thank you for choosing Mero-Booking. Your reservation is secured.'}
           </p>

           {/* Highlighted Confirmation Number */}
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8 text-center shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Confirmation Number</p>
             <div className="flex items-center justify-center gap-3 relative z-10">
               <p className="text-4xl font-mono font-bold text-blue-900 tracking-widest select-all">#{confirmedBooking.id}</p>
               <button 
                 onClick={handleCopyId} 
                 className="p-2 bg-white/50 hover:bg-white text-blue-500 hover:text-green-600 rounded-lg transition-all shadow-sm border border-transparent hover:border-blue-100"
                 title="Copy Confirmation Number"
               >
                 {isCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
               </button>
             </div>
             <div className="absolute -right-4 -bottom-4 text-blue-100 opacity-20 pointer-events-none">
               <FileText size={80} />
             </div>
           </div>
           
           <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-200 shadow-inner print:bg-white print:border-2 print:border-black">
             <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
               <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border print:bg-transparent print:text-black print:border-black ${
                    isPending ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    Status: {confirmedBooking.status}
                  </span>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date</p>
                  <p className="text-xs font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="col-span-2">
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Accommodation</p>
                   <p className="font-bold text-gray-900 text-lg">{room.name}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Check In</p>
                   <p className="font-medium text-gray-900">{confirmedBooking.checkIn}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Check Out</p>
                   <p className="font-medium text-gray-900">{confirmedBooking.checkOut}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Guest</p>
                   <p className="font-medium text-gray-900">{confirmedBooking.guestName}</p>
                </div>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Duration</p>
                   <p className="font-medium text-gray-900">{nights} Nights</p>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-200 border-dashed">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-xl text-blue-600 print:text-black">NPR {confirmedBooking.totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Includes all taxes and fees.</p>
             </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-3 print:hidden">
             <Button onClick={handleShare} variant="outline" className="flex-1 py-3 rounded-xl gap-2 border-gray-300 hover:bg-gray-50">
               <Share2 size={18} /> Share
             </Button>
             <Button onClick={() => window.print()} variant="outline" className="flex-1 py-3 rounded-xl gap-2 border-gray-300 hover:bg-gray-50">
               <Printer size={18} /> Print
             </Button>
             <Button onClick={() => navigate('/my-bookings')} className="flex-1 py-3 rounded-xl gap-2 shadow-lg shadow-blue-600/20">
               <FileText size={18} /> My Bookings
             </Button>
           </div>
           
           <div className="hidden print:block text-center text-xs mt-8 text-gray-500">
              <p>Mero-Booking Management System • Kathmandu, Nepal</p>
              <p>www.merobooking.com • contact@merobooking.com</p>
           </div>
        </div>
      </div>
    );
  }

  // --- Summary View ---
  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-800">Invalid Booking Details</h2>
        <Button className="mt-4" onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const baseCost = nights * room.pricePerNight;
  const taxes = baseCost * 0.13;
  const totalCost = Math.floor(baseCost + taxes);

  const handleConfirm = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newBooking = await createBooking({
        roomId: room.id,
        userId: user.id,
        guestName: user.name,
        checkIn,
        checkOut,
        totalPrice: totalCost
      });
      setConfirmedBooking(newBooking);
    } catch (error) {
      alert('Booking failed. The room may no longer be available for these dates.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Side - Image */}
        <div className="w-full md:w-2/5 relative h-64 md:h-auto group">
          <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
            <div className="text-white">
              <h2 className="text-3xl font-bold font-serif leading-tight">{room.name}</h2>
              <p className="opacity-90 mt-2 text-sm font-light leading-relaxed text-gray-200">{room.description.substring(0, 100)}...</p>
            </div>
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="flex-1 p-8 md:p-10 flex flex-col">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-6 text-sm font-medium w-fit">
            <ArrowLeft size={16} /> Back to details
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm Reservation</h1>

          <div className="space-y-6 flex-1">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
               <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-200">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                     <Calendar size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Dates</p>
                     <p className="font-medium text-gray-900">{checkIn} — {checkOut}</p>
                   </div>
                 </div>
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{nights} Nights</span>
               </div>
               
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                     <Users size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Guests</p>
                     <p className="font-medium text-gray-900">{room.capacity} Person Capacity</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-3 px-2">
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Price per night</span>
                 <span>NPR {room.pricePerNight.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Subtotal ({nights} nights)</span>
                 <span>NPR {baseCost.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm text-gray-600">
                 <span>Taxes & Fees (13%)</span>
                 <span>NPR {Math.floor(taxes).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                 <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                 <span className="font-bold text-3xl text-blue-600">NPR {totalCost.toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button 
              onClick={handleConfirm} 
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all transform active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Processing...</span>
              ) : (
                <span className="flex items-center gap-2">Confirm & Pay <CheckCircle size={20} /></span>
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-wide">
              Secure Booking • Instant Confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};