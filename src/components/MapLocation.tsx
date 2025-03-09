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
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}`;
  
  return (
    <div className={cn("w-full h-full flex flex-col space-y-4", className)}>
      <div className="glass rounded-xl overflow-hidden w-full flex-1">
        <iframe
          title="Party Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
      </div>
      
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 glass rounded-full px-6 py-3 text-base hover:bg-accent/10 transition-colors border border-accent/20"
      >
        <MapPin className="h-5 w-5" />
        Get Directions
      </a>
    </div>
  );
};

export default MapLocation;
