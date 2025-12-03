'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table';
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Download, Filter, Search, RefreshCw, Upload, Activity, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { User, Workload, WorkloadFilters as WorkloadFiltersType } from '@/types';
import '@/styles/workload-enhancements.css';

export default function WorkloadPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const { user, loading } = useAuth();
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<WorkloadFiltersType>({});
  const router = useRouter();

  useEffect(() => {
    // Load workloads when user is authenticated
    if (user && !loading) {
      loadWorkloads();
    }
  }, [user, loading]);

  const loadWorkloads = async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setIsRefreshing(true);
    } else {
      setIsLoadingWorkloads(true);
    }

    try {
      // PRIORITIZE REAL DATABASE DATA
      let workloadData: Workload[] = [];
      let usingDemoData = false;
      
      try {
        // Import supabase client
        const { createClientSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseClient();
        
        // Fetch workload data without user join to avoid RLS recursion
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
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Database error:', error.message);
          console.warn('Falling back to demo data due to database error');
          usingDemoData = true;
        } else if (data) {
          workloadData = data;
          console.log(`✅ Successfully loaded ${data.length} workloads from DATABASE`);
          
          if (showRefreshToast) {
            toast.success('Data berhasil dimuat dari database', {
              description: `${data.length} workload real dari Supabase`,
            });
          }
        } else {
          console.warn('No data returned from database, using demo data');
          usingDemoData = true;
        }
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        usingDemoData = true;
      }

      // Only use minimal demo data if database completely fails
      if (usingDemoData && workloadData.length === 0) {
        console.warn('⚠️ Database completely unavailable - using minimal demo data');
        const minimalDemoWorkloads: Workload[] = [
      {
        id: 'demo-1',
        user_id: '1',
        nama: 'Demo User',
        type: 'Administrasi',
        deskripsi: 'Demo workload - Database tidak tersedia',
        status: 'pending',
        tgl_diterima: '2024-12-02',
        fungsi: 'DEMO',
        created_at: '2024-12-02T08:00:00Z',
        updated_at: '2024-12-02T08:00:00Z'
      },
      {
        id: 'demo-2',
        user_id: '2',
        nama: 'Demo User 2',
        type: 'Demo',
        deskripsi: 'Demo workload 2 - Database tidak tersedia',
        status: 'on-progress',
        tgl_diterima: '2024-12-02',
        fungsi: 'DEMO',
        created_at: '2024-12-02T09:00:00Z',
        updated_at: '2024-12-02T09:00:00Z'
      }
    ];

        workloadData = minimalDemoWorkloads;
        
        if (showRefreshToast) {
          toast.error('⚠️ Database tidak tersedia', {
            description: `Menampilkan ${workloadData.length} data demo minimal. Silakan hubungi administrator.`,
          });
        } else {
          console.log(`⚠️ Using MINIMAL DEMO DATA: ${workloadData.length} demo workloads (Database unavailable)`);
        }
      }

      // Set the workload data (either from DB or demo)
      setWorkloads(workloadData);
      
      // Log final result
      if (!showRefreshToast) {
        if (usingDemoData && workloadData.length <= 2) {
          console.log(`📊 MINIMAL DEMO DATA: ${workloadData.length} fallback workload (Database unavailable)`);
        } else {
          console.log(`📊 REAL DATA: ${workloadData.length} workload dari database Supabase`);
        }
      }
    } catch (error) {
      console.error('Error in loadWorkloads:', error);
      toast.error('Gagal memuat data', {
        description: 'Silakan coba lagi beberapa saat',
      });
    } finally {
      setIsLoadingWorkloads(false);
      setIsRefreshing(false);
    }
  };

  // Handler functions
  const handleClearFilters = () => {
    setFilters({});
    toast.info('Filter berhasil dihapus');
  };

  const handleRefresh = () => {
    loadWorkloads(true);
  };


  const handleView = (workload: Workload) => {
    console.log(`👁️ VIEW BUTTON CLICKED - Workload ID: ${workload.id}`);
    console.log(`📍 Navigating to: /workload/${workload.id}`);
    
    // Simple router.push without complex navigation helper
    router.push(`/workload/${workload.id}`);
  };

  const handleEdit = (workload: Workload) => {
    console.log(`✏️ EDIT BUTTON CLICKED - Workload ID: ${workload.id}`);
    console.log(`📍 Navigating to: /workload/${workload.id}/edit`);
    
    // Simple router.push without complex navigation helper
    router.push(`/workload/${workload.id}/edit`);
  };

  const handleDelete = async (workload: Workload) => {
    try {
      console.log(`🗑️ Starting delete operation for workload ID: ${workload.id}`);
      
      // Import supabase client
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
      // Step 1: Verify the record exists before deleting
      console.log(`🔍 Verifying workload exists in database...`);
      const { data: existingRecord, error: checkError } = await supabase
        .from('workload')
        .select('id, nama')
        .eq('id', workload.id)
        .single();
        
      if (checkError || !existingRecord) {
        console.error('❌ Record not found:', checkError);
        throw new Error('Workload tidak ditemukan di database');
      }
      
      console.log(`✅ Record found: ${existingRecord.nama}`);
      
      // Step 2: Perform delete operation with verification
      console.log(`🗑️ Executing DELETE operation...`);
      const { error: deleteError, count } = await supabase
        .from('workload')
        .delete({ count: 'exact' })
        .eq('id', workload.id);
        
      if (deleteError) {
        console.error('❌ Delete operation failed:', deleteError);
        
        // Handle specific error cases
        let errorMessage = 'Gagal menghapus workload dari database';
        if (deleteError.code === 'PGRST116') {
          errorMessage = 'Workload tidak ditemukan atau sudah dihapus';
        } else if (deleteError.code === '42501') {
          errorMessage = 'Tidak memiliki izin untuk menghapus workload ini';
        } else if (deleteError.message.includes('policy')) {
          errorMessage = 'Database policy memblokir operasi delete';
        } else if (deleteError.message.includes('Network')) {
          errorMessage = 'Koneksi bermasalah. Periksa jaringan internet';
        }
        
        throw new Error(errorMessage);
      }
      
      console.log(`📊 Delete operation result - Count: ${count}`);
      
      if (!count || count === 0) {
        throw new Error('Delete operation tidak mempengaruhi data apapun');
      }
      
      // Step 3: Verify deletion was successful
      console.log(`🔍 Verifying deletion was successful...`);
      const { data: verifyData, error: verifyError } = await supabase
        .from('workload')
        .select('id')
        .eq('id', workload.id);
        
      if (verifyError) {
        console.warn('⚠️ Verification query failed:', verifyError);
        // Continue anyway since delete operation succeeded
      } else if (verifyData && verifyData.length > 0) {
        console.error('❌ Verification failed: Record still exists!');
        throw new Error('Data masih ada di database setelah delete operation');
      }
      
      console.log(`✅ Deletion verified successfully - Record no longer exists`);
      
      // Step 4: Update local state (only after database verification)
      setWorkloads(prevWorkloads => 
        prevWorkloads.filter(w => w.id !== workload.id)
      );
      
      console.log(`✅ Local state updated`);
      
      // Step 5: Log audit action (non-blocking)
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const sessionData = JSON.parse(currentUser);
          await supabase.from('audit_log').insert({
            user_id: sessionData.user.id,
            user_name: sessionData.user.nama_lengkap || 'Unknown User',
            action: 'DELETE',
            details: `Successfully deleted workload: ${workload.nama} (ID: ${workload.id})`
          });
          console.log(`📝 Audit log created`);
        }
      } catch (auditError) {
        console.warn('⚠️ Audit logging failed (non-critical):', auditError);
      }
      
      console.log(`🎉 Delete operation completed successfully`);
      
    } catch (error) {
      console.error('💥 Error in handleDelete:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      
      toast.error('Gagal menghapus workload', {
        description: errorMessage,
        duration: 5000,
      });
      
      // Re-fetch data to ensure UI consistency
      console.log(`🔄 Re-fetching data to ensure UI consistency...`);
      await loadWorkloads();
      
      throw error; // Re-throw to let dialog handle the error state
    }
  };

  const handleExport = () => {
    toast.info('Export sedang diproses', {
      description: 'File akan diunduh setelah selesai',
    });
  };

  const handleImport = () => {
    toast.info('Fitur import belum tersedia', {
      description: 'Silakan hubungi administrator',
    });
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

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" data-animated="workload">
        <div className={`container mx-auto py-6 px-4 space-y-6 transition-opacity motion-reduce:transition-none motion-reduce:opacity-100 duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Enhanced Page Header */}
          <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Manajemen Workload
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Direktorat Hukum dan Perjanjian Internasional Sosial Budaya
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Kelola dan pantau beban kerja tim secara efektif dan terstruktur
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {user.role === 'user' && (
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 px-4 py-2">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Mode Pegawai: Kelola Workload Sendiri
                    </Badge>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Memperbarui...' : 'Refresh'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleImport}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                
                <Button
                  onClick={() => router.push('/workload/new')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Workload
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Table with Pagination */}
          <div className={`transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            <EnhancedWorkloadTable
              workloads={workloads}
              filters={filters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              isLoading={isLoadingWorkloads}
              currentUser={user}
            />
          </div>

          {/* Enhanced Filters (moved below table) */}
          <div className={`transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            <EnhancedWorkloadFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              totalRecords={workloads.length}
              filteredRecords={workloads.length}
            />
          </div>

          {/* Footer Information */}
          <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sistem aktif dan terhubung</span>
                </div>
                <div className="hidden sm:block">•</div>
                <span className="hidden sm:inline">
                  Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                © 2025 Penata Layanan Oprasional
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}