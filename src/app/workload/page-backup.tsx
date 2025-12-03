'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters';
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table';
import { ModernStatisticsDashboard } from '@/components/workload/modern-statistics-dashboard';
import { EnhancedQuickActions } from '@/components/workload/enhanced-quick-actions';
import { ProfessionalBadge } from '@/components/ui/professional-badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  TrendingUp, 
  TrendingDown,
  Users, 
  User as UserIcon,
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BarChart3, 
  Settings, 
  Zap, 
  Target,
  Eye,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import type { Workload, WorkloadFilters as WorkloadFiltersType, User, DashboardStats } from '@/types';
import { toast } from 'sonner';
import '@/styles/modern-workload-management.css';

export default function WorkloadPageRedesigned() {
  const router = useRouter();
  
  // State management with enhanced features
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [filteredWorkloads, setFilteredWorkloads] = useState<Workload[]>([]);
  const [filters, setFilters] = useState<WorkloadFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { user } = useAuth();

  // Enhanced fetch function with real database integration
  const fetchWorkloads = useCallback(async (showToast = false) => {
    try {
      const isRefresh = !loading;
      if (isRefresh) {
        setRefreshing(true);
        if (showToast) toast.info('Refreshing data...');
      } else {
        setLoading(true);
      }

      // Fetch workloads from real database
      let workloadData: Workload[] = [];
      let statsData: any = null;

      try {
        // Import supabase client
        const { createClientSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseClient();
        
        // Fetch workload data
        const { data: workloadsResponse, error: workloadError } = await supabase
          .from('workload')
          .select(`
            id,
            user_id,
            nama,
            type,
            deskripsi,
            status,
            tgl_diterima,
            tgl_deadline,
            fungsi,
            uraian,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (workloadError) {
          console.error('Database error:', workloadError.message);
          throw workloadError;
        }

        if (workloadsResponse) {
          workloadData = workloadsResponse;
          console.log(`✅ Successfully loaded ${workloadsResponse.length} workloads from database`);
          
          if (isRefresh && showToast) {
            toast.success(`Refreshed ${workloadsResponse.length} workloads`);
          }
        }

        // Fetch dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          statsData = stats.data;
        }

      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        // Fallback to minimal demo data
        workloadData = [
          {
            id: 'demo-1',
            user_id: '1',
            nama: 'Demo User',
            type: 'Administrasi',
            deskripsi: 'Demo workload - Database tidak tersedia',
            // uraian: 'Demo workload untuk testing UI', // Field removed
            status: 'pending',
            tgl_diterima: '2024-12-02',
            tgl_deadline: '2024-12-15',
            fungsi: 'DEMO',
            created_at: '2024-12-02T08:00:00Z',
            updated_at: '2024-12-02T08:00:00Z'
          },
          {
            id: 'demo-2',
            user_id: '2',
            nama: 'Demo User 2',
            type: 'Rapat / Perundingan',
            deskripsi: 'Demo workload 2 - Database tidak tersedia',
            // uraian: 'Demo workload untuk testing fitur', // Field removed
            status: 'on-progress',
            tgl_diterima: '2024-12-02',
            tgl_deadline: '2024-12-10',
            fungsi: 'DEMO',
            created_at: '2024-12-02T09:00:00Z',
            updated_at: '2024-12-02T09:00:00Z'
          },
          {
            id: 'demo-3',
            user_id: '3',
            nama: 'Demo User 3',
            type: 'Tanggapan',
            deskripsi: 'Demo workload 3 - Completed task',
            // uraian: 'Demo completed workload', // Field removed
            status: 'done',
            tgl_diterima: '2024-11-25',
            tgl_deadline: '2024-12-01',
            fungsi: 'DEMO',
            created_at: '2024-11-25T10:00:00Z',
            updated_at: '2024-12-01T16:00:00Z'
          }
        ];
        
        if (showToast) {
          toast.warning('Using demo data - Database unavailable');
        }
      }

      setWorkloads(workloadData);
      setDashboardStats(statsData);
      
    } catch (error) {
      console.error('Error fetching workloads:', error);
      toast.error('Error loading data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  // Initial data load
  useEffect(() => {
    fetchWorkloads();
  }, [fetchWorkloads]);

  // Enhanced filtering with search
  const applyFilters = useCallback(() => {
    let filtered = [...workloads];

    // Apply search query across multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(workload => 
        workload.nama?.toLowerCase().includes(query) ||
        // workload.uraian?.toLowerCase().includes(query) || // Field removed
        workload.deskripsi?.toLowerCase().includes(query) ||
        workload.type?.toLowerCase().includes(query) ||
        workload.fungsi?.toLowerCase().includes(query) ||
        workload.status?.toLowerCase().includes(query)
      );
    }

    // Apply specific filters
    if (filters.nama) {
      filtered = filtered.filter(workload => 
        workload.nama?.toLowerCase().includes(filters.nama!.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(workload => workload.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(workload => workload.status === filters.status);
    }
    if (filters.fungsi) {
      filtered = filtered.filter(workload => workload.fungsi === filters.fungsi);
    }
    if (filters.start_date) {
      filtered = filtered.filter(workload => 
        workload.tgl_diterima && new Date(workload.tgl_diterima) >= new Date(filters.start_date!)
      );
    }
    if (filters.end_date) {
      filtered = filtered.filter(workload => 
        workload.tgl_diterima && new Date(workload.tgl_diterima) <= new Date(filters.end_date!)
      );
    }

    setFilteredWorkloads(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [workloads, filters, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredWorkloads.slice(startIndex, endIndex);
  }, [filteredWorkloads, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredWorkloads.length / pageSize);

  // Handlers
  const handleFiltersChange = (newFilters: WorkloadFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSelectedItems([]);
    toast.success('Filters cleared');
  };

  const handleRefresh = () => {
    fetchWorkloads(true);
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
      
      // Step 3: Update local state (after successful delete)
      setWorkloads(prevWorkloads => 
        prevWorkloads.filter(w => w.id !== workload.id)
      );
      
      console.log(`✅ Local state updated`);
      
      // Step 4: Show success message
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
      
      // Re-fetch data to ensure UI consistency
      console.log(`🔄 Re-fetching data to ensure UI consistency...`);
      await fetchWorkloads();
      
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
    completed: workloads.filter(w => w.status === 'done').length,
    overdue: workloads.filter(w => w.status === 'pending' && w.tgl_deadline && new Date(w.tgl_deadline) < new Date()).length
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
            <EnhancedWorkloadFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
              totalRecords={workloads.length}
              filteredRecords={filteredWorkloads.length}
            />
          </div>

          {/* REDESIGNED: Data Workload Section moved BELOW filters */}
          <div className={`transform transition-all motion-reduce:transition-none duration-700 ease-out delay-75 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {/* Enhanced Header with Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 mb-6 backdrop-blur-sm bg-white/95">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end mb-8">
                {user.role === 'user' && (
                  <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 px-4 py-2.5 hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Mode Pegawai
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 group"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-300 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  {refreshing ? 'Memperbarui...' : 'Refresh'}
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
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                
                <Button
                  onClick={() => router.push('/workload/new')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Workload
                </Button>
              </div>

              {/* Statistics Dashboard */}
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
              isLoading={refreshing}
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