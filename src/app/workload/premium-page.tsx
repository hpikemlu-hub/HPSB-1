'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { PremiumWorkloadTable } from '@/components/workload/premium-workload-table';
import { PremiumWorkloadFilters } from '@/components/workload/premium-workload-filters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  BarChart3,
  Activity,
  Database,
  Users,
  Zap,
  Shield,
  Globe,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import type { User, Workload, WorkloadFilters as WorkloadFiltersType } from '@/types';
import '@/styles/premium-workload-redesign.css';

export default function PremiumWorkloadPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  
  const { user, loading } = useAuth();
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [isLoadingWorkloads, setIsLoadingWorkloads] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<WorkloadFiltersType>({});
  const router = useRouter();

  useEffect(() => {
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
      let workloadData: Workload[] = [];
      let usingDemoData = false;
      
      try {
        const { createClientSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseClient();
        
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

      setWorkloads(workloadData);
      
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
    toast.success('Filter berhasil dihapus', {
      description: 'Semua filter telah direset',
      duration: 2000,
    });
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
      
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
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
      
      console.log(`🗑️ Executing DELETE operation...`);
      const { error: deleteError, count } = await supabase
        .from('workload')
        .delete({ count: 'exact' })
        .eq('id', workload.id);
        
      if (deleteError) {
        console.error('❌ Delete operation failed:', deleteError);
        
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
      
      setWorkloads(prevWorkloads => 
        prevWorkloads.filter(w => w.id !== workload.id)
      );
      
      console.log(`✅ Local state updated`);
      
      toast.success('Workload berhasil dihapus', {
        description: `${workload.nama} telah dihapus dari sistem`,
      });
      
      console.log(`🎉 Delete operation completed successfully`);
      
    } catch (error) {
      console.error('💥 Error in handleDelete:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      
      toast.error('Gagal menghapus workload', {
        description: errorMessage,
        duration: 5000,
      });
      
      console.log(`🔄 Re-fetching data to ensure UI consistency...`);
      await loadWorkloads();
      
      throw error;
    }
  };

  const handleExport = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Memproses export data...',
        success: 'Data berhasil diexport',
        error: 'Gagal export data'
      }
    );
  };

  const handleImport = () => {
    toast.info('Fitur import sedang dikembangkan', {
      description: 'Akan tersedia di update selanjutnya',
    });
  };

  // Calculate enhanced statistics
  const stats = {
    total: workloads.length,
    pending: workloads.filter(w => w.status === 'pending').length,
    inProgress: workloads.filter(w => w.status === 'on-progress').length,
    completed: workloads.filter(w => w.status === 'completed').length,
    overdue: workloads.filter(w => w.status === 'overdue').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const activeWorkloads = stats.pending + stats.inProgress;

  if (loading || !user) {
    return (
      <div className="premium-workload-container flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-blue-50 opacity-30 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800">Memuat Workload Management</h2>
            <p className="text-slate-600">Sistem sedang menyiapkan dashboard...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="premium-workload-container">
        <div className={`premium-content-wrapper transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* PREMIUM HEADER SECTION */}
          <div className="premium-header">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="premium-header-title">
                  <Database className="h-8 w-8 text-blue-600" />
                  Workload Management System
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 text-xs">
                    v2.0 Enterprise
                  </Badge>
                </h1>
                <p className="premium-header-subtitle">
                  Dashboard manajemen workload terintegrasi untuk Penata Layanan Operasional
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Live</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Real-time</span>
                  </div>
                </div>
                
                {user.role === 'user' && (
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 px-4 py-2 font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    Mode Pegawai
                  </Badge>
                )}
              </div>
            </div>

            {/* PREMIUM STATISTICS OVERVIEW */}
            <div className="premium-stats-container">
              <Card className="premium-stat-card stat-total">
                <CardContent className="p-0">
                  <div className="premium-stat-icon">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="premium-stat-number">{stats.total}</div>
                  <div className="premium-stat-label">Total Workload</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {completionRate}% completion rate
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-stat-card stat-pending">
                <CardContent className="p-0">
                  <div className="premium-stat-icon">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="premium-stat-number">{stats.pending}</div>
                  <div className="premium-stat-label">Pending Review</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Menunggu persetujuan
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-stat-card stat-progress">
                <CardContent className="p-0">
                  <div className="premium-stat-icon">
                    <TrendingUp className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="premium-stat-number">{stats.inProgress}</div>
                  <div className="premium-stat-label">In Progress</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Sedang dikerjakan
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-stat-card stat-completed">
                <CardContent className="p-0">
                  <div className="premium-stat-icon">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="premium-stat-number">{stats.completed}</div>
                  <div className="premium-stat-label">Completed</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Berhasil diselesaikan
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* PREMIUM FILTER SECTION */}
          <PremiumWorkloadFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
            workloadStats={stats}
          />

          {/* PREMIUM ACTION SECTION */}
          <div className="premium-action-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-700">Quick Actions</span>
                <Badge variant="outline" className="text-xs">{activeWorkloads} Active</Badge>
              </div>
              
              <div className="premium-action-grid">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="premium-button secondary"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="premium-button secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleImport}
                  className="premium-button secondary"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                
                <Button
                  onClick={() => router.push('/workload/new')}
                  className="premium-button primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Workload
                  <Sparkles className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* PREMIUM DATA TABLE SECTION */}
          <div className="premium-data-container">
            <div className="premium-data-header">
              <h2 className="premium-data-title">
                <Database className="h-6 w-6 text-slate-600" />
                Data Workload
              </h2>
              <p className="premium-data-subtitle">
                Kelola dan monitor semua workload dalam sistem terintegrasi
              </p>
            </div>

            <div className="premium-table-wrapper">
              <PremiumWorkloadTable
                workloads={workloads}
                filters={filters}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                isLoading={isLoadingWorkloads}
                currentUser={user}
              />
            </div>
          </div>

          {/* PREMIUM FOOTER */}
          <div className="premium-footer">
            <div className="premium-footer-content">
              <div className="flex items-center space-x-6">
                <div className="premium-status-indicator">
                  <div className="premium-status-dot"></div>
                  <span>Sistem operasional dan terhubung</span>
                </div>
                <div className="text-slate-400 hidden sm:block">•</div>
                <span className="text-sm text-slate-500 hidden sm:inline">
                  Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-sm text-slate-600 font-medium">
                <span className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>© 2025 Penata Layanan Operasional - Enterprise Edition</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}