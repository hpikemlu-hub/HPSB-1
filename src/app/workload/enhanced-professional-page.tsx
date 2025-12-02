'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { Workload, WorkloadFilters } from '@/types';

// Enhanced Professional Components
import { ProfessionalWorkloadTable } from '@/components/workload/professional-workload-table';
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters';
import { WorkloadOverviewDashboard } from '@/components/workload/workload-overview-dashboard';
import { QuickActionPanel } from '@/components/workload/quick-action-panel';

export default function EnhancedProfessionalWorkloadPage() {
  const { user, loading: authLoading } = useAuth();
  
  // State Management
  const [workloadData, setWorkloadData] = useState<Workload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Enhanced UI State
  const [viewMode, setViewMode] = useState<'dashboard' | 'table' | 'kanban'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filter and Search State
  const [filters, setFilters] = useState<WorkloadFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'tgl_deadline',
    direction: 'desc' as 'asc' | 'desc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Data fetching
  const fetchWorkloadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await fetch('/api/workload');
      if (!response.ok) throw new Error('Failed to fetch workload data');
      
      const data = await response.json();
      setWorkloadData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching workload:', err);
      setError('Failed to load workload data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchWorkloadData();
    }
  }, [authLoading]);

  // Enhanced filtering and search logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = workloadData.filter(item => {
      // Search across multiple fields
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          item.nama?.toLowerCase().includes(searchLower) ||
          item.jenis_kegiatan?.toLowerCase().includes(searchLower) ||
          item.bentuk_kegiatan?.toLowerCase().includes(searchLower) ||
          item.fungsi?.toLowerCase().includes(searchLower) ||
          item.uraian?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Apply filters
      if (filters.nama && !item.nama?.toLowerCase().includes(filters.nama.toLowerCase())) return false;
      if (filters.type && item.jenis_kegiatan !== filters.type) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.fungsi && item.fungsi !== filters.fungsi) return false;
      
      // Date range filtering
      if (filters.start_date && item.tgl_deadline && new Date(item.tgl_deadline) < new Date(filters.start_date)) return false;
      if (filters.end_date && item.tgl_deadline && new Date(item.tgl_deadline) > new Date(filters.end_date)) return false;

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Workload];
      const bValue = b[sortConfig.key as keyof Workload];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [workloadData, filters, searchQuery, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = workloadData.length;
    const pending = workloadData.filter(item => item.status === 'pending').length;
    const inProgress = workloadData.filter(item => item.status === 'on-progress').length;
    const completed = workloadData.filter(item => item.status === 'done').length;
    
    // Calculate overdue items
    const now = new Date();
    const overdue = workloadData.filter(item => 
      item.status !== 'done' && 
      item.tgl_deadline && 
      new Date(item.tgl_deadline) < now
    ).length;

    return { total, pending, inProgress, completed, overdue };
  }, [workloadData]);

  // Event handlers
  const handleRefresh = () => {
    fetchWorkloadData(false);
  };

  const handleFilterChange = (newFilters: WorkloadFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Loading and error states
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="container mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="container mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => fetchWorkloadData()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Enhanced Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Workload Management</h1>
                <p className="text-sm text-slate-600">
                  HPI Sosbud - {stats.total} Total Records
                </p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {filteredAndSortedData.length} Filtered
              </Badge>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {/* View Toggle */}
                <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="table">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Table</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="kanban">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Kanban</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Refresh Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>

                {/* Filter Toggle */}
                <Button 
                  variant={showAdvancedFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(filters).filter(key => filters[key as keyof WorkloadFilters]).length > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 text-xs">
                      {Object.keys(filters).filter(key => filters[key as keyof WorkloadFilters]).length}
                    </Badge>
                  )}
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Quick Actions */}
              <QuickActionPanel onRefresh={handleRefresh} />
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search workload by nama, type, status, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Statistics Dashboard - Always visible */}
          <WorkloadOverviewDashboard 
            stats={stats}
            data={workloadData}
            filteredData={filteredAndSortedData}
          />

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="animate-in slide-in-from-top duration-300">
              <EnhancedWorkloadFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                totalRecords={workloadData.length}
                filteredRecords={filteredAndSortedData.length}
              />
            </div>
          )}

          {/* Content Area based on view mode */}
          {viewMode === 'dashboard' && (
            <div className="space-y-6">
              {/* Data Table */}
              <ProfessionalWorkloadTable
                data={paginatedData}
                totalRecords={filteredAndSortedData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                sortConfig={sortConfig}
                onSort={handleSort}
                onRefresh={handleRefresh}
                isLoading={refreshing}
              />
            </div>
          )}

          {viewMode === 'table' && (
            <ProfessionalWorkloadTable
              data={paginatedData}
              totalRecords={filteredAndSortedData.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              sortConfig={sortConfig}
              onSort={handleSort}
              onRefresh={handleRefresh}
              isLoading={refreshing}
            />
          )}

          {viewMode === 'kanban' && (
            <Card>
              <CardHeader>
                <CardTitle>Kanban View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-500 py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Kanban view coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}