import React, { useState, useEffect } from 'react';
import { getRooms, getFacilities, createBooking, checkAvailability } from '../../services/mockDb';
import { RoomType, Facility } from '../../types';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Wifi, Car, Calendar, Star, Coffee, Waves } from 'lucide-react';

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
  
  const [dates, setDates] = useState({
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });
  
  const [availableRoomIds, setAvailableRoomIds] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      setRooms(await getRooms());
      setFacilities(await getFacilities());
    };
    init();

    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // 6 seconds per slide

    return () => clearInterval(timer);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    const unavailable = await checkAvailability(dates.checkIn, dates.checkOut);
    const allIds = (await getRooms()).map(r => r.id);
    const available = allIds.filter(id => !unavailable.includes(id));
    setAvailableRoomIds(available);
    setIsSearching(false);
  };

  const handleBook = async (room: RoomType) => {
    if (!user) {
      alert("Please login to book a room.");
      navigate('/login');
      return;
    }

    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    const total = nights * room.pricePerNight;

    if (window.confirm(`Confirm booking for ${room.name}?\n${nights} nights\nTotal: NPR ${total.toLocaleString()}`)) {
      await createBooking({
        roomId: room.id,
        userId: user.id,
        guestName: user.name,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut,
        totalPrice: total
      });
      alert('Booking request sent! Check status in your profile.');
    }
  };

  const displayedRooms = availableRoomIds 
    ? rooms.filter(r => availableRoomIds.includes(r.id))
    : rooms;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section with Moving Slider (Ken Burns Effect) */}
      <div className="relative h-[85vh] bg-slate-900 text-white overflow-hidden">
        {HERO_IMAGES.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
             <img 
               src={img} 
               className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                 index === currentHeroIndex ? 'scale-110' : 'scale-100'
               }`} 
               alt={`Luxury Hotel View ${index + 1}`} 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
          </div>
        ))}

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center z-20 pt-20">
          <div className="animate-fade-in-up">
            <h5 className="text-blue-300 font-semibold tracking-[0.2em] uppercase mb-4 text-sm md:text-base">Welcome to HotelEase</h5>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-serif leading-tight drop-shadow-xl">
              Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">Luxury Living</span>
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              Escape to a world of unparalleled comfort and elegance. Your sanctuary of sophistication awaits.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-2xl max-w-5xl w-full flex flex-col lg:flex-row gap-6 items-end text-left mt-8 ring-1 ring-white/10">
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">Check In</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-3.5 text-white/70 group-hover:text-white transition-colors" size={20} />
                 <input 
                   type="date" 
                   className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:bg-white/20 focus:outline-none transition-all"
                   value={dates.checkIn}
                   onChange={e => setDates({...dates, checkIn: e.target.value})}
                 />
               </div>
             </div>
             <div className="flex-1 w-full">
               <label className="block text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">Check Out</label>
               <div className="relative group">
                 <Calendar className="absolute left-4 top-3.5 text-white/70 group-hover:text-white transition-colors" size={20} />
                 <input 
                   type="date" 
                   className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:bg-white/20 focus:outline-none transition-all"
                   value={dates.checkOut}
                   min={dates.checkIn}
                   onChange={e => setDates({...dates, checkOut: e.target.value})}
                 />
               </div>
             </div>
             <button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="w-full lg:w-auto h-[50px] px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
             >
               {isSearching ? 'Searching...' : 'Check Availability'}
             </button>
          </div>
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentHeroIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Facilities Strip */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
           {facilities.slice(0, 6).map(f => {
             // Simple dynamic icon selection for demo
             let Icon = Star;
             if (f.name.includes('Wifi')) Icon = Wifi;
             if (f.name.includes('Car')) Icon = Car;
             if (f.name.includes('Coffee') || f.name.includes('Breakfast')) Icon = Coffee;
             if (f.name.includes('Pool')) Icon = Waves;
             
             return (
               <div key={f.id} className="flex flex-col items-center gap-4 group cursor-pointer">
                 {/* Glassy iOS Icon Container */}
                 <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.3)] bg-white shadow-lg border border-white/50">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-xl"></div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent to-blue-100/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon size={32} className="relative z-10 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" strokeWidth={1.5} />
                 </div>
                 <span className="text-sm font-semibold tracking-wide text-gray-600 group-hover:text-gray-900 transition-colors">{f.name}</span>
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
           <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        {displayedRooms.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-light text-gray-600">No residences available for these dates.</h3>
            <p className="text-gray-400 mt-2">We apologize for the inconvenience. Please select alternative dates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {displayedRooms.map(room => (
              <div key={room.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full">
                <div className="h-80 relative overflow-hidden">
                  <img 
                    src={room.imageUrl} 
                    alt={room.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-white/50 px-4 py-2 rounded-2xl text-blue-900 font-bold shadow-lg text-sm">
                    NPR {room.pricePerNight.toLocaleString()} <span className="text-gray-500 font-normal">/ night</span>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h3 className="text-2xl font-bold font-serif text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{room.name}</h3>
                       <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
                         <span className="flex items-center gap-1.5"><Users size={16} className="text-blue-500"/> {room.capacity} Guests</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span className="flex items-center gap-1.5"><Star size={16} className="text-yellow-400 fill-current"/> 5.0 Rating</span>
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

                  <Button onClick={() => handleBook(room)} className="w-full py-4 text-base tracking-wide uppercase font-semibold bg-gray-900 hover:bg-blue-700 transition-colors rounded-xl">
                    Reserve Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};