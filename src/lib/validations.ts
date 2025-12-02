import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Email atau username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi')
});

// User Validation Schemas
export const userSchema = z.object({
  nama_lengkap: z.string().min(1, 'Nama lengkap is required'),
  nip: z.string().optional(),
  golongan: z.string().optional(),
  jabatan: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  role: z.enum(['admin', 'user']),
  email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

// Workload Validation Schemas
export const workloadSchema = z.object({
  nama: z.string().min(1, 'Nama is required'),
  type: z.string().min(1, 'Type is required'),
  deskripsi: z.string().optional(),
  status: z.enum(['done', 'on-progress', 'pending']),
  tgl_diterima: z.string().optional(),
  fungsi: z.string().optional()
});

// Calendar Event Validation Schemas
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  participants: z.array(z.string()).optional(),
  location: z.string().optional(),
  dipa: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  color: z.string().optional()
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date']
});

// E-Kinerja Validation Schemas
export const eKinerjaSchema = z.object({
  tgl_surat: z.string().optional(),
  no_surat: z.string().optional(),
  perihal: z.string().optional(),
  kepada: z.string().optional(),
  jenis_surat: z.string().optional(),
  tujuan: z.string().optional(),
  url_dokumen: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

// Filter Validation Schemas
export const workloadFiltersSchema = z.object({
  nama: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['done', 'on-progress', 'pending']).optional(),
  fungsi: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional()
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type WorkloadFormData = z.infer<typeof workloadSchema>;
export type CalendarEventFormData = z.infer<typeof calendarEventSchema>;
export type EKinerjaFormData = z.infer<typeof eKinerjaSchema>;
export type WorkloadFiltersData = z.infer<typeof workloadFiltersSchema>;