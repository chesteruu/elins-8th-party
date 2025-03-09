import axios from 'axios';

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
  readonly API_BASE = '/.netlify/functions';
  readonly PASSWORD_KEY = 'elinBirthdayPassword';
  readonly PARTY_DATE = '2025-04-25';
  readonly PARTY_TIME = '16:00 -> 17:45';
  readonly PARTY_LOCATION = 'SMASH Täby, Täby Centrum';
  readonly PARTY_ADDRESS = 'Stora Marknadsvägen 15, 183 70 Täby';
  
  async getGuests(): Promise<Guest[]> {
    try {
      const response = await axios.get('/.netlify/functions/getGuests');
      // Handle both array and {data: []} formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching guests:', error);
      return [];
    }
  }
  
  async findGuestById(id: string): Promise<Guest | null> {
    try {
      const response = await axios.get(`/.netlify/functions/getGuest?id=${id}`);
      
      if (response.data && response.data.id) {
        // Return the guest data in the expected format
        return {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          numberOfGuests: response.data.numberOfGuests,
          message: response.data.message,
          confirmed: response.data.confirmed,
          attending: response.data.attending
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding guest by ID:', error);
      return null;
    }
  }
  
  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | null> {
    try {
      const response = await axios.put(`${this.API_BASE}/updateGuest?id=${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating guest:', error);
      return null;
    }
  }
  
  async addGuest(guest: Omit<Guest, 'id'>): Promise<Guest> {
    try {
      const response = await axios.post(`${this.API_BASE}/createGuest`, guest);
      return response.data;
    } catch (error) {
      console.error('Error creating guest:', error);
      throw error;
    }
  }
  
  async deleteGuest(id: string): Promise<boolean> {
    try {
      await axios.delete(`${this.API_BASE}/deleteGuest?id=${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      return false;
    }
  }
  
  async clearAllGuests(): Promise<boolean> {
    try {
      await axios.delete(`${this.API_BASE}/clearGuests`);
      return true;
    } catch (error) {
      console.error('Error clearing guests:', error);
      return false;
    }
  }
  
  // Create invitation link with pre-filled data
  createInvitationLink(guest: Partial<Guest> & { id?: string }): string {
    const baseUrl = 'https://0011.nu';
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
