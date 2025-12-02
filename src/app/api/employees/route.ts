import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Employee CRUD API Routes
 * Handles Create, Read operations for employees
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
 * GET /api/employees - Fetch all employees
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    const search = searchParams.get('search');

    const supabase = createAdminClient();
    
    let query = supabase
      .from('users')
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }
    
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    // Apply search if provided
    if (search) {
      query = query.or(`nama_lengkap.ilike.%${search}%,nip.ilike.%${search}%,jabatan.ilike.%${search}%,golongan.ilike.%${search}%`);
    }

    // Order by hierarchical structure
    query = query.order('nama_lengkap', { ascending: true });

    const { data: employees, error } = await query;

    if (error) {
      console.error('Employee fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employees || [],
      count: employees?.length || 0
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
 * POST /api/employees - Create new employee
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nama_lengkap,
      nip,
      golongan,
      jabatan,
      username,
      email,
      role = 'user',
      is_active = true
    } = body;

    // Validate required fields
    if (!nama_lengkap || !username) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap dan username harus diisi' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Prepare data - admin field restrictions will be handled by database trigger
    const employeeData = {
      nama_lengkap,
      nip: role === 'admin' ? null : nip, // Extra safety, but trigger will handle this
      golongan: role === 'admin' ? null : golongan,
      jabatan: role === 'admin' ? null : jabatan,
      username,
      email,
      role,
      is_active
    };

    const { data: newEmployee, error } = await supabase
      .from('users')
      .insert(employeeData)
      .select(`
        id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
        created_at, updated_at
      `)
      .single();

    if (error) {
      console.error('Employee creation error:', error);
      
      // Handle specific database errors
      if (error.code === '23505') {
        if (error.message.includes('users_username_key')) {
          return NextResponse.json(
            { success: false, error: 'Username sudah digunakan' },
            { status: 400 }
          );
        }
        if (error.message.includes('users_nip_key')) {
          return NextResponse.json(
            { success: false, error: 'NIP sudah terdaftar' },
            { status: 400 }
          );
        }
        if (error.message.includes('users_email_key')) {
          return NextResponse.json(
            { success: false, error: 'Email sudah terdaftar' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: `Pegawai ${newEmployee.nama_lengkap} berhasil ditambahkan`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}