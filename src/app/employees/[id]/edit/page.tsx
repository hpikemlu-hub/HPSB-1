'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { ProfessionalEmployeeEditForm } from '@/components/employees/professional-employee-edit-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { fetchEmployeeById, updateEmployee } from '@/lib/employee-operations';
import { toast } from 'sonner';
import type { User } from '@/types';

interface EditEmployeePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { user, loading: authLoading } = useAuth();
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    if (user && !authLoading) {
      loadEmployee(resolvedParams.id);
    }
  }, [user, authLoading, resolvedParams.id]);

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Loading employee data for ID:', employeeId);
      
      const employeeData = await fetchEmployeeById(employeeId);

      if (!employeeData) {
        console.error('❌ Employee not found:', employeeId);
        toast.error('Pegawai tidak ditemukan');
        router.push('/employees');
        return;
      }

      console.log('✅ Employee data loaded successfully:', employeeData);
      setEmployee(employeeData);
      
    } catch (error) {
      console.error('❌ Error loading employee data:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    console.log('🔄 FORM SUBMIT STARTED - Updating employee');
    console.log('📝 Form data received:', formData);
    console.log('🆔 Employee ID to update:', resolvedParams.id);
    console.log('🔒 Current user:', user);
    console.log('👤 Employee being edited:', employee);
    
    setIsSubmitting(true);
    try {
      // Use centralized employee operations
      const result = await updateEmployee(resolvedParams.id, formData);

      if (result.success) {
        console.log('✅ Employee updated successfully:', result.data);
        
        // Add small delay for better UX
        setTimeout(() => {
          router.push('/employees');
        }, 500);
      } else {
        console.error('❌ Employee update failed:', result.error);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error during employee update:', error);
    } finally {
      setIsSubmitting(false);
      console.log('🏁 FORM SUBMIT COMPLETED');
    }
  };

  const handleCancel = () => {
    router.push(`/employees/${resolvedParams.id}`);
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Employee Data</p>
            <p className="text-sm text-slate-600">Preparing edit form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-slate-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Employee Not Found</h2>
          <p className="text-slate-600 mb-6">The employee you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/employees')} className="bg-gradient-to-r from-blue-600 to-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Employee List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <ProfessionalEmployeeEditForm
        employee={employee}
        currentUser={user}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  );
}