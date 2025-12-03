'use client';

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { ProfessionalEmployeeDetail } from '@/components/employees/professional-employee-detail';
import { ChangePasswordDialog } from '@/components/employees/change-password-dialog';
import { fetchEmployeeById } from '@/lib/employee-operations';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { User } from '@/types';

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  // Local password dialog launcher
  function PasswordActions({ employeeId, canSelf, canAdmin }: { employeeId: string; canSelf: boolean; canAdmin: boolean }) {
    const supabase = createClientSupabaseClient();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'self' | 'admin'>('self');

    return (
      <div className="fixed bottom-6 right-6 flex gap-2 z-40">
        {canSelf && (
          <Button onClick={() => { setMode('self'); setOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
            Ubah Password Saya
          </Button>
        )}
        {canAdmin && (
          <Button onClick={() => { setMode('admin'); setOpen(true); }} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
            Reset/Ubah Password Pengguna
          </Button>
        )}
        <ChangePasswordDialog open={open} onOpenChange={setOpen} mode={mode} targetUserId={mode === 'admin' ? employeeId : undefined} targetUserEmail={mode === 'admin' ? (employee?.email as string | undefined) : undefined} />
      </div>
    );
  }

  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        loadEmployee(resolvedParams.id);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router, resolvedParams.id]);

  const loadEmployee = async (id: string) => {
    try {
      setLoading(true);
      console.log('🔄 Loading employee detail for ID:', id);

      const employeeData = await fetchEmployeeById(id);

      if (!employeeData) {
        console.error('❌ Employee not found:', id);
        toast.error('Pegawai tidak ditemukan');
        router.push('/employees');
        return;
      }

      console.log('✅ Employee detail loaded successfully:', employeeData);
      setEmployee(employeeData);
      
    } catch (error) {
      console.error('❌ Error loading employee detail:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Employee Details</p>
            <p className="text-sm text-slate-600">Preparing profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  const canSelfChange = user && employee && user.id === employee.id;
  const canAdminChange = user && employee && user.role === 'admin' && user.id !== employee.id;

  if (!employee) {
    return (
      <MainLayout user={user}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pegawai Tidak Ditemukan</h2>
            <p className="text-slate-600 mb-6">Pegawai yang Anda cari tidak ada dalam sistem.</p>
            <button
              onClick={() => router.push('/employees')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
            >
              Kembali ke Daftar Pegawai
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="relative">
        <ProfessionalEmployeeDetail employee={employee} currentUser={user} />

        {(canSelfChange || canAdminChange) && (
          <PasswordActions employeeId={employee.id} canSelf={!!canSelfChange} canAdmin={!!canAdminChange} />)
        }
      </div>
    </MainLayout>
  );
}