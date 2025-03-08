
import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLocationProps {
  address: string;
  className?: string;
}

const MapLocation: React.FC<MapLocationProps> = ({ address, className }) => {
  // Create Google Maps URL with the address
  const encodedAddress = encodeURIComponent(address);
  
  // Using simple Google Maps embed without API key
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${encodedAddress}`;
  
  // Fallback to a static map image
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x400&markers=${encodedAddress}`;
  
  return (
    <div className={cn("w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 animate-fade-in", className)}>
      <div className="relative pb-[56.25%] h-0 bg-gray-100">
        {/* Fallback static content instead of iframe */}
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
          <div>
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-1">SMASH Täby</h3>
            <p className="text-sm text-muted-foreground">
              Täby Centrum, Stora Marknadsvägen 15, 183 70 Täby
            </p>
          </div>
        </div>
      </div>
      
      <div className="glass p-4 flex items-center gap-3">
        <MapPin className="h-5 w-5 text-primary animate-float" />
        <p className="text-sm md:text-base">{address}</p>
      </div>
      
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-primary text-primary-foreground text-center py-3 hover:bg-primary/90 transition-colors duration-300"
      >
        Get Directions
      </a>
    </div>
  );
};

export default MapLocation;
