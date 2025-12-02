// App Constants
export const APP_NAME = 'Workload HPI Sosbud';
export const APP_DESCRIPTION = 'Sistem Manajemen Workload Direktorat Hukum dan Perjanjian Sosial Budaya';

// Workload Types
export const WORKLOAD_TYPES = [
  'Rapat / Perundingan',
  'Tanggapan',
  'Persiapan Kegiatan',
  'Administrasi',
  'Side Job'
] as const;

// Workload Status
export const WORKLOAD_STATUS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'on-progress', label: 'On Progress', color: 'bg-blue-500' },
  { value: 'done', label: 'Done', color: 'bg-green-500' }
] as const;

// Fungsi (Organizational Functions)
export const FUNGSI_OPTIONS = [
  'SOSTERASI',
  'PENISETAN',
  'HPIKSP',
  'BUTEK',
  'NON FUNGSI'
] as const;

// User Roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' }
] as const;

// Golongan Options
export const GOLONGAN_OPTIONS = [
  'IV/a', 'IV/b', 'IV/c', 'IV/d',
  'III/a', 'III/b', 'III/c', 'III/d',
  'II/a', 'II/b', 'II/c', 'II/d',
  'I/a', 'I/b', 'I/c', 'I/d'
] as const;

// Jabatan Options
export const JABATAN_OPTIONS = [
  'Direktur',
  'Koordinator',
  'Kepala Sub Bagian',
  'Analis Kebijakan',
  'Perancang Peraturan Perundang-undangan',
  'Pranata Hukum'
] as const;

// Calendar Colors
export const CALENDAR_COLORS = [
  { value: '#0d6efd', label: 'Blue' },
  { value: '#198754', label: 'Green' },
  { value: '#dc3545', label: 'Red' },
  { value: '#fd7e14', label: 'Orange' },
  { value: '#6f42c1', label: 'Purple' },
  { value: '#20c997', label: 'Teal' }
] as const;

// E-Kinerja Document Types
export const JENIS_SURAT_OPTIONS = [
  'Surat Dinas',
  'Nota Dinas',
  'Memorandum',
  'Surat Tugas',
  'Surat Undangan',
  'Lainnya'
] as const;

// Audit Actions
export const AUDIT_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT'
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 15,
  PAGE_SIZE_OPTIONS: [15, 35, 50, 100]
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm:ss'
} as const;