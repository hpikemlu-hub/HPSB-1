require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// List of all users to provision
const usersToProvision = [
  {
    nama_lengkap: 'Administrator',
    username: 'admin',
    email: 'admin@kemlu.go.id',
    role: 'admin',
    nip: '196501011990031001',
    golongan: 'IV/a',
    jabatan: 'System Administrator'
  },
  {
    nama_lengkap: 'Ajeng Widianty',
    username: 'ajeng.widianty',
    email: 'ajeng.widianty@kemlu.go.id',
    role: 'user',
    nip: '198502022010012001',
    golongan: 'III/b',
    jabatan: 'Staff Ahli'
  },
  {
    nama_lengkap: 'Test Admin API',
    username: 'test.admin.api',
    email: 'test.admin.api@kemlu.go.id',
    role: 'admin',
    nip: '197001011995011001',
    golongan: 'IV/b',
    jabatan: 'Admin API'
  },
  // Add more users as needed - placeholder for the remaining 19 users
  {
    nama_lengkap: 'User 4',
    username: 'user4',
    email: 'user4@kemlu.go.id',
    role: 'user',
    nip: '198001012005011001',
    golongan: 'III/a',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 5',
    username: 'user5',
    email: 'user5@kemlu.go.id',
    role: 'user',
    nip: '198202022007012002',
    golongan: 'III/b',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 6',
    username: 'user6',
    email: 'user6@kemlu.go.id',
    role: 'user',
    nip: '198403032009013003',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 7',
    username: 'user7',
    email: 'user7@kemlu.go.id',
    role: 'user',
    nip: '198604042011014004',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 8',
    username: 'user8',
    email: 'user8@kemlu.go.id',
    role: 'user',
    nip: '198805052013015005',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 9',
    username: 'user9',
    email: 'user9@kemlu.go.id',
    role: 'user',
    nip: '199006062015016006',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 10',
    username: 'user10',
    email: 'user10@kemlu.go.id',
    role: 'user',
    nip: '199207072017017007',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 11',
    username: 'user11',
    email: 'user11@kemlu.go.id',
    role: 'user',
    nip: '199408082019018008',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 12',
    username: 'user12',
    email: 'user12@kemlu.go.id',
    role: 'user',
    nip: '199609092021019009',
    golongan: 'III/d',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 13',
    username: 'user13',
    email: 'user13@kemlu.go.id',
    role: 'user',
    nip: '198310102008010010',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 14',
    username: 'user14',
    email: 'user14@kemlu.go.id',
    role: 'user',
    nip: '198511112010011011',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 15',
    username: 'user15',
    email: 'user15@kemlu.go.id',
    role: 'user',
    nip: '198712122012012012',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 16',
    username: 'user16',
    email: 'user16@kemlu.go.id',
    role: 'user',
    nip: '198901132014013013',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 17',
    username: 'user17',
    email: 'user17@kemlu.go.id',
    role: 'user',
    nip: '199102142016014014',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 18',
    username: 'user18',
    email: 'user18@kemlu.go.id',
    role: 'user',
    nip: '199303152018015015',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 19',
    username: 'user19',
    email: 'user19@kemlu.go.id',
    role: 'user',
    nip: '199504162020016016',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 20',
    username: 'user20',
    email: 'user20@kemlu.go.id',
    role: 'user',
    nip: '199705172022017017',
    golongan: 'III/c',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 21',
    username: 'user21',
    email: 'user21@kemlu.go.id',
    role: 'user',
    nip: '199906182024018018',
    golongan: 'III/b',
    jabatan: 'Staff'
  },
  {
    nama_lengkap: 'User 22',
    username: 'user22',
    email: 'user22@kemlu.go.id',
    role: 'user',
    nip: '200107192025019019',
    golongan: 'III/a',
    jabatan: 'Staff'
  }
];

async function provisionUsers() {
  console.log('🚀 Starting user provisioning...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const defaultPassword = 'HPSB2025!';

  for (const userData of usersToProvision) {
    try {
      console.log(`\n📝 Processing user: ${userData.email}`);

      // Check if user already exists in Supabase Auth first
      let authUserId = null;
      let authUserExists = false;

      try {
        // List all users to find the one with the email
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
          console.error(`⚠️ Error listing Supabase Auth users:`, listError);
        } else {
          const foundUser = users.find(user => user.email === userData.email);
          if (foundUser) {
            authUserExists = true;
            authUserId = foundUser.id;
            console.log(`✅ User ${userData.email} already exists in Supabase Auth: ${foundUser.id}`);
          }
        }
      } catch (listError) {
        console.error(`⚠️ Error checking if user exists in Supabase Auth:`, listError);
      }

      if (!authUserExists) {
        // Create user in Supabase Auth
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: defaultPassword,
            emailConfirm: true, // Confirm the email immediately
          });

          if (authError) {
            console.error(`❌ Error creating Supabase Auth user ${userData.email}:`, authError);
            continue;
          }

          authUserId = authData.user.id;
          console.log(`✅ Supabase Auth user created: ${userData.email} with ID: ${authUserId}`);
        } catch (createError) {
          console.error(`❌ Exception creating Supabase Auth user ${userData.email}:`, createError);
          continue;
        }
      }

      // Check if user already exists in the users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, email, auth_uid')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists in users table`);

        // Update auth_uid if not set
        if (!existingUser.auth_uid && authUserId) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ auth_uid: authUserId })
            .eq('email', userData.email);

          if (updateError) {
            console.error(`⚠️ Error updating auth_uid for ${userData.email}:`, updateError);
          } else {
            console.log(`✅ Updated auth_uid for ${userData.email}: ${authUserId}`);
          }
        }
      } else {
        // Create user in the users table with auth_uid
        const userWithAuthId = {
          ...userData,
          auth_uid: authUserId
        };

        const { data: newUser, error: userCreateError } = await supabase
          .from('users')
          .insert([userWithAuthId])
          .select()
          .single();

        if (userCreateError) {
          console.error(`❌ Error creating user ${userData.email} in users table:`, userCreateError);
          continue;
        }

        console.log(`✅ User ${userData.email} created in users table with auth_uid: ${newUser.auth_uid}`);
      }

    } catch (error) {
      console.error(`❌ Error processing user ${userData.email}:`, error);
    }
  }

  console.log('\n🎉 User provisioning completed!');
}

async function verifyProvisioning() {
  console.log('\n🔍 Verifying user provisioning...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Check total users in database
  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (userError) {
    console.error('❌ Error counting users:', userError);
  } else {
    console.log(`📊 Total users in database: ${userCount}`);
  }
  
  // Check auth users
  try {
    const { data: { users }, error: authError } = await (supabase.auth.admin).listUsers();
    
    if (authError) {
      console.error('❌ Error listing auth users:', authError);
    } else {
      console.log(`📊 Total users in Supabase Auth: ${users.length}`);
      
      // Check how many of our target users exist in auth
      const authEmails = users.map(u => u.email);
      const targetEmails = usersToProvision.map(u => u.email);
      const matchedEmails = targetEmails.filter(email => authEmails.includes(email));
      
      console.log(`📊 Target users in Supabase Auth: ${matchedEmails.length}/${targetEmails.length}`);
      
      if (matchedEmails.length < targetEmails.length) {
        const missing = targetEmails.filter(email => !authEmails.includes(email));
        console.log(`⚠️ Missing auth accounts:`, missing);
      }
    }
  } catch (listError) {
    console.error('❌ Error verifying auth users:', listError);
  }
}

async function main() {
  await provisionUsers();
  await verifyProvisioning();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  provisionUsers,
  verifyProvisioning,
  usersToProvision
};