/**
 * Employee API Integration Layer
 * Centralized API calls for employee CRUD operations
 */

import type { User, UserForm, ApiResponse } from '@/types';

// Base API configuration
const API_BASE = '/api/employees';

/**
 * Employee API Service Class
 */
export class EmployeeAPI {
  /**
   * Fetch all employees with optional filters
   */
  static async getAll(filters?: {
    role?: 'admin' | 'user';
    active?: boolean;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.role) params.append('role', filters.role);
      if (filters?.active !== undefined) params.append('active', filters.active.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to fetch employees',
        };
      }

      return {
        data: result.data,
        message: `Loaded ${result.count} employees`,
      };
    } catch (error) {
      console.error('Employee fetch error:', error);
      return {
        error: 'Network error occurred while fetching employees',
      };
    }
  }

  /**
   * Get specific employee by ID
   */
  static async getById(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to fetch employee',
        };
      }

      return {
        data: result.data,
      };
    } catch (error) {
      console.error('Employee fetch error:', error);
      return {
        error: 'Network error occurred while fetching employee',
      };
    }
  }

  /**
   * Create new employee
   */
  static async create(employeeData: UserForm): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to create employee',
        };
      }

      return {
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      console.error('Employee creation error:', error);
      return {
        error: 'Network error occurred while creating employee',
      };
    }
  }

  /**
   * Update existing employee
   */
  static async update(id: string, employeeData: Partial<UserForm>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to update employee',
        };
      }

      return {
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      console.error('Employee update error:', error);
      return {
        error: 'Network error occurred while updating employee',
      };
    }
  }

  /**
   * Delete employee (simple delete)
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to delete employee',
        };
      }

      return {
        message: result.message,
      };
    } catch (error) {
      console.error('Employee deletion error:', error);
      return {
        error: 'Network error occurred while deleting employee',
      };
    }
  }

  /**
   * Cascade delete employee with data handling options
   */
  static async cascadeDelete(
    employeeId: string,
    action: 'delete' | 'transfer',
    targetEmployeeId?: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await fetch('/api/admin/cascade-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          action,
          targetEmployeeId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to cascade delete employee',
        };
      }

      return {
        message: result.message,
      };
    } catch (error) {
      console.error('Employee cascade deletion error:', error);
      return {
        error: 'Network error occurred while cascade deleting employee',
      };
    }
  }

  /**
   * Validate employee data (username, NIP, email uniqueness)
   */
  static async validate(data: {
    username?: string;
    nip?: string;
    email?: string;
    excludeId?: string;
  }): Promise<ApiResponse<{
    valid: boolean;
    errors: { [key: string]: string };
  }>> {
    try {
      const response = await fetch(`${API_BASE}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: result.error || 'Failed to validate employee data',
        };
      }

      return {
        data: result.data,
      };
    } catch (error) {
      console.error('Employee validation error:', error);
      return {
        error: 'Network error occurred while validating employee data',
      };
    }
  }
}

/**
 * Helper hooks for React components
 */

// Custom hook for employee operations
export function useEmployeeAPI() {
  return {
    getAll: EmployeeAPI.getAll,
    getById: EmployeeAPI.getById,
    create: EmployeeAPI.create,
    update: EmployeeAPI.update,
    delete: EmployeeAPI.delete,
    cascadeDelete: EmployeeAPI.cascadeDelete,
    validate: EmployeeAPI.validate,
  };
}

/**
 * Type-safe employee data transformers
 */
export class EmployeeTransforms {
  /**
   * Transform User to UserForm for editing
   */
  static toForm(user: User): UserForm {
    return {
      nama_lengkap: user.nama_lengkap,
      nip: user.nip || '',
      golongan: user.golongan || '',
      jabatan: user.jabatan || '',
      username: user.username || '',
      role: user.role,
      email: user.email || '',
      is_active: user.is_active ?? true,
    };
  }

  /**
   * Clean form data before submission (remove empty strings, handle admin fields)
   */
  static cleanFormData(formData: UserForm): UserForm {
    const cleaned = { ...formData };

    // Convert empty strings to undefined for optional fields
    if (cleaned.nip === '') cleaned.nip = undefined;
    if (cleaned.golongan === '') cleaned.golongan = undefined;
    if (cleaned.jabatan === '') cleaned.jabatan = undefined;
    if (cleaned.email === '') cleaned.email = undefined;

    // Ensure admin accounts don't have government fields
    if (cleaned.role === 'admin') {
      cleaned.nip = undefined;
      cleaned.golongan = undefined;
      cleaned.jabatan = undefined;
    }

    return cleaned;
  }
}

/**
 * Export default API instance
 */
export default EmployeeAPI;