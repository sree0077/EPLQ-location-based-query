import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash, Save, X, Upload, Loader, MapPin } from 'lucide-react';
import { POI, Coordinates } from '../../types';
import encryptionService from '../../services/encryptionService';

interface POIManagerProps {
  pois: POI[];
  onAddPOI: (poi: Omit<POI, 'id' | 'timestamp'>) => Promise<void>;
  onUpdatePOI: (id: string, poi: Partial<Omit<POI, 'id' | 'timestamp'>>) => Promise<void>;
  onDeletePOI: (id: string) => Promise<void>;
  onBulkUpload: (pois: Array<Omit<POI, 'id' | 'timestamp'>>) => Promise<void>;
  isLoading: boolean;
  onSelectLocation?: (location: Coordinates) => void;
  selectedLocation?: Coordinates | null;
  bulkUploadOpen: boolean;
  setBulkUploadOpen: (open: boolean) => void;
}

type POIFormInputs = {
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
};

const POIManager = ({
  pois,
  onAddPOI,
  onUpdatePOI,
  onDeletePOI,
  onBulkUpload,
  isLoading,
  onSelectLocation,
  selectedLocation,
  bulkUploadOpen,
  setBulkUploadOpen,
}: POIManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({ lat: 0, lng: 0 });
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<POIFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      latitude: 0,
      longitude: 0,
    },
  });

  // Update form when selected location changes
  useEffect(() => {
    if (selectedLocation && showForm) {
      setValue('latitude', selectedLocation.lat);
      setValue('longitude', selectedLocation.lng);
      setCurrentCoords(selectedLocation);
    }
  }, [selectedLocation, showForm, setValue]);

  const handleAddPOI = async (data: POIFormInputs) => {
    try {
      const { encryptedLat, encryptedLng } = encryptionService.encryptCoordinates({
        lat: data.latitude,
        lng: data.longitude,
      });
      
      await onAddPOI({
        name: data.name,
        description: data.description,
        category: data.category,
        encryptedLat,
        encryptedLng,
      });
      
      reset();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding POI:', error);
    }
  };

  const handleUpdatePOI = async (data: POIFormInputs) => {
    if (!editingId) return;
    
    try {
      const { encryptedLat, encryptedLng } = encryptionService.encryptCoordinates({
        lat: data.latitude,
        lng: data.longitude,
      });
      
      await onUpdatePOI(editingId, {
        name: data.name,
        description: data.description,
        category: data.category,
        encryptedLat,
        encryptedLng,
      });
      
      reset();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating POI:', error);
    }
  };

  const startEdit = (poi: POI) => {
    // This is a simplified version - in a real app, you'd decrypt the coordinates
    // For demo purposes, we're just using the encrypted values as is
    setValue('name', poi.name);
    setValue('description', poi.description || '');
    setValue('category', poi.category || '');
    setValue('latitude', parseFloat(poi.encryptedLat));
    setValue('longitude', parseFloat(poi.encryptedLng));
    
    setEditingId(poi.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    reset();
    setEditingId(null);
    setShowForm(false);
  };

  const processCsvUpload = async () => {
    try {
      // Simple CSV parsing
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      
      const nameIndex = headers.findIndex((h) => h.trim().toLowerCase() === 'name');
      const descIndex = headers.findIndex((h) => h.trim().toLowerCase() === 'description');
      const catIndex = headers.findIndex((h) => h.trim().toLowerCase() === 'category');
      const latIndex = headers.findIndex((h) => h.trim().toLowerCase() === 'latitude');
      const lngIndex = headers.findIndex((h) => h.trim().toLowerCase() === 'longitude');
      
      if (latIndex === -1 || lngIndex === -1 || nameIndex === -1) {
        alert('CSV must contain at least name, latitude, and longitude columns');
        return;
      }
      
      const pois: Array<Omit<POI, 'id' | 'timestamp'>> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        
        const name = values[nameIndex].trim();
        const description = descIndex !== -1 ? values[descIndex].trim() : '';
        const category = catIndex !== -1 ? values[catIndex].trim() : '';
        const lat = parseFloat(values[latIndex].trim());
        const lng = parseFloat(values[lngIndex].trim());
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          continue; // Skip invalid coordinates
        }
        
        const { encryptedLat, encryptedLng } = encryptionService.encryptCoordinates({
          lat,
          lng,
        });
        
        pois.push({
          name,
          description,
          category,
          encryptedLat,
          encryptedLng,
        });
      }
      
      if (pois.length === 0) {
        alert('No valid POIs found in the CSV');
        return;
      }
      
      console.log('POIs to upload:', pois);
      await onBulkUpload(pois);
      setBulkUploadOpen(false);
      setCsvContent('');
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV. Please check the format and try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md animate-fade-in">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-500" />
            Manage Points of Interest
          </h2>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setBulkUploadOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </button>
            
            <button
              type="button"
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                reset();
              }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {showForm && !editingId ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New POI
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* POI Form */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 animate-slide-in">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? 'Edit POI' : 'Add New POI'}
            </h3>
            
            <form onSubmit={handleSubmit(editingId ? handleUpdatePOI : handleAddPOI)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                      errors.name ? 'border-error-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    id="category"
                    type="text"
                    {...register('category')}
                    className="block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register('latitude', {
                      required: 'Latitude is required',
                      validate: {
                        range: (value) => 
                          (value >= -90 && value <= 90) || 'Latitude must be between -90 and 90',
                      },
                    })}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                      errors.latitude ? 'border-error-500' : 'border-gray-300'
                    }`}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        const newCoords = { ...currentCoords, lat: value };
                        setCurrentCoords(newCoords);
                        if (onSelectLocation) {
                          onSelectLocation(newCoords);
                        }
                      }
                    }}
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-error-600">{errors.latitude.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register('longitude', {
                      required: 'Longitude is required',
                      validate: {
                        range: (value) => 
                          (value >= -180 && value <= 180) || 'Longitude must be between -180 and 180',
                      },
                    })}
                    className={`block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                      errors.longitude ? 'border-error-500' : 'border-gray-300'
                    }`}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        const newCoords = { ...currentCoords, lng: value };
                        setCurrentCoords(newCoords);
                        if (onSelectLocation) {
                          onSelectLocation(newCoords);
                        }
                      }
                    }}
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-error-600">{errors.longitude.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      {editingId ? 'Update POI' : 'Add POI'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* POI List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates (Encrypted)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pois.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No POIs found. Add your first one!
                  </td>
                </tr>
              ) : (
                pois.map((poi) => (
                  <tr key={poi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {poi.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {poi.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {poi.description || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-xs">Lat: {poi.encryptedLat.substring(0, 10)}...</span>
                        <span className="text-xs">Lng: {poi.encryptedLng.substring(0, 10)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(poi)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeletePOI(poi.id)}
                          className="text-error-600 hover:text-error-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bulk Upload Modal */}
      {bulkUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setBulkUploadOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6 z-60 animate-fade-in">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                onClick={() => setBulkUploadOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload POIs</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Upload a CSV file with POI data. The file should have headers for at least: name, latitude, longitude.
                Optional columns: description, category.
              </p>
              
              <div>
                <label htmlFor="csvContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Paste CSV Content
                </label>
                <textarea
                  id="csvContent"
                  rows={10}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300"
                  placeholder="name,latitude,longitude,description,category"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBulkUploadOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={processCsvUpload}
                  disabled={isLoading || !csvContent.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POIManager;