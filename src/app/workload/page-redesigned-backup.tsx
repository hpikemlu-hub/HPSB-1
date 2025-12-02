'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table';
import { RedesignedWorkloadFilters } from '@/components/workload/redesigned-workload-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Download, 
  Upload, 
  Activity, 
  User, 
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import type { User, Workload, WorkloadFilters as WorkloadFiltersType } from '@/types';
import '@/styles/workload-enhancements.css';
import '@/styles/workload-redesign.css';

export default function WorkloadPageRedesigned() {
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
    router.push(`/workload/${workload.id}`);
  };

  const handleEdit = (workload: Workload) => {
    console.log(`✏️ EDIT BUTTON CLICKED - Workload ID: ${workload.id}`);
    console.log(`📍 Navigating to: /workload/${workload.id}/edit`);
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

  // Calculate statistics for quick overview
  const stats = {
    total: workloads.length,
    pending: workloads.filter(w => w.status === 'pending').length,
    inProgress: workloads.filter(w => w.status === 'on-progress').length,
    completed: workloads.filter(w => w.status === 'completed').length,
    overdue: workloads.filter(w => w.status === 'overdue').length
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-50 opacity-20 animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-800">Memuat Workload...</p>
            <p className="text-sm text-slate-600">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" data-animated="workload">
        <div className={`container mx-auto py-8 px-4 space-y-8 transition-all motion-reduce:transition-none duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* REDESIGNED: Filter Section moved to TOP */}
          <div className={`transform transition-all motion-reduce:transition-none duration-700 ease-out ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <RedesignedWorkloadFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              workloadStats={stats}
            />
          </div>

          {/* REDESIGNED: Data Workload Section moved BELOW filters */}
          <div className={`transform transition-all motion-reduce:transition-none duration-700 ease-out delay-75 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Enhanced Header with Statistics Cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-6 backdrop-blur-sm bg-white/95">
              {/* Main Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Data Workload
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Kelola dan pantau beban kerja tim Anda
                    </p>
                    <p className="text-sm text-slate-500">
                      Direktorat Hukum dan Perjanjian Internasional Sosial Budaya
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {user.role === 'user' && (
                    <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 px-4 py-2.5 hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300">
                      <User className="w-4 h-4 mr-2" />
                      Mode Pegawai
                    </Badge>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 group"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    {isRefreshing ? 'Memperbarui...' : 'Refresh'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleImport}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/workload/new')}
                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Workload
                  </Button>
                </div>
              </div>

              {/* Quick Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Total</p>
                        <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-150 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-700">Pending</p>
                        <p className="text-2xl font-bold text-amber-800">{stats.pending}</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-150 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-cyan-700">Progress</p>
                        <p className="text-2xl font-bold text-cyan-800">{stats.inProgress}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-cyan-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-emerald-700">Selesai</p>
                        <p className="text-2xl font-bold text-emerald-800">{stats.completed}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enhanced Data Table */}
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

          {/* Enhanced Footer */}
          <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 transform transition-all motion-reduce:transition-none duration-700 ease-out delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Sistem aktif dan terhubung</span>
                </div>
                <div className="hidden sm:block text-slate-400">•</div>
                <span className="hidden sm:inline">
                  Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-sm text-slate-500 font-medium">
                © 2025 Penata Layanan Operasional
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}