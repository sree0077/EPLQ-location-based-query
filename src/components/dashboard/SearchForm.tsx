import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, MapPin, Crosshair, Loader } from 'lucide-react';
import { Coordinates } from '../../types';
import encryptionService from '../../services/encryptionService';

interface SearchFormProps {
  onSearch: (query: {
    encryptedLat: string;
    encryptedLng: string;
    encryptedRadius?: string;
  }) => Promise<void>;
  onUpdateLocation: (location: Coordinates) => void;
  isLoading: boolean;
  mapCoordinates?: Coordinates;
}

type SearchFormInputs = {
  latitude: number;
  longitude: number;
  radius: number;
};

const SearchForm = ({ onSearch, onUpdateLocation, isLoading, mapCoordinates }: SearchFormProps) => {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<Coordinates>({ lat: 0, lng: 0 });
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SearchFormInputs>({
    defaultValues: {
      latitude: 0,
      longitude: 0,
      radius: 5, // Default 5km radius
    },
  });

  useEffect(() => {
    if (mapCoordinates) {
      setValue('latitude', mapCoordinates.lat);
      setValue('longitude', mapCoordinates.lng);
      setCurrentCoords(mapCoordinates);
    }
  }, [mapCoordinates, setValue]);

  const onSubmit = async (data: SearchFormInputs) => {
    try {
      console.log('Search form submitted with coordinates:', {
        lat: data.latitude,
        lng: data.longitude,
        radius: data.radius
      });

      // Encrypt the search query before sending it
      const encryptedQuery = encryptionService.encryptQuery({
        center: { lat: data.latitude, lng: data.longitude },
        radius: data.radius * 1000, // Convert to meters
      });
      
      console.log('Encrypted query:', {
        encryptedLat: encryptedQuery.encryptedLat.substring(0, 20) + '...',
        encryptedLng: encryptedQuery.encryptedLng.substring(0, 20) + '...',
        encryptedRadius: encryptedQuery.encryptedRadius?.substring(0, 20) + '...'
      });

      await onSearch(encryptedQuery);
    } catch (error) {
      console.error('Error encrypting and submitting search:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        const newCoords = { lat: latitude, lng: longitude };
        setCurrentCoords(newCoords);
        onUpdateLocation(newCoords);
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Search className="h-5 w-5 mr-2 text-primary-500" />
        Encrypted Location Search
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="40.7128"
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                if (!isNaN(lat)) {
                  const newCoords = { ...currentCoords, lat };
                  setCurrentCoords(newCoords);
                  onUpdateLocation(newCoords);
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
              placeholder="-74.0060"
              onChange={(e) => {
                const lng = parseFloat(e.target.value);
                if (!isNaN(lng)) {
                  const newCoords = { ...currentCoords, lng };
                  setCurrentCoords(newCoords);
                  onUpdateLocation(newCoords);
                }
              }}
            />
            {errors.longitude && (
              <p className="mt-1 text-sm text-error-600">{errors.longitude.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
            Search Radius (km)
          </label>
          <input
            id="radius"
            type="number"
            step="0.1"
            min="0.1"
            max="1000"
            {...register('radius', {
              required: 'Radius is required',
              min: {
                value: 0.1,
                message: 'Radius must be at least 0.1 km',
              },
              max: {
                value: 1000,
                message: 'Radius cannot exceed 1000 km',
              },
            })}
            className={`block w-full px-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
              errors.radius ? 'border-error-500' : 'border-gray-300'
            }`}
          />
          {errors.radius && (
            <p className="mt-1 text-sm text-error-600">{errors.radius.message}</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {gettingLocation ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Crosshair className="h-4 w-4 mr-2" />
                Use My Location
              </>
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <span className="font-semibold">Privacy Note:</span> Your location data will be encrypted
          client-side before being sent to the server.
        </p>
      </div>
    </div>
  );
};

export default SearchForm;