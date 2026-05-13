import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  PlusIcon, Edit2Icon, Trash2Icon, MapIcon,
  ListIcon, ImageIcon, UploadIcon, XIcon,
  LayersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import * as buildingsApi from '../../api/buildings';
import type { Building } from '../../api/buildings';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function Locations() {
  const [locations, setLocations] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Building | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Building | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<buildingsApi.CreateBuildingPayload> & { image_url?: string }>({
    name: '', category: 'Classroom', description: '',
    latitude: 10.3287, longitude: 37.7454, image_url: '',
  });
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const mapLayers = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    buildingsApi.getBuildings()
      .then(setLocations)
      .catch(() => toast.error('Failed to load locations'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenForm = (loc?: Building) => {
    if (loc) {
      setEditingLocation(loc);
      setFormData({
        name: loc.name, category: loc.category, description: loc.description,
        latitude: loc.latitude, longitude: loc.longitude, image_url: loc.image_url ?? '',
        building_number: loc.building_number ?? '',
        opening_hours: loc.opening_hours ?? '',
        contact: loc.contact ?? '',
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', category: 'Classroom', description: '', latitude: 10.3287, longitude: 37.7454, image_url: '', building_number: '', opening_hours: '', contact: '' });
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, image_url: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLocation) {
        const updated = await buildingsApi.updateBuilding(editingLocation.id, formData as buildingsApi.CreateBuildingPayload);
        setLocations((prev) => prev.map((l) => l.id === editingLocation.id ? updated : l));
        toast.success('Location updated');
      } else {
        const created = await buildingsApi.createBuilding(formData as buildingsApi.CreateBuildingPayload);
        setLocations((prev) => [...prev, created]);
        toast.success('Location added');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;
    try {
      await buildingsApi.deleteBuilding(locationToDelete.id);
      setLocations((prev) => prev.filter((l) => l.id !== locationToDelete.id));
      toast.success('Location deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Delete failed');
    } finally {
      setLocationToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: (loc: Building) =>
        loc.image_url
          ? <img src={loc.image_url} alt={loc.name} className="w-14 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
          : <div className="w-14 h-10 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400"><ImageIcon size={16} /></div>,
    },
    { header: 'Name', accessor: 'name' as keyof Building, className: 'font-medium text-slate-900 dark:text-white' },
    {
      header: 'Category',
      accessor: (loc: Building) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {loc.category}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: (loc: Building) => <span className="truncate max-w-xs block">{loc.description}</span>,
    },
    {
      header: 'Coordinates',
      accessor: (loc: Building) => (
        <span className="text-slate-500 font-mono text-xs">
          {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (loc: Building) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenForm(loc)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
            <Edit2Icon size={16} />
          </button>
          <button onClick={() => { setLocationToDelete(loc); setIsDeleteOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2Icon size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Locations</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage buildings, classrooms, and facilities.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
              <ListIcon size={16} /> List
            </button>
            <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
              <MapIcon size={16} /> Map
            </button>
          </div>
          <button onClick={() => handleOpenForm()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <PlusIcon size={18} /><span>Add Location</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          <input type="text" placeholder="Search locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          <Table data={filtered} columns={columns} keyExtractor={(l) => l.id} />
        </div>
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
          <MapContainer 
            center={[10.3287, 37.7454]} 
            zoom={16} 
            minZoom={15}
            maxBounds={[
              [10.3200, 37.7350], // South-West
              [10.3380, 37.7550]  // North-East
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}>
            <MapClickHandler onClick={(lat, lng) => {
              setEditingLocation(null);
              setFormData({ name: '', category: 'Classroom', description: '', latitude: lat, longitude: lng, image_url: '', building_number: '', opening_hours: '', contact: '' });
              setIsFormOpen(true);
            }} />
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <div className="bg-white dark:bg-slate-800 p-1 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                <button 
                  onClick={() => setMapType('standard')}
                  className={`p-2 rounded-md transition-colors ${mapType === 'standard' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Standard Map"
                >
                  <MapIcon size={20} />
                </button>
                <button 
                  onClick={() => setMapType('satellite')}
                  className={`p-2 rounded-md transition-colors ${mapType === 'satellite' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Satellite View"
                >
                  <ImageIcon size={20} />
                </button>
                <button 
                  onClick={() => setMapType('terrain')}
                  className={`p-2 rounded-md transition-colors ${mapType === 'terrain' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Terrain View"
                >
                  <LayersIcon size={20} />
                </button>
              </div>
            </div>
            <TileLayer 
              attribution={mapType === 'satellite' ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'} 
              url={mapLayers[mapType]} 
            />
            {filtered.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.latitude, loc.longitude]}
                eventHandlers={{ click: () => handleOpenForm(loc) }}>
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <div className="font-bold text-sm text-center">
                    {loc.name}
                    <div className="text-xs text-slate-500 font-normal">{loc.category}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingLocation ? 'Edit Location' : 'Add New Location'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location Image</label>
            {formData.image_url ? (
              <div className="relative group">
                <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-slate-300 dark:border-slate-600" />
                <button type="button" onClick={() => { setFormData((p) => ({ ...p, image_url: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors"><XIcon size={14} /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-medium rounded-lg shadow-md transition-colors">Replace</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-primary-500 hover:text-primary-500 transition-colors">
                <UploadIcon size={24} /><span className="text-sm">Click to upload an image</span><span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location Name</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Classroom, Office, Lab" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Building Number</label>
              <input type="text" value={formData.building_number} onChange={(e) => setFormData({ ...formData, building_number: e.target.value })} placeholder="e.g. B-12" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Hours</label>
              <input type="text" value={formData.opening_hours} onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })} placeholder="e.g. Mon-Fri: 8am-5pm" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Details</label>
            <input type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="e.g. +251 911 000 000" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
              <input required type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
              <input required type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors">
              {saving ? 'Saving...' : editingLocation ? 'Save Changes' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Location" message={`Are you sure you want to delete ${locationToDelete?.name}? This action cannot be undone.`} confirmText="Delete" />
    </div>
  );
}
