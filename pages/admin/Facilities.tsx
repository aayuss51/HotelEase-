import React, { useEffect, useState } from 'react';
import { getFacilities, saveFacility, deleteFacility } from '../../services/mockDb';
import { Facility } from '../../types';
import { Button } from '../../components/Button';
import { Plus, Trash2, Edit2, Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Tv, Loader2 } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Wifi, Car, Coffee, Dumbbell, Waves, Utensils, Tv
};

export const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<Partial<Facility>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData(true);
  }, []);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setFacilities(await getFacilities());
    if (showLoading) setIsLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentFacility.name && currentFacility.icon) {
      setIsSubmitting(true);
      await saveFacility(currentFacility as Facility);
      await loadData(false); // Background refresh
      setIsSubmitting(false);
      setIsEditing(false);
      setCurrentFacility({});
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this facility?')) {
      await deleteFacility(id);
      loadData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-medium animate-pulse">Loading facilities...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Facilities Management</h2>
        <Button onClick={() => { setCurrentFacility({}); setIsEditing(true); }}>
          <Plus size={18} className="mr-2" /> Add Facility
        </Button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">{currentFacility.id ? 'Edit' : 'Add'} Facility</h3>
          <form onSubmit={handleSave} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={currentFacility.name || ''}
                onChange={e => setCurrentFacility({ ...currentFacility, name: e.target.value })}
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={currentFacility.icon || ''}
                onChange={e => setCurrentFacility({ ...currentFacility, icon: e.target.value })}
                required
              >
                <option value="">Select Icon</option>
                {Object.keys(ICON_MAP).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
               <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
               </Button>
               <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {facilities.map(f => {
          const IconComp = ICON_MAP[f.icon] || Wifi;
          return (
            <div key={f.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* Glassy Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <IconComp size={22} />
                </div>
                <span className="font-medium text-gray-700">{f.name}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setCurrentFacility(f); setIsEditing(true); }} className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(f.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};