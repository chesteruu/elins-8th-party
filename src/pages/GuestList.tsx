import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Home, Check, ChevronLeft, UserPlus, Users, Mail, Sparkles, X, Send, Trash2, RefreshCw } from 'lucide-react';
import { guestService, Guest } from '@/services/guestService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const GuestList = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState({ name: '', email: '', numberOfGuests: 1 });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [emailSubject, setEmailSubject] = useState("🎂 Elin's 8th Birthday Party! 🎈");
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Email template
  const getEmailTemplate = (guestName: string, rsvpLink: string) => {
    return `
🎂 Elin's 8th Birthday Party! 🎈

Dear ${guestName},

You're invited to a fun-filled celebration for Elin's 8th birthday! 🎊 Come join us for an unforgettable day of games, laughter, and sweet treats!

📅 Date: Friday, April 25, 2025
⏰ Time: 16:00 (Please arrive 10 minutes earlier! ⏳)
📍 Location: SMASH Täby, Täby Centrum
📍 Address: Stora Marknadsvägen 15, 183 70 Täby

🎠 Get ready for a day of fun activities, yummy snacks, and birthday surprises!

RSVP: Please confirm your attendance by clicking the link: ${rsvpLink}

We can't wait to celebrate with you! 🎉🎁✨
    `;
  };
  
  // Load guests from storage
  const loadGuests = async () => {
    setLoading(true);
    try {
      // Initialize default password if needed
      if (!guestService.getPassword()) {
        guestService.setPassword('2025042808');
      }
      
      if (!showPasswordDialog) {
        const loadedGuests = await guestService.getGuests();
        setGuests(loadedGuests);
      }
    } catch (error) {
      console.error('Error loading guests:', error);
      toast({
        title: "Error",
        description: "Failed to load guest list",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadGuests();
  }, []);
  
  const handlePasswordSubmit = () => {
    if (guestService.verifyPassword(password)) {
      setShowPasswordDialog(false);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };
  
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
      attending: null,
    });
    
    setGuests([...guests, guest]);
    setNewGuest({ name: '', email: '', numberOfGuests: 1 });
    setShowAddForm(false);
    
    toast({
      title: "Guest added",
      description: "Guest has been added to the invitation list",
    });
  };
  
  const copyInvitationTemplate = async (guest: Guest) => {
    const template = guestService.createInvitationTemplate(guest);
    await navigator.clipboard.writeText(template);
    setCopiedId(guest.id);
    
    toast({
      title: "Invitation copied!",
      description: "Full invitation template has been copied to clipboard",
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const openEmailForm = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowEmailForm(true);
  };
  
  const sendEmail = () => {
    if (!selectedGuest) return;
    
    // In a real application, this would call an API to send the email
    const link = guestService.createInvitationLink(selectedGuest);
    const emailContent = getEmailTemplate(selectedGuest.name, link);
    
    // For demo purposes, we'll just open the default email client
    const mailtoLink = `mailto:${selectedGuest.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;
    window.open(mailtoLink);
    
    setShowEmailForm(false);
    setSelectedGuest(null);
    
    toast({
      title: "Email ready!",
      description: "Your default email client has been opened with the invitation",
    });
  };
  
  const clearAllGuests = () => {
    guestService.clearAllGuests();
    setGuests([]);
    setShowClearConfirmation(false);
    
    toast({
      title: "Guest list cleared",
      description: "All guests have been removed from the list",
    });
  };
  
  const confirmDeleteGuest = (guest: Guest) => {
    setGuestToDelete(guest);
    setShowDeleteConfirmation(true);
  };
  
  const deleteGuest = () => {
    if (!guestToDelete) return;
    
    const updatedGuests = guests.filter(g => g.id !== guestToDelete.id);
    localStorage.setItem(guestService.STORAGE_KEY, JSON.stringify(updatedGuests));
    setGuests(updatedGuests);
    setShowDeleteConfirmation(false);
    setGuestToDelete(null);
    
    toast({
      title: "Guest deleted",
      description: `${guestToDelete.name} has been removed from the guest list`,
    });
  };
  
  const attendingGuests = guests.filter(g => g.confirmed && g.attending === true);
  const decliningGuests = guests.filter(g => g.confirmed && g.attending === false);
  const pendingGuests = guests.filter(g => !g.confirmed || g.attending === null);
  const totalAttending = attendingGuests.reduce((sum, g) => sum + g.numberOfGuests, 0);
  
  const handleDeleteGuest = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      const success = await guestService.deleteGuest(id);
      if (success) {
        toast({
          title: "Success",
          description: "Invitation deleted successfully",
        });
        loadGuests(); // Refresh the list
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL invitations? This cannot be undone!')) {
      const success = await guestService.clearAllGuests();
      if (success) {
        toast({
          title: "Success",
          description: "All invitations have been deleted",
        });
        loadGuests(); // Refresh the list
      }
    }
  };
  
  if (showPasswordDialog) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
        <div className="glass rounded-xl p-8 border border-accent/20 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Password Required</h2>
          <p className="mb-6 text-center text-muted-foreground">
            Please enter the password to access the guest list management page.
          </p>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="w-full"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Button>
              <Button onClick={handlePasswordSubmit}>
                Access Guest List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-primary hover:underline">
            <ChevronLeft className="h-4 w-4" />
            Back to invitation
          </Link>
          <h1 className="text-3xl font-bold">Guest List</h1>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={loadGuests}
              disabled={loading}
            >
              <RefreshCw className={cn(
                "h-4 w-4 mr-2",
                loading && "animate-spin"
              )} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={loading || guests.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Stats summary */}
        <div className="glass rounded-xl p-6 border border-accent/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">{guests.length}</h3>
              <p className="text-muted-foreground">Total Invited</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{attendingGuests.length}</h3>
              <p className="text-muted-foreground">Attending</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{decliningGuests.length}</h3>
              <p className="text-muted-foreground">Not Attending</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{totalAttending}</h3>
              <p className="text-muted-foreground">Total Guests</p>
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
        
        {/* Email invitation form */}
        {showEmailForm && selectedGuest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-xl p-6 border border-accent/20 max-w-2xl w-full">
              <h3 className="text-lg font-medium mb-4">Send Invitation Email</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">To:</p>
                  <p>{selectedGuest.name} &lt;{selectedGuest.email}&gt;</p>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="body" className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    id="body"
                    value={getEmailTemplate(selectedGuest.name, guestService.createInvitationLink(selectedGuest))}
                    readOnly
                    className="w-full p-2 rounded-md border border-input bg-muted font-mono text-sm h-64 overflow-auto whitespace-pre-wrap"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowEmailForm(false)}
                    className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={sendEmail}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Clear confirmation dialog */}
        <Dialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Guest List</DialogTitle>
              <DialogDescription>
                Are you sure you want to clear the entire guest list? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                Yes, Clear List
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete confirmation dialog */}
        <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Guest</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {guestToDelete?.name} from the guest list? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirmation(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteGuest}>
                Delete Guest
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Guest lists */}
        <div className="space-y-8">
          {attendingGuests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Attending
              </h2>
              <div className="space-y-3">
                {attendingGuests.map(guest => (
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
                      <div className="flex items-center gap-2">
                        {guest.email && (
                          <button
                            onClick={() => openEmailForm(guest)}
                            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                            title="Send email invitation"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => copyInvitationTemplate(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                          title="Copy invitation template"
                        >
                          {copiedId === guest.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => confirmDeleteGuest(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors text-red-500"
                          title="Delete guest"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {decliningGuests.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <X className="h-5 w-5 text-red-500" />
                Not Attending
              </h2>
              <div className="space-y-3">
                {decliningGuests.map(guest => (
                  <div key={guest.id} className="glass rounded-xl p-4 border border-red-500/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{guest.name}</h3>
                        {guest.message && (
                          <p className="mt-2 text-sm italic">"{guest.message}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {guest.email && (
                          <button
                            onClick={() => openEmailForm(guest)}
                            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                            title="Send email invitation"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => copyInvitationTemplate(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                          title="Copy invitation template"
                        >
                          {copiedId === guest.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => confirmDeleteGuest(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors text-red-500"
                          title="Delete guest"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
                      <div className="flex items-center gap-2">
                        {guest.email && (
                          <button
                            onClick={() => openEmailForm(guest)}
                            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                            title="Send email invitation"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => copyInvitationTemplate(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors"
                          title="Copy invitation template"
                        >
                          {copiedId === guest.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => confirmDeleteGuest(guest)}
                          className="p-2 rounded-full hover:bg-accent/10 transition-colors text-red-500"
                          title="Delete guest"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {guests.length === 0 && !loading && (
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
