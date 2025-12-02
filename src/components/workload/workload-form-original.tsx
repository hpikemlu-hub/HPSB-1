'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Loader2 } from 'lucide-react';
import { workloadSchema, type WorkloadFormData } from '@/lib/validations';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';

interface WorkloadFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<WorkloadFormData>;
  onSubmit: (data: WorkloadFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  currentUser?: any; // Add user context
}

export function WorkloadForm({ mode, defaultValues, onSubmit, onCancel, isSubmitting, currentUser }: WorkloadFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<WorkloadFormData>({
    resolver: zodResolver(workloadSchema),
    defaultValues: {
      nama: mode === 'create' && currentUser ? currentUser.nama || currentUser.name || currentUser.email : '',
      type: 'Administrasi',
      deskripsi: '',
      status: 'pending',
      tgl_diterima: '',
      fungsi: '',
      ...defaultValues
    }
  });

  const watchedStatus = watch('status');
  const watchedType = watch('type');

  const handleFormSubmit = async (data: WorkloadFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'New Workload Details' : 'Edit Workload Details'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama <span className="text-red-500">*</span>
                {mode === 'create' && currentUser && (
                  <span className="text-xs text-gray-500 ml-2 bg-green-100 px-2 py-1 rounded">
                    Auto-assigned to you
                  </span>
                )}
              </Label>
              <Input
                id="nama"
                {...register('nama')}
                placeholder="Enter nama penanggung jawab"
                className={`${errors.nama ? 'border-red-500' : ''} ${mode === 'create' && currentUser ? 'bg-gray-100 text-gray-700' : ''}`}
                disabled={mode === 'create' && currentUser}
                readOnly={mode === 'create' && currentUser}
                title={mode === 'create' && currentUser ? "Nama otomatis diisi dengan profil Anda dan tidak dapat diubah" : ""}
              />
              {mode === 'create' && currentUser && (
                <p className="text-xs text-green-600">
                  ✅ Workload akan dibuat atas nama: <strong>{currentUser.nama || currentUser.name || currentUser.email}</strong>
                </p>
              )}
              {errors.nama && (
                <p className="text-sm text-red-600">{errors.nama.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedType}
                onValueChange={(value) => setValue('type', value, { shouldDirty: true })}
              >
                <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select workload type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKLOAD_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as any, { shouldDirty: true })}
              >
                <SelectTrigger id="status" className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {WORKLOAD_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${status.color}`}></div>
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Fungsi */}
            <div className="space-y-2">
              <Label htmlFor="fungsi">Fungsi</Label>
              <Select
                value={watch('fungsi') || 'none'}
                onValueChange={(value) => setValue('fungsi', value === 'none' ? '' : value, { shouldDirty: true })}
              >
                <SelectTrigger id="fungsi">
                  <SelectValue placeholder="Select fungsi (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Fungsi</SelectItem>
                  {FUNGSI_OPTIONS.map(fungsi => (
                    <SelectItem key={fungsi} value={fungsi}>
                      {fungsi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Diterima */}
            <div className="space-y-2">
              <Label htmlFor="tgl_diterima">Tanggal Diterima</Label>
              <Input
                id="tgl_diterima"
                type="date"
                {...register('tgl_diterima')}
                className={errors.tgl_diterima ? 'border-red-500' : ''}
              />
              {errors.tgl_diterima && (
                <p className="text-sm text-red-600">{errors.tgl_diterima.message}</p>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              {...register('deskripsi')}
              placeholder="Enter detailed description of the workload..."
              rows={4}
              className={errors.deskripsi ? 'border-red-500' : ''}
            />
            {errors.deskripsi && (
              <p className="text-sm text-red-600">{errors.deskripsi.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Provide a clear description of the task, objectives, and any relevant details.
            </p>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Status Information</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Pending:</strong> Task has been assigned but not yet started</p>
              <p><strong>In Progress:</strong> Task is currently being worked on</p>
              <p><strong>Done:</strong> Task has been completed successfully</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Workload' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}