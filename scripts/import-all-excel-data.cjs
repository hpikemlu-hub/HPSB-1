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
    process.exit(1);
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Parse all sheets from Excel file
 */
function parseAllSheets(filePath) {
  try {
    console.log(`📂 Reading Excel file: ${filePath}`);
    
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    
    console.log(`📋 Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);
    
    const allData = {};
    
    // Parse each sheet
    sheetNames.forEach(sheetName => {
      console.log(`📊 Processing sheet: "${sheetName}"`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: 'dd/mm/yyyy'
      });
      
      if (jsonData.length > 0) {
        const headers = jsonData[0];
        const rows = jsonData.slice(1).filter(row => {
          return row.some(cell => cell && cell.toString().trim() !== '');
        });
        
        const results = rows.map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            if (header) {
              obj[header] = row[index] || '';
            }
          });
          return obj;
        });
        
        allData[sheetName] = {
          headers,
          data: results
        };
        
        console.log(`✅ Sheet "${sheetName}": ${results.length} rows, Headers: ${headers.join(', ')}`);
      }
    });
    
    return allData;
    
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    throw error;
  }
}

/**
 * Parse Indonesian date format or Excel serial dates
 */
function parseIndonesianDate(dateInput) {
  if (!dateInput || dateInput.toString().trim() === '') return null;
  
  try {
    const dateStr = dateInput.toString().trim();
    
    // Handle Excel serial date numbers (like 45960.29166666667)
    if (/^\d+(\.\d+)?$/.test(dateStr)) {
      const excelSerialDate = parseFloat(dateStr);
      
      // Excel epoch starts from January 1, 1900
      // Excel wrongly treats 1900 as leap year, so subtract 2 days
      const excelEpoch = new Date(1900, 0, 1);
      const daysSinceEpoch = Math.floor(excelSerialDate) - 2;
      
      const date = new Date(excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000);
      
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        console.log(`📅 Converted Excel date ${excelSerialDate} -> ${year}-${month}-${day}`);
        return `${year}-${month}-${day}`;
      }
    }
    
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        
        const dayNum = parseInt(day);
        const monthNum = parseInt(month);
        let yearNum = parseInt(year);
        
        // Handle 2-digit years
        if (yearNum < 100) {
          yearNum += yearNum < 50 ? 2000 : 1900;
        }
        
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum > 1900) {
          const date = new Date(yearNum, monthNum - 1, dayNum);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    console.warn(`⚠️  Could not parse date: ${dateStr}`);
    return null;
    
  } catch (error) {
    console.warn(`⚠️  Error parsing date ${dateInput}:`, error.message);
    return null;
  }
}

/**
 * Normalize status
 */
function normalizeStatus(status) {
  if (!status) return 'pending';
  
  const statusMap = {
    'pending': 'pending',
    'belum mulai': 'pending',
    'todo': 'pending',
    'on-progress': 'on-progress',
    'on progress': 'on-progress',
    'in progress': 'on-progress',
    'progress': 'on-progress',
    'sedang dikerjakan': 'on-progress',
    'done': 'done',
    'completed': 'done',
    'selesai': 'done',
    'finished': 'done'
  };
  
  return statusMap[status.toLowerCase()] || 'pending';
}

/**
 * Extract value from row
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
 * Get or create user
 */
async function getOrCreateUser(userName, additionalData = {}) {
  if (!userName || userName.trim() === '') {
    return null;
  }

  // Try to find existing user
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('nama_lengkap', userName.trim())
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user
  try {
    const newUser = {
      nama_lengkap: userName.trim(),
      username: userName.toLowerCase().replace(/\s+/g, '.'),
      nip: additionalData.nip || `NIP${Math.random().toString().substr(2, 8)}`,
      golongan: additionalData.golongan || '',
      jabatan: additionalData.jabatan || '',
      email: additionalData.email || null, // Allow null email to avoid duplicates
      role: additionalData.role || 'user',
      is_active: true
    };

    const { data: createdUser, error } = await supabase
      .from('users')
      .insert(newUser)
      .select('id')
      .single();

    if (error) {
      console.warn(`⚠️  Could not create user ${userName}:`, error);
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
 * Import workload data
 */
async function importWorkloadData(sheetData) {
  console.log('\n📋 Importing WORKLOAD data...');
  
  const workloadRecords = [];
  
  for (const [index, row] of sheetData.data.entries()) {
    try {
      const userId = await getOrCreateUser(extractValue(row, ['Nama', 'PIC', 'User']));
      
      const record = {
        nama: extractValue(row, ['Type', 'Task', 'Nama Task']) || `Task ${index + 1}`,
        type: extractValue(row, ['Type', 'Jenis']) || 'General',
        deskripsi: extractValue(row, ['Deskripsi', 'Description']) || '',
        status: normalizeStatus(extractValue(row, ['Status'])),
        tgl_diterima: parseIndonesianDate(extractValue(row, ['Tgl Diterima', 'Tanggal'])),
        fungsi: extractValue(row, ['Fungsi', 'Department']) || '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      workloadRecords.push(record);
    } catch (error) {
      console.error(`Error processing workload row ${index + 1}:`, error);
    }
  }
  
  // Insert in batches
  const batchSize = 50;
  let successCount = 0;
  
  for (let i = 0; i < workloadRecords.length; i += batchSize) {
    const batch = workloadRecords.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('workload')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting workload batch:`, error);
    } else {
      successCount += data.length;
      console.log(`✅ Workload batch inserted: ${data.length} records`);
    }
  }
  
  console.log(`📊 Workload import: ${successCount} records inserted`);
  return successCount;
}

/**
 * Validate and fix start/end dates
 */
function validateAndFixDates(rawStart, rawEnd) {
  const result = { start: null, end: null, swapped: false, valid: false, error: null };

  const start = parseIndonesianDate(rawStart);
  const end = parseIndonesianDate(rawEnd);

  if (!start && !end) {
    result.error = 'Both start_date and end_date are missing or invalid';
    return result;
  }

  // If one side is missing, mirror the other (single-day event)
  const s = start || end;
  const e = end || start;

  // Basic format check YYYY-MM-DD
  const isYMD = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  if (!isYMD(s) || !isYMD(e)) {
    result.error = `Invalid date format. start=${s}, end=${e}`;
    return result;
  }

  // Check real date validity
  const asDate = (v) => new Date(`${v}T00:00:00Z`);
  if (isNaN(asDate(s).getTime()) || isNaN(asDate(e).getTime())) {
    result.error = `Unparsable date. start=${s}, end=${e}`;
    return result;
  }

  let startDate = s;
  let endDate = e;

  // Swap if start > end
  if (asDate(startDate).getTime() > asDate(endDate).getTime()) {
    [startDate, endDate] = [endDate, startDate];
    result.swapped = true;
  }

  result.start = startDate;
  result.end = endDate;
  result.valid = true;
  return result;
}

/**
 * Append an error log entry to a file for manual review
 */
function logCalendarImportIssue(filePath, issue) {
  try {
    fs.appendFileSync(filePath, JSON.stringify(issue) + '\n', 'utf8');
  } catch (e) {
    console.warn('⚠️  Failed to write import issue log:', e.message);
  }
}

/**
 * Import real calendar data to calendar_events table
 */
async function importRealCalendarData(sheetData) {
  console.log('\n📅 Importing CALENDAR EVENTS data...');

  const errorLogPath = path.join(__dirname, 'import-errors-calendar.jsonl');
  // Start fresh file per run
  try { fs.writeFileSync(errorLogPath, '', 'utf8'); } catch {}

  const validRecords = [];
  let skippedCount = 0;

  for (const [index, row] of sheetData.data.entries()) {
    try {
      // Extract multiple participants if they're in one field
      const participantsStr = extractValue(row, ['Nama', 'Participants', 'Peserta']);
      let participants = [];
      if (participantsStr) {
        participants = participantsStr.split(',').map(p => p.trim()).filter(p => p);
      }

      // Get creator from first participant or separate creator field
      const creatorName = extractValue(row, ['Creator', 'Dibuat Oleh']) || (participants[0] || '');
      const creatorId = await getOrCreateUser(creatorName);

      // Validate and normalize dates with swap logic
      const rawStart = extractValue(row, ['Tanggal Mulai', 'Start Date', 'Tanggal']);
      const rawEnd = extractValue(row, ['Tanggal Selesai', 'End Date', 'Tanggal Akhir']);
      const { start, end, swapped, valid, error } = validateAndFixDates(rawStart, rawEnd);

      if (!valid) {
        skippedCount++;
        logCalendarImportIssue(errorLogPath, {
          row: index + 1,
          title: extractValue(row, ['Judul Kegiatan', 'Title', 'Event', 'Nama Kegiatan']),
          rawStart,
          rawEnd,
          error,
          rowData: row
        });
        continue; // Skip invalid record
      }

      const record = {
        title: extractValue(row, ['Judul Kegiatan', 'Title', 'Event', 'Nama Kegiatan']) || `Event ${index + 1}`,
        description: extractValue(row, ['Deskripsi (Optional)', 'Description', 'Deskripsi', 'Keterangan']) || '',
        start_date: start,
        end_date: end,
        location: extractValue(row, ['Lokasi', 'Location', 'Tempat']) || '',
        color: '#0ea5e9', // Default blue color
        creator_id: creatorId,
        participants: participants,
        dipa: extractValue(row, ['DIPA', 'Budget', 'Anggaran']) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (swapped) {
        logCalendarImportIssue(errorLogPath, {
          row: index + 1,
          title: record.title,
          note: 'start_date > end_date detected. Values swapped to satisfy check_dates constraint',
          finalStart: record.start_date,
          finalEnd: record.end_date
        });
      }

      validRecords.push(record);
    } catch (error) {
      skippedCount++;
      logCalendarImportIssue(errorLogPath, {
        row: index + 1,
        error: `Exception processing row: ${error.message}`,
        rowData: row
      });
    }
  }

  if (validRecords.length === 0) {
    console.log('📅 No valid calendar records to insert');
    console.log(`⏭️  Skipped records: ${skippedCount}`);
    return 0;
  }

  // Insert valid records in batches. If a batch fails, fall back to row-by-row to skip bad ones.
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);
    const { data, error } = await supabase.from('calendar_events').insert(batch).select();

    if (error) {
      console.warn('⚠️  Batch insert failed. Falling back to row-by-row. Reason:', error.message || error);
      for (const [offset, rec] of batch.entries()) {
        const idx = i + offset + 1;
        const res = await supabase.from('calendar_events').insert(rec).select();
        if (res.error) {
          skippedCount++;
          logCalendarImportIssue(errorLogPath, {
            row: idx,
            title: rec.title,
            error: `Row insert failed: ${res.error.message}`,
            record: rec
          });
        } else if (res.data && res.data.length) {
          inserted += res.data.length;
        }
      }
    } else if (data && data.length) {
      inserted += data.length;
      console.log(`✅ Calendar batch inserted: ${data.length} records`);
    }
  }

  console.log(`📅 Calendar import complete. Inserted: ${inserted}, Skipped: ${skippedCount}`);
  return inserted;
}

