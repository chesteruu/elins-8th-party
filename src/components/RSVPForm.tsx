
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Lock, Key, CheckCircle, User, Users, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { guestService } from '@/services/guestService';

interface RSVPFormProps {
  className?: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ className }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [step, setStep] = useState<'key' | 'form' | 'confirmed'>('key');
  const [accessKey, setAccessKey] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    guests: 0,
    message: '',
  });

  const correctKey = 'ELIN2025'; // In a real app, this would be stored securely

  // Parse prefilled data from URL
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      
      const nameParam = params.get('name');
      const guestsParam = params.get('guests');
      
      if (nameParam) {
        setFormData(prev => ({ ...prev, name: nameParam }));
      }
      
      if (guestsParam) {
        const guestCount = parseInt(guestsParam);
        if (!isNaN(guestCount)) {
          setFormData(prev => ({ ...prev, guests: guestCount }));
        }
      }
    }
  }, [location.search]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessKey.trim().toUpperCase() === correctKey) {
      setStep('form');
      toast({
        title: "Success!",
        description: "Key verified. You can now RSVP.",
      });
    } else {
      toast({
        title: "Invalid key",
        description: "Please check your invitation for the correct key.",
        variant: "destructive",
      });
    }
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save RSVP data
    guestService.addGuest({
      name: formData.name,
      numberOfGuests: formData.guests,
      message: formData.message,
      confirmed: true,
    });
    
    setStep('confirmed');
    toast({
      title: "Thank you!",
      description: "Your RSVP has been received.",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className={cn("w-full", className)}>
      {step === 'key' && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">RSVP Access</h2>
          </div>
          <p className="mb-4 text-muted-foreground">Please enter the invitation key to RSVP.</p>
          
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="access-key" className="text-sm font-medium">Invitation Key</label>
              </div>
              <input
                id="access-key"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="Enter your key"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground rounded-md p-3 hover:bg-primary/90 transition-colors"
            >
              Verify Key
            </button>
          </form>
        </div>
      )}

      {step === 'form' && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">RSVP to the Party</h2>
          </div>
          
          <form onSubmit={handleRSVPSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="name" className="text-sm font-medium">Your Name</label>
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="guests" className="text-sm font-medium">Number of Guests</label>
              </div>
              <input
                id="guests"
                name="guests"
                type="number"
                min="0"
                max="3"
                value={formData.guests}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border border-input bg-background"
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Including yourself</p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="message" className="text-sm font-medium">Message (Optional)</label>
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-3 rounded-md border border-input bg-background min-h-[100px]"
                placeholder="Any message for the birthday girl?"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground rounded-md p-3 hover:bg-primary/90 transition-colors"
            >
              Submit RSVP
            </button>
          </form>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="glass rounded-xl p-6 text-center animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Thank You!</h2>
          </div>
          <p className="mb-4">Your RSVP has been confirmed.</p>
          <p className="text-muted-foreground">We look forward to celebrating with you!</p>
        </div>
      )}
    </div>
  );
};

export default RSVPForm;
