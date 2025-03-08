
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
  private readonly STORAGE_KEY = 'elinBirthdayGuests';
  
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
  
  findGuestById(id: string): Guest | undefined {
    return this.getGuests().find(g => g.id === id);
  }
  
  // Create invitation link with pre-filled data
  createInvitationLink(guest: Partial<Guest>): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    
    if (guest.name) params.append('name', guest.name);
    if (guest.email) params.append('email', guest.email);
    if (guest.numberOfGuests) params.append('guests', guest.numberOfGuests.toString());
    
    return `${baseUrl}?${params.toString()}`;
  }
}

export const guestService = new GuestService();
