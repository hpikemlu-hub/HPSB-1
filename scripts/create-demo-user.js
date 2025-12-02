const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createDemoUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔄 Creating demo user...');

  try {
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.nama_lengkap);
      return;
    }

    // Create demo admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          nama_lengkap: 'Administrator System',
          nip: '196501011990031001',
          golongan: 'IV/a',
          jabatan: 'System Administrator',
          username: 'admin',
          email: 'admin@kemlu.go.id',
          role: 'admin',
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Demo admin user created successfully!');
    console.log('📝 User details:', {
      nama: data.nama_lengkap,
      username: data.username,
      role: data.role,
      email: data.email
    });

    console.log('\n🔑 Login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
  }
}

createDemoUser();