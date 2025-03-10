import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Countdown from '@/components/Countdown';
import MapLocation from '@/components/MapLocation';
import PartyDetails from '@/components/PartyDetails';
import RSVPForm from '@/components/RSVPForm';
import { Cake, Star, Sparkles, CalendarCheck, UserCheck } from 'lucide-react';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  // Party details - updated to April 25, 2025 (Friday)
  const partyDate = new Date('2025-04-25T16:00:00');
  const partyAddress = 'SMASH Täby, Täby Centrum, Stora Marknadsvägen 15, 183 70 Täby';
  const arrivalNote = 'Please arrive 10 minutes earlier. The party will be around 1 hour 45 minutes long.';
  
  useEffect(() => {
    setMounted(true);
    
    // Create floating stars effect
    const createStar = () => {
      if (!mounted) return;
      
      const star = document.createElement('div');
      star.classList.add('absolute', 'text-accent', 'opacity-70', 'animate-float');
      
      // Randomize star properties
      const size = Math.random() * 20 + 10;
      const posX = Math.random() * window.innerWidth;
      const posY = Math.random() * window.innerHeight;
      const duration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      
      star.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>';
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${posX}px`;
      star.style.top = `${posY}px`;
      star.style.animationDuration = `${duration}s`;
      star.style.animationDelay = `${delay}s`;
      
      document.getElementById('stars-container')?.appendChild(star);
      
      // Remove star after animation
      setTimeout(() => {
        star.remove();
      }, (duration + delay) * 1000);
    };
    
    // Create stars periodically
    const interval = setInterval(createStar, 2000);
    // Create initial stars
    for (let i = 0; i < 10; i++) createStar();
    
    return () => clearInterval(interval);
  }, [mounted]);
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative z-10">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: 'url("/lovable-uploads/eaefef1e-c7ce-4732-a689-b36dd0736fe0.png")' }}
      ></div>
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-[2px] -z-10"></div>
      
      {/* Stars container */}
      <div id="stars-container" className="fixed inset-0 pointer-events-none z-0"></div>
      
      {/* Main content */}
      <div className="container max-w-5xl mx-auto px-4 py-10 md:py-16 relative z-10">
        <div className="flex justify-between mb-4">
          <div></div>
          <Link 
            to="/guests" 
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm hover:bg-accent/10 transition-colors border border-accent/20"
          >
            <UserCheck className="h-4 w-4" />
            <span>Manage Guest List</span>
          </Link>
        </div>
        
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <div className="flex justify-center">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium animate-fade-in mb-4">
              You're Invited!
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-[#5d4037]">
            Elin's 8<sup>th</sup> Birthday Party
          </h1>
          
          <div className="flex justify-center items-center gap-3 mb-8 animate-fade-in animate-delay-100">
            <Cake className="h-5 w-5 text-primary" />
            <span className="text-xl">Celebration Time!</span>
          </div>
          
          {/* Countdown timer */}
          <div className="mb-12">
            <h2 className="text-xl mb-6 animate-fade-in animate-delay-200">Countdown to the party</h2>
            <Countdown targetDate={partyDate} className="animate-fade-in animate-delay-300" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <MapLocation 
            address={partyAddress} 
            className="order-2 md:order-1 glass"
          />
          
          <div className="space-y-8 order-1 md:order-2">
            <div className="glass rounded-xl p-6 border border-accent/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-medium">Party Location</h2>
              </div>
              <h3 className="text-xl font-bold mb-2">SMASH Täby</h3>
              <p className="text-muted-foreground mb-4">Täby Centrum<br />Stora Marknadsvägen 15<br />183 70 Täby</p>
            </div>
            
            <PartyDetails 
              date={partyDate}
              arrivalNote={arrivalNote}
            />
          </div>
        </div>
        
        {/* RSVP Section */}
        <div className="mt-16 text-center animate-fade-in animate-delay-500">
          <div className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 mx-auto">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>We can't wait to celebrate with you!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
