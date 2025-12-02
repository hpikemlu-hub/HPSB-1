const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse Excel file and return data array
 */
function parseExcelFile(filePath) {
  try {
    console.log(`📂 Reading Excel file: ${filePath}`);
    
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    
    // Get sheet names
    const sheetNames = workbook.SheetNames;
    console.log(`📋 Found ${sheetNames.length} sheet(s): ${sheetNames.join(', ')}`);
    
    // Use first sheet or look for specific sheet name
    let targetSheet = sheetNames[0];
    
    // Look for common sheet names
    const commonNames = ['Sheet1', 'Data', 'Workload', 'Tasks', 'HPI Sosbud'];
    for (const name of commonNames) {
      if (sheetNames.includes(name)) {
        targetSheet = name;
        break;
      }
    }
    
    console.log(`📊 Using sheet: "${targetSheet}"`);
    
    // Convert sheet to JSON
    const worksheet = workbook.Sheets[targetSheet];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Use first row as header
      raw: false, // Convert all values to strings
      dateNF: 'dd/mm/yyyy' // Date format
    });
    
    if (jsonData.length === 0) {
      throw new Error('No data found in Excel sheet');
    }
    
    // Extract headers and data
    const headers = jsonData[0];
    const rows = jsonData.slice(1).filter(row => {
      // Filter empty rows
      return row.some(cell => cell && cell.toString().trim() !== '');
    });
    
    // Convert to object format
    const results = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] || '';
        }
      });
      return obj;
    });
    
    console.log(`✅ Excel parsed: ${results.length} rows found`);
    console.log(`📋 Headers detected: ${headers.join(', ')}`);
    
    // Show first few rows for verification
    if (results.length > 0) {
      console.log('\n📊 Sample data (first 3 rows):');
      results.slice(0, 3).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Clean and normalize Excel data
 */
function cleanWorkloadData(excelData) {
  console.log('🧹 Cleaning and normalizing Excel data...');
  
  const cleanedData = excelData.map((row, index) => {
    try {
      // Map Excel columns to database schema
      // Try various possible column names
      const cleaned = {
        // Map to workload table fields
        nama: extractValue(row, ['Nama', 'Type', 'Task', 'Judul', 'Title']) || `Task ${index + 1}`,
        type: extractValue(row, ['Type', 'Jenis', 'Kategori', 'Category']) || 'General',
        deskripsi: extractValue(row, ['Deskripsi', 'Description', 'Detail', 'Keterangan']) || '',
        
        // User assignment and department
        assigned_to_name: extractValue(row, ['Nama', 'PIC', 'Assigned To', 'Petugas', 'Staff']),
        fungsi: extractValue(row, ['Fungsi', 'Department', 'Departemen', 'Unit', 'Divisi']) || '',
        
        // Status and date
        status: normalizeStatusToDB(extractValue(row, ['Status', 'Progress', 'Kondisi']) || 'pending'),
        tgl_diterima: parseIndonesianDate(extractValue(row, ['Tanggal', 'Tgl Diterima', 'Date', 'Created Date', 'Start Date'])),
        
        // Additional fields that might be in Excel
        priority: extractValue(row, ['Priority', 'Prioritas', 'Urgensi']) || '',
        progress: extractValue(row, ['Progress', 'Persentase', '%']) || '',
        notes: extractValue(row, ['Notes', 'Catatan', 'Komentar']) || '',
        
        // Meta
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
 * Extract value from row using multiple possible column names
 */
function extractValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (row[name] && row[name].toString().trim() !== '') {
      return row[name].toString().trim();
    }
  }
  return '';
}

/**
 * Normalize status values for HPI Sosbud database
 */
function normalizeStatusToDB(status) {
  if (!status) return 'pending';
  
  const statusMap = {
    // Pending variations
    'pending': 'pending',
    'belum mulai': 'pending',
    'todo': 'pending',
    'to do': 'pending',
    'not started': 'pending',
    'waiting': 'pending',
    
    // On-progress variations
    'on-progress': 'on-progress',
    'on progress': 'on-progress',
    'in progress': 'on-progress',
    'in_progress': 'on-progress',
    'progress': 'on-progress',
    'sedang dikerjakan': 'on-progress',
    'berlangsung': 'on-progress',
    'working': 'on-progress',
    'ongoing': 'on-progress',
    
    // Done variations
    'done': 'done',
    'completed': 'done',
    'complete': 'done',
    'selesai': 'done',
    'finished': 'done',
    'success': 'done',
    'completed successfully': 'done'
  };
  
  const normalized = statusMap[status.toLowerCase()] || 'pending';
  return normalized;
}

/**
 * Parse Indonesian date format DD/MM/YYYY or Excel date
 */
function parseIndonesianDate(dateString) {
  if (!dateString || dateString.toString().trim() === '') return null;
  
  try {
    const dateStr = dateString.toString().trim();
    
    // Handle Excel date numbers
    if (/^\d{5}$/.test(dateStr)) {
      // Excel serial date number (days since 1900-01-01)
      const excelEpoch = new Date(1900, 0, 1);
      const days = parseInt(dateStr) - 2; // Excel bug: treats 1900 as leap year
      const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
      return formatDateForDB(date);
    }
    
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        
        // Validate parts
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        let yearNum = parseInt(year);
        
        // Handle 2-digit years
        if (yearNum < 100) {
          yearNum += yearNum < 50 ? 2000 : 1900;
        }
        
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum > 1900) {
          const date = new Date(yearNum, monthNum - 1, dayNum);
          return formatDateForDB(date);
        }
      }
    }
    
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return formatDateForDB(date);
    }
    
    console.warn(`⚠️  Could not parse date: ${dateStr}`);
    return null;
    
  } catch (error) {
    console.warn(`⚠️  Error parsing date ${dateString}:`, error.message);
    return null;
  }
}

/**
 * Format date for PostgreSQL DATE type
 */
function formatDateForDB(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      nip: `NIP${Math.random().toString().substr(2, 8)}`,
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
        user_id: user_id,
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
 * Main import function
 */
async function importExcelData(excelFilePath) {
  console.log('🚀 Starting Excel Data Import');
  console.log('==============================\n');
  
  try {
    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }
    
    // Parse Excel
    const rawData = await parseExcelFile(excelFilePath);
    
    if (rawData.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    // Clean and normalize data
    const cleanedData = cleanWorkloadData(rawData);
    
    if (cleanedData.length === 0) {
      throw new Error('No valid data after cleaning');
    }
    
    // Insert workload data
    const result = await insertWorkloadData(cleanedData);
    
    // Create audit log entry
    try {
      await supabase.from('audit_log').insert({
        user_id: 'system',
        user_name: 'System Import',
        action: 'IMPORT',
        resource_type: 'workload',
        resource_id: 'excel_import',
        details: `Imported ${result.successCount} workload records from Excel`,
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
  const excelFilePath = process.argv[2];
  
  if (!excelFilePath) {
    console.error('Usage: node import-excel-data.js <path-to-excel-file>');
    console.error('Example: node import-excel-data.js "HPI-Sosbud-Workload.xlsx"');
    console.error('Supported formats: .xlsx, .xls');
    process.exit(1);
  }
  
  try {
    await importExcelData(excelFilePath);
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = {
  importExcelData,
  parseExcelFile,
  cleanWorkloadData
};

// Run if called directly
if (require.main === module) {
  main();
}