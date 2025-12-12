import React, { useState, useEffect } from 'react';
import { getRooms, getFacilities, checkAvailability, getReviews } from '../../services/mockDb';
import { RoomType, Facility, Review } from '../../types';
import { Button } from '../../components/Button';
import { ImageWithSkeleton } from '../../components/ImageWithSkeleton';
import { RoomDetailsModal } from '../../components/RoomDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Wifi, Car, Calendar, Star, Coffee, Waves, Loader2, AlertCircle, Info } from 'lucide-react';

// Curated High-End Luxury Images
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3540&auto=format&fit=crop', // Iconic Luxury Pool
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=3540&auto=format&fit=crop', // Dramatic Night Exterior
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=3540&auto=format&fit=crop', // Modern Dark Luxury Interior
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=3450&auto=format&fit=crop', // Grand Resort Exterior
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=3480&auto=format&fit=crop', // Bright Luxury Interior
];

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });
  const [dateError, setDateError] = useState<string>('');
  
  const [availableRoomIds, setAvailableRoomIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Modal State
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<RoomType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [r, f, rv] = await Promise.all([getRooms(), getFacilities(), getReviews()]);
      setRooms(r);
      setFacilities(f);
      setReviews(rv);
    };
    init();

    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 8000); // Cycle every 8 seconds

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getNextDay = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const validateDates = () => {
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    
    if (end <= start) {
      setDateError('Check-out date must be after check-in date.');
      return false;
    }
    setDateError('');
    return true;
  };

  const handleSearch = async () => {
    if (!validateDates()) return;

    setIsSearching(true);
    const unavailable = await checkAvailability(dates.checkIn, dates.checkOut);
    const allIds = (await getRooms()).map(r => r.id);
    const available = allIds.filter(id => !unavailable.includes(id));
    setAvailableRoomIds(available);
    setIsSearching(false);
  };

  const handleBook = (room: RoomType) => {
    if (!validateDates()) return;

    navigate(`/book?roomId=${room.id}&checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`);
  };

  const handleViewDetails = (room: RoomType) => {
    setSelectedRoomDetails(room);
    setIsDetailsModalOpen(true);
  };

  const getRoomRating = (roomId: string) => {
    const roomReviews = reviews.filter(r => r.roomId === roomId);
    if (roomReviews.length === 0) return { avg: 5.0, count: 0 };
    
    const sum = roomReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = sum / roomReviews.length;
    return { avg: parseFloat(avg.toFixed(1)), count: roomReviews.length };
  };

  const displayedRooms = availableRoomIds 
    ? rooms.filter(r => availableRoomIds.includes(r.id))
    : rooms;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Hero Section Container */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        
        {/* Fixed Parallax Background Layer */}
        <div className="fixed top-0 left-0 w-full h-[85vh] z-0 pointer-events-none">
          {HERO_IMAGES.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
               {/* Ken Burns Effect: Smoother slow zoom animation, reduced to 5% scale */}
               <ImageWithSkeleton 
                 src={img} 
                 className={`w-full h-full object-cover transform transition-transform duration-[10000ms] ease-out will-change-transform ${
                   index === currentHeroIndex ? 'scale-105' : 'scale-100'
                 }`} 
                 alt={`Luxury Hotel View ${index + 1}`} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-slate-900/40"></div>
            </div>
          ))}
        </div>

        {/* Hero Content Layer (Parallax Text) */}
        <div 
           className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 pt-20"
           style={{ 
             transform: `translateY(${scrollY * 0.4}px)`, 
             opacity: Math.max(0, 1 - scrollY / 600) 
           }}
        >
          <div className="animate-fade-in-up">
            <h5 className="text-emerald-200 font-semibold tracking-[0.3em] uppercase mb-6 text-sm md:text-base border-b border-emerald-200/30 inline-block pb-2">Welcome to Mero-Booking</h5>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight font-serif leading-tight drop-shadow-2xl text-white">
              Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-white to-emerald-100">Luxury Living</span>
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg">
              Escape to a world of unparalleled comfort and elegance. Your sanctuary of sophistication awaits.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col lg:flex-row gap-6 items-end text-left mt-8 ring-1 ring-white/20 hover:bg-slate-900/70 transition-colors">
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 drop-shadow-md">Check In</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-600 transition-colors z-10" size={20} />
                 <input 
                   type="date" 
                   style={{ colorScheme: 'light' }}
                   className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all shadow-lg"
                   value={dates.checkIn}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={e => {
                     setDates(prev => ({...prev, checkIn: e.target.value}));
                     setDateError('');
                   }}
                 />
               </div>
             </div>
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 drop-shadow-md">Check Out</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-600 transition-colors z-10" size={20} />
                 <input 
                   type="date" 
                   style={{ colorScheme: 'light' }}
                   className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all shadow-lg"
                   value={dates.checkOut}
                   min={getNextDay(dates.checkIn)}
                   onChange={e => {
                     setDates(prev => ({...prev, checkOut: e.target.value}));
                     setDateError('');
                   }}
                 />
               </div>
             </div>
             <button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="w-full lg:w-auto h-[50px] px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-600/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isSearching && <Loader2 className="animate-spin" size={20} />}
               {isSearching ? 'Checking...' : 'Check Availability'}
             </button>

             {dateError && (
               <div className="absolute -bottom-12 left-0 w-full flex items-center justify-center">
                 <div className="bg-red-500/90 text-white text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce">
                   <AlertCircle size={16} />
                   {dateError}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentHeroIndex ? 'bg-white w-12 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/30 w-3 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Page Content */}
      <div className="relative z-20 bg-gray-50 shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.3)] border-t border-white/50">
        
        {/* Facilities Strip */}
        <div className="bg-white/80 backdrop-blur-sm py-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
             {facilities.slice(0, 6).map(f => {
               let Icon = Star;
               if (f.name.includes('Wifi')) Icon = Wifi;
               if (f.name.includes('Car')) Icon = Car;
               if (f.name.includes('Coffee') || f.name.includes('Breakfast')) Icon = Coffee;
               if (f.name.includes('Pool')) Icon = Waves;
               
               return (
                 <div key={f.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                   <div className="relative w-20 h-20 rounded-[24px] flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] bg-gradient-to-br from-white to-gray-50 shadow-xl shadow-gray-200/50 border border-white">
                      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-emerald-50/0 to-emerald-50/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Icon size={32} className="relative z-10 text-gray-400 group-hover:text-emerald-600 transition-colors duration-300" strokeWidth={1.5} />
                   </div>
                   <span className="text-sm font-semibold tracking-wide text-gray-500 group-hover:text-gray-900 transition-colors">{f.name}</span>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Room Listing */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
              {availableRoomIds ? 'Available Residences' : 'Accommodations'}
             </h2>
             <div className="w-24 h-1 bg-emerald-600 mx-auto rounded-full opacity-80"></div>
          </div>
          
          {displayedRooms.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-light text-gray-600">No residences available for these dates.</h3>
              <p className="text-gray-400 mt-2">We apologize for the inconvenience. Please select alternative dates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {displayedRooms.map(room => {
                const { avg, count } = getRoomRating(room.id);
                return (
                  <div key={room.id} className="group bg-white rounded-[32px] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full hover:-translate-y-1">
                    <div className="h-80 relative overflow-hidden">
                      <ImageWithSkeleton 
                        src={room.imageUrl} 
                        alt={room.name} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-white/50 px-5 py-2.5 rounded-2xl text-emerald-900 font-bold shadow-lg text-sm">
                        NPR {room.pricePerNight.toLocaleString()} <span className="text-gray-500 font-normal">/ night</span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                           <h3 className="text-2xl font-bold font-serif text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{room.name}</h3>
                           <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                             <span className="flex items-center gap-1.5"><Users size={16} className="text-emerald-500"/> {room.capacity} Guests</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <div className="flex items-center gap-1.5" title={`${count} reviews`}>
                               <Star size={16} className={`fill-current ${count > 0 ? 'text-yellow-400' : 'text-gray-300'}`}/> 
                               <span className={count > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                                 {count > 0 ? `${avg.toFixed(1)} Rating` : 'No ratings yet'}
                               </span>
                             </div>
                           </div>
                         </div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed mb-6 flex-1 border-t border-dashed border-gray-100 pt-4 mt-2">
                        {room.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                         {room.facilityIds.slice(0, 4).map(fid => {
                            const f = facilities.find(fac => fac.id === fid);
                            return f ? (
                              <span key={fid} className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600 font-medium">
                                {f.name}
                              </span>
                            ) : null;
                         })}
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        <Button 
                          onClick={() => handleViewDetails(room)} 
                          variant="secondary"
                          className="w-full py-4 text-sm tracking-wide font-semibold bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors rounded-xl flex items-center justify-center gap-2"
                        >
                          <Info size={16} /> About this Room
                        </Button>
                        <Button 
                          onClick={() => handleBook(room)} 
                          className="w-full py-4 text-sm tracking-wide uppercase font-semibold bg-gray-900 hover:bg-emerald-700 transition-colors rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                          Reserve Now
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoomDetails && (
        <RoomDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          room={selectedRoomDetails}
          facilities={facilities}
          onBook={(r) => {
             setIsDetailsModalOpen(false);
             handleBook(r);
          }}
        />
      )}
    </div>
  );
};
