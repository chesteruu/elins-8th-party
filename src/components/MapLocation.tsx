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
    <div className={cn("space-y-4", className)}>
      <div className="glass rounded-xl overflow-hidden aspect-video">
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
        className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 hover:bg-accent/10 transition-colors border border-accent/20"
      >
        <MapPin className="h-4 w-4" />
        Get Directions
      </a>
    </div>
  );
};

export default MapLocation;
