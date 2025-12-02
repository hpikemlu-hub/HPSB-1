'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { WorkloadForm } from '@/components/workload/workload-form-enhanced';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-700 font-medium">Loading workspace...</p>
            <p className="text-sm text-slate-500">Preparing your workload management environment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -m-6 p-6">
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          
          {/* Enhanced Header Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex items-center gap-6">
                {/* Back Button */}
                <GovButton
                  variant="secondary"
                  size="sm"
                  onClick={() => router.back()}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
                  icon={ArrowLeft}
                >
                  Back
                </GovButton>
                
                {/* Header Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold flex items-center gap-3">
                        Create New Workload
                        <Sparkles className="w-6 h-6 text-amber-300" />
                      </h1>
                      <p className="text-blue-100 mt-2 text-lg">
                        Add a new workload task to track progress and manage assignments effectively
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <FileText className="w-4 h-4 text-blue-200" />
                      <span className="text-sm text-blue-100">Government Standard</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-300" />
                      <span className="text-sm text-blue-100">Auto-Assignment Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breadcrumb Section */}
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <span>Workload Management</span>
                <span className="text-slate-400">/</span>
                <span>Workloads</span>
                <span className="text-slate-400">/</span>
                <span className="text-blue-600 font-medium">New Workload</span>
              </div>
            </div>

            {/* User Context Information */}
            {user && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-4 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">
                      Creating workload for: {user.nama_lengkap || user.nama || user.name || user.email}
                    </p>
                    <p className="text-green-600 text-sm">
                      Your profile information will be automatically assigned to this workload
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Form Container */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-blue-50/60 rounded-3xl blur-3xl -z-10 transform rotate-1"></div>
            
            {/* Main Form */}
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

          {/* Help Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 mb-2">Workload Creation Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="space-y-2">
                    <p><strong className="text-slate-700">Required Fields:</strong> Ensure nama and type are properly filled</p>
                    <p><strong className="text-slate-700">Status Selection:</strong> Choose appropriate status based on current progress</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong className="text-slate-700">Description:</strong> Provide clear task objectives and details</p>
                    <p><strong className="text-slate-700">Fungsi:</strong> Select organizational function if applicable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}