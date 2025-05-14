import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SearchResult, Coordinates } from '../../types';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const userIcon = createCustomIcon('#2563EB'); // Primary color
const poiIcon = createCustomIcon('#0D9488'); // Secondary color

// Center map on a specific location
interface CenterMapProps {
  position: Coordinates;
  zoom?: number;
}

const CenterMap = ({ position, zoom = 13 }: CenterMapProps) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(position, zoom);
  }, [map, position, zoom]);
  
  return null;
};

interface MapViewProps {
  center: Coordinates;
  zoom?: number;
  results?: SearchResult[];
  userLocation?: Coordinates;
  searchRadius?: number; // in meters
  onLocationSelect?: (location: Coordinates) => void;
  interactable?: boolean;
}

// Create a new component to handle map events
const MapEvents = ({ onMapClick }: { onMapClick?: (e: L.LeafletMouseEvent) => void }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
};

// Add a helper function to validate coordinates
const isValidCoordinates = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
};

const MapView = ({
  center,
  zoom = 13,
  results = [],
  userLocation,
  searchRadius,
  onLocationSelect,
  interactable = true,
}: MapViewProps) => {
  const [position, setPosition] = useState<Coordinates>(center);
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    setPosition(center);
  }, [center]);
  
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!interactable) return;
    
    const { lat, lng } = e.latlng;
    setPosition({ lat, lng });
    
    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  };
  
  const dragMarker = () => {
    if (!interactable || !markerRef.current) return;
    
    const marker = markerRef.current;
    const position = marker.getLatLng();
    setPosition({ lat: position.lat, lng: position.lng });
    
    if (onLocationSelect) {
      onLocationSelect({ lat: position.lat, lng: position.lng });
    }
  };

  // Filter out invalid results
  const validResults = results.filter(result => {
    if (result.lat !== undefined && result.lng !== undefined) {
      return isValidCoordinates(result.lat, result.lng);
    }
    return false;
  });

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Add the MapEvents component to handle map clicks */}
        {interactable && <MapEvents onMapClick={handleMapClick} />}
        
        <CenterMap position={position} zoom={zoom} />
        
        {/* User selected/query position */}
        {interactable && (
          <Marker
            position={[position.lat, position.lng]}
            icon={userIcon}
            draggable={interactable}
            ref={markerRef}
            eventHandlers={{
              dragend: dragMarker,
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="font-medium">Selected Location</div>
                <div className="text-xs mt-1">
                  {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* User location with search radius */}
        {userLocation && isValidCoordinates(userLocation.lat, userLocation.lng) && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <div className="font-medium">Your Location</div>
                  <div className="text-xs mt-1">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {searchRadius && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius}
                pathOptions={{ color: '#2563EB', fillColor: '#60A5FA', fillOpacity: 0.2 }}
              />
            )}
          </>
        )}
        
        {/* Result POIs */}
        {validResults.map((result) => (
          <Marker
            key={result.id}
            position={[result.lat!, result.lng!]}
            icon={poiIcon}
          >
            <Popup>
              <div>
                <div className="font-medium">{result.name}</div>
                {result.description && (
                  <div className="text-sm mt-1">{result.description}</div>
                )}
                {result.distance && (
                  <div className="text-xs mt-1 text-gray-500">
                    {result.distance.toFixed(2)} km away
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;