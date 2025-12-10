import React, { useEffect, useState } from 'react';
import { getRooms, saveRoom, deleteRoom, getFacilities, getBookings } from '../../services/mockDb';
import { RoomType, Facility, Booking } from '../../types';
import { Button } from '../../components/Button';
import { ImageWithSkeleton } from '../../components/ImageWithSkeleton';
import { Plus, Trash2, Edit2, Users, DollarSign, Loader2, Image as ImageIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Upload, Info } from 'lucide-react';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<RoomType>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar State
  const [calendarRoom, setCalendarRoom] = useState<RoomType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData(true);
  }, []);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    const [r, f, b] = await Promise.all([getRooms(), getFacilities(), getBookings()]);
    setRooms(r);
    setFacilities(f);
    setBookings(b);
    if (showLoading) setIsLoading(false);
  };

  const handleEdit = (room: RoomType) => {
    setCurrentRoom(room);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoom.name && currentRoom.pricePerNight && currentRoom.description) {
      setIsSubmitting(true);
      
      const roomToSave = {
        ...currentRoom,
        // Use provided image or fallback to picsum placeholder if empty
        imageUrl: currentRoom.imageUrl ? currentRoom.imageUrl : `https://picsum.photos/800/600?random=${Math.random()}`
      } as RoomType;

      await saveRoom(roomToSave);
      
      await loadData(false); // Background refresh
      setIsSubmitting(false);
      setIsEditing(false);
      setCurrentRoom({});
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentRoom({ ...currentRoom, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const toggleFacility = (id: string) => {
    const current = currentRoom.facilityIds || [];
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    setCurrentRoom({ ...currentRoom, facilityIds: updated });
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  const getBookingForDate = (day: number) => {
    if (!calendarRoom) return null;
    
    // Construct date string YYYY-MM-DD (local time approximation for mock)
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const checkDate = `${year}-${month}-${dayStr}`;

    return bookings.find(b => 
      b.roomId === calendarRoom.id && 
      ['CONFIRMED', 'PENDING'].includes(b.status) &&
      checkDate >= b.checkIn && checkDate < b.checkOut
    );
  };

  const getActiveBookings = (roomId: string) => {
    const today = new Date().toISOString().split('T')[0];
    // Filter active bookings and sort by most recent check-in to ensure the "most recent" is first
    return bookings.filter(b => 
      b.roomId === roomId && 
      b.status === 'CONFIRMED' &&
      b.checkIn <= today && 
      b.checkOut > today
    ).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Room Management</h2>
        <Button onClick={() => { setCurrentRoom({ facilityIds: [] }); setIsEditing(true); }}>
          <Plus size={18} className="mr-2" /> Add Room Type
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{currentRoom.id ? 'Edit' : 'Add'} Room</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input type="text" className="w-full border rounded p-2" value={currentRoom.name || ''} onChange={e => setCurrentRoom({...currentRoom, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price/Night (NPR)</label>
                <input type="number" className="w-full border rounded p-2" value={currentRoom.pricePerNight || ''} onChange={e => setCurrentRoom({...currentRoom, pricePerNight: Number(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (People)</label>
                <input type="number" className="w-full border rounded p-2" value={currentRoom.capacity || ''} onChange={e => setCurrentRoom({...currentRoom, capacity: Number(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Stock</label>
                <input type="number" className="w-full border rounded p-2" value={currentRoom.totalStock || ''} onChange={e => setCurrentRoom({...currentRoom, totalStock: Number(e.target.value)})} required />
              </div>
              
              {/* Description Field - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description 
                  <span className="text-gray-400 font-normal ml-1 text-xs">(Visible to guests)</span>
                </label>
                <textarea 
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y min-h-[100px]" 
                  rows={4}
                  value={currentRoom.description || ''} 
                  onChange={e => setCurrentRoom({...currentRoom, description: e.target.value})} 
                  placeholder="Describe the room's amenities, view, and unique features..."
                  required 
                />
              </div>
              
              {/* Image Input Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Room Image</label>
                <div className="space-y-3">
                  {/* URL Input */}
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      className="w-full border rounded p-2 pl-9 text-sm text-gray-600" 
                      placeholder="Paste image URL..."
                      value={currentRoom.imageUrl?.startsWith('data:') ? '' : (currentRoom.imageUrl || '')} 
                      onChange={e => setCurrentRoom({...currentRoom, imageUrl: e.target.value})} 
                    />
                    {currentRoom.imageUrl?.startsWith('data:') && (
                      <span className="absolute left-10 top-2.5 text-xs text-green-600 bg-green-50 px-2 rounded">
                        Image Uploaded
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase">OR</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  {/* File Upload */}
                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-gray-50 border border-gray-300 border-dashed rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <Upload size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Upload Image from Device</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>

                  {/* Preview */}
                  {currentRoom.imageUrl ? (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                      <ImageWithSkeleton src={currentRoom.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setCurrentRoom({...currentRoom, imageUrl: ''})}
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                      <ImageIcon size={24} className="mb-2 opacity-50" />
                      <p className="text-xs italic">
                        No image selected. A random luxury image will be assigned on save.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Facilities</label>
              <div className="flex flex-wrap gap-2">
                {facilities.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFacility(f.id)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      (currentRoom.facilityIds || []).includes(f.id) 
                      ? 'bg-blue-100 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
               <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                 {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin"/> Saving...</> : 'Save Room'}
               </Button>
               <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => {
          const activeBookings = getActiveBookings(room.id);
          
          return (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden relative group bg-gray-100">
                <ImageWithSkeleton src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                {/* Active Booking Info Badge */}
                {activeBookings.length > 0 && (
                  <div className="absolute top-2 left-2 z-20 group/info">
                    <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-full text-blue-600 shadow-sm cursor-help hover:bg-white transition-colors border border-blue-100">
                      <Info size={16} />
                    </div>
                    {/* Custom Tooltip */}
                    <div className="absolute top-full left-0 mt-2 w-max max-w-[220px] bg-gray-900/95 backdrop-blur rounded-lg shadow-xl p-3 text-white text-xs opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all transform origin-top-left scale-95 group-hover/info:scale-100 pointer-events-none z-50">
                      <p className="font-bold mb-2 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-700 pb-1">
                        Currently Occupied ({activeBookings.length})
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {activeBookings.map((b, idx) => (
                          <div key={b.id} className={`pl-2 ${idx === 0 ? 'border-l-2 border-blue-500' : 'border-l-2 border-gray-600'}`}>
                            <p className={`font-mono font-bold ${idx === 0 ? 'text-blue-200' : 'text-gray-400'}`}>#{b.id}</p>
                            <p className="truncate text-gray-300">{b.guestName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button onClick={() => handleEdit(room)} className="p-2 bg-white/90 rounded-full hover:text-blue-600 shadow-sm transition-colors"><Edit2 size={16} /></button>
                   <button onClick={async () => { if(window.confirm('Delete?')) { await deleteRoom(room.id); loadData(false); }}} className="p-2 bg-white/90 rounded-full hover:text-red-600 shadow-sm transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{room.name}</h3>
                  <span className="font-semibold text-blue-600">NPR {room.pricePerNight.toLocaleString()}</span>
                </div>
                <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3" title={room.description}>{room.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1"><Users size={16} /> {room.capacity} Guests</span>
                  <span className="flex items-center gap-1"><DollarSign size={16} /> {room.totalStock} Available</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {room.facilityIds.map(fid => {
                     const fac = facilities.find(f => f.id === fid);
                     return fac ? <span key={fid} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{fac.name}</span> : null;
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-auto flex items-center justify-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => setCalendarRoom(room)}
                >
                  <CalendarIcon size={16} /> View Availability
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Availability Calendar Modal */}
      {calendarRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Availability Check</h3>
                <p className="text-sm text-gray-500">{calendarRoom.name}</p>
              </div>
              <button onClick={() => setCalendarRoom(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <h4 className="font-bold text-lg text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for padding */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {Array.from({ length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth()) }).map((_, i) => {
                  const day = i + 1;
                  const booking = getBookingForDate(day);
                  const isBooked = !!booking;
                  const isPending = booking?.status === 'PENDING';
                  const isToday = 
                    new Date().getDate() === day && 
                    new Date().getMonth() === currentMonth.getMonth() && 
                    new Date().getFullYear() === currentMonth.getFullYear();

                  return (
                    <div 
                      key={day} 
                      className={`
                        aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 relative cursor-help
                        ${isBooked 
                          ? (isPending 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 hover:scale-110 hover:shadow-md hover:z-10' 
                              : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:scale-110 hover:shadow-md hover:z-10')
                          : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 hover:scale-105 hover:shadow-sm hover:z-10'
                        }
                        ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      `}
                      title={isBooked 
                        ? `Booking ID: #${booking?.id}\nGuest: ${booking?.guestName}\nStatus: ${isPending ? 'Pending (Awaiting Approval)' : 'Confirmed'}` 
                        : 'Available'
                      }
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6 text-xs justify-center font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-200"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                  <span className="text-gray-600">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};