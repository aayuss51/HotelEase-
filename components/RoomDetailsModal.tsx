import React from 'react';
import { RoomType, Facility } from '../types';
import { X, Users, Check, Star, Info, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { ImageWithSkeleton } from './ImageWithSkeleton';

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomType;
  facilities: Facility[];
  onBook: (room: RoomType) => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ isOpen, onClose, room, facilities, onBook }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Modal Header / Image Area */}
        <div className="relative h-64 shrink-0 bg-gray-100">
           <ImageWithSkeleton src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           
           <button 
             onClick={onClose} 
             className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors backdrop-blur-md text-white border border-white/30"
           >
             <X size={20} />
           </button>
           
           <div className="absolute bottom-6 left-6 text-white">
             <h2 className="text-3xl font-serif font-bold leading-tight mb-1">{room.name}</h2>
             <div className="flex items-center gap-3 text-sm opacity-90">
                <span className="flex items-center gap-1"><Users size={14} /> {room.capacity} Guests</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400"/> Luxury Rated</span>
             </div>
           </div>

           <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-white/50 shadow-lg">
             <span className="text-xl font-bold text-emerald-900">NPR {room.pricePerNight.toLocaleString()}</span>
             <span className="text-xs text-gray-500 font-medium"> / night</span>
           </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          <div className="space-y-8">
            {/* About this Room / Description Section */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
              <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <Info size={18} />
                 </div>
                 <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">About this Room</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-base font-light">
                {room.description}
              </p>
            </div>

            {/* Facilities Section */}
            <div>
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs mb-4 ml-1">Room Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.facilityIds.map(fid => {
                  const f = facilities.find(fac => fac.id === fid);
                  return f ? (
                    <div key={fid} className="flex items-center gap-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-sm transition-all">
                      <Check size={16} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium">{f.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-4 shrink-0">
          <Button variant="secondary" onClick={onClose} className="flex-1 bg-white border-gray-200 hover:bg-gray-100">
            Close Details
          </Button>
          <Button onClick={() => onBook(room)} className="flex-1 shadow-lg shadow-emerald-600/20 text-base flex items-center justify-center gap-2">
            Book this Room <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};