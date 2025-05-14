import { useState } from 'react';
import { SearchResult } from '../../types';
import { MapPin, Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

const ResultCard = ({ result, index }: ResultCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate animation delay based on index for staggered animation
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-slide-in"
      style={{ animationDelay }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{result.name}</h3>
          
          {result.distance !== undefined && (
            <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              {result.distance.toFixed(2)} km
            </span>
          )}
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1 text-primary-500" />
          <span className="line-clamp-1">
            Lat: {result.encryptedLat.substring(0, 8)}..., Lng: {result.encryptedLng.substring(0, 8)}...
          </span>
        </div>
        
        {result.category && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Tag className="h-4 w-4 mr-1 text-gray-400" />
            <span>{result.category}</span>
          </div>
        )}
        
        {result.description && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-sm text-primary-600 hover:text-primary-800 focus:outline-none transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View details
                </>
              )}
            </button>
            
            {expanded && (
              <div className="mt-2 text-sm text-gray-600 animate-fade-in">
                {result.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;