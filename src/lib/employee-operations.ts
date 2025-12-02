'use client';

import { createClientSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { User } from '@/types';

/**
 * Centralized Employee Operations Library
 * Handles all CRUD operations with consistent error handling and notifications
 */

export interface EmployeeFormData {
  nama_lengkap: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  is_active?: boolean;
}

export interface EmployeeOperationResult {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

/**
 * Create new employee using API
 */
export async function createEmployee(formData: EmployeeFormData): Promise<EmployeeOperationResult> {
  try {
    console.log('🔄 Creating employee via API:', formData);
    
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_lengkap: formData.nama_lengkap,
        nip: formData.nip || null,
        golongan: formData.golongan || null,
        jabatan: formData.jabatan || null,
        username: formData.username,
        email: formData.email || null,
        role: formData.role,
        is_active: formData.is_active ?? true
      })
    });

    const result = await response.json();
    
    if (!response.ok || !result?.success) {
      console.error('❌ Employee creation failed:', result);
      toast.error(result?.error || 'Gagal membuat pegawai baru');
      return { success: false, error: result?.error };
    }

    console.log('✅ Employee created successfully:', result.data);
    toast.success(result?.message || 'Pegawai berhasil ditambahkan');
    
    return { 
      success: true, 
      data: result.data,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Create employee error:', error);
    toast.error('Terjadi kesalahan saat membuat pegawai baru');
    return { success: false, error: 'Network error' };
  }
}

/**
 * Update existing employee using API
 */
