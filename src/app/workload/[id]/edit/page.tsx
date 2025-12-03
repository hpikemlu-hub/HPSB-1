'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { WorkloadForm } from '@/components/workload/workload-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { User, Workload } from '@/types';
import type { WorkloadFormData } from '@/lib/validations';

interface EditWorkloadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditWorkloadPage({ params }: EditWorkloadPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        loadWorkload(resolvedParams.id);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router, resolvedParams.id]);

  const loadWorkload = async (id: string) => {
    try {
      // PRIORITIZE REAL DATABASE DATA (same logic as detail page)
      let workloadData: Workload | null = null;
      let usingDemoData = false;
      
      try {
        // Import supabase client
        const { createClientSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseClient();
        
        // Fetch specific workload from database
        const { data, error } = await supabase
          .from('workload')
          .select(`
            id,
            user_id,
            nama,
            type,
            deskripsi,
            status,
            tgl_diterima,
            fungsi,
            created_at,
            updated_at
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Database error:', error.message);
          console.warn('Falling back to demo data due to database error');
          usingDemoData = true;
        } else if (data) {
          workloadData = data;
          console.log(`✅ Successfully loaded workload ${id} from DATABASE for editing`);
        } else {
          console.warn('No data returned from database for workload:', id);
          usingDemoData = true;
        }
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        usingDemoData = true;
      }

      // Only use demo data if database completely fails
      if (usingDemoData || !workloadData) {
        const demoWorkloads: Workload[] = [
          {
            id: '1',
            user_id: '1',
            nama: 'Rifqi Maulana',
            type: 'Administrasi',
            deskripsi: 'Pengembangan aplikasi workload sistem modern untuk digitalisasi proses kerja di Direktorat HPI Sosbud.',
            status: 'done',
            tgl_diterima: '2025-11-29',
            fungsi: 'NON FUNGSI',
            created_at: '2025-11-29T08:00:00Z',
            updated_at: '2025-11-29T16:30:00Z'
          },
          {
            id: '2',
            user_id: '2',
            nama: 'Yustisia Pratiwi Pramesti',
            type: 'Tanggapan',
            deskripsi: 'Review komprehensif draft perjanjian kerjasama RI-PNG bidang sosial budaya dan pendidikan.',
            status: 'on-progress',
            tgl_diterima: '2025-11-28',
            fungsi: 'SOSTERASI',
            created_at: '2025-11-28T09:15:00Z',
            updated_at: '2025-11-29T14:20:00Z'
          }
        ];

        const foundDemoWorkload = demoWorkloads.find(w => w.id === id);
        if (foundDemoWorkload) {
          workloadData = foundDemoWorkload;
          console.log(`⚠️ Using DEMO workload for editing ID: ${id}`);
        }
      }

      // Set the workload data
      if (workloadData) {
        setWorkload(workloadData);
      } else {
        console.error(`❌ Workload not found for editing: ${id}`);
        // Workload not found, redirect to list
        router.push('/workload');
        return;
      }
      
    } catch (error) {
      console.error('Error loading workload for editing:', error);
      // On error, redirect to list
      router.push('/workload');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: WorkloadFormData) => {
    try {
      setIsSubmitting(true);
      console.log('🔄 Starting UPDATE operation for ID:', resolvedParams.id, data);
      
      // Import supabase client
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
      // Prepare workload data for update
      const updateData = {
        nama: data.nama,
        type: data.type,
        deskripsi: data.deskripsi || '',
        status: data.status,
        tgl_diterima: data.tgl_diterima || '',
        fungsi: data.fungsi || '',
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Updating workload in database:', updateData);
      
      // Execute UPDATE operation
      const { data: updatedData, error } = await supabase
        .from('workload')
        .update(updateData)
        .eq('id', resolvedParams.id)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Database UPDATE failed:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!updatedData) {
        throw new Error('Update operation completed but no data returned');
      }
      
      console.log('✅ Workload updated successfully:', updatedData);
      
      // Update local state with optimistic update
      setWorkload(updatedData);
      
      // Show success message with toast
      const { toast } = await import('sonner');
      toast.success('Workload berhasil diperbarui!', {
        description: `${data.nama} - ${data.type}`,
        duration: 3000,
      });
      
      // Redirect to workload list (for consistency)
      router.push('/workload');
      
    } catch (error) {
      console.error('💥 Error updating workload:', error);
      
      // Show error message with toast
      const { toast } = await import('sonner');
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      
      toast.error('Gagal memperbarui workload', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Reload data to ensure UI consistency on error
      if (workload) {
        loadWorkload(resolvedParams.id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/workload/${resolvedParams.id}`);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workload data...</p>
        </div>
      </div>
    );
  }

  if (!workload) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Workload Not Found</h2>
          <p className="mt-2 text-gray-600">The workload you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.push('/workload')} className="mt-4">
            Back to Workload List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-4xl space-y-6">{/* Professional form width consistent dengan create */}
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/workload/${resolvedParams.id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Workload</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update workload information and track progress
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <WorkloadForm
            mode="edit"
            defaultValues={{
              nama: workload.nama,
              type: workload.type,
              deskripsi: workload.deskripsi || '',
              status: workload.status,
              tgl_diterima: workload.tgl_diterima || '',
              fungsi: workload.fungsi || ''
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Workload Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Workload Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium">
                {new Date(workload.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Last Updated:</span>
              <p className="font-medium">
                {new Date(workload.updated_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">ID:</span>
              <p className="font-medium font-mono">{workload.id}</p>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>
              <p className="font-medium font-mono">{workload.user_id}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}