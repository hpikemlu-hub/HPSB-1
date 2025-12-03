import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Individual Employee API Routes
 * Handles GET, PUT, DELETE operations for specific employee
 */

// Create admin client for server-side operations
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * GET /api/employees/[id] - Get specific employee
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: employee, error } = await supabase
      .from('users')
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Employee fetch error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Pegawai tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees/[id] - Update specific employee
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🚀 API ROUTE /api/employees/[id] PUT - REQUEST RECEIVED');
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🆔 Employee ID from params:', id);
    console.log('📄 Request body received:', body);
    
    const {
      nama_lengkap,
      nip,
      golongan,
      jabatan,
      username,
      email,
      role,
      is_active
    } = body;
    
    console.log('📋 Extracted fields:', {
      nama_lengkap, nip, golongan, jabatan, username, email, role, is_active
    });

    // Validate required fields
    if (!nama_lengkap || !username) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap dan username harus diisi' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if employee exists first
    const { data: existingEmployee, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Pegawai tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // Prepare update data - admin field restrictions handled by database trigger
    const updateData = {
      nama_lengkap,
      nip: role === 'admin' ? null : nip, // Extra safety, but trigger will handle this
      golongan: role === 'admin' ? null : golongan,
      jabatan: role === 'admin' ? null : jabatan,
      username,
      email,
      role,
      is_active,
      updated_at: new Date().toISOString()
    };
    
    console.log('📦 Update data prepared:', updateData);
    console.log('🔄 Executing UPDATE query to Supabase...');

    const { data: updatedEmployee, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `)
      .single();

    if (error) {
      console.error('❌ SUPABASE UPDATE ERROR:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.message.includes('users_username_key')) {
          return NextResponse.json(
            { success: false, error: 'Username sudah digunakan oleh pegawai lain' },
            { status: 400 }
          );
        }
        if (error.message.includes('users_nip_key')) {
          return NextResponse.json(
            { success: false, error: 'NIP sudah terdaftar untuk pegawai lain' },
            { status: 400 }
          );
        }
        if (error.message.includes('users_email_key')) {
          return NextResponse.json(
            { success: false, error: 'Email sudah terdaftar untuk pegawai lain' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ SUPABASE UPDATE SUCCESS!');
    console.log('✅ Updated employee data:', updatedEmployee);
    console.log('🎉 Sending success response to frontend...');
    
    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: `Data pegawai ${updatedEmployee.nama_lengkap} berhasil diperbarui`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employees/[id] - Delete specific employee (simple delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Check if employee exists first
    const { data: existingEmployee, error: fetchError } = await supabase
      .from('users')
      .select('id, nama_lengkap, role')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Pegawai tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // Prevent deletion of admin accounts for safety
    if (existingEmployee.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin accounts cannot be deleted via simple delete' },
        { status: 403 }
      );
    }

    // Delete employee (cascade deletion will handle related records via database constraints)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Employee deletion error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pegawai ${existingEmployee.nama_lengkap} berhasil dihapus`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}