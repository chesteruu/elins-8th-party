
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Home, Check, ChevronLeft, UserPlus, Users, Mail, Sparkles } from 'lucide-react';
import { guestService, Guest } from '@/services/guestService';
import { useToast } from '@/hooks/use-toast';

const GuestList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', numberOfGuests: 1 });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  
  // Load guests from storage
  useEffect(() => {
    setGuests(guestService.getGuests());
  }, []);
  
  const handleAddGuest = () => {
    if (!newGuest.name) {
      toast({
        title: "Name required",
        description: "Please enter a name for the guest",
        variant: "destructive",
      });
      return;
    }
    
    const guest = guestService.addGuest({
      name: newGuest.name,
      email: newGuest.email,
      numberOfGuests: newGuest.numberOfGuests,
      confirmed: false,
      message: '',
    });
    
    setGuests([...guests, guest]);
    setNewGuest({ name: '', email: '', numberOfGuests: 1 });
    setShowAddForm(false);
    
    toast({
      title: "Guest added",
      description: "Guest has been added to the invitation list",
    });
  };
  
  const copyInvitationLink = (guest: Guest) => {
    const link = guestService.createInvitationLink(guest);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    
    toast({
      title: "Link copied!",
      description: "Invitation link has been copied to clipboard",
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const confirmedGuests = guests.filter(g => g.confirmed);
  const pendingGuests = guests.filter(g => !g.confirmed);
  const totalAttending = confirmedGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  
  return (
    <div className="min-h-screen w-full bg-gradient-radial from-background to-accent/5">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" />
            Back to invitation
          </Link>
          <h1 className="text-3xl font-bold">Guest List</h1>
          <div></div>
        </div>
        
        {/* Stats summary */}
        <div className="glass rounded-xl p-6 border border-accent/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">{guests.length}</h3>
              <p className="text-muted-foreground">Total Invited</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{confirmedGuests.length}</h3>
              <p className="text-muted-foreground">Confirmed RSVPs</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{totalAttending}</h3>
              <p className="text-muted-foreground">Total Attending</p>
            </div>
          </div>
        </div>
        
        {/* Add guest button */}
        <div className="mb-8">
          {!showAddForm ? (
            <button 
              onClick={() => setShowAddForm(true)}
              className="glass border border-accent/20 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-accent/10 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add New Guest
            </button>
          ) : (
            <div className="glass rounded-xl p-6 border border-accent/20 animate-fade-in">
              <h3 className="text-lg font-medium mb-4">Add New Guest</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={newGuest.name}
                    onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email (optional)</label>
                  <input
                    id="email"
                    type="email"
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="guests" className="block text-sm font-medium mb-1">Number of Guests</label>
                  <input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={newGuest.numberOfGuests}
                    onChange={(e) => setNewGuest({...newGuest, numberOfGuests: parseInt(e.target.value) || 1})}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddGuest}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Add Guest
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Guest lists */}
        <div className="space-y-8">
          {confirmedGuests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Confirmed Guests
              </h2>
              <div className="space-y-3">
                {confirmedGuests.map(guest => (
                  <div key={guest.id} className="glass rounded-xl p-4 border border-green-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{guest.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{guest.numberOfGuests} {guest.numberOfGuests > 1 ? 'guests' : 'guest'}</span>
                        </div>
                        {guest.message && (
                          <p className="mt-2 text-sm italic">"{guest.message}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => copyInvitationLink(guest)}
                        className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                        title="Copy invitation link"
                      >
                        {copiedId === guest.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {pendingGuests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pending RSVPs</h2>
              <div className="space-y-3">
                {pendingGuests.map(guest => (
                  <div key={guest.id} className="glass rounded-xl p-4 border border-accent/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{guest.name}</h3>
                        {guest.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{guest.email}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => copyInvitationLink(guest)}
                        className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                        title="Copy invitation link"
                      >
                        {copiedId === guest.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {guests.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-accent mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No guests yet</h3>
              <p className="text-muted-foreground mb-6">Start by adding guests to the invitation list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestList;
