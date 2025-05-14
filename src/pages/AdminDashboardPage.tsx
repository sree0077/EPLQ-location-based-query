import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import POIManager from '../components/dashboard/POIManager';
import MapView from '../components/maps/MapView';
import { Coordinates, POI } from '../types';
import apiService from '../services/apiService';
import encryptionService from '../services/encryptionService';

const AdminDashboardPage = () => {
  const [pois, setPois] = useState<POI[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  
  // Generate encryption keys when the component mounts
  useEffect(() => {
    // No need to generate keys as they are fixed in the encryption service
    if (!encryptionService.getKeys()) {
      console.error('Encryption keys not available');
    }
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getAllPOIs();
      setPois(Array.isArray(data.pois) ? data.pois : []);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      setError('Failed to load POIs. Please try again.');
      setPois([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPOI = async (poi: Omit<POI, 'id' | 'timestamp'>) => {
    setIsLoading(true);
    
    try {
      const newPOI = await apiService.addPOI(poi);
      setPois((prevPOIs) => [...prevPOIs, newPOI]);
    } catch (error) {
      console.error('Error adding POI:', error);
      setError('Failed to add POI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePOI = async (id: string, poi: Partial<Omit<POI, 'id' | 'timestamp'>>) => {
    setIsLoading(true);
    
    try {
      const updatedPOI = await apiService.updatePOI(id, poi);
      setPois((prevPOIs) => prevPOIs.map((p) => (p.id === id ? updatedPOI : p)));
    } catch (error) {
      console.error('Error updating POI:', error);
      setError('Failed to update POI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePOI = async (id: string) => {
    setIsLoading(true);
    
    try {
      await apiService.deletePOI(id);
      setPois((prevPOIs) => prevPOIs.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting POI:', error);
      setError('Failed to delete POI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (pois: Array<Omit<POI, 'id' | 'timestamp'>>) => {
    setIsLoading(true);
    
    try {
      const newPOIs = await apiService.bulkAddPOIs(pois);
      setPois((prevPOIs) => [...prevPOIs, ...newPOIs]);
    } catch (error) {
      console.error('Error bulk uploading POIs:', error);
      setError('Failed to bulk upload POIs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLocation = (location: Coordinates) => {
    setMapCenter(location);
    setSelectedLocation(location);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage encrypted Points of Interest (POIs)
          </p>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-error-50 text-error-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - POI Manager */}
          <div className="lg:col-span-7">
            <POIManager
              pois={pois}
              onAddPOI={handleAddPOI}
              onUpdatePOI={handleUpdatePOI}
              onDeletePOI={handleDeletePOI}
              onBulkUpload={handleBulkUpload}
              isLoading={isLoading}
              onSelectLocation={handleSelectLocation}
              selectedLocation={selectedLocation}
              bulkUploadOpen={bulkUploadOpen}
              setBulkUploadOpen={setBulkUploadOpen}
            />
          </div>
          
          {/* Right Column - Map View */}
          {!bulkUploadOpen && (
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Map Preview</h2>
                <div className="h-96">
                  <MapView
                    center={mapCenter}
                    zoom={12}
                    results={pois.map(poi => ({
                      id: poi.id,
                      name: poi.name,
                      description: poi.description,
                      category: poi.category,
                      encryptedLat: poi.encryptedLat,
                      encryptedLng: poi.encryptedLng,
                    }))}
                    onLocationSelect={handleSelectLocation}
                  />
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    <span className="font-semibold">Note:</span> This map is using the encrypted coordinates as if they were plaintext for visualization purposes only. In a real application, the coordinates would be properly encrypted and not directly plottable on a map like this.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;