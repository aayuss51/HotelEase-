export type UserRole = 'ADMIN' | 'GUEST' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Facility {
  id: string;
  name: string;
  icon: string; // Name of the icon
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  totalStock: number;
  facilityIds: string[];
  imageUrl: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  roomId: string;
  userId: string; // Guest ID
  guestName: string;
  checkIn: string; // ISO Date string YYYY-MM-DD
  checkOut: string; // ISO Date string YYYY-MM-DD
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface DashboardStats {
  newBookings24h: number;
  upcomingBookings: number;
  availableRoomsToday: number;
  occupiedRoomsToday: number;
  checkingOutToday: number;
}