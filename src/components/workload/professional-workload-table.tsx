'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Filter,
  TrendingUp
} from 'lucide-react';
import { WORKLOAD_STATUS } from '@/constants';
import { Workload, WorkloadFilters } from '@/types';
import { ProfessionalPagination } from './professional-pagination';

interface ProfessionalWorkloadTableProps {
  workloads: Workload[];
  filters: WorkloadFilters;
  onEdit?: (workload: Workload) => void;
  onDelete?: (workload: Workload) => void;
  onView?: (workload: Workload) => void;
  isLoading?: boolean;
}

type SortField = 'nama' | 'type' | 'status' | 'tgl_diterima' | 'fungsi';
type SortDirection = 'asc' | 'desc';

export function ProfessionalWorkloadTable({
  workloads,
  filters,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}: ProfessionalWorkloadTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<SortField>('tgl_diterima');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get status configuration
  const getStatusConfig = (status: string) => {
    const config = WORKLOAD_STATUS.find(s => s.value === status);
    return config || { value: status, label: status, color: 'bg-gray-500' };
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'on-progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Sort workloads
  const sortedWorkloads = useMemo(() => {
    return [...workloads].sort((a, b) => {
      let aValue: string | number = a[sortField] || '';
      let bValue: string | number = b[sortField] || '';
      
      // Handle date sorting
      if (sortField === 'tgl_diterima') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = (aValue as string).toString().toLowerCase();
        bValue = (bValue as string).toString().toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [workloads, sortField, sortDirection]);

  // Paginate workloads
  const paginatedWorkloads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedWorkloads.slice(startIndex, endIndex);
  }, [sortedWorkloads, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedWorkloads.length / pageSize);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Daftar Workload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-600">Memuat data workload...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (sortedWorkloads.length === 0) {
    return (
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Daftar Workload</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-16 w-16 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">Tidak ada data workload</h3>
            <p className="text-slate-500">
              {Object.values(filters).some(f => f) 
                ? 'Coba ubah filter pencarian Anda'
                : 'Belum ada workload yang ditambahkan'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Card */}
      <Card className="shadow-lg border-slate-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Daftar Workload</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-normal">
                {sortedWorkloads.length} workload ditemukan
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    { key: 'nama', label: 'Nama Workload', icon: FileText },
                    { key: 'type', label: 'Tipe', icon: Filter },
                    { key: 'status', label: 'Status', icon: AlertCircle },
                    { key: 'tgl_diterima', label: 'Tanggal', icon: Calendar },
                    { key: 'fungsi', label: 'Fungsi', icon: User },
                  ].map(({ key, label, icon: Icon }) => (
                    <th 
                      key={key}
                      className="text-left p-4 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors duration-200"
                      onClick={() => handleSort(key as SortField)}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span>{label}</span>
                        <ArrowUpDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                  <th className="text-center p-4 font-semibold text-slate-700 w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedWorkloads.map((workload, index) => {
                  const statusConfig = getStatusConfig(workload.status);
                  return (
                    <tr 
                      key={workload.id}
                      className="hover:bg-blue-50/50 transition-all duration-200 group"
                      style={{
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                            {workload.nama}
                          </p>
                          {workload.deskripsi && (
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {workload.deskripsi}
                            </p>
                          )}
                          {workload.user && (
                            <p className="text-xs text-slate-400 flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{workload.user.nama_lengkap}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                          {workload.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          className={`${statusConfig.color} text-white flex items-center space-x-1 w-fit`}
                        >
                          {getStatusIcon(workload.status)}
                          <span>{statusConfig.label}</span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{formatDate(workload.tgl_diterima)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {workload.fungsi && (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {workload.fungsi}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-1">
                          {onView && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onView(workload)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(workload)}
                              className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(workload)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedWorkloads.map((workload, index) => {
              const statusConfig = getStatusConfig(workload.status);
              return (
                <div 
                  key={workload.id}
                  className="p-4 hover:bg-blue-50/50 transition-all duration-200"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-slate-900 flex-1">
                        {workload.nama}
                      </h3>
                      <Badge 
                        className={`${statusConfig.color} text-white flex items-center space-x-1 ml-2`}
                      >
                        {getStatusIcon(workload.status)}
                        <span className="text-xs">{statusConfig.label}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <Badge variant="outline" className="text-xs">
                          {workload.type}
                        </Badge>
                        {workload.fungsi && (
                          <Badge variant="secondary" className="text-xs">
                            {workload.fungsi}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{formatDate(workload.tgl_diterima)}</span>
                      </div>
                      
                      {workload.user && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{workload.user.nama_lengkap}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(workload)}
                          className="flex-1 text-xs h-8"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(workload)}
                          className="flex-1 text-xs h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(workload)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <ProfessionalPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedWorkloads.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[15, 35, 50, 100]}
      />
    </div>
  );
}

// Animation keyframes for CSS
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}