'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { EmployeeForm } from '@/components/employees/employee-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createEmployee } from '@/lib/employee-operations';
import { toast } from 'sonner';
import type { User } from '@/types';

interface EmployeeFormData {
  nama_lengkap: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
}

export default function NewEmployeePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication and admin permission
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        if (sessionData.user.role !== 'admin') {
          router.push('/employees');
          return;
        }
        setUser(sessionData.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    console.log('🔄 FORM SUBMIT STARTED - Creating new employee');
    console.log('📝 Form data received:', data);
    
    setIsSubmitting(true);
    try {
      // Use centralized employee operations
      const result = await createEmployee(data);
      
      if (result.success) {
        console.log('✅ Employee created successfully:', result.data);
        
        // Add small delay for better UX
        setTimeout(() => {
          router.push('/employees');
        }, 500);
      } else {
        console.error('❌ Employee creation failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error during employee creation:', error);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 FORM SUBMIT COMPLETED');
    }
  };

  const handleCancel = () => {
    router.push('/employees');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="p-6 space-y-6 max-w-4xl bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new employee account for HPI Sosbud staff member
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <EmployeeForm
            mode="create"
            defaultValues={{
              role: 'user', // Default to regular user
              nama_lengkap: '',
              username: '',
              email: ''
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Help Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">Employee Creation Guidelines</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>Username:</strong> Must be unique and will be used for login. Recommend format: firstname.lastname</p>
            <p><strong>Email:</strong> Should be official Kemlu email address (@kemlu.go.id)</p>
            <p><strong>NIP:</strong> 18-digit civil service identification number (optional for external staff)</p>
            <p><strong>Role:</strong> Admin users can manage all aspects, regular users have limited access</p>
            <p><strong>Status:</strong> New employees are active by default, can be deactivated later if needed</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}