/**
 * Import users data
 */
async function importUsersData(sheetData) {
  console.log('\n👥 Importing USERS data...');
  
  let processedCount = 0;
  
  for (const [index, row] of sheetData.data.entries()) {
    try {
      const userData = {
        nip: extractValue(row, ['NIP', 'ID', 'PegawaiID']),
        email: extractValue(row, ['Email', 'E-mail']),
        jabatan: extractValue(row, ['Jabatan', 'Position', 'Title']),
        golongan: extractValue(row, ['Golongan', 'Grade', 'Level']),
        role: extractValue(row, ['Role', 'Level']) || 'user'
      };
      
      await getOrCreateUser(extractValue(row, ['Nama', 'Nama Lengkap', 'Full Name']), userData);
      processedCount++;
    } catch (error) {
      console.error(`Error processing user row ${index + 1}:`, error);
    }
  }
  
  console.log(`✅ Users processed: ${processedCount} records`);
  return processedCount;
}

/**
 * Main import function
 */
async function importAllExcelData(excelFilePath) {
  console.log('🚀 Starting COMPLETE Excel Data Import');
  console.log('=====================================\n');
  
  try {
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }
    
    // Parse all sheets
    const allSheets = parseAllSheets(excelFilePath);
    
    const summary = {
      workload: 0,
      calendar: 0,
      users: 0
    };
    
    // Import each sheet based on name
    for (const [sheetName, sheetData] of Object.entries(allSheets)) {
      console.log(`\n🔄 Processing sheet: ${sheetName}`);
      
      if (sheetName.toUpperCase() === 'DATA' || sheetName.toUpperCase().includes('WORKLOAD')) {
        summary.workload += await importWorkloadData(sheetData);
      } 
      else if (sheetName.toUpperCase().includes('CALENDAR')) {
        summary.calendar += await importRealCalendarData(sheetData);
      }
      else if (sheetName.toUpperCase().includes('E_KINERJA')) {
        summary.workload += await importWorkloadData(sheetData);
      }
      else if (sheetName.toUpperCase().includes('USER') || sheetName.toUpperCase().includes('PEGAWAI')) {
        summary.users += await importUsersData(sheetData);
      }
      else {
        console.log(`⚠️  Skipping sheet "${sheetName}" - no matching import handler`);
      }
    }
    
    // Create audit log
    try {
      await supabase.from('audit_log').insert({
        user_id: 'system',
        user_name: 'System Import',
        action: 'IMPORT_ALL',
        resource_type: 'excel_complete',
        resource_id: 'excel_import_all',
        details: `Complete import: ${summary.workload} workload, ${summary.calendar} calendar, ${summary.users} users`,
        ip_address: '127.0.0.1',
        user_agent: 'Node.js Complete Import Script',
        severity: 'high',
        status: 'success',
        created_at: new Date().toISOString()
      });
    } catch (auditError) {
      console.warn('⚠️  Could not create audit log:', auditError);
    }
    
    console.log('\n🎉 COMPLETE IMPORT FINISHED!');
    console.log('==============================');
    console.log(`📋 Workload records: ${summary.workload}`);
    console.log(`📅 Calendar events: ${summary.calendar}`);
    console.log(`👥 Users processed: ${summary.users}`);
    
    return summary;
    
  } catch (error) {
    console.error('💥 Complete import failed:', error);
    throw error;
  }
}

// CLI usage
async function main() {
  const excelFilePath = process.argv[2] || 'scripts/Work-load Dit. HPI Sosbud (3).xlsx';
  
  try {
    await importAllExcelData(excelFilePath);
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}