import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  PlusIcon,
  Edit2Icon,
  Trash2Icon,
  MapIcon,
  ListIcon,
  ImageIcon,
  UploadIcon,
  XIcon } from
'lucide-react';
import { toast } from 'sonner';
import { initialLocations, Location } from '../../data/mockData';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
export function Locations() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Form state
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: 'Classroom',
    description: '',
    lat: 52.629,
    lng: -1.132,
    imageUrl: ''
  });
  const filteredLocations = locations.filter(
    (loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleOpenForm = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData(location);
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        type: 'Classroom',
        description: '',
        lat: 52.629,
        lng: -1.132,
        imageUrl: ''
      });
    }
    setIsFormOpen(true);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      setLocations(
        locations.map((l) =>
        l.id === editingLocation.id ?
        {
          ...formData,
          id: l.id
        } as Location :
        l
        )
      );
      toast.success('Location updated successfully');
    } else {
      const newLocation = {
        ...formData,
        id: Date.now().toString()
      } as Location;
      setLocations([...locations, newLocation]);
      toast.success('Location added successfully');
    }
    setIsFormOpen(false);
  };
  const handleDelete = () => {
    if (locationToDelete) {
      setLocations(locations.filter((l) => l.id !== locationToDelete.id));
      toast.success('Location deleted successfully');
      setLocationToDelete(null);
    }
  };
  const columns = [
  {
    header: 'Image',
    accessor: (loc: Location) =>
    loc.imageUrl ?
    <img
      src={loc.imageUrl}
      alt={loc.name}
      className="w-14 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700" /> :


    <div className="w-14 h-10 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
            <ImageIcon size={16} />
          </div>

  },
  {
    header: 'Name',
    accessor: 'name' as keyof Location,
    className: 'font-medium text-slate-900 dark:text-white'
  },
  {
    header: 'Type',
    accessor: (loc: Location) =>
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {loc.type}
        </span>

  },
  {
    header: 'Description',
    accessor: (loc: Location) =>
    <span className="truncate max-w-xs block">{loc.description}</span>

  },
  {
    header: 'Coordinates',
    accessor: (loc: Location) =>
    <span className="text-slate-500 font-mono text-xs">
          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
        </span>

  },
  {
    header: 'Actions',
    accessor: (loc: Location) =>
    <div className="flex gap-2">
          <button
        onClick={() => handleOpenForm(loc)}
        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
        
            <Edit2Icon size={16} />
          </button>
          <button
        onClick={() => {
          setLocationToDelete(loc);
          setIsDeleteOpen(true);
        }}
        className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
        
            <Trash2Icon size={16} />
          </button>
        </div>

  }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Campus Locations
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage buildings, classrooms, and facilities.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              
              <ListIcon size={16} /> List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              
              <MapIcon size={16} /> Map
            </button>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            
            <PlusIcon size={18} />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {viewMode === 'list' ?
      <div className="space-y-4">
          <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
        
          <Table
          data={filteredLocations}
          columns={columns}
          keyExtractor={(loc) => loc.id} />
        
        </div> :

      <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
          <MapContainer
          center={[52.629, -1.136]}
          zoom={16}
          style={{
            height: '100%',
            width: '100%'
          }}>
          
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
            {filteredLocations.map((loc) =>
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    {loc.imageUrl &&
                <img
                  src={loc.imageUrl}
                  alt={loc.name}
                  className="w-full h-24 object-cover rounded-md mb-2" />

                }
                    <h3 className="font-bold text-sm mb-1">{loc.name}</h3>
                    <p className="text-xs text-slate-500 mb-2">{loc.type}</p>
                    <p className="text-xs">{loc.description}</p>
                    <button
                  onClick={() => handleOpenForm(loc)}
                  className="mt-2 text-xs text-primary-600 hover:underline">
                  
                      Edit Details
                    </button>
                  </div>
                </Popup>
              </Marker>
          )}
          </MapContainer>
        </div>
      }

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}>
        
        <form onSubmit={handleSave} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location Image
            </label>
            {formData.imageUrl ?
            <div className="relative group">
                <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-slate-300 dark:border-slate-600" />
              
                <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors"
                title="Remove image">
                
                  <XIcon size={14} />
                </button>
                <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-medium rounded-lg shadow-md transition-colors">
                
                  Replace
                </button>
              </div> :

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors">
              
                <UploadIcon size={24} />
                <span className="text-sm">Click to upload an image</span>
                <span className="text-xs text-slate-400">
                  PNG, JPG up to 5MB
                </span>
              </button>
            }
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location Name
            </label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Building Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value as any
              })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
              
              <option value="Classroom">Classroom</option>
              <option value="Office">Office</option>
              <option value="Lab">Lab</option>
              <option value="Library">Library</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value
              })
              }
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
            
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Latitude
              </label>
              <input
                required
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  lat: parseFloat(e.target.value)
                })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
              
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Longitude
              </label>
              <input
                required
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  lng: parseFloat(e.target.value)
                })
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
              
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              
              {editingLocation ? 'Save Changes' : 'Add Location'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={`Are you sure you want to delete ${locationToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete" />
      
    </div>);

}