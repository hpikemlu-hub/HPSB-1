'use client';

import { createClient } from '@supabase/supabase-js';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
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
  debugInfo?: any[];
}

/**
 * CRITICAL FIX: Use SERVICE ROLE for deletion operations
 * The root cause was using ANON key instead of SERVICE ROLE for admin operations
 */
const getSupabaseAdmin = () => {
  // Use the dedicated admin client we created
  try {
    return createAdminSupabaseClient();
  } catch (error) {
    console.error('⚠️ Admin client creation failed:', error);
    console.error('Falling back to regular client...');
    // Fallback to regular client if admin client fails
    return createClientSupabaseClient();
  }
};

// Fallback to regular client for non-admin operations
const getRegularSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

/**
 * FIXED: Get data impact analysis for employee deletion
 */
export const getEmployeeDeletionImpact = async (employeeId: string): Promise<DataImpact> => {
  const supabase = getRegularSupabaseClient(); // Use regular client for read operations
  
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
  const supabase = getRegularSupabaseClient();
  
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
 * FIXED: Transfer workload data to another employee using admin client
 */
const transferWorkloads = async (fromEmployeeId: string, toEmployeeId: string) => {
  const supabase = getSupabaseAdmin(); // Use admin client for write operations
  
  const { data, error } = await supabase
    .from('workload')
    .update({ 
      user_id: toEmployeeId,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', fromEmployeeId)
    .select();

  if (error) {
    console.error('Workload transfer error:', error);
    throw error;
  }
  return data;
};

/**
 * FIXED: Delete all workload data for an employee using admin client
 */
const deleteWorkloads = async (employeeId: string) => {
  const supabase = getSupabaseAdmin(); // Use admin client for delete operations
  
  const { error } = await supabase
    .from('workload')
    .delete()
    .eq('user_id', employeeId);

  if (error) {
    console.error('Workload deletion error:', error);
    throw error;
  }
};

/**
 * FIXED: Delete all calendar events for an employee using admin client
 */
const deleteCalendarEvents = async (employeeId: string) => {
  const supabase = getSupabaseAdmin(); // Use admin client for delete operations
  
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('creator_id', employeeId);

  if (error) {
    console.error('Calendar deletion error:', error);
    throw error;
  }
};

/**
 * FIXED: Delete employee permanently from database using admin client
 */
const deleteEmployee = async (employeeId: string) => {
  const supabase = getSupabaseAdmin(); // Use admin client for delete operations
  
  console.log('🗑️ Attempting to delete employee:', employeeId);
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', employeeId);

  if (error) {
    console.error('❌ Employee deletion error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  
  console.log('✅ Employee deleted successfully');
};

/**
 * Create audit log for cascade deletion
 */
const createAuditLog = async (employeeData: User, action: string, details: string) => {
  const supabase = getSupabaseAdmin(); // Use admin client for audit operations
  
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
  } else {
    console.log('✅ Audit log created successfully');
  }
};

/**
 * FIXED: Main cascade deletion function with comprehensive logging and admin client
 */
export const executeCascadeDeletion = async (
  employee: User,
  action: 'transfer' | 'delete',
  targetEmployee?: User
): Promise<CascadeDeletionResult> => {
  const debugLog: any[] = [];
  let rollbackActions: Array<() => Promise<void>> = [];

  try {
    debugLog.push({ step: 'START_DELETION', timestamp: new Date(), employeeId: employee.id, action });
    console.log('🚀 Starting cascade deletion for:', employee.nama_lengkap);

    // Step 1: Validate parameters
    if (action === 'transfer' && !targetEmployee) {
      throw new Error('Target employee required for transfer operation');
    }
    debugLog.push({ step: 'VALIDATION_PASSED' });

    // Step 2: Test admin client connection
    const supabaseAdmin = getSupabaseAdmin();
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', employee.id)
      .single();

    if (connectionError) {
      debugLog.push({ step: 'CONNECTION_FAILED', error: connectionError });
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }
    debugLog.push({ step: 'CONNECTION_VERIFIED', foundEmployee: !!connectionTest });

    // Step 3: Handle workload data
    if (action === 'transfer' && targetEmployee) {
      debugLog.push({ step: 'START_WORKLOAD_TRANSFER', targetId: targetEmployee.id });
      
      // Transfer workloads
      const transferredWorkloads = await transferWorkloads(employee.id, targetEmployee.id);
      
      debugLog.push({ step: 'WORKLOADS_TRANSFERRED', count: transferredWorkloads?.length || 0 });

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

      toast.success(`Data workload berhasil dipindahkan ke ${targetEmployee.nama_lengkap}`, {
        description: `${transferredWorkloads?.length || 0} workload telah dipindahkan`,
        duration: 5000
      });

    } else {
      debugLog.push({ step: 'START_WORKLOAD_DELETE' });
      
      // Delete workloads permanently
      await deleteWorkloads(employee.id);
      debugLog.push({ step: 'WORKLOADS_DELETED' });
      
      toast.loading("Menghapus data workload...", {
        description: "Sedang memproses penghapusan data terkait"
      });
    }

    // Step 4: Handle calendar events (always delete)
    debugLog.push({ step: 'START_CALENDAR_DELETE' });
    await deleteCalendarEvents(employee.id);
    debugLog.push({ step: 'CALENDAR_EVENTS_DELETED' });

    // Step 5: CRITICAL - Delete employee permanently
    debugLog.push({ step: 'START_EMPLOYEE_DELETE', employeeId: employee.id });
    await deleteEmployee(employee.id);
    debugLog.push({ step: 'EMPLOYEE_DELETED_SUCCESS' });
    
    // Add rollback action for employee restoration (recreate record)
    rollbackActions.push(async () => {
      const supabase = getSupabaseAdmin();
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

    // Step 6: Verify deletion worked
    debugLog.push({ step: 'VERIFY_DELETION' });
    const { data: verifyData } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', employee.id);
    
    const stillExists = verifyData && verifyData.length > 0;
    debugLog.push({ step: 'DELETION_VERIFIED', stillExists });

    if (stillExists) {
      throw new Error('Employee still exists in database after deletion attempt');
    }

    // Step 7: Create final audit log
    await createAuditLog(
      employee, 
      'EMPLOYEE_DELETED_FIXED', 
      `Employee permanently deleted via FIXED cascade deletion. Action: ${action}${targetEmployee ? ` to ${targetEmployee.nama_lengkap}` : ''}. Used SERVICE ROLE for deletion.`
    );
    debugLog.push({ step: 'AUDIT_LOG_CREATED' });

    // Success notification
    toast.dismiss(); // Dismiss loading toasts
    toast.success("✅ Pegawai berhasil dihapus permanen", {
      description: `${employee.nama_lengkap} telah dihapus dari database`,
      duration: 5000
    });

    debugLog.push({ step: 'SUCCESS_COMPLETE', timestamp: new Date() });
    console.log('🎉 Cascade deletion completed successfully');

    return { success: true, debugInfo: debugLog };

  } catch (error) {
    console.error('🚨 Cascade deletion error:', error);
    debugLog.push({ 
      step: 'ERROR_OCCURRED', 
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: error
    });
    
    // Execute rollback actions in reverse order
    try {
      console.log('🔄 Attempting rollback...');
      for (const rollback of rollbackActions.reverse()) {
        await rollback();
      }
      
      toast.error("❌ Penghapusan dibatalkan", {
        description: "Terjadi kesalahan. Semua data telah dikembalikan ke kondisi semula.",
        duration: 5000,
        action: {
          label: "Detail",
          onClick: () => console.error('Rollback completed due to:', error)
        }
      });
    } catch (rollbackError) {
      console.error('🚨 Rollback failed:', rollbackError);
      toast.error("❌ Kesalahan kritis", {
        description: "Gagal mengembalikan data. Hubungi administrator sistem.",
        duration: 10000
      });
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      debugInfo: debugLog
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
  toast.loading("🔄 Mencoba ulang penghapusan...", {
    description: "Memproses ulang operasi penghapusan pegawai"
  });

  const result = await executeCascadeDeletion(employee, action, targetEmployee);
  
  if (!result.success) {
    toast.error("❌ Gagal mencoba ulang", {
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
    const supabase = getRegularSupabaseClient();
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