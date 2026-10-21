export interface Hospital {
  _id: string;
  name: string;
  code: string;
  adminName?: string;
  adminEmail?: string;
  email: string;
  phone?: string;
  emergencyPhone?: string;
  city?: string;
  address?: string;
  departments: string[];
  defaultDiscountPercent: number;
  licenseNumber?: string;
  status: 'pending' | 'approved' | 'suspended';
  isActive: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketStatus = 'issued' | 'confirmed' | 'arrived' | 'completed' | 'cancelled';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  conversationId?: string;
  userId: string;
  userName: string;
  userPhone: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  serialNumber?: number;
  regularFee: number;
  discountPercent: number;
  discountAmount: number;
  finalFee: number;
  status: TicketStatus;
  pdfUrl?: string;
  hospitalRemarks?: string;
  arrivedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Doctor {
  _id: string;
  hospitalId: string;
  hospitalName?: string;
  name: string;
  specialty: string;
  qualification: string;
  department: string;
  regularFee: number;
  discountedFee: number;
  discountPercent: number;
  experience?: string;
  visitingHours?: string;
  visitingDays?: string[] | string;
  roomNumber?: string;
  photoUrl?: string;
  bio?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalTickets: number;
  todayTicketsCount: number;
  completedCount: number;
  activeCount: number;
  arrivedCount: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  doctorCount: number;
  recentTickets: Ticket[];
}

export interface IncomingTicketNotification {
  id: string;
  ticket: Ticket;
  message: string;
  timestamp: string;
  read: boolean;
}