export async function updateEmployee(employeeId: string, formData: Partial<EmployeeFormData>): Promise<EmployeeOperationResult> {
  try {
    console.log('🔄 Updating employee via API:', { employeeId, formData });
    
    const response = await fetch(`/api/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama_lengkap: formData.nama_lengkap,
        nip: formData.nip || null,
        golongan: formData.golongan || null,
        jabatan: formData.jabatan || null,
        username: formData.username,
        email: formData.email || null,
        role: formData.role,
        is_active: formData.is_active ?? true,
      })
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      console.error('❌ Employee update failed:', result);
      toast.error(result?.error || 'Gagal memperbarui data pegawai');
      return { success: false, error: result?.error };
    }

    console.log('✅ Employee updated successfully:', result.data);
    toast.success(result?.message || 'Data pegawai berhasil diperbarui');
    
    return { 
      success: true, 
      data: result.data,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Update employee error:', error);
    toast.error('Terjadi kesalahan saat memperbarui data');
    return { success: false, error: 'Network error' };
  }
}

/**
 * Delete employee using API
 */
export async function deleteEmployee(employeeId: string): Promise<EmployeeOperationResult> {
  try {
    console.log('🔄 Deleting employee via API:', employeeId);
    
    const response = await fetch(`/api/employees/${employeeId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (!response.ok || !result?.success) {
      console.error('❌ Employee deletion failed:', result);
      toast.error(result?.error || 'Gagal menghapus pegawai');
      return { success: false, error: result?.error };
    }

    console.log('✅ Employee deleted successfully');
    toast.success(result?.message || 'Pegawai berhasil dihapus');
    
    return { 
      success: true,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Delete employee error:', error);
    toast.error('Terjadi kesalahan saat menghapus pegawai');
    return { success: false, error: 'Network error' };
  }
}

/**
 * Fetch all employees with real-time updates
 */
export async function fetchEmployees(showToast = false): Promise<User[]> {
  try {
    console.log('🔄 Fetching employees...');
    
    const supabase = createClientSupabaseClient();
    const { data: employees, error } = await supabase
      .from('users')
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `)
      .eq('is_active', true)
      .order('nama_lengkap', { ascending: true });

    if (error) {
      console.error('❌ Employee fetch error:', error);
      toast.error('Gagal memuat data pegawai dari database');
      throw error;
    }

    console.log('✅ Employees fetched successfully:', employees?.length || 0);
    
    if (showToast) {
      toast.success(`Berhasil memuat ${employees?.length || 0} data pegawai`);
    }
    
    return employees || [];

  } catch (error) {
    console.error('❌ Fetch employees error:', error);
    if (showToast) {
      toast.error('Terjadi kesalahan saat mengambil data pegawai');
    }
    return [];
  }
}

/**
 * Fetch single employee by ID
 */
export async function fetchEmployeeById(employeeId: string): Promise<User | null> {
  try {
    console.log('🔄 Fetching employee by ID:', employeeId);
    
    const supabase = createClientSupabaseClient();
    const { data: employee, error } = await supabase
      .from('users')
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `)
      .eq('id', employeeId)
      .single();

    if (error) {
      console.error('❌ Employee fetch by ID error:', error);
      toast.error('Gagal memuat data pegawai');
      throw error;
    }

    console.log('✅ Employee fetched by ID successfully:', employee);
    return employee;

  } catch (error) {
    console.error('❌ Fetch employee by ID error:', error);
    toast.error('Terjadi kesalahan saat memuat data pegawai');
    return null;
  }
}

/**
 * Enhanced hierarchical sorting and grouping functions
 */

// Position level detection for Indonesian government hierarchy
export function getPositionLevel(jabatan?: string): 'director' | 'coordinator' | 'staff' {
  if (!jabatan) return 'staff';
  const jabatanLower = jabatan.toLowerCase();
  
  if (jabatanLower.includes('direktur')) return 'director';
  
  // Enhanced coordinator detection with variations
  if (jabatanLower.includes('koordinator') || 
      jabatanLower.includes('koordinasi') || 
      jabatanLower.includes('koord.') ||
      jabatanLower.includes('fungsi')) return 'coordinator';
  
  return 'staff';
}

// Enhanced position detection with specific Indonesian titles
export function detectPositionType(jabatan?: string): string {
  if (!jabatan) return 'Unknown';
  
  const jabatanLower = jabatan.toLowerCase();
  
  // Director level
  if (jabatanLower.includes('direktur hukum dan perjnajian sosial budaya')) return 'Direktur';
  if (jabatanLower.includes('direktur')) return 'Direktur';
  
  // Coordinator level
  if (jabatanLower.includes('koordinator fungsi isu sosial')) return 'Koordinator Sosial';
  if (jabatanLower.includes('koordinator fungsi kebudayaan')) return 'Koordinator Budaya';
  if (jabatanLower.includes('koordinator')) return 'Koordinator';
  
  // Staff level - enhanced detection
  if (jabatanLower.includes('diplomat ahli muda')) return 'Diplomat Ahli Muda';
  if (jabatanLower.includes('diplomat ahli pertama')) return 'Diplomat Ahli Pertama';
  if (jabatanLower.includes('penata layanan oprasional')) return 'Penata Layanan';
  if (jabatanLower.includes('diplomat')) return 'Diplomat';
  if (jabatanLower.includes('penata')) return 'Penata';
  
  return 'Staff PNS';
}

// Group employees by hierarchical level
export function groupEmployeesByHierarchy(employees: User[]): {
  directors: User[];
  coordinators: User[];
  staff: User[];
} {
  const groups = {
    directors: [] as User[],
    coordinators: [] as User[],
    staff: [] as User[]
  };

  employees.forEach(employee => {
    const level = getPositionLevel(employee.jabatan);
    switch (level) {
      case 'director':
        groups.directors.push(employee);
        break;
      case 'coordinator':
        groups.coordinators.push(employee);
        break;
      default:
        groups.staff.push(employee);
        break;
    }
  });

  // Sort each group internally
  groups.directors = sortWithinLevel(groups.directors);
  groups.coordinators = sortWithinLevel(groups.coordinators);
  groups.staff = sortWithinLevel(groups.staff);

  return groups;
}

// Sort employees within the same hierarchical level
function sortWithinLevel(employees: User[]): User[] {
  return employees.sort((a, b) => {
    const golComparison = compareGolongan(a.golongan, b.golongan);
    return golComparison !== 0 ? golComparison : a.nama_lengkap.localeCompare(b.nama_lengkap);
  });
}

// Enhanced golongan comparison for PNS hierarchy with robust parsing
function compareGolongan(golA?: string, golB?: string): number {
  // Parse golongan string to extract roman numeral and letter
  const parseGolongan = (golString?: string): { roman: number; letter: number; hasLetter: boolean } => {
    if (!golString) return { roman: 0, letter: 0, hasLetter: false };
    
    const upperGol = golString.toUpperCase();
    
    // Try to find complete roman+letter patterns first (more specific patterns)
    const fullPatterns = [
      /(IV)\s*[\/\.\s\(]*\s*([A-E])/,  // IV + letter
      /(III)\s*[\/\.\s\(]*\s*([A-E])/, // III + letter  
      /(II)\s*[\/\.\s\(]*\s*([A-E])/,  // II + letter
      /\b(I)\s*[\/\.\s\(]*\s*([A-E])/ // I + letter (with word boundary)
    ];
    
    // Check for full patterns first
    for (const pattern of fullPatterns) {
      const match = upperGol.match(pattern);
      if (match && match[1] && match[2]) {
        const romanText = match[1];
        const letterText = match[2];
        
        let roman = 0;
        switch (romanText) {
          case 'IV': roman = 4; break;
          case 'III': roman = 3; break;
          case 'II': roman = 2; break;
          case 'I': roman = 1; break;
        }
        
        let letter = 0;
        switch (letterText) {
          case 'E': letter = 5; break;
          case 'D': letter = 4; break;
          case 'C': letter = 3; break;
          case 'B': letter = 2; break;
          case 'A': letter = 1; break;
        }
        
        return { roman, letter, hasLetter: true };
      }
    }
    
    // If no full pattern found, try roman-only patterns
    const romanOnlyPatterns = [
      /\b(IV)\b(?!\s*[\/\.\s\(]*\s*[A-E])/,  // IV not followed by letter
      /\b(III)\b(?!\s*[\/\.\s\(]*\s*[A-E])/, // III not followed by letter
      /\b(II)\b(?!\s*[\/\.\s\(]*\s*[A-E])/,  // II not followed by letter  
      /\b(I)\b(?!\s*[\/\.\s\(]*\s*[A-E])/    // I not followed by letter
    ];
    
    for (const pattern of romanOnlyPatterns) {
      const match = upperGol.match(pattern);
      if (match && match[1]) {
        let roman = 0;
        switch (match[1]) {
          case 'IV': roman = 4; break;
          case 'III': roman = 3; break;
          case 'II': roman = 2; break;
          case 'I': roman = 1; break;
        }
        
        return { roman, letter: 0, hasLetter: false };
      }
    }
    
    return { roman: 0, letter: 0, hasLetter: false };
  };
  
  const parsedA = parseGolongan(golA);
  const parsedB = parseGolongan(golB);
  
  // If both are unparseable, maintain original order
  if (parsedA.roman === 0 && parsedB.roman === 0) return 0;
  
  // Unparseable items go to bottom (return positive to put A after B)
  if (parsedA.roman === 0) return 1;
  if (parsedB.roman === 0) return -1;
  
  // Compare by roman first (descending: IV > III > II > I)
  if (parsedA.roman !== parsedB.roman) {
    return parsedB.roman - parsedA.roman;
  }
  
  // Within same roman level, compare by letter (descending: e > d > c > b > a)
  if (parsedA.hasLetter && parsedB.hasLetter) {
    return parsedB.letter - parsedA.letter;
  }
  
  // Items with letters come before items without letters within same roman
  if (parsedA.hasLetter && !parsedB.hasLetter) return -1;
  if (!parsedA.hasLetter && parsedB.hasLetter) return 1;
  
  // Both have no letters, consider equal at this level
  return 0;
}

/**
 * Enhanced hierarchical sorting function
 */
export function sortEmployeesByHierarchy(employees: User[]): User[] {
  return employees.sort((a, b) => {
    // Get position levels
    const levelA = getPositionLevel(a.jabatan);
    const levelB = getPositionLevel(b.jabatan);
    
    // Define priority order
    const levelPriority = { director: 1, coordinator: 2, staff: 3 };
    
    // Compare by level first
    if (levelPriority[levelA] !== levelPriority[levelB]) {
      return levelPriority[levelA] - levelPriority[levelB];
    }
    
    // Within same level, sort by golongan then name
    const golComparison = compareGolongan(a.golongan, b.golongan);
    return golComparison !== 0 ? golComparison : a.nama_lengkap.localeCompare(b.nama_lengkap);
  });
}

/**
 * Filter employees based on search criteria
 */
export function filterEmployees(
  employees: User[], 
  searchQuery: string, 
  filters: { nama?: string; jabatan?: string; golongan?: string; status?: string }
): User[] {
  let filtered = [...employees];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(emp => 
      emp.nama_lengkap.toLowerCase().includes(query) ||
      emp.nip?.toLowerCase().includes(query) ||
      emp.jabatan?.toLowerCase().includes(query) ||
      emp.golongan?.toLowerCase().includes(query) ||
      emp.username.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query)
    );
  }

  // Apply specific filters
  if (filters.jabatan && filters.jabatan !== '') {
    filtered = filtered.filter(emp => emp.jabatan === filters.jabatan);
  }
  if (filters.golongan && filters.golongan !== '') {
    filtered = filtered.filter(emp => emp.golongan === filters.golongan);
  }
  if (filters.status && filters.status !== '') {
    if (filters.status === 'active') {
      filtered = filtered.filter(emp => emp.is_active === true);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(emp => emp.is_active === false);
    }
  }

  return sortEmployeesByHierarchy(filtered);
}