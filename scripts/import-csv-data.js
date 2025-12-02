const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n');
    
    envVars.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    
    console.log('✅ Environment variables loaded from .env.local');
  } else {
    console.error('❌ .env.local file not found');
    console.log('Expected location:', envPath);
    process.exit(1);
  }
}

// Load environment first
loadEnvFile();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nCurrent values:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse CSV file and return data array
 */
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' })) // Handle semicolon separator
      .on('data', (data) => {
        // Filter out empty rows
        const hasData = Object.values(data).some(value => value && value.trim() !== '');
        if (hasData) {
          results.push(data);
        }
      })
      .on('end', () => {
        console.log(`✅ CSV parsed: ${results.length} rows found (empty rows filtered)`);
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Clean and normalize CSV data
 */
function cleanWorkloadData(csvData) {
  console.log('🧹 Cleaning and normalizing CSV data...');
  
  const cleanedData = csvData.map((row, index) => {
    try {
      // Map CSV columns to database schema (HPI Sosbud specific)
      // CSV structure: Nama;Type;Deskripsi;Status;Tgl Diterima;Fungsi
      const cleaned = {
        // Map to workload table fields
        nama: row['Type'] || 'Unknown Task', // CSV Type → workload.nama (task name)
        type: row['Type'] || 'General', // CSV Type → workload.type  
        deskripsi: row['Deskripsi'] || '', // CSV Deskripsi → workload.deskripsi
        
        // User assignment and department
        assigned_to_name: row['Nama'] || '', // CSV Nama → user lookup (PIC name)
        fungsi: row['Fungsi'] || '', // CSV Fungsi → workload.fungsi
        
        // Status and date
        status: normalizeStatusToDB(row['Status'] || 'pending'), // CSV Status → workload.status
        tgl_diterima: parseIndonesianDate(row['Tgl Diterima']), // CSV Tgl Diterima → workload.tgl_diterima
        
        // Meta
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Original row for reference
        original_row_index: index + 1
      };
      
      return cleaned;
    } catch (error) {
      console.error(`❌ Error processing row ${index + 1}:`, error);
      return null;
    }
  }).filter(item => item !== null);
  
  console.log(`✅ Data cleaned: ${cleanedData.length} valid rows`);
  return cleanedData;
}

/**
 * Normalize status values for HPI Sosbud database
 * Database accepts: 'done', 'on-progress', 'pending'
 */
function normalizeStatusToDB(status) {
  const statusMap = {
    // Pending variations
    'pending': 'pending',
    'belum mulai': 'pending',
    'todo': 'pending',
    'to do': 'pending',
    'not started': 'pending',
    
    // On-progress variations
    'on-progress': 'on-progress',
    'on progress': 'on-progress',
    'in progress': 'on-progress',
    'in_progress': 'on-progress',
    'progress': 'on-progress',
    'sedang dikerjakan': 'on-progress',
    'berlangsung': 'on-progress',
    'working': 'on-progress',
    
    // Done variations
    'done': 'done',
    'completed': 'done',
    'complete': 'done',
    'selesai': 'done',
    'finished': 'done',
    'success': 'done'
  };
  
  const normalized = statusMap[status.toLowerCase()] || 'pending';
  return normalized;
}

/**
 * Normalize priority values
 */
function normalizePriority(priority) {
  const priorityMap = {
    'low': 'low',
    'rendah': 'low',
    'normal': 'medium',
    'medium': 'medium',
    'sedang': 'medium',
    'high': 'high',
    'tinggi': 'high',
    'urgent': 'urgent',
    'mendesak': 'urgent',
    'critical': 'urgent',
    'kritis': 'urgent'
  };
  
  const normalized = priorityMap[priority.toLowerCase()] || 'medium';
  return normalized;
}

/**
 * Parse Indonesian date format DD/MM/YYYY
 */
function parseIndonesianDate(dateString) {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    // Expected format: DD/MM/YYYY (e.g., "13/08/2025")
    const parts = dateString.trim().split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      
      // Validate parts
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum > 1900) {
        // Create date in YYYY-MM-DD format for PostgreSQL
        const isoDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
        const parsed = new Date(isoDate);
        
        // Validate the created date
        if (!isNaN(parsed.getTime())) {
          return isoDate; // Return date string for PostgreSQL DATE type
        }
      }
    }
    
    console.warn(`⚠️  Could not parse Indonesian date: ${dateString}`);
    return null;
  } catch (error) {
    console.warn(`⚠️  Error parsing date ${dateString}:`, error.message);
    return null;
  }
}

/**
 * Get or create user by name and return user_id
 */
