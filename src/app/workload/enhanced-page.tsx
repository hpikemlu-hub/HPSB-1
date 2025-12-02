'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table';
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters';
import type { Workload, WorkloadFilters } from '@/types';

// Mock data function for demo - replace with actual API call
const mockWorkloads: Workload[] = [
  {
    id: '1',
    user_id: 'user1',
    nama: 'Persiapan Rapat Koordinasi Bilateral Indonesia-Malaysia',
    type: 'Rapat / Perundingan',
    deskripsi: 'Menyiapkan materi dan agenda untuk rapat bilateral dengan delegasi Malaysia mengenai kerjasama sosial budaya',
    status: 'on-progress',
    tgl_diterima: '2024-01-15',
    fungsi: 'SOSTERASI',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
    user: {
      id: 'user1',
      nama_lengkap: 'Dr. Ahmad Santoso, S.H., M.H.',
      nip: '198504152009031001',
      golongan: 'IV/a',
      jabatan: 'Analis Kebijakan',
      username: 'ahmad.santoso',
      role: 'user',
      is_active: true,
      email: 'ahmad.santoso@kemlu.go.id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '2',
    user_id: 'user2',
    nama: 'Tanggapan Draft Perjanjian Kerjasama Pendidikan',
    type: 'Tanggapan',
    deskripsi: 'Memberikan tanggapan hukum terhadap draft perjanjian kerjasama di bidang pendidikan',
    status: 'done',
    tgl_diterima: '2024-01-10',
    fungsi: 'HPIKSP',
    created_at: '2024-01-10T09:30:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    user: {
      id: 'user2',
      nama_lengkap: 'Siti Nurhaliza, S.H., LL.M.',
      nip: '198703102010012001',
      golongan: 'III/d',
      jabatan: 'Perancang Peraturan Perundang-undangan',
      username: 'siti.nurhaliza',
      role: 'user',
      is_active: true,
      email: 'siti.nurhaliza@kemlu.go.id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '3',
    user_id: 'user3',
    nama: 'Administrasi Pengelolaan Arsip Dokumen Perjanjian',
    type: 'Administrasi',
    deskripsi: 'Mengelola dan mengarsipkan dokumen-dokumen perjanjian internasional yang telah ditandatangani',
    status: 'pending',
    tgl_diterima: '2024-01-20',
    fungsi: 'BUTEK',
    created_at: '2024-01-20T11:15:00Z',
    updated_at: '2024-01-20T11:15:00Z',
    user: {
      id: 'user3',
      nama_lengkap: 'Budi Prasetyo, S.Sos.',
      nip: '199001051015031002',
      golongan: 'III/b',
      jabatan: 'Pranata Hukum',
      username: 'budi.prasetyo',
      role: 'user',
      is_active: true,
      email: 'budi.prasetyo@kemlu.go.id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  }
];

// Add more mock data to demonstrate pagination
for (let i = 4; i <= 50; i++) {
  mockWorkloads.push({
    id: i.toString(),
    user_id: `user${(i % 3) + 1}`,
    nama: `Kegiatan ${i} - ${['Koordinasi', 'Evaluasi', 'Implementasi', 'Monitoring'][i % 4]} Program`,
    type: ['Rapat / Perundingan', 'Tanggapan', 'Persiapan Kegiatan', 'Administrasi', 'Side Job'][i % 5],
    deskripsi: `Deskripsi detail untuk kegiatan ${i}`,
    status: ['pending', 'on-progress', 'done'][i % 3] as 'pending' | 'on-progress' | 'done',
    tgl_diterima: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    fungsi: ['SOSTERASI', 'PENISETAN', 'HPIKSP', 'BUTEK', 'NON FUNGSI'][i % 5],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user: mockWorkloads[(i % 3)].user
  });
}

export default function EnhancedWorkloadPage() {
  const router = useRouter();
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<WorkloadFilters>({});

  // Simulate API call
  const fetchWorkloads = useCallback(async (showRefreshToast = false) => {
    if (showRefreshToast) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWorkloads(mockWorkloads);
      
      if (showRefreshToast) {
        toast.success('Data berhasil diperbarui', {
          description: `${mockWorkloads.length} workload dimuat`,
        });
      }
    } catch (error) {
      toast.error('Gagal memuat data', {
        description: 'Silakan coba lagi beberapa saat',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkloads();
  }, [fetchWorkloads]);

  const handleClearFilters = () => {
    setFilters({});
    toast.info('Filter berhasil dihapus');
  };

  const handleRefresh = () => {
    fetchWorkloads(true);
  };

  const handleView = (workload: Workload) => {
    router.push(`/workload/${workload.id}`);
  };

  const handleEdit = (workload: Workload) => {
    router.push(`/workload/${workload.id}/edit`);
  };

  const handleDelete = (workload: Workload) => {
    toast.error('Fitur hapus belum tersedia', {
      description: 'Silakan hubungi administrator',
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Enhanced Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
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

        {/* Enhanced Filters */}
        <EnhancedWorkloadFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Enhanced Table with Pagination */}
        <EnhancedWorkloadTable
          workloads={workloads}
          filters={filters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          isLoading={isLoading}
        />

        {/* Footer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
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
  );
}