export type Role = 'owner' | 'admin' | 'specialist';
export type Status = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
export interface Entity { id: string; organization_id: string; created_at: string; archived_at: string | null }
export interface Client extends Entity { full_name: string; phone: string | null; email: string | null; birth_date: string | null; notes: string | null; vip: boolean }
export interface Service extends Entity { name: string; category: string | null; duration_minutes: number; price_minor: number; active: boolean }
export interface Staff extends Entity { display_name: string; title: string | null; phone: string | null; branch_id: string; user_id: string | null; active: boolean }
export interface Branch extends Entity { name: string; address: string | null; phone: string | null; timezone: string }
export interface Appointment { id: string; organization_id: string; client_id: string; staff_id: string; service_id: string; branch_id: string; starts_at: string; ends_at: string; price_minor: number; notes: string | null; status: Status; updated_at: string }
export interface Payment { id: string; appointment_id: string; amount_minor: number; status: 'pending' | 'paid' | 'refunded' | 'void'; method: string; paid_at: string | null; refunded_at: string | null; created_at: string }
export interface Schedule { id: string; staff_id: string; work_date: string; starts_local: string; ends_local: string }
export interface Assignment { id: string; staff_id: string; service_id: string }
export interface Member { user_id: string; role: Role }
export interface Workspace { organization: { id: string; name: string; timezone: string; currency: string }; user: { id: string; first_name: string; last_name: string | null; telegram_user_id: number }; role: Role; clients: Client[]; services: Service[]; staff: Staff[]; branches: Branch[]; appointments: Appointment[]; payments: Payment[]; schedules: Schedule[]; assignments: Assignment[]; members: Member[] }
