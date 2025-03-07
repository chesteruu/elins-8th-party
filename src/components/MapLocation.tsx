
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
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBIARjQfp5LL4EKXYVv48OAMn0KhIB0x1Y&q=${encodedAddress}&zoom=15`;
  
  return (
    <div className={cn("w-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 animate-fade-in", className)}>
      <div className="relative pb-[56.25%] h-0">
        <iframe
          title="Party Location"
          className="absolute top-0 left-0 w-full h-full"
          src={googleMapsUrl}
          allowFullScreen
          loading="lazy"
        />
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
