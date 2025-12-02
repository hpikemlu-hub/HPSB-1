'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Trash2, 
  Loader2,
  Calendar,
  Tag,
  FileText,
  Building2,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { Workload } from '@/types';
import { WORKLOAD_STATUS } from '@/constants';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workload: Workload | null;
  onConfirm: (workloadId: string) => Promise<void>;
  isLoading?: boolean;
}

interface DeleteDialogConfig {
  confirmationText?: string;
  warningMessage?: string;
  showWorkloadDetails?: boolean;
  autoCloseOnSuccess?: boolean;
  successMessage?: string;
}

const DEFAULT_CONFIG: DeleteDialogConfig = {
  confirmationText: "Konfirmasi Hapus Workload",
  warningMessage: "Apakah Anda yakin ingin menghapus workload ini? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang permanen.",
  showWorkloadDetails: true,
  autoCloseOnSuccess: true,
  successMessage: "Workload berhasil dihapus"
};

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  workload,
  onConfirm,
  isLoading = false,
  config = DEFAULT_CONFIG
}: DeleteConfirmationDialogProps & { config?: DeleteDialogConfig }) {
  const [deleteState, setDeleteState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

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

  const handleConfirm = async () => {
    if (!workload) return;

    setDeleteState('loading');
    setErrorMessage('');

    try {
      await onConfirm(workload.id);
      setDeleteState('success');
      
      // Show success toast
      toast.success('Workload berhasil dihapus!', {
        description: `${workload.nama} telah dihapus dari sistem.`,
        duration: 4000,
      });
      
      if (mergedConfig.autoCloseOnSuccess) {
        setTimeout(() => {
          onOpenChange(false);
          setDeleteState('idle');
        }, 1000);
      }
    } catch (error) {
      setDeleteState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Gagal menghapus workload. Silakan coba lagi.');
    }
  };

  const handleCancel = () => {
    if (deleteState === 'loading') return; // Prevent closing during deletion
    onOpenChange(false);
    setDeleteState('idle');
    setErrorMessage('');
  };

  const isDeleting = isLoading || deleteState === 'loading';

  if (!workload) return null;

  const statusConfig = getStatusConfig(workload.status);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[28rem] max-w-[calc(100vw-2rem)] mx-4"
        role="alertdialog"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        data-testid="delete-confirmation-dialog"
      >
        <DialogTitle className="sr-only">
          {mergedConfig.confirmationText}
        </DialogTitle>
        
        {/* Header with Warning Icon */}
        <DialogHeader className="text-center sm:text-left space-y-4">
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <div className="p-3 bg-red-50 rounded-full border-2 border-red-200">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {mergedConfig.confirmationText}
            </h3>
          </div>
          
          <DialogDescription 
            id="delete-dialog-description"
            className="text-sm text-gray-600 leading-relaxed"
          >
            {mergedConfig.warningMessage}
          </DialogDescription>
        </DialogHeader>

        {/* Workload Details Card */}
        {mergedConfig.showWorkloadDetails && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start space-x-2">
                <Activity className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 break-words">
                    {workload.nama}
                  </h4>
                  {workload.deskripsi && (
                    <p className="text-sm text-gray-600 mt-1 break-words">
                      {workload.deskripsi}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <Tag className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-gray-600">Jenis:</span>
                  <Badge 
                    variant="outline" 
                    className="bg-purple-50 border-purple-200 text-purple-700 text-xs"
                  >
                    {workload.type}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <FileText className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">Status:</span>
                  <Badge 
                    variant="secondary"
                    className={`
                      text-xs
                      ${workload.status === 'done' && 'bg-green-100 text-green-800 border-green-200'}
                      ${workload.status === 'on-progress' && 'bg-blue-100 text-blue-800 border-blue-200'}
                      ${workload.status === 'pending' && 'bg-yellow-100 text-yellow-800 border-yellow-200'}
                    `}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>

                {workload.tgl_diterima && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-gray-600">Tanggal:</span>
                    <span className="text-xs font-medium text-gray-800">
                      {formatDate(workload.tgl_diterima)}
                    </span>
                  </div>
                )}

                {workload.fungsi && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-3 w-3 text-indigo-600" />
                    <span className="text-xs text-gray-600">Fungsi:</span>
                    <Badge 
                      variant="outline" 
                      className="bg-orange-50 border-orange-200 text-orange-700 text-xs"
                    >
                      {workload.fungsi}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-red-800">
              Data yang dihapus tidak dapat dikembalikan
            </span>
          </div>
        </div>

        {/* Error Message */}
        {deleteState === 'error' && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {deleteState === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-green-800">{mergedConfig.successMessage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto min-h-[2.75rem] sm:min-h-[2.75rem] border-slate-300 hover:bg-slate-50 text-slate-700"
            aria-label="Batalkan penghapusan"
            data-testid="cancel-delete-button"
          >
            Batal
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || deleteState === 'success'}
            className="w-full sm:w-auto min-h-[2.75rem] sm:min-h-[2.75rem] bg-red-600 hover:bg-red-700 focus-visible:ring-red-600/20"
            aria-label="Konfirmasi hapus workload"
            data-testid="confirm-delete-button"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {deleteState === 'success' ? (
              'Berhasil'
            ) : isDeleting ? (
              'Menghapus...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </>
            )}
          </Button>
        </DialogFooter>

        {/* Screen Reader Live Region */}
        <div aria-live="polite" className="sr-only">
          {deleteState === 'loading' && "Sedang menghapus workload..."}
          {deleteState === 'success' && mergedConfig.successMessage}
          {deleteState === 'error' && errorMessage}
        </div>
      </DialogContent>
    </Dialog>
  );
}