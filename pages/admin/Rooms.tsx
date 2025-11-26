import React, { useEffect, useState } from 'react';
import { getRooms, saveRoom, deleteRoom, getFacilities } from '../../services/mockDb';
import { RoomType, Facility } from '../../types';
import { Button } from '../../components/Button';
import { Plus, Trash2, Edit2, Users, DollarSign } from 'lucide-react';

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<RoomType>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setRooms(await getRooms());
    setFacilities(await getFacilities());
    setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoom.name && currentRoom.pricePerNight) {
      await saveRoom({
        ...currentRoom,
        imageUrl: currentRoom.imageUrl || `https://picsum.photos/800/600?random=${Math.random()}`
      } as RoomType);
      setIsEditing(false);
      setCurrentRoom({});
      loadData();
    }
  };

  const toggleFacility = (id: string) => {
    const current = currentRoom.facilityIds || [];
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    setCurrentRoom({ ...currentRoom, facilityIds: updated });
  };

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
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" className="w-full border rounded p-2" value={currentRoom.description || ''} onChange={e => setCurrentRoom({...currentRoom, description: e.target.value})} required />
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

            <div className="flex gap-3 pt-4">
               <Button type="submit">Save Room</Button>
               <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden relative group">
              <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => { setCurrentRoom(room); setIsEditing(true); }} className="p-2 bg-white/90 rounded-full hover:text-blue-600 shadow-sm"><Edit2 size={16} /></button>
                 <button onClick={async () => { if(window.confirm('Delete?')) { await deleteRoom(room.id); loadData(); }}} className="p-2 bg-white/90 rounded-full hover:text-red-600 shadow-sm"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{room.name}</h3>
                <span className="font-semibold text-blue-600">NPR {room.pricePerNight.toLocaleString()}</span>
              </div>
              <p className="text-gray-500 text-sm mb-4 flex-1">{room.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Users size={16} /> {room.capacity} Guests</span>
                <span className="flex items-center gap-1"><DollarSign size={16} /> {room.totalStock} Available</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {room.facilityIds.map(fid => {
                   const fac = facilities.find(f => f.id === fid);
                   return fac ? <span key={fid} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{fac.name}</span> : null;
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};