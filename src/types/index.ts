// Database Types
export interface User {
  id: string;
  nama_lengkap: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  username?: string; // Make optional to fix TypeScript error
  role: 'admin' | 'user';
  is_active?: boolean;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Workload {
  id: string;
  user_id: string;
  nama: string;
  type: string;
  deskripsi?: string;
  status: 'done' | 'on-progress' | 'pending';
  tgl_diterima?: string;
  tgl_deadline?: string;
  fungsi?: string;
  created_at: string;
  updated_at: string;
  user?: User; // Relation
  calendar_link?: CalendarTodo; // Linked calendar event
}

// ========================================
// CALENDAR MODULE TYPES
// ========================================

// Event Type Enum
export type EventType = 
  | 'perjalanan_dinas'
  | 'meeting'
  | 'workshop'
  | 'conference'
  | 'training'
  | 'seminar'
  | 'rapat_internal'
  | 'kunjungan'
  | 'other';

// Participant Role & Status
export type ParticipantRole = 'organizer' | 'participant' | 'observer';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

// Enhanced CalendarEvent Interface
export interface CalendarEvent {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  participants?: string[]; // Legacy field - kept for backward compatibility
  event_type?: EventType;
  is_business_trip?: boolean;
  is_all_day?: boolean;
  start_date: string;
  end_date: string;
  location?: string;
  dipa?: string;
  color?: string;
  notes?: string;
  budget_amount?: number;
  budget_source?: string;
  recurrence_rule?: string;
  parent_event_id?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  
  // Relations
  creator?: User;
  event_participants?: EventParticipant[];
  calendar_todos?: CalendarTodo[];
}

// Event Participant
export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Calendar Todo Link
export interface CalendarTodo {
  id: string;
  event_id: string;
  todo_id: string;
  auto_completed: boolean;
  auto_completed_at?: string;
  created_at: string;
  event?: CalendarEvent;
  todo?: Workload;
}

// Auto Complete Log
export interface AutoCompleteLog {
  id: string;
  event_id?: string;
  event_title: string;
  todo_ids: string[];
  todos_completed: number;
  execution_time: string;
  status: 'success' | 'partial' | 'failed';
  error_message?: string;
  details?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  details?: string;
  created_at: string;
  user?: User; // Relation
}

export interface EKinerja {
  id: string;
  tgl_surat?: string;
  no_surat?: string;
  perihal?: string;
  kepada?: string;
  jenis_surat?: string;
  tujuan?: string;
  url_dokumen?: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface WorkloadForm {
  nama: string;
  type: string;
  deskripsi?: string;
  status: 'done' | 'on-progress' | 'pending';
  tgl_diterima?: string;
  tgl_deadline?: string;
  fungsi?: string;
}

export interface UserForm {
  nama_lengkap: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
  is_active?: boolean;
}

export interface CalendarEventForm {
  // New separated category field (mapped to event_type on submit)
  category?: string;
  title: string;
  description?: string;
  participants?: string[]; // Legacy
  event_type?: EventType;
  is_business_trip?: boolean;
  is_all_day?: boolean;
  start_date: string;
  end_date: string;
  location?: string;
  dipa?: string;
  color?: string;
  notes?: string;
  budget_amount?: number;
  budget_source?: string;
  
  // New structured participants
  event_participants?: Array<{
    user_id: string;
    role: ParticipantRole;
    status?: ParticipantStatus;
  }>;
  
  // Auto-create todos for participants
  auto_create_todos?: boolean;
  todo_template?: {
    nama: string;
    type: string;
    deskripsi?: string;
    fungsi?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Password Management Types
export interface PasswordChangeRequest {
  newPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  data?: {
    user_id: string;
    user_name: string;
    updated_by: string;
    audit_id: string;
    timestamp: string;
  };
}

// Filter & Search Types
export interface WorkloadFilters {
  nama?: string;
  type?: string;
  status?: string;
  fungsi?: string;
  start_date?: string;
  end_date?: string;
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface PaginationHelpers {
  goToPage: (pageNumber: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  handleItemsPerPageChange: (newValue: number) => void;
}

// Team Tasks Types
export interface TodoItem {
  id: string;
  deskripsi: string;
  status: 'pending' | 'on-progress' | 'done';
  tgl_diterima: string;
  type: string;
  fungsi?: string;
  nama: string;
  user_id: string;
  tgl_deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface TeamMember {
  id: string;
  nama_lengkap: string;
  jabatan: string;
  departemen?: string;
  email?: string;
  phone?: string;
  todos?: TodoItem[];
}

// Dashboard Statistics
export interface DashboardStats {
  total_workload: number;
  completed_workload: number;
  in_progress_workload: number;
  pending_workload: number;
  total_users: number;
  recent_activities: AuditLog[];
  workload_by_type: Array<{
    type: string;
    count: number;
  }>;
  workload_by_status: Array<{
    status: string;
    count: number;
  }>;
}