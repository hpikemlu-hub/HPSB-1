#!/usr/bin/env node

/**
 * Employee API Testing Script
 * Tests all CRUD operations and validates admin field restrictions
 */

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testEmployee = {
  nama_lengkap: 'Test Employee API',
  username: 'test_employee_api',
  email: 'test_api@example.com',
  role: 'user',
  nip: '999888777',
  golongan: 'III/b',
  jabatan: 'Test Staff'
};

const testAdmin = {
  nama_lengkap: 'Test Admin API',
  username: 'test_admin_api', 
  email: 'test_admin@example.com',
  role: 'admin',
  nip: '111222333',  // Should be cleared
  golongan: 'IV/a',  // Should be cleared
  jabatan: 'Test Admin Position'  // Should be cleared
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Employee API Tests...\n');

  // Test 1: Fetch all employees
  console.log('📋 Test 1: Fetch all employees');
  const fetchResult = await makeRequest(`${BASE_URL}/employees`);
  if (fetchResult.data?.success) {
    console.log(`✅ Success: Found ${fetchResult.data.count} employees`);
  } else {
    console.log(`❌ Failed:`, fetchResult);
  }
  console.log();

  // Test 2: Create regular employee
  console.log('👤 Test 2: Create regular employee');
  const createResult = await makeRequest(`${BASE_URL}/employees`, {
    method: 'POST',
    body: JSON.stringify(testEmployee)
  });
  
  if (createResult.data?.success) {
    console.log(`✅ Success: Created employee ${createResult.data.data.nama_lengkap}`);
    console.log(`   ID: ${createResult.data.data.id}`);
    testEmployee.id = createResult.data.data.id;
  } else {
    console.log(`❌ Failed:`, createResult.data);
  }
  console.log();

  // Test 3: Create admin (test field restrictions)
  console.log('👑 Test 3: Create admin (testing field restrictions)');
  const adminResult = await makeRequest(`${BASE_URL}/employees`, {
    method: 'POST',
    body: JSON.stringify(testAdmin)
  });
  
  if (adminResult.data?.success) {
    const admin = adminResult.data.data;
    console.log(`✅ Success: Created admin ${admin.nama_lengkap}`);
    console.log(`   Government fields cleared: NIP=${admin.nip}, Golongan=${admin.golongan}, Jabatan=${admin.jabatan}`);
    
    if (admin.nip === null && admin.golongan === null && admin.jabatan === null) {
      console.log('✅ Admin field restrictions working correctly!');
    } else {
      console.log('❌ Admin field restrictions FAILED!');
    }
    testAdmin.id = admin.id;
  } else {
    console.log(`❌ Failed:`, adminResult.data);
  }
  console.log();

  // Test 4: Update employee
  if (testEmployee.id) {
    console.log('✏️ Test 4: Update employee');
    const updateResult = await makeRequest(`${BASE_URL}/employees/${testEmployee.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...testEmployee,
        nama_lengkap: 'Updated Test Employee',
        jabatan: 'Senior Test Staff'
      })
    });
    
    if (updateResult.data?.success) {
      console.log(`✅ Success: Updated employee to ${updateResult.data.data.nama_lengkap}`);
      console.log(`   New jabatan: ${updateResult.data.data.jabatan}`);
    } else {
      console.log(`❌ Failed:`, updateResult.data);
    }
    console.log();
  }

  // Test 5: Validation API
  console.log('🔍 Test 5: Validation API');
  const validationResult = await makeRequest(`${BASE_URL}/employees/validate`, {
    method: 'POST',
    body: JSON.stringify({
      username: testEmployee.username, // Should fail (duplicate)
      nip: '555666777',               // Should pass (unique)
      email: 'unique@example.com'     // Should pass (unique)
    })
  });
  
  if (validationResult.data?.success) {
    const validation = validationResult.data.data;
    console.log(`✅ Validation API working:`);
    console.log(`   Valid: ${validation.valid}`);
    console.log(`   Errors:`, validation.errors);
  } else {
    console.log(`❌ Failed:`, validationResult.data);
  }
  console.log();

  // Test 6: Get specific employee
  if (testEmployee.id) {
    console.log('🔎 Test 6: Get specific employee');
    const getResult = await makeRequest(`${BASE_URL}/employees/${testEmployee.id}`);
    
    if (getResult.data?.success) {
      console.log(`✅ Success: Retrieved ${getResult.data.data.nama_lengkap}`);
    } else {
      console.log(`❌ Failed:`, getResult.data);
    }
    console.log();
  }

  // Cleanup: Delete test employees
  console.log('🧹 Cleanup: Deleting test employees');
  
  if (testEmployee.id) {
    const deleteResult = await makeRequest(`${BASE_URL}/employees/${testEmployee.id}`, {
      method: 'DELETE'
    });
    console.log(`${deleteResult.data?.success ? '✅' : '❌'} Regular employee cleanup`);
  }
  
  if (testAdmin.id) {
    // Use cascade delete for admin to bypass protection
    const cascadeResult = await makeRequest(`${BASE_URL}/admin/cascade-delete`, {
      method: 'POST',
      body: JSON.stringify({
        employeeId: testAdmin.id,
        action: 'delete'
      })
    });
    console.log(`${cascadeResult.data?.success ? '✅' : '❌'} Admin employee cleanup`);
  }

  console.log('\n🎉 Employee API Tests Completed!');
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };