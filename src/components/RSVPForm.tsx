
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Lock, Key, CheckCircle, User, Users, MessageCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { guestService } from '@/services/guestService';

interface RSVPFormProps {
  className?: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ className }) => {
  const { toast } = useToast();
  const location = useLocation();
  const [step, setStep] = useState<'key' | 'form' | 'confirmed' | 'declined'>('key');
  const [accessKey, setAccessKey] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    guests: 0,
    message: '',
    attending: true,
  });
  const [nameReadOnly, setNameReadOnly] = useState(false);

  const correctKey = 'ELIN2025'; // In a real app, this would be stored securely

  // Parse prefilled data from URL
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      
      const nameParam = params.get('name');
      const guestsParam = params.get('guests');
      
      if (nameParam) {
        setFormData(prev => ({ ...prev, name: nameParam }));
        setNameReadOnly(true);
        // Skip key verification if name is provided in URL
        setStep('form');
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
      numberOfGuests: formData.attending ? formData.guests : 0,
      message: formData.message,
      confirmed: true,
      attending: formData.attending,
    });
    
    // Set appropriate confirmation step
    setStep(formData.attending ? 'confirmed' : 'declined');
    
    toast({
      title: "Thank you!",
      description: `Your RSVP has been ${formData.attending ? 'accepted' : 'declined'}.`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAttendingChange = (attending: boolean) => {
    setFormData(prev => ({
      ...prev,
      attending,
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
                {nameReadOnly && <span className="text-xs text-muted-foreground">(from invitation)</span>}
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={cn(
                  "w-full p-3 rounded-md border border-input", 
                  nameReadOnly ? "bg-muted cursor-not-allowed" : "bg-background"
                )}
                placeholder="Enter your name"
                required
                readOnly={nameReadOnly}
              />
            </div>
            
            {/* Attending Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Will you attend?</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleAttendingChange(true)}
                  className={cn(
                    "flex-1 p-3 rounded-md border flex items-center justify-center gap-2 transition-all",
                    formData.attending 
                      ? "bg-green-100 border-green-500 text-green-700" 
                      : "border-input hover:border-green-200 hover:bg-green-50"
                  )}
                >
                  <Check className={cn("h-5 w-5", formData.attending ? "text-green-500" : "text-muted-foreground")} />
                  Yes, I'll attend
                </button>
                <button
                  type="button"
                  onClick={() => handleAttendingChange(false)}
                  className={cn(
                    "flex-1 p-3 rounded-md border flex items-center justify-center gap-2 transition-all",
                    !formData.attending 
                      ? "bg-red-100 border-red-500 text-red-700" 
                      : "border-input hover:border-red-200 hover:bg-red-50"
                  )}
                >
                  <X className={cn("h-5 w-5", !formData.attending ? "text-red-500" : "text-muted-foreground")} />
                  Sorry, I can't
                </button>
              </div>
            </div>
            
            {formData.attending && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor="guests" className="text-sm font-medium">Number of Guests</label>
                </div>
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-md border border-input bg-background"
                  placeholder="1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Including yourself</p>
              </div>
            )}
            
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
                placeholder={formData.attending 
                  ? "Any message for the birthday girl?" 
                  : "Let us know why you can't make it (optional)"
                }
              />
            </div>
            
            <button 
              type="submit" 
              className={cn(
                "w-full text-primary-foreground rounded-md p-3 transition-colors",
                formData.attending 
                  ? "bg-primary hover:bg-primary/90" 
                  : "bg-red-500 hover:bg-red-500/90"
              )}
            >
              {formData.attending ? "Confirm Attendance" : "Confirm Absence"}
            </button>
          </form>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="glass rounded-xl p-6 text-center animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">Thank You!</h2>
          </div>
          <p className="mb-4">Your RSVP has been confirmed.</p>
          <p className="text-muted-foreground">We look forward to celebrating with you!</p>
        </div>
      )}

      {step === 'declined' && (
        <div className="glass rounded-xl p-6 text-center animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="rounded-full bg-red-100 p-3">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold">We'll Miss You!</h2>
          </div>
          <p className="mb-4">Thank you for letting us know you can't make it.</p>
          <p className="text-muted-foreground">We appreciate your response.</p>
        </div>
      )}
    </div>
  );
};

export default RSVPForm;
