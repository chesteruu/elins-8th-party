
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: Date;
  className?: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, className }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);
  
  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ];

  return (
    <div className={cn("flex flex-wrap justify-center gap-4 md:gap-6", className)}>
      {timeUnits.map((unit, index) => (
        <div 
          key={unit.label} 
          className="flex flex-col items-center glass rounded-lg px-3 py-2 md:px-6 md:py-4 animate-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <span className="text-2xl md:text-4xl font-bold">{String(unit.value).padStart(2, '0')}</span>
          <span className="text-xs md:text-sm font-medium text-muted-foreground">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
