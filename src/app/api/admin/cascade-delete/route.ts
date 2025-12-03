import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route for cascade deletion operations
 * This runs server-side and can access SERVICE_ROLE_KEY
 */
export async function POST(request: NextRequest) {
  try {
    const { employeeId, action, targetEmployeeId } = await request.json();

    console.log('🔑 Server-side cascade deletion:', { employeeId, action, targetEmployeeId });

    // Create admin client with SERVICE_ROLE_KEY (server-side)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Step 1: Handle workload data based on action
    if (action === 'transfer' && targetEmployeeId) {
      console.log(`📦 Transferring workloads from ${employeeId} to ${targetEmployeeId}`);
      
      const { error: workloadError } = await supabaseAdmin
        .from('workload')
        .update({ user_id: targetEmployeeId })
        .eq('user_id', employeeId);

      if (workloadError) {
        throw new Error(`Workload transfer failed: ${workloadError.message}`);
      }

    } else if (action === 'delete') {
      console.log(`🗑️ Deleting all workloads for employee: ${employeeId}`);
      
      const { error: workloadError } = await supabaseAdmin
        .from('workload')
        .delete()
        .eq('user_id', employeeId);

      if (workloadError) {
        throw new Error(`Workload deletion failed: ${workloadError.message}`);
      }
    }

    // Step 2: Handle calendar/perjalanan dinas data
    if (action === 'transfer' && targetEmployeeId) {
      console.log(`📅 Transferring calendar events from ${employeeId} to ${targetEmployeeId}`);
      
      const { error: calendarError } = await supabaseAdmin
        .from('calendar')
        .update({ user_id: targetEmployeeId })
        .eq('user_id', employeeId);

      // Calendar error is not fatal (table might not exist yet)
      if (calendarError) {
        console.warn('⚠️ Calendar transfer warning:', calendarError.message);
      }

    } else if (action === 'delete') {
      console.log(`🗑️ Deleting calendar events for employee: ${employeeId}`);
      
      const { error: calendarError } = await supabaseAdmin
        .from('calendar')
        .delete()
        .eq('user_id', employeeId);

      // Calendar error is not fatal (table might not exist yet)
      if (calendarError) {
        console.warn('⚠️ Calendar deletion warning:', calendarError.message);
      }
    }

    // Step 3: Delete employee permanently
    console.log(`👤 Deleting employee: ${employeeId}`);
    
    const { error: employeeError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', employeeId);

    if (employeeError) {
      throw new Error(`Employee deletion failed: ${employeeError.message}`);
    }

    console.log('✅ Cascade deletion completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Employee and related data successfully deleted' 
    });

  } catch (error: any) {
    console.error('❌ Cascade deletion failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}