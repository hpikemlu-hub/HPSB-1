'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { WorkloadForm } from '@/components/workload/workload-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
      <div className="max-w-4xl space-y-6">{/* Professional form width for government standards */}
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Workload</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new workload task to track progress and manage assignments
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <WorkloadForm
            mode="create"
            defaultValues={{
              nama: user.nama_lengkap || user.nama || user.name || user.email, // Pre-fill with current user
              type: 'Administrasi',
              status: 'pending',
              tgl_diterima: new Date().toISOString().split('T')[0] // Today's date
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            currentUser={user}
          />
        </div>
      </div>
    </MainLayout>
  );
}