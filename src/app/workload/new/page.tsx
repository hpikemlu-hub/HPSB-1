'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { WorkloadForm } from '@/components/workload/workload-form';
import { Button } from '@/components/ui/button';
import { GovButton } from '@/components/ui/gov-button';
import { ArrowLeft, Plus, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import type { User } from '@/types';
import type { WorkloadFormData } from '@/lib/validations';

export default function NewWorkloadPage() {
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: WorkloadFormData) => {
    try {
      setIsSubmitting(true);
      console.log('🔄 Starting CREATE operation:', data);
      
      // Import supabase client
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
      // Get current user for user_id
      if (!user) {
        throw new Error('User session not found');
      }
      
      const userId = user.id;
      
      // Prepare workload data for database
      const workloadData = {
        user_id: userId,
        nama: data.nama,
        type: data.type,
        deskripsi: data.deskripsi || '',
        status: data.status,
        tgl_diterima: data.tgl_diterima || new Date().toISOString().split('T')[0],
        fungsi: data.fungsi || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting workload to database:', workloadData);
      
      // Execute INSERT operation
      const { data: insertedData, error } = await supabase
        .from('workload')
        .insert(workloadData)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Database INSERT failed:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!insertedData) {
        throw new Error('Insert operation completed but no data returned');
      }
      
      console.log('✅ Workload created successfully:', insertedData);
      
      // Show success message with toast
      const { toast } = await import('sonner');
      toast.success('Workload berhasil dibuat!', {
        description: `${data.nama} - ${data.type}`,
        duration: 3000,
      });
      
      // Redirect back to workload list
      router.push('/workload');
      
    } catch (error) {
      console.error('💥 Error creating workload:', error);
      
      // Show error message with toast
      const { toast } = await import('sonner');
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      
      toast.error('Gagal membuat workload', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/workload');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 mx-auto" style={{animationDelay: '0.5s'}}></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-700">Memuat Sistem</p>
            <p className="text-sm text-slate-500">Menyiapkan form workload...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          {/* Enhanced Header Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-blue-500/5 p-6">
            <div className="flex items-start gap-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.back()}
                className="shrink-0 mt-1 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
                Kembali
              </Button>
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                    Buat Workload Baru
                  </h1>
                  <p className="mt-2 text-slate-600 leading-relaxed max-w-2xl">
                    Tambahkan tugas workload baru untuk melacak progres dan mengelola penugasan dengan sistem terintegrasi
                  </p>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Sistem Aktif</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                    <span className="text-sm font-medium text-blue-700">User: {user.nama_lengkap || user.nama || user.name || user.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Form Container */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-xl shadow-blue-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Form Input Workload</h2>
              <p className="text-blue-100 text-sm mt-1">Lengkapi informasi workload dengan detail yang akurat</p>
            </div>
            
            <div className="p-8">
              <WorkloadForm
                mode="create"
                defaultValues={{
                  nama: user.nama_lengkap || user.nama || user.name || user.email,
                  type: 'Administrasi',
                  status: 'pending',
                  tgl_diterima: new Date().toISOString().split('T')[0]
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                currentUser={user}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}