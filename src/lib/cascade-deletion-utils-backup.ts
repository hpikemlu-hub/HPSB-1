'use client';

import { createClientSupabaseClient } from '@/lib/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

export interface DataImpact {
  workloadCount: number;
  calendarCount: number;
  totalImpact: number;
}

export interface CascadeDeletionResult {
  success: boolean;
  error?: string;
  rollbackData?: any;
}

/**
 * Get data impact analysis for employee deletion
 */
export const getEmployeeDeletionImpact = async (employeeId: string): Promise<DataImpact> => {
  const supabase = createClientSupabaseClient();
  
  try {
    // Count workloads
    const { count: workloadCount } = await supabase
      .from('workload')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', employeeId);

    // Count calendar events
    const { count: calendarCount } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', employeeId);

    return {
      workloadCount: workloadCount || 0,
      calendarCount: calendarCount || 0,
      totalImpact: (workloadCount || 0) + (calendarCount || 0)
    };
  } catch (error) {
    console.error('Error getting deletion impact:', error);
    return {
      workloadCount: 0,
      calendarCount: 0,
      totalImpact: 0
    };
  }
};

/**
 * Get all active employees except the current one for transfer selection
 */
export const getTransferTargetEmployees = async (excludeEmployeeId: string): Promise<User[]> => {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .neq('id', excludeEmployeeId)
      .order('nama_lengkap');

    if (error) {
      console.error('Error fetching transfer targets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching transfer targets:', error);
    return [];
  }
};

/**
 * Transfer workload data to another employee
 */
const transferWorkloads = async (fromEmployeeId: string, toEmployeeId: string) => {
  const supabase = createClientSupabaseClient();
  
  const { data, error } = await supabase
    .from('workload')
    .update({ 
      user_id: toEmployeeId,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', fromEmployeeId)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Delete all workload data for an employee
 */
const deleteWorkloads = async (employeeId: string) => {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('workload')
    .delete()
    .eq('user_id', employeeId);

  if (error) throw error;
};

/**
 * Delete all calendar events for an employee
 */
const deleteCalendarEvents = async (employeeId: string) => {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('creator_id', employeeId);

  if (error) throw error;
};

/**
 * Delete employee permanently from database
 */
const deleteEmployee = async (employeeId: string) => {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
};

/**
 * Create audit log for cascade deletion
 */
const createAuditLog = async (employeeData: User, action: string, details: string) => {
  const supabase = createClientSupabaseClient();
  
  const { error } = await supabase
    .from('audit_log')
    .insert({
      user_name: 'System Admin',
      action: action,
      table_name: 'users',
      record_id: employeeData.id,
      details: details,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating audit log:', error);
    // Don't throw here - audit log failure shouldn't stop the main operation
  }
};

/**
 * Main cascade deletion function
 */
export const executeCascadeDeletion = async (
  employee: User,
  action: 'transfer' | 'delete',
  targetEmployee?: User
): Promise<CascadeDeletionResult> => {
  const supabase = createClientSupabaseClient();
  let rollbackActions: Array<() => Promise<void>> = [];

  try {
    // Step 1: Validate parameters
    if (action === 'transfer' && !targetEmployee) {
      throw new Error('Target employee required for transfer operation');
    }

    // Step 2: Handle workload data
    if (action === 'transfer' && targetEmployee) {
      // Transfer workloads
      const transferredWorkloads = await transferWorkloads(employee.id, targetEmployee.id);
      
      // Add rollback action
      rollbackActions.push(async () => {
        await transferWorkloads(targetEmployee.id, employee.id);
      });

      // Create audit log for transfer
      await createAuditLog(
        employee, 
        'WORKLOAD_TRANSFER', 
        `Transferred ${transferredWorkloads?.length || 0} workloads to ${targetEmployee.nama_lengkap}`
      );

      // Show success notification
      toast.success(`Data workload berhasil dipindahkan ke ${targetEmployee.nama_lengkap}`, {
        description: `${transferredWorkloads?.length || 0} workload telah dipindahkan`,
        duration: 5000
      });

    } else {
      // Delete workloads permanently
      await deleteWorkloads(employee.id);
      
      // No rollback for delete operation
      toast.loading("Menghapus data workload...", {
        description: "Sedang memproses penghapusan data terkait"
      });
    }

    // Step 3: Handle calendar events (always delete)
    await deleteCalendarEvents(employee.id);

    // Step 4: Delete employee permanently
    await deleteEmployee(employee.id);
    
    // Add rollback action for employee restoration (recreate record)
    rollbackActions.push(async () => {
      await supabase
        .from('users')
        .insert({
          id: employee.id,
          nama_lengkap: employee.nama_lengkap,
          nip: employee.nip,
          golongan: employee.golongan,
          jabatan: employee.jabatan,
          username: employee.username,
          email: employee.email,
          role: employee.role,
          is_active: true,
          created_at: employee.created_at,
          updated_at: new Date().toISOString()
        });
    });

    // Step 5: Create final audit log
    await createAuditLog(
      employee, 
      'EMPLOYEE_DELETED', 
      `Employee permanently deleted via cascade deletion. Action: ${action}${targetEmployee ? ` to ${targetEmployee.nama_lengkap}` : ''}`
    );

    // Success notification
    toast.dismiss(); // Dismiss loading toasts
    toast.success("Pegawai berhasil dihapus permanen", {
      description: `${employee.nama_lengkap} telah dihapus dari database`,
      duration: 5000
    });

    return { success: true };

  } catch (error) {
    console.error('Cascade deletion error:', error);
    
    // Execute rollback actions in reverse order
    try {
      for (const rollback of rollbackActions.reverse()) {
        await rollback();
      }
      
      toast.error("Penghapusan dibatalkan", {
        description: "Terjadi kesalahan. Semua data telah dikembalikan ke kondisi semula.",
        duration: 5000,
        action: {
          label: "Detail",
          onClick: () => console.error('Rollback completed due to:', error)
        }
      });
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
      toast.error("Kesalahan kritis", {
        description: "Gagal mengembalikan data. Hubungi administrator sistem.",
        duration: 10000
      });
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Retry deletion function for error recovery
 */
export const retryDeletion = async (
  employee: User,
  action: 'transfer' | 'delete',
  targetEmployee?: User
): Promise<void> => {
  toast.loading("Mencoba ulang penghapusan...", {
    description: "Memproses ulang operasi penghapusan pegawai"
  });

  const result = await executeCascadeDeletion(employee, action, targetEmployee);
  
  if (!result.success) {
    toast.error("Gagal mencoba ulang", {
      description: result.error || "Operasi masih gagal. Hubungi administrator.",
      duration: 5000
    });
  }
};

/**
 * Validate deletion prerequisites
 */
export const validateDeletionPrerequisites = async (employeeId: string): Promise<{
  canDelete: boolean;
  issues: string[];
}> => {
  const issues: string[] = [];
  
  try {
    // Check if employee is admin
    const supabase = createClientSupabaseClient();
    const { data: employee } = await supabase
      .from('users')
      .select('role')
      .eq('id', employeeId)
      .single();

    if (employee?.role === 'admin') {
      // Check if this is the last admin
      const { count: adminCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('is_active', true);

      if ((adminCount || 0) <= 1) {
        issues.push('Tidak dapat menghapus admin terakhir di sistem');
      }
    }

    return {
      canDelete: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Error validating deletion prerequisites:', error);
    return {
      canDelete: false,
      issues: ['Gagal memvalidasi persyaratan penghapusan']
    };
  }
};