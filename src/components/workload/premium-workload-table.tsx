'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Hash,
  Activity,
  Tag,
  Clock,
  Building2,
  Settings,
  Loader2,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Download,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Workload, WorkloadFilters } from '@/types';
import { WORKLOAD_STATUS } from '@/constants';
import { PaginationSelector } from './pagination-selector';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PremiumWorkloadTableProps {
  workloads: Workload[];
  filters: WorkloadFilters;
  onEdit?: (workload: Workload) => void;
  onDelete?: (workload: Workload) => void;
  onView?: (workload: Workload) => void;
  isLoading?: boolean;
  currentUser?: any;
  navigationLoading?: {
    view: string | null;
    edit: string | null;
  };
}

const PAGE_SIZE_OPTIONS = [15, 35, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 15;

export function PremiumWorkloadTable({ 
  workloads, 
  filters, 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false,
  currentUser,
  navigationLoading = { view: null, edit: null }
}: PremiumWorkloadTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_PAGE_SIZE);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    workload: Workload | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    workload: null,
    isLoading: false
  });

  // Filter workloads based on current filters
  const filteredWorkloads = useMemo(() => {
    return workloads.filter(workload => {
      // Search by name
      if (filters.nama && !workload.nama.toLowerCase().includes(filters.nama.toLowerCase())) {
        return false;
      }

      // Search by description
      if (filters.deskripsi && !workload.deskripsi?.toLowerCase().includes(filters.deskripsi.toLowerCase())) {
        return false;
      }

      // Filter by status
      if (filters.status && workload.status !== filters.status) {
        return false;
      }

      // Filter by type
      if (filters.type && workload.type !== filters.type) {
        return false;
      }

      // Filter by fungsi
      if (filters.fungsi && workload.fungsi !== filters.fungsi) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom || filters.dateTo) {
        const workloadDate = new Date(workload.tgl_diterima);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (workloadDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          if (workloadDate > toDate) return false;
        }
      }

      return true;
    });
  }, [workloads, filters]);

  // Pagination
  const totalItems = filteredWorkloads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentWorkloads = filteredWorkloads.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  // Delete Handlers
  const handleDeleteClick = (workload: Workload) => {
    setDeleteDialog({ 
      isOpen: true, 
      workload, 
      isLoading: false 
    });
  };

  const handleDeleteConfirm = async (workloadId: string) => {
    const workloadToDelete = deleteDialog.workload;
    if (!workloadToDelete) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await onDelete?.(workloadToDelete);
      setDeleteDialog({ isOpen: false, workload: null, isLoading: false });
    } catch (error) {
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, workload: null, isLoading: false });
  };

  // Row selection handlers
  const toggleRowSelection = (workloadId: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(workloadId)) {
      newSelection.delete(workloadId);
    } else {
      newSelection.add(workloadId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === currentWorkloads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentWorkloads.map(w => w.id)));
    }
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        className: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300', 
        icon: Clock,
        label: 'Pending'
      },
      'on-progress': { 
        className: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300', 
        icon: TrendingUp,
        label: 'In Progress'
      },
      'completed': { 
        className: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300', 
        icon: Star,
        label: 'Completed'
      },
      'overdue': { 
        className: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300', 
        icon: Clock,
        label: 'Overdue'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} px-3 py-1.5 font-medium border shadow-sm`}>
        <Icon className="w-3 h-3 mr-1.5" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <Card className="premium-data-container">
        <CardContent className="p-12">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="space-y-2 text-center">
              <p className="text-lg font-medium text-slate-700">Memuat data workload...</p>
              <p className="text-sm text-slate-500">Mohon tunggu sebentar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredWorkloads.length === 0) {
    return (
      <Card className="premium-data-container">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-700">Tidak ada data workload</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {Object.keys(filters).length > 0 
                  ? "Tidak ditemukan workload yang sesuai dengan filter yang diterapkan. Coba ubah kriteria pencarian."
                  : "Belum ada data workload yang tersedia dalam sistem."
                }
              </p>
            </div>
            {Object.keys(filters).length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-slate-300 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* TABLE HEADER WITH CONTROLS */}
      <Card className="border-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-700">Data Management</span>
                <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                  {totalItems} Records
                </Badge>
              </div>
              
              {selectedRows.size > 0 && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {selectedRows.size} Selected
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <PaginationSelector
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setItemsPerPage}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PREMIUM DATA TABLE */}
      <Card className="premium-data-container">
        <div className="premium-table-wrapper">
          <Table className="premium-table">
            <TableHeader className="premium-table-header">
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === currentWorkloads.length && currentWorkloads.length > 0}
                    onChange={toggleAllRows}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>ID</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nama Pegawai</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Jenis</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[300px]">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Deskripsi</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[140px]">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[130px]">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Tanggal</span>
                  </div>
                </TableHead>
                <TableHead className="min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Fungsi</span>
                  </div>
                </TableHead>
                <TableHead className="w-[120px] text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Actions</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentWorkloads.map((workload, index) => (
                <TableRow 
                  key={workload.id} 
                  className={`premium-table-row ${selectedRows.has(workload.id) ? 'bg-blue-50/50 border-blue-200' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TableCell className="premium-table-cell">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(workload.id)}
                      onChange={() => toggleRowSelection(workload.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                  
                  <TableCell className="premium-table-cell">
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-600">
                        {workload.id.slice(-6)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(workload.id)}
                        className="h-6 w-6 p-0 hover:bg-slate-100"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {workload.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{workload.nama}</p>
                        <p className="text-xs text-slate-500">ID: {workload.user_id}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-medium">
                      <Tag className="w-3 h-3 mr-1" />
                      {workload.type}
                    </Badge>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <div className="max-w-xs">
                      <p className="text-sm text-slate-700 line-clamp-2" title={workload.deskripsi}>
                        {workload.deskripsi || 'Tidak ada deskripsi'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    {getStatusBadge(workload.status)}
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(workload.tgl_diterima)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 font-medium">
                      <Building2 className="w-3 h-3 mr-1" />
                      {workload.fungsi}
                    </Badge>
                  </TableCell>

                  <TableCell className="premium-table-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => onView?.(workload)}
                          disabled={navigationLoading?.view === workload.id}
                          className="hover:bg-blue-50"
                        >
                          {navigationLoading?.view === workload.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        {(currentUser?.role === 'admin' || currentUser?.id === workload.user_id) && (
                          <DropdownMenuItem 
                            onClick={() => onEdit?.(workload)}
                            disabled={navigationLoading?.edit === workload.id}
                            className="hover:bg-green-50"
                          >
                            {navigationLoading?.edit === workload.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => copyToClipboard(workload.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open in New Tab
                        </DropdownMenuItem>
                        
                        {currentUser?.role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(workload)}
                              className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* TABLE FOOTER */}
        <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <span>
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
                <strong>{totalItems}</strong> results
              </span>
              {selectedRows.size > 0 && (
                <span className="text-blue-600 font-medium">
                  {selectedRows.size} row(s) selected
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-slate-300 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <span className="px-3 py-1 bg-white border border-slate-300 rounded text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-slate-300 hover:bg-slate-100"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        workload={deleteDialog.workload}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}