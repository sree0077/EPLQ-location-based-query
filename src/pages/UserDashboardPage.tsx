import { useState, useEffect } from 'react';
import { InfoIcon, RefreshCw, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import SearchForm from '../components/dashboard/SearchForm';
import MapView from '../components/maps/MapView';
import ResultCard from '../components/dashboard/ResultCard';
import { Coordinates, SearchResult } from '../types';
import apiService from '../services/apiService';
import encryptionService from '../services/encryptionService';
import 'leaflet/dist/leaflet.css';

const UserDashboardPage = () => {
  const [searchLocation, setSearchLocation] = useState<Coordinates>({ lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [searchRadius, setSearchRadius] = useState<number>(5000); // 5km in meters
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generate encryption keys when the component mounts
  useEffect(() => {
    // No need to generate keys as they are fixed in the encryption service
    if (!encryptionService.getKeys()) {
      console.error('Encryption keys not available');
    }
  }, []);

  const handleSearch = async (query: {
    encryptedLat: string;
    encryptedLng: string;
    encryptedRadius?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending search request to backend with query:', {
        encryptedLat: query.encryptedLat.substring(0, 20) + '...',
        encryptedLng: query.encryptedLng.substring(0, 20) + '...',
        encryptedRadius: query.encryptedRadius?.substring(0, 20) + '...'
      });

      // Send the encrypted query to the server
      const searchResults = await apiService.searchPOIs({
        encryptedLat: query.encryptedLat,
        encryptedLng: query.encryptedLng,
        encryptedRadius: query.encryptedRadius,
      });
      
      console.log('Received search results from backend:', {
        totalResults: searchResults.length,
        results: searchResults.map(result => ({
          id: result.id,
          name: result.name,
          distance: result.distance,
          encryptedLat: result.encryptedLat.substring(0, 20) + '...',
          encryptedLng: result.encryptedLng.substring(0, 20) + '...'
        }))
      });
      
      // Decrypt the results before displaying
      const decryptedResults = searchResults.map(result => {
        try {
          const decryptedCoords = encryptionService.decryptCoordinates(
            result.encryptedLat,
            result.encryptedLng
          );
          
          return {
            ...result,
            lat: decryptedCoords.lat,
            lng: decryptedCoords.lng,
          };
        } catch (error) {
          console.warn('Error decrypting coordinates for result:', result.id, error);
          return null;
        }
      }).filter((result): result is SearchResult & { lat: number; lng: number } => result !== null);
      
      console.log('Decrypted search results:', {
        totalResults: decryptedResults.length,
        results: decryptedResults.map(result => ({
          id: result.id,
          name: result.name,
          distance: result.distance,
          lat: result.lat,
          lng: result.lng
        }))
      });
      
      setResults(decryptedResults);
      
      // Set the search radius for visualization
      if (query.encryptedRadius) {
        try {
          const radius = encryptionService.decryptRadius(query.encryptedRadius);
          setSearchRadius(radius);
        } catch (error) {
          console.warn('Error decrypting radius:', error);
          setSearchRadius(5000); // Default to 5km if decryption fails
        }
      }
    } catch (error) {
      console.error('Error searching POIs:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = (location: Coordinates) => {
    setSearchLocation(location);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Search for Points of Interest with encrypted location data
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Search Form & Map */}
          <div className="lg:col-span-7">
            <SearchForm 
              onSearch={handleSearch}
              onUpdateLocation={handleLocationUpdate}
              isLoading={isLoading}
              mapCoordinates={searchLocation}
            />
            
            <div className="h-96 mt-6">
              <MapView
                center={searchLocation}
                zoom={12}
                results={results}
                userLocation={searchLocation}
                searchRadius={searchRadius}
                onLocationSelect={handleLocationUpdate}
              />
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
                
                {isLoading ? (
                  <div className="flex items-center text-primary-600">
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">{results.length} results found</span>
                )}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 text-error-700 rounded-md flex items-start">
                  <InfoIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              {!isLoading && results.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <MapPin className="h-12 w-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500">No results found. Try a different location or larger radius.</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                  {results.map((result, index) => (
                    <ResultCard key={result.id} result={result} index={index} />
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Privacy Information</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <span className="font-medium">Client-Side Encryption:</span> All your location data is encrypted on your device before being sent to the server.
                </p>
                <p>
                  <span className="font-medium">Predicate Encryption:</span> Our system uses specialized encryption that allows searching on encrypted data without revealing the actual values.
                </p>
                <p>
                  <span className="font-medium">No Plaintext Storage:</span> Your coordinates are never stored in plaintext on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;