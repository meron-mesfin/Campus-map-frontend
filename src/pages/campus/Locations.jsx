import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

function MapClickHandler({ onClick }) {
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
  Building2Icon,
  LayoutGridIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Table } from '../../components/shared/Table';
import { Modal } from '../../components/shared/Modal';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import * as buildingsApi from '../../api/buildings';
import * as deptApi from '../../api/departments';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CATEGORIES = [
  'Academic', 'Administrative', 'Laboratory', 'Library',
  'Classroom', 'Facility', 'Residential', 'Service', 'Cafeteria', 'Outdoor', 'Other',
];

export function Locations() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fileInputRef = useRef(null);
  // Separate state for the actual File object (for upload)
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: 'Academic', description: '',
    latitude: 10.3287, longitude: 37.7454, image_url: '',
  });
  const [mapType, setMapType] = useState('standard');
  const [selectedMapCategory, setSelectedMapCategory] = useState('All');
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'name') {
      if (!value || !value.trim()) {
        newErrors.name = 'Location Name is required';
      } else if (value.trim().length < 3) {
        newErrors.name = 'Name must be at least 3 characters long';
      } else if (value.trim().length > 100) {
        newErrors.name = 'Name must not exceed 100 characters';
      } else {
        delete newErrors.name;
      }
    }
    
    if (field === 'description') {
      if (!value || !value.trim()) {
        newErrors.description = 'Description is required';
      } else if (value.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters long';
      } else if (value.trim().length > 500) {
        newErrors.description = 'Description must not exceed 500 characters';
      } else {
        delete newErrors.description;
      }
    }
    
    if (field === 'latitude') {
      const lat = parseFloat(value);
      if (isNaN(lat)) {
        newErrors.latitude = 'Latitude must be a valid number';
      } else if (lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      } else {
        delete newErrors.latitude;
      }
    }

    if (field === 'longitude') {
      const lng = parseFloat(value);
      if (isNaN(lng)) {
        newErrors.longitude = 'Longitude must be a valid number';
      } else if (lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      } else {
        delete newErrors.longitude;
      }
    }

    if (field === 'building_number') {
      if (value && value.trim()) {
        const bNumRegex = /^[A-Za-z0-9\-_]+$/;
        if (!bNumRegex.test(value.trim())) {
          newErrors.building_number = 'Building number must contain only letters, numbers, hyphens, or underscores';
        } else {
          delete newErrors.building_number;
        }
      } else {
        delete newErrors.building_number;
      }
    }
    
    setErrors(newErrors);
    return newErrors;
  };

  const validateForm = () => {
    let tempErrors = {};
    
    if (!formData.name || !formData.name.trim()) {
      tempErrors.name = 'Location Name is required';
    } else if (formData.name.trim().length < 3) {
      tempErrors.name = 'Name must be at least 3 characters long';
    } else if (formData.name.trim().length > 100) {
      tempErrors.name = 'Name must not exceed 100 characters';
    }
    
    if (!formData.description || !formData.description.trim()) {
      tempErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      tempErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 500) {
      tempErrors.description = 'Description must not exceed 500 characters';
    }
    
    const lat = parseFloat(formData.latitude);
    if (isNaN(lat)) {
      tempErrors.latitude = 'Latitude must be a valid number';
    } else if (lat < -90 || lat > 90) {
      tempErrors.latitude = 'Latitude must be between -90 and 90';
    }
    
    const lng = parseFloat(formData.longitude);
    if (isNaN(lng)) {
      tempErrors.longitude = 'Longitude must be a valid number';
    } else if (lng < -180 || lng > 180) {
      tempErrors.longitude = 'Longitude must be between -180 and 180';
    }
    

    if (formData.building_number && formData.building_number.trim()) {
      const bNumRegex = /^[A-Za-z0-9\-_]+$/;
      if (!bNumRegex.test(formData.building_number.trim())) {
        tempErrors.building_number = 'Building number must contain only letters, numbers, hyphens, or underscores';
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const mapLayers = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    Promise.all([
      buildingsApi.getBuildings(),
      deptApi.getDepartments()
    ])
      .then(([locs, depts]) => {
        setLocations(locs);
        setDepartments(depts);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenForm = (loc) => {
    setSelectedImageFile(null);
    setErrors({});
    if (loc) {
      setEditingLocation(loc);
      setFormData({
        name: loc.name, category: loc.category, description: loc.description,
        latitude: loc.latitude, longitude: loc.longitude, image_url: loc.image_url ?? '',
        building_number: loc.building_number ?? '',
        opening_hours: loc.opening_hours ?? '',
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', category: 'Academic', description: '', latitude: 10.3287, longitude: 37.7454, image_url: '', building_number: '', opening_hours: '' });
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    // Store the actual file for upload
    setSelectedImageFile(file);
    // Store base64 preview only for UI display
    const reader = new FileReader();
    reader.onload = (ev) => setFormData((prev) => ({ ...prev, image_url: ev.target?.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    setSaving(true);
    try {
      if (editingLocation) {
        const updated = await buildingsApi.updateBuilding(editingLocation.id, formData);
        // Upload image if a new file was selected
        if (selectedImageFile) {
          await buildingsApi.uploadBuildingImage(editingLocation.id, selectedImageFile);
        }
        setLocations((prev) => prev.map((l) => l.id === editingLocation.id ? updated : l));
        toast.success('Location updated');
      } else {
        const created = await buildingsApi.createBuilding(formData);
        // Upload image for the newly created building
        if (selectedImageFile) {
          const imageUrl = await buildingsApi.uploadBuildingImage(created.id, selectedImageFile);
          created.image_url = imageUrl;
        }
        setLocations((prev) => [...prev, created]);
        toast.success('Location added');
      }
      setSelectedImageFile(null);
      setIsFormOpen(false);
    } catch (err) {
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
    } catch (err) {
      toast.error(err.message ?? 'Delete failed');
    } finally {
      setLocationToDelete(null);
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: (loc) =>
        loc.image_url
          ? <img src={loc.image_url} alt={loc.name} className="w-14 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
          : <div className="w-14 h-10 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400"><ImageIcon size={16} /></div>,
    },
    { header: 'Name', accessor: 'name', className: 'font-medium text-slate-900 dark:text-white' },
    {
      header: 'Category',
      accessor: (loc) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {loc.category}
        </span>
      ),
    },
    {
      header: 'Rooms',
      accessor: (loc) => (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/campus/rooms?building=${loc.id}`); }}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${loc.room_count > 0 ? 'bg-[#E8F5E9] text-[#0d6a49] hover:bg-[#C8E6C9]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
        >
          <LayoutGridIcon size={11} />
          {loc.room_count || 0} rooms
        </button>
      ),
    },
    {
      header: 'Description',
      accessor: (loc) => <span className="truncate max-w-xs block">{loc.description}</span>,
    },
    {
      header: 'Coordinates',
      accessor: (loc) => (
        <span className="text-slate-500 font-mono text-xs">
          {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (loc) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleOpenForm(loc); }} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
            <Edit2Icon size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setLocationToDelete(loc); setIsDeleteOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors">
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
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <input type="text" placeholder="Search locations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            {filtered.length > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {Math.min(filtered.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length} locations
              </p>
            )}
          </div>
          
          <Table 
            data={paginatedData} 
            columns={columns} 
            keyExtractor={(l) => l.id} 
            onRowClick={(loc) => handleOpenForm(loc)}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeftIcon size={20} />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show only first, last, and pages around current
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-primary-600 text-white' : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRightIcon size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm relative z-0">
          <MapContainer
            center={[10.3287, 37.7454]}
            zoom={16}
            minZoom={15}
            maxBounds={[
              [10.3200, 37.7350],
              [10.3380, 37.7550]
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}>
            <MapClickHandler onClick={(lat, lng) => {
              setEditingLocation(null);
              setSelectedImageFile(null);
              setFormData({ name: '', category: 'Academic', description: '', latitude: lat, longitude: lng, image_url: '', building_number: '', opening_hours: '', contact: '' });
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

            {/* Category Filter Pills Overlay */}
            <div 
              className="absolute top-4 left-14 z-[1000] flex items-center gap-1.5 overflow-x-auto py-1 px-1 max-w-[calc(100%-150px)] no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {['All', ...CATEGORIES].map((cat) => {
                const isActive = selectedMapCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMapCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 scale-105'
                        : 'bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <TileLayer
              attribution={mapType === 'satellite' ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
              url={mapLayers[mapType]}
            />
            {filtered
              .filter((loc) => selectedMapCategory === 'All' || loc.category === selectedMapCategory)
              .map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  eventHandlers={{ click: () => handleOpenForm(loc) }}>
                  <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                    <div className="font-bold text-sm text-center">
                      {loc.name}
                      <div className="text-xs text-slate-500 font-normal">{loc.category}</div>
                      <div className="text-xs text-slate-500 font-normal mt-1 flex items-center justify-center gap-1">
                        <LayoutGridIcon size={10} /> {loc.room_count || 0} rooms
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
          </MapContainer>
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelectedImageFile(null); }} title={editingLocation ? 'Edit Location' : 'Add New Location'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location Image</label>
            {formData.image_url ? (
              <div className="relative group">
                <img src={formData.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-slate-300 dark:border-slate-600" />
                <button type="button" onClick={() => { setFormData((p) => ({ ...p, image_url: '' })); setSelectedImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors"><XIcon size={14} /></button>
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
            <input
              required
              type="text"
              value={formData.name}
              onBlur={(e) => validate('name', e.target.value)}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) validate('name', e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onBlur={(e) => validate('description', e.target.value)}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) validate('description', e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Building Number</label>
              <input
                type="text"
                value={formData.building_number}
                onBlur={(e) => validate('building_number', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, building_number: e.target.value });
                  if (errors.building_number) validate('building_number', e.target.value);
                }}
                placeholder="e.g. B-12"
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.building_number
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
              />
              {errors.building_number && <p className="text-xs text-red-500 mt-1">{errors.building_number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Hours</label>
              <input type="text" value={formData.opening_hours} onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })} placeholder="e.g. Mon-Fri: 8am-5pm" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          {editingLocation && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Building2Icon size={16} /> Departments in this Building
                </label>
                <div className="flex flex-wrap gap-2">
                  {departments.filter(d => String(d.building_id) === String(editingLocation.id)).length > 0 ? (
                    departments.filter(d => String(d.building_id) === String(editingLocation.id)).map(d => (
                      <span key={d.id} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                        {d.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">No departments assigned to this building.</span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <LayoutGridIcon size={16} /> Rooms in this Building
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/campus/rooms?building=${editingLocation.id}`);
                      setIsFormOpen(false);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Manage Rooms &rarr;
                  </button>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  This building currently has <strong className="text-slate-900 dark:text-white">{editingLocation.room_count || 0}</strong> room(s) registered.
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
              <input
                required
                type="number"
                step="any"
                value={formData.latitude}
                onBlur={(e) => validate('latitude', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || '' });
                  if (errors.latitude) validate('latitude', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.latitude
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
              />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
              <input
                required
                type="number"
                step="any"
                value={formData.longitude}
                onBlur={(e) => validate('longitude', e.target.value)}
                onChange={(e) => {
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || '' });
                  if (errors.longitude) validate('longitude', e.target.value);
                }}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 ${
                  errors.longitude
                    ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-primary-500'
                }`}
              />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => { setIsFormOpen(false); setSelectedImageFile(null); }} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
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
