'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  Filter,
  Search
} from 'lucide-react';
import { Workload, WorkloadFilters } from '@/types';
import { WorkloadFilters as WorkloadFiltersComponent } from '@/components/workload/workload-filters';
import { ProfessionalWorkloadTable } from '@/components/workload/professional-workload-table';
import { supabase } from '@/lib/supabase/client';

export default function ProfessionalWorkloadPage() {
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [filteredWorkloads, setFilteredWorkloads] = useState<Workload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  
  const [filters, setFilters] = useState<WorkloadFilters>({
    nama: undefined,
    type: undefined,
    status: undefined,
    fungsi: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  // Statistics
  const stats = {
    total: filteredWorkloads.length,
    completed: filteredWorkloads.filter(w => w.status === 'done').length,
    inProgress: filteredWorkloads.filter(w => w.status === 'on-progress').length,
    pending: filteredWorkloads.filter(w => w.status === 'pending').length,
  };

  // Load workloads
  const loadWorkloads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('workloads')
        .select(`
          *,
          user:users(nama_lengkap, nip, jabatan)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWorkloads(data || []);
    } catch (err: any) {
      console.error('Error loading workloads:', err);
      setError(err.message || 'Failed to load workloads');
    } finally {
      setLoading(false);
    }
  };

  // Filter workloads
  useEffect(() => {
    let filtered = [...workloads];

    // Apply filters
    if (filters.nama) {
      filtered = filtered.filter(w => 
        w.nama.toLowerCase().includes(filters.nama!.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(w => w.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(w => w.status === filters.status);
    }

    if (filters.fungsi) {
      filtered = filtered.filter(w => w.fungsi === filters.fungsi);
    }

    if (filters.start_date) {
      filtered = filtered.filter(w => 
        w.tgl_diterima && new Date(w.tgl_diterima) >= new Date(filters.start_date!)
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(w => 
        w.tgl_diterima && new Date(w.tgl_diterima) <= new Date(filters.end_date!)
      );
    }

    setFilteredWorkloads(filtered);
  }, [workloads, filters]);

  // Load data on mount
  useEffect(() => {
    loadWorkloads();
  }, []);

  // Handle filter changes
  const handleFiltersChange = (newFilters: WorkloadFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      nama: undefined,
      type: undefined,
      status: undefined,
      fungsi: undefined,
      start_date: undefined,
      end_date: undefined,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    loadWorkloads();
  };

  // Handle actions (placeholders)
  const handleEdit = (workload: Workload) => {
    console.log('Edit workload:', workload);
    // TODO: Navigate to edit page or open modal
  };

  const handleDelete = (workload: Workload) => {
    console.log('Delete workload:', workload);
    // TODO: Show confirmation dialog and delete
  };

  const handleView = (workload: Workload) => {
    console.log('View workload:', workload);
    // TODO: Navigate to view page or open modal
  };

  const handleExport = () => {
    console.log('Export workloads');
    // TODO: Implement export functionality
  };

  const handleImport = () => {
    console.log('Import workloads');
    // TODO: Implement import functionality
  };

  const handleAddNew = () => {
    console.log('Add new workload');
    // TODO: Navigate to add page or open modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8" />
                  <span>Manajemen Workload</span>
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Sistem Manajemen Workload Direktorat Hukum dan Perjanjian Sosial Budaya
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleAddNew}
                  className="bg-white text-blue-700 hover:bg-blue-50 border-2 border-white/20 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Workload
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Workload',
                  value: stats.total,
                  icon: BarChart3,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100'
                },
                {
                  label: 'Completed',
                  value: stats.completed,
                  icon: CheckCircle2,
                  color: 'text-green-600',
                  bg: 'bg-green-100'
                },
                {
                  label: 'In Progress',
                  value: stats.inProgress,
                  icon: Clock,
                  color: 'text-blue-600',
                  bg: 'bg-blue-100'
                },
                {
                  label: 'Pending',
                  value: stats.pending,
                  icon: AlertCircle,
                  color: 'text-yellow-600',
                  bg: 'bg-yellow-100'
                },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-300 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
            </Button>
            
            {Object.values(filters).some(f => f) && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Search className="h-3 w-3 mr-1" />
                Filter Aktif
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="border-slate-300 hover:bg-slate-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-slate-300 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <WorkloadFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        {/* Main Table */}
        <div className="animate-in fade-in-0 duration-500">
          <ProfessionalWorkloadTable
            workloads={filteredWorkloads}
            filters={filters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            isLoading={loading}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 bg-white rounded-xl p-4 border border-slate-200">
          <p className="flex items-center justify-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Direktorat Hukum dan Perjanjian Sosial Budaya - Kementerian Luar Negeri RI</span>
          </p>
        </div>
      </div>
    </div>
  );
}