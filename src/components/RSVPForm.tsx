
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { User, Users, MessageCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { guestService, Guest } from '@/services/guestService';

interface RSVPFormProps {
  className?: string;
}

const RSVPForm: React.FC<RSVPFormProps> = ({ className }) => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'confirmed' | 'declined'>('form');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    guests: 1,
    message: '',
    attending: true,
  });
  const [nameReadOnly, setNameReadOnly] = useState(false);
  const [existingGuest, setExistingGuest] = useState<Guest | null>(null);
  const [validLink, setValidLink] = useState(false);

  console.log("Current location:", location.pathname, location.search);

  // Parse prefilled data from URL and validate the link
  useEffect(() => {
    if (location.search) {
      const params = new URLSearchParams(location.search);
      
      const idParam = params.get('id');
      const nameParam = params.get('name');
      const guestsParam = params.get('guests');
      
      console.log("URL Parameters:", { idParam, nameParam, guestsParam });
      
      // Initialize with invalid link assumption
      let isValidLink = false;
      let guestData: any = {};
      
      if (idParam) {
        // Try to find existing guest by ID
        const guest = guestService.findGuestById(idParam);
        console.log("Looking for guest with ID:", idParam);
        console.log("Found guest:", guest);
        
        if (guest) {
          setExistingGuest(guest);
          guestData = {
            id: guest.id,
            name: guest.name,
            guests: guest.numberOfGuests || 1,
            message: guest.message || '',
            attending: guest.attending === false ? false : true,
          };
          setNameReadOnly(true);
          isValidLink = true; // Valid if guest exists
        }
      } else if (nameParam) {
        // If no ID but has name, this is from a valid invite
        guestData = { name: nameParam };
        setNameReadOnly(true);
        
        if (guestsParam) {
          const guestCount = parseInt(guestsParam);
          if (!isNaN(guestCount)) {
            guestData = { ...guestData, guests: guestCount };
          }
        }
        
        isValidLink = true; // Valid if it has name parameter
      }
      
      if (isValidLink) {
        console.log("Valid link detected, setting form data:", guestData);
        setFormData(prev => ({ ...prev, ...guestData }));
        setValidLink(true);
      } else {
        // Invalid link
        console.log("Invalid link detected");
        toast({
          title: "Invalid invitation link",
          description: "This link appears to be invalid or expired.",
          variant: "destructive",
        });
        navigate('/');
      }
    } else {
      // If no URL parameters, redirect to home page
      console.log("No URL parameters, redirecting to home");
      navigate('/');
    }
  }, [location.search, navigate, toast]);

  const handleAttendingChange = (attending: boolean) => {
    setFormData(prev => ({
      ...prev,
      attending,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 0 : value,
    }));
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If guest already exists, update it
    if (existingGuest) {
      console.log("Updating existing guest:", existingGuest.id);
      const updatedGuest = guestService.updateGuest(existingGuest.id, {
        numberOfGuests: formData.attending ? formData.guests : 0,
        message: formData.message,
        confirmed: true,
        attending: formData.attending,
      });
      console.log("Updated guest result:", updatedGuest);
      
      toast({
        title: "Thank you!",
        description: `Your attendance status has been updated.`,
      });
    } else {
      // Save new RSVP data
      console.log("Adding new guest:", formData.name);
      const newGuest = guestService.addGuest({
        name: formData.name,
        numberOfGuests: formData.attending ? formData.guests : 0,
        message: formData.message,
        confirmed: true,
        attending: formData.attending,
      });
      console.log("New guest added:", newGuest);
      
      toast({
        title: "Thank you!",
        description: `Your attendance has been ${formData.attending ? 'confirmed' : 'declined'}.`,
      });
    }
    
    // Set appropriate confirmation step
    setStep(formData.attending ? 'confirmed' : 'declined');
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  // If the link is invalid, don't render the form at all
  if (!validLink) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {step === 'form' && (
        <div className="glass rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Check className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Confirm Your Attendance</h2>
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
              {existingGuest 
                ? "Update Attendance" 
                : formData.attending ? "Confirm Attendance" : "Confirm Absence"}
            </button>
          </form>
        </div>
      )}

      {step === 'confirmed' && (
        <div className="glass rounded-xl p-6 text-center animate-fade-in">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold">Thank You!</h2>
          </div>
          <p className="mb-4">Your attendance has been confirmed.</p>
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