async function getUserId(userName) {
  if (!userName || userName.trim() === '') {
    return null;
  }

  // Try to find existing user
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('nama_lengkap', userName.trim())
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user if not found
  try {
    const newUser = {
      nama_lengkap: userName.trim(),
      username: userName.toLowerCase().replace(/\s+/g, '.'),
      nip: `NIP${Math.random().toString().substr(2, 8)}`, // Generate temporary NIP
      role: 'user',
      is_active: true
    };

    const { data: createdUser, error: createError } = await supabase
      .from('users')
      .insert(newUser)
      .select('id')
      .single();

    if (createError) {
      console.warn(`⚠️  Could not create user ${userName}:`, createError);
      return null;
    }

    console.log(`✅ Created user: ${userName}`);
    return createdUser.id;
  } catch (error) {
    console.warn(`⚠️  Exception creating user ${userName}:`, error);
    return null;
  }
}

/**
 * Insert workload data into database
 */
async function insertWorkloadData(workloadData) {
  console.log(`📤 Processing ${workloadData.length} workload records...`);
  
  const processedData = [];
  let successCount = 0;
  let errorCount = 0;

  // First pass: resolve user_ids
  console.log('🔍 Resolving user assignments...');
  for (const item of workloadData) {
    try {
      // Get user_id for assigned person
      const user_id = await getUserId(item.assigned_to_name);
      
      const processedItem = {
        nama: item.nama,
        type: item.type,
        deskripsi: item.deskripsi,
        status: item.status,
        tgl_diterima: item.tgl_diterima,
        fungsi: item.fungsi,
        user_id: user_id, // Can be null if user not found/created
        created_at: item.created_at,
        updated_at: item.updated_at
      };

      processedData.push(processedItem);
    } catch (error) {
      console.error(`❌ Error processing item ${item.nama}:`, error);
      errorCount++;
    }
  }

  // Second pass: insert in batches
  console.log(`📤 Inserting ${processedData.length} workload records...`);
  const batchSize = 50;
  
  for (let i = 0; i < processedData.length; i += batchSize) {
    const batch = processedData.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('workload')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += data.length;
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted: ${data.length} records`);
      }
    } catch (error) {
      console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
      errorCount += batch.length;
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`✅ Successfully inserted: ${successCount} records`);
  console.log(`❌ Failed to insert: ${errorCount} records`);
  
  return { successCount, errorCount };
}

/**
 * Create employees from workload data
 */
async function createEmployeesFromWorkload(workloadData) {
  console.log('👥 Creating employee records from workload assignments...');
  
  // Extract unique assignees
  const assignees = [...new Set(workloadData
    .map(item => item.assigned_to)
    .filter(name => name && name.trim() !== '')
  )];
  
  console.log(`Found ${assignees.length} unique assignees`);
  
  const employees = assignees.map(name => ({
    nama_lengkap: name,
    nip: `NIP${Math.random().toString().substr(2, 8)}`, // Generate temporary NIP
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@hpisosbud.kemlu.go.id`,
    jabatan: 'Staff', // Default position
    phone: '', // To be filled later
    role: 'user',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(employees)
      .select();
    
    if (error) {
      console.error('❌ Error creating employees:', error);
      return 0;
    } else {
      console.log(`✅ Created ${data.length} employee records`);
      return data.length;
    }
  } catch (error) {
    console.error('❌ Exception creating employees:', error);
    return 0;
  }
}

/**
 * Main import function
 */
async function importCSVData(csvFilePath) {
  console.log('🚀 Starting CSV Data Import');
  console.log('===========================\n');
  
  try {
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    console.log(`📂 Reading CSV file: ${csvFilePath}`);
    
    // Parse CSV
    const rawData = await parseCSVFile(csvFilePath);
    
    if (rawData.length === 0) {
      throw new Error('No data found in CSV file');
    }
    
    console.log(`\n📋 Raw CSV Structure (first row):`);
    console.log(Object.keys(rawData[0]));
    
    // Clean and normalize data
    const cleanedData = cleanWorkloadData(rawData);
    
    if (cleanedData.length === 0) {
      throw new Error('No valid data after cleaning');
    }
    
    // Create employees from assignees
    await createEmployeesFromWorkload(cleanedData);
    
    // Insert workload data
    const result = await insertWorkloadData(cleanedData);
    
    // Create audit log entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: 'system',
        user_name: 'System Import',
        action: 'IMPORT',
        resource_type: 'workload',
        resource_id: 'csv_import',
        details: `Imported ${result.successCount} workload records from CSV`,
        ip_address: '127.0.0.1',
        user_agent: 'Node.js Import Script',
        severity: 'medium',
        status: 'success',
        created_at: new Date().toISOString()
      });
    } catch (auditError) {
      console.warn('⚠️  Could not create audit log:', auditError);
    }
    
    console.log('\n🎉 Import completed successfully!');
    
    return result;
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  }
}

/**
 * CLI usage
 */
async function main() {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('Usage: node import-csv-data.js <path-to-csv-file>');
    console.error('Example: node import-csv-data.js "./Work-load Dit. HPI Sosbud (2).csv"');
    process.exit(1);
  }
  
  try {
    await importCSVData(csvFilePath);
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  importCSVData,
  parseCSVFile,
  cleanWorkloadData
};

// Run if called directly
if (require.main === module) {
  main();
}