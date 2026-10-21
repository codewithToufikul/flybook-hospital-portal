import { Hospital, Ticket, Doctor, DashboardStats } from '../types';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.flybook.com.bd';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('hospital_portal_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(res: Response): Promise<{ success: boolean; message?: string; data?: T;[key: string]: any }> {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // --- Auth ---
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<{ token: string; hospital: Hospital }>(res);
  }

  async register(payload: any) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ token: string; hospital: Hospital }>(res);
  }

  async getMe() {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ hospital: Hospital }>(res);
  }

  // --- Dashboard Stats ---
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/stats`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ stats: DashboardStats }>(res);
  }

  // --- Tickets ---
  async getTickets(params?: { status?: string; dateFilter?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.dateFilter) query.append('dateFilter', params.dateFilter);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/api/my-hospital/portal/tickets?${query.toString()}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ count: number; tickets: Ticket[] }>(res);
  }

  async verifyTicket(identifier: string) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/tickets/verify/${encodeURIComponent(identifier)}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ ticket: Ticket }>(res);
  }

  async updateTicketStatus(ticketId: string, status: string, remarks?: string) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return this.handleResponse<{ ticket: Ticket }>(res);
  }

  // --- Doctors ---
  async getDoctors() {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/doctors`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<{ count: number; doctors: Doctor[] }>(res);
  }

  async addDoctor(payload: Partial<Doctor>) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/doctors`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ doctor: Doctor }>(res);
  }

  async updateDoctor(doctorId: string, payload: Partial<Doctor>) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/doctors/${doctorId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ doctor: Doctor }>(res);
  }

  async deleteDoctor(doctorId: string) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/doctors/${doctorId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<void>(res);
  }

  // --- Profile Settings ---
  async updateProfile(payload: Partial<Hospital>) {
    const res = await fetch(`${API_BASE}/api/my-hospital/portal/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<{ hospital: Hospital }>(res);
  }
}

export const api = new ApiService();
