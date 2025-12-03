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
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Workload, WorkloadFilters } from '@/types';
import { WORKLOAD_STATUS } from '@/constants';
import { PaginationSelector } from './pagination-selector';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

interface EnhancedWorkloadTableProps {
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

export function EnhancedWorkloadTable({ 
  workloads, 
  filters, 
  onEdit, 
  onDelete, 
  onView,
  isLoading = false,
  currentUser,
  navigationLoading = { view: null, edit: null }
}: EnhancedWorkloadTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

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
      console.error('Delete failed:', error);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Filter workloads based on current filters
  const filteredWorkloads = useMemo(() => {
    const safeFilters = filters || {};
    
    // 🔍 DEBUG: Log filter inputs
    console.log('🔍 FILTER DEBUG - INPUTS:');
    console.log('   - workloads.length:', workloads.length);
    console.log('   - filters:', safeFilters);
    
    const filtered = workloads.filter((workload) => {
      let passed = true;
      let reason = '';
      
      if (safeFilters.nama && !(workload.nama || '').toLowerCase().includes(safeFilters.nama.toLowerCase())) {
        passed = false;
        reason = 'nama filter';
      }
      if (passed && safeFilters.type && workload.type !== safeFilters.type) {
        passed = false;
        reason = 'type filter';
      }
      if (passed && safeFilters.status && workload.status !== safeFilters.status) {
        passed = false;
        reason = 'status filter';
      }
      if (passed && safeFilters.fungsi && workload.fungsi !== safeFilters.fungsi) {
        passed = false;
        reason = 'fungsi filter';
      }
      if (passed && safeFilters.start_date && workload.tgl_diterima && workload.tgl_diterima < safeFilters.start_date) {
        passed = false;
        reason = 'start_date filter';
      }
      if (passed && safeFilters.end_date && workload.tgl_diterima && workload.tgl_diterima > safeFilters.end_date) {
        passed = false;
        reason = 'end_date filter';
      }
      
      // Log first few rejections for debugging
      if (!passed && workloads.indexOf(workload) < 3) {
        console.log(`   - Workload ${workload.id} REJECTED by ${reason}:`, {
          workload: {
            nama: workload.nama,
            type: workload.type,
            status: workload.status,
            fungsi: workload.fungsi,
            tgl_diterima: workload.tgl_diterima
          },
          filters: safeFilters
        });
      }
      
      return passed;
    });
    
    // Sort filtered data to ensure newest entries appear at the top
    // Sort by created_at descending (newest first) for consistent display
    return filtered.sort((a, b) => {
      // Only use created_at to determine recency so edits (updated_at) don't affect ordering
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Newest created entries first
    });
  }, [workloads, filters]);

  // Update total items when filtered workloads change
  useMemo(() => {
    setTotalItems(filteredWorkloads.length);
    
    // 🔍 DEBUG: Track pagination visibility issue
    console.log('🔍 PAGINATION DEBUG:');
    console.log('   - Raw workloads.length:', workloads.length);
    console.log('   - Filtered workloads.length:', filteredWorkloads.length);
    console.log('   - totalItems (set):', filteredWorkloads.length);
    console.log('   - Pagination will be visible:', filteredWorkloads.length > 0);
    console.log('   - Expected pages:', Math.ceil(filteredWorkloads.length / itemsPerPage));
    
    if (filteredWorkloads.length === 0 && workloads.length > 0) {
      console.warn('⚠️ PAGINATION ISSUE: Raw data exists but filtered data is empty!');
      console.log('   - Check filter logic in useMemo');
    }
  }, [filteredWorkloads, workloads.length, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredWorkloads.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination Functions
  const goToPage = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(validPage);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Permission checks
  const canEdit = (workload: Workload): boolean => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.id === workload.user_id;
  };

  const canDelete = (workload: Workload): boolean => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || currentUser.id === workload.user_id;
  };

  const getStatusConfig = (status: string) => {
    return WORKLOAD_STATUS.find(s => s.value === status) || WORKLOAD_STATUS[0];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
    } catch {
      return '-';
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {/* Data per page selector */}
      <div className="flex items-center justify-between">
        <PaginationSelector
          pageSize={itemsPerPage}
          onPageSizeChange={handleItemsPerPageChange}
          options={PAGE_SIZE_OPTIONS}
        />
        
        <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border">
          Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} data
        </div>
      </div>

      {/* Enhanced Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gradient-to-r from-slate-100 to-blue-100">
              <TableRow className="border-b-2 border-slate-200">
                <TableHead className="w-[50px] text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Hash className="h-4 w-4 text-blue-600" />
                    <span>No</span>
                  </div>
                </TableHead>
                <TableHead className="w-[350px] text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span>Nama Kegiatan</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span>Jenis</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span>Status</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <span>Tanggal Diterima</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    <span>Fungsi</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Settings className="h-4 w-4 text-slate-600" />
                    <span>Aksi</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-3 text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <FileText className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-medium">Tidak ada data workload</p>
                      <p className="text-sm">Silakan coba filter yang berbeda</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((workload, index) => {
                  const statusConfig = getStatusConfig(workload.status);
                  const isEvenRow = index % 2 === 0;
                  
                  // Row numbering: Data is sorted newest first, so row #1 = newest entry
                  // Sequential numbering 1,2,3... with newest workload at row #1
                  const rowNumber = startIndex + index + 1;
                  
                  return (
                    <TableRow 
                      key={workload.id} 
                      className={`
                        transition-all duration-200 hover:bg-blue-50/50 hover:shadow-sm
                        ${isEvenRow ? 'bg-slate-50/30' : 'bg-white'}
                        ${currentUser && currentUser.id === workload.user_id ? 'ring-2 ring-green-300 bg-green-50/50' : ''}
                        border-b border-slate-100
                      `}
                    >
                      <TableCell className="font-medium text-center">{rowNumber}</TableCell>
                      <TableCell className="w-[350px]">
                        <div className="break-words whitespace-normal leading-relaxed">
                          <div className="font-medium text-slate-800 mb-1">
                            <User className="inline h-3 w-3 mr-1 text-blue-600" />
                            {workload.nama}
                            {currentUser && currentUser.id === workload.user_id && (
                              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 font-semibold ml-2">
                                WORKLOAD SAYA
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            {workload.deskripsi || 'No description'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className="bg-purple-50 border-purple-200 text-purple-700 font-medium"
                        >
                          {workload.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="secondary"
                          className={`
                            ${workload.status === 'done' && 'bg-green-100 text-green-800 border-green-200'}
                            ${workload.status === 'on-progress' && 'bg-blue-100 text-blue-800 border-blue-200'}
                            ${workload.status === 'pending' && 'bg-yellow-100 text-yellow-800 border-yellow-200'}
                            font-medium
                          `}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-slate-600">{formatDate(workload.tgl_diterima)}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {workload.fungsi ? (
                          <Badge 
                            variant="outline" 
                            className="bg-orange-50 border-orange-200 text-orange-700 font-medium"
                          >
                            {workload.fungsi}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-1">
                          {onView && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={navigationLoading.view === workload.id}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent?.stopImmediatePropagation();
                                
                                console.log('👁️ VIEW clicked for workload:', workload.id);
                                console.log('🔍 Event details:', { 
                                  type: e.type, 
                                  defaultPrevented: e.defaultPrevented,
                                  target: e.target,
                                  currentTarget: e.currentTarget
                                });
                                
                                // Extra safety: prevent any form submission
                                const form = e.currentTarget.closest('form');
                                if (form) {
                                  console.warn('⚠️ Button is inside a form! This might cause page refresh.');
                                }
                                
                                try {
                                  await onView(workload);
                                  console.log('✅ onView handler executed successfully');
                                } catch (error) {
                                  console.error('❌ Error in onView handler:', error);
                                }
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600 disabled:opacity-50"
                              title={navigationLoading.view === workload.id ? "Loading..." : "Lihat Detail"}
                            >
                              {navigationLoading.view === workload.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {onEdit && canEdit(workload) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={navigationLoading.edit === workload.id}
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.nativeEvent?.stopImmediatePropagation();
                                
                                console.log('✏️ EDIT clicked for workload:', workload.id);
                                console.log('🔍 Event details:', { 
                                  type: e.type, 
                                  defaultPrevented: e.defaultPrevented,
                                  target: e.target,
                                  currentTarget: e.currentTarget
                                });
                                
                                // Extra safety: prevent any form submission
                                const form = e.currentTarget.closest('form');
                                if (form) {
                                  console.warn('⚠️ Button is inside a form! This might cause page refresh.');
                                }
                                
                                try {
                                  await onEdit(workload);
                                  console.log('✅ onEdit handler executed successfully');
                                } catch (error) {
                                  console.error('❌ Error in onEdit handler:', error);
                                }
                              }}
                              className="h-8 w-8 p-0 hover:bg-amber-100 text-amber-600 disabled:opacity-50"
                              title={navigationLoading.edit === workload.id ? "Loading..." : (currentUser && currentUser.id === workload.user_id ? "Edit Workload Saya" : "Edit Workload")}
                            >
                              {navigationLoading.edit === workload.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {onDelete && canDelete(workload) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(workload)}
                              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                              title={currentUser && currentUser.id === workload.user_id ? "Hapus Workload Saya" : "Hapus Workload"}
                              aria-label={`Hapus workload ${workload.nama}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination - Always show when there are workloads */}
        {(() => {
          // 🔍 DEBUG: Log pagination render decision
          console.log('🎯 PAGINATION RENDER CHECK:');
          console.log('   - totalItems:', totalItems);
          console.log('   - totalItems > 0:', totalItems > 0);
          console.log('   - Will render pagination:', totalItems > 0);
          
          return totalItems > 0;
        })() && (
          <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 hidden sm:block">
                <span className="font-medium">Halaman {currentPage}</span> dari{' '}
                <span className="font-medium">{totalPages}</span>
                <span className="text-slate-500 ml-2">
                  ({totalItems} total workload)
                </span>
              </div>

              {/* Mobile info */}
              <div className="text-sm text-slate-600 sm:hidden">
                {currentPage} / {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                {/* Navigation buttons - Only show if more than 1 page */}
                {totalPages > 1 && (
                  <>
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToFirstPage}
                      disabled={!hasPreviousPage}
                      className="hidden sm:flex items-center space-x-1 border-slate-300 hover:bg-blue-50"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                      <span>First</span>
                    </Button>

                    {/* Previous Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousPage}
                      disabled={!hasPreviousPage}
                      className="flex items-center space-x-1 border-slate-300 hover:bg-blue-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>
                  </>
                )}

                {/* Page Numbers - Show only if more than 1 page */}
                {totalPages > 1 && (
                  <div className="hidden sm:flex items-center space-x-1">
                    {generatePageNumbers().map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`
                          w-9 h-9 p-0 border-slate-300
                          ${currentPage === page 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                            : 'hover:bg-blue-50'
                          }
                        `}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Next/Last buttons - Only show if more than 1 page */}
                {totalPages > 1 && (
                  <>
                    {/* Next Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={!hasNextPage}
                      className="flex items-center space-x-1 border-slate-300 hover:bg-blue-50"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToLastPage}
                      disabled={!hasNextPage}
                      className="hidden sm:flex items-center space-x-1 border-slate-300 hover:bg-blue-50"
                    >
                      <span>Last</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => 
          setDeleteDialog(prev => ({ ...prev, isOpen: open }))
        }
        workload={deleteDialog.workload}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}