'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters';
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table';
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
  Minimize2,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ModernEnhancedWorkloadPage() {
  // Enhanced state management
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [filteredWorkloads, setFilteredWorkloads] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
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
            uraian: 'Demo workload untuk testing UI',
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
            uraian: 'Demo workload untuk testing fitur',
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
            uraian: 'Demo completed workload',
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
        workload.uraian?.toLowerCase().includes(query) ||
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            window.location.href = '/workload/new';
            break;
          case 'f':
            e.preventDefault();
            setShowFilters(!showFilters);
            break;
          case 'r':
            e.preventDefault();
            handleRefresh();
            break;
          case 'a':
            e.preventDefault();
            if (filteredWorkloads.length > 0) {
              setSelectedItems(filteredWorkloads.map(w => w.id));
              toast.success(`Selected all ${filteredWorkloads.length} items`);
            }
            break;
          case 'd':
            e.preventDefault();
            setSelectedItems([]);
            toast.success('Deselected all items');
            break;
        }
      }
      
      // Toggle full screen
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullScreen(!isFullScreen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilters, filteredWorkloads, isFullScreen]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-8 w-64 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced CSS */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .modern-workload-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: -0.01em;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }
        
        .header-gradient {
          background: linear-gradient(135deg, rgba(30, 64, 175, 0.95), rgba(59, 130, 246, 0.9));
          color: white;
          backdrop-filter: blur(20px);
        }
        
        .action-button {
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border: none;
          color: white;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.3);
        }
        
        .search-container {
          position: relative;
        }
        
        .search-container::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }
        
        .stats-toggle {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .floating-controls {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 40;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .floating-button {
          background: rgba(30, 64, 175, 0.9);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
          transition: all 0.2s ease;
        }
        
        .floating-button:hover {
          background: rgba(29, 78, 216, 0.9);
          transform: scale(1.1);
          box-shadow: 0 8px 30px rgba(29, 78, 216, 0.4);
        }
        
        @media (max-width: 768px) {
          .floating-controls {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>

      <div className={`modern-workload-page ${isFullScreen ? 'p-4' : 'container mx-auto px-4 py-8'} space-y-8`}>
        {/* Enhanced Header */}
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Workload Management
                </h1>
                <div className="flex items-center gap-2">
                  <ProfessionalBadge variant="success" size="sm">
                    {workloads.length} Total
                  </ProfessionalBadge>
                  <ProfessionalBadge variant="info" size="sm">
                    {filteredWorkloads.length} Shown
                  </ProfessionalBadge>
                  {refreshing && (
                    <ProfessionalBadge variant="warning" size="sm">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Refreshing
                    </ProfessionalBadge>
                  )}
                </div>
              </div>
              <p className="text-slate-600 text-lg font-medium">
                Professional workload tracking and analytics dashboard
              </p>
            </div>
            
            {/* Header Controls */}
            <div className="flex flex-wrap gap-3">
              <div className="search-container">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search workloads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 glass-effect border-0 focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="glass-effect border-0 hover:bg-slate-100"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                className="glass-effect border-0 hover:bg-slate-100"
              >
                {showStats ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Statistics
              </Button>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="glass-effect border-0 hover:bg-slate-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Link href="/workload/new">
                <Button className="action-button">
                  <Plus className="h-4 w-4 mr-2" />
                  New Workload
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        {showStats && (
          <div className="stats-toggle">
            <ModernStatisticsDashboard
              workloads={workloads}
              filteredWorkloads={filteredWorkloads}
            />
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <EnhancedQuickActions
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              onRefresh={handleRefresh}
              totalItems={filteredWorkloads.length}
              filterActive={Object.keys(filters).length > 0 || searchQuery.length > 0}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Filters */}
            {showFilters && (
              <div className="transition-all duration-300 ease-in-out">
                <EnhancedWorkloadFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            {/* Enhanced Data Table */}
            <Card className="glass-effect border-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Workload Data
                    <Badge variant="outline" className="ml-2">
                      {filteredWorkloads.length} items
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">
                        Page {currentPage} of {totalPages}
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-3 py-1 border rounded text-sm glass-effect border-0"
                      >
                        <option value={15}>15 per page</option>
                        <option value={35}>35 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode(viewMode === 'compact' ? 'detailed' : 'compact')}
                      className="glass-effect border-0"
                    >
                      {viewMode === 'compact' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedWorkloadTable
                  data={paginatedData}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  selectedItems={selectedItems}
                  onSelectionChange={setSelectedItems}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Footer */}
        <Card className="glass-effect border-0">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                <div><strong>Shortcuts:</strong></div>
                <div>Ctrl+N: New</div>
                <div>Ctrl+F: Filters</div>
                <div>Ctrl+R: Refresh</div>
                <div>Ctrl+A: Select All</div>
                <div>F11: Full Screen</div>
              </div>
              <div className="text-sm text-slate-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Controls */}
      <div className="floating-controls">
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="floating-button"
          title="Toggle Full Screen (F11)"
        >
          {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="floating-button"
          title="Scroll to Top"
        >
          ↑
        </button>
      </div>
    </div>
  );
}