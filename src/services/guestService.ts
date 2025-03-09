
export interface Guest {
  id: string;
  name: string;
  email?: string;
  numberOfGuests: number;
  message?: string;
  confirmed: boolean;
  attending?: boolean | null; // true for attending, false for not attending, null for unconfirmed
}

// In a real app, this would use a database. Using localStorage for demo purposes
class GuestService {
  readonly STORAGE_KEY = 'elinBirthdayGuests';
  readonly PASSWORD_KEY = 'elinBirthdayPassword';
  readonly PARTY_DATE = '2025-04-25';
  readonly PARTY_TIME = '16:00 -> 17:45';
  readonly PARTY_LOCATION = 'SMASH Täby, Täby Centrum';
  readonly PARTY_ADDRESS = 'Stora Marknadsvägen 15, 183 70 Täby';
  
  getGuests(): Guest[] {
    const storedGuests = localStorage.getItem(this.STORAGE_KEY);
    return storedGuests ? JSON.parse(storedGuests) : [];
  }
  
  addGuest(guest: Omit<Guest, 'id'>): Guest {
    const guests = this.getGuests();
    const newGuest = {
      ...guest,
      id: crypto.randomUUID(),
    };
    
    guests.push(newGuest);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guests));
    return newGuest;
  }
  
  updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === id);
    
    if (index === -1) return null;
    
    const updatedGuest = { ...guests[index], ...updates };
    guests[index] = updatedGuest;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(guests));
    
    return updatedGuest;
  }
  
  deleteGuest(id: string): boolean {
    const guests = this.getGuests();
    const filteredGuests = guests.filter(g => g.id !== id);
    
    if (filteredGuests.length === guests.length) {
      return false; // No guest was removed
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGuests));
    return true;
  }
  
  findGuestById(id: string): Guest | undefined {
    const guests = this.getGuests();
    console.log("Finding guest by ID:", id);
    console.log("All guests in storage:", guests);
    
    const guest = guests.find(g => g.id === id);
    console.log("Found guest:", guest);
    return guest;
  }
  
  // Create invitation link with pre-filled data
  createInvitationLink(guest: Partial<Guest> & { id?: string }): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    if (guest.id) {
      // If guest has an ID, this is an existing guest, use that for updating
      params.append('id', guest.id);
    } else {
      // For new guests, include name and number of guests
      if (guest.name) params.append('name', guest.name);
      if (guest.numberOfGuests) params.append('guests', guest.numberOfGuests.toString());
    }
    
    return `${baseUrl}/rsvp?${params.toString()}`;
  }
  
  // Generate full invitation template with guest details
  createInvitationTemplate(guest: Partial<Guest>): string {
    const link = this.createInvitationLink(guest);
    const name = guest.name || "Friend";
    
    return `🎂 Elin's 8th Birthday Party! 🎈

You're invited to a fun-filled celebration for Elin's 8th birthday! 🎊 Come join us for an unforgettable day of games, laughter, and sweet treats!

📅 Date: Friday, April 25, 2025
⏰ Time: ${this.PARTY_TIME} (Please arrive 10 minutes earlier! ⏳)
📍 Location: ${this.PARTY_LOCATION}
📍 Address: ${this.PARTY_ADDRESS}

🎠 Get ready for a day of fun activities, yummy snacks, and birthday surprises!

RSVP: Please confirm your attendance by clicking the link: ${link}

We can't wait to celebrate with you! 🎉🎁✨`;
  }
  
  // Clear all guests
  clearAllGuests(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Password protection methods
  setPassword(password: string): void {
    localStorage.setItem(this.PASSWORD_KEY, password);
  }
  
  getPassword(): string | null {
    return localStorage.getItem(this.PASSWORD_KEY);
  }
  
  verifyPassword(password: string): boolean {
    const storedPassword = this.getPassword();
    if (!storedPassword) {
      // Set default password if none exists
      this.setPassword("2025042808");
      return password === "2025042808";
    }
    return password === storedPassword;
  }
}

export const guestService = new GuestService();
