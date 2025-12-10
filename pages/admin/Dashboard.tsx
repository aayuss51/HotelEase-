import React, { useEffect, useState } from 'react';
import { getDashboardStats, getBookings, getRooms } from '../../services/mockDb';
import { DashboardStats, Booking, RoomType } from '../../types';
import { Users, Bed, CalendarCheck, DoorOpen, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<{room: string, guest: string, checkout: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, b, r] = await Promise.all([
          getDashboardStats(),
          getBookings(),
          getRooms()
        ]);
        
        setStats(s);
        
        // Get recent 5 bookings safe check
        if (Array.isArray(b)) {
           const sorted = [...b].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
           setRecentBookings(sorted.slice(0, 5));

           // Get Occupied Rooms Details
           const today = new Date().toISOString().split('T')[0];
           const occupied = b.filter(bk => bk.status === 'CONFIRMED' && bk.checkIn <= today && bk.checkOut > today);
           
           const occupiedDetails = occupied.map(bk => {
             const roomName = r.find(rm => rm.id === bk.roomId)?.name || 'Unknown Room';
             return { room: roomName, guest: bk.guestName, checkout: bk.checkOut };
           });
           setOccupiedRooms(occupiedDetails);
        }
      } catch (e) {
        console.error("Dashboard data load failed", e);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline text-red-800">Retry</button>
      </div>
    );
  }

  const cards = [
    { title: 'New Bookings (24h)', value: stats?.newBookings24h || 0, icon: CalendarCheck, gradient: 'from-green-400 to-green-600' },
    { title: 'Available Rooms', value: stats?.availableRoomsToday || 0, icon: DoorOpen, gradient: 'from-blue-400 to-blue-600' },
    { title: 'Occupied Rooms', value: stats?.occupiedRoomsToday || 0, icon: Bed, gradient: 'from-orange-400 to-orange-600' },
    { title: 'Checking Out Today', value: stats?.checkingOutToday || 0, icon: Users, gradient: 'from-purple-400 to-purple-600' },
  ];

  const chartData = [
    { name: 'Available', value: stats?.availableRoomsToday || 0 },
    { name: 'Occupied', value: stats?.occupiedRoomsToday || 0 },
    { name: 'Due Out', value: stats?.checkingOutToday || 0 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900">{card.value}</h3>
            </div>
            {/* Glassy Icon Container */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg shadow-gray-200 relative overflow-hidden`}>
               <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <card.icon size={24} className="relative z-10 drop-shadow-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-lg mb-6">Room Status Today</h3>
          <div className="h-64">
             {/* Only render Chart if stats exists to prevent Recharts crash */}
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                 <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                   cursor={{fill: '#F3F4F6'}}
                 />
                 <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Current Occupancy List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Currently Occupied</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {occupiedRooms.length === 0 ? (
              <p className="text-gray-500 text-sm">No rooms occupied right now.</p>
            ) : (
              occupiedRooms.map((occ, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{occ.room}</p>
                    <p className="text-xs text-gray-500">{occ.guest}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 border border-gray-200">Out: {occ.checkout}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider rounded-lg">
              <tr>
                <th className="px-6 py-4 rounded-l-lg">Guest</th>
                <th className="px-6 py-4">Room ID</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{bk.guestName}</td>
                  <td className="px-6 py-4 text-gray-500">#{bk.roomId}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {bk.checkIn} → {bk.checkOut}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${
                      bk.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 border-green-100' :
                      bk.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {bk.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">NPR {bk.totalPrice.toLocaleString()}</td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};