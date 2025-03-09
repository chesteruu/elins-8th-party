import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapLocationProps {
  address: string;
  className?: string;
}

const MapLocation = ({ address, className }: MapLocationProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-accent/20 glass h-full flex flex-col", 
      className
    )}>
      <iframe
        title="Party Location"
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(address)}`}
        className="w-full flex-grow min-h-[300px] rounded-xl"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 px-4 py-2 rounded-full 
          bg-red-500/40 hover:bg-red-500/60 
          text-white font-medium 
          backdrop-blur-sm 
          transition-colors 
          flex items-center gap-2 
          shadow-lg"
      >
        <MapPin className="h-4 w-4" />
        Get Directions
      </a>
    </div>
  );
};

export default MapLocation;
