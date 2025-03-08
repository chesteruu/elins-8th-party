
import React from 'react';
import { Calendar, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PartyDetailsProps {
  date: Date;
  arrivalNote: string;
  className?: string;
}

const PartyDetails: React.FC<PartyDetailsProps> = ({ date, arrivalNote, className }) => {
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(date, 'HH:mm'); // Changed to 24-hour format
  
  return (
    <div className={cn("space-y-4 animate-fade-in animate-delay-200", className)}>
      <div className="glass rounded-xl p-5 flex items-start gap-4">
        <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-medium mb-1">Date</h3>
          <p className="text-lg">{formattedDate}</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-5 flex items-start gap-4">
        <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-medium mb-1">Time</h3>
          <p className="text-lg">{formattedTime}</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-5 flex items-start gap-4">
        <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-medium mb-1">Note</h3>
          <p>{arrivalNote}</p>
        </div>
      </div>
    </div>
  );
};

export default PartyDetails;
