'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { GovButton } from '@/components/ui/gov-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Save, 
  X, 
  Loader2, 
  User, 
  FileText, 
  Calendar, 
  CheckCircle2,
  Building,
  Clock,
  AlertCircle,
  Info,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { workloadSchema, type WorkloadFormData } from '@/lib/validations';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';

interface WorkloadFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<WorkloadFormData>;
  onSubmit: (data: WorkloadFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  currentUser?: any;
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
      console.error('Form submission error:', error);
    }
  };

  // Status display configuration
  const statusConfig = {
    'pending': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    'on-progress': { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    'done': { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  };

  const currentStatusConfig = statusConfig[watchedStatus as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Enhanced Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {mode === 'create' ? 'New Workload Details' : 'Edit Workload Details'}
                {mode === 'create' && <Sparkles className="w-5 h-5 text-amber-500" />}
              </CardTitle>
              <p className="text-slate-600 mt-1">
                {mode === 'create' 
                  ? 'Create a new workload assignment with professional tracking capabilities'
                  : 'Update workload information and track progress efficiently'
                }
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Form Card */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Assignment Information</h3>
                  <p className="text-sm text-slate-600">Personal details and responsibility assignment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enhanced Nama Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nama" className="font-medium text-slate-700 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      Nama Penanggung Jawab
                      <span className="text-red-500">*</span>
                    </Label>
                    {mode === 'create' && currentUser && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Auto-assigned
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="nama"
                      {...register('nama')}
                      placeholder="Enter nama penanggung jawab"
                      className={`
                        h-12 transition-all duration-200 
                        ${errors.nama ? 'border-red-300 bg-red-50 focus:border-red-400' : ''} 
                        ${mode === 'create' && currentUser 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 font-medium' 
                          : 'hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                        }
                      `}
                      disabled={mode === 'create' && currentUser}
                      readOnly={mode === 'create' && currentUser}
                      title={mode === 'create' && currentUser ? "Nama otomatis diisi dengan profil Anda dan tidak dapat diubah" : ""}
                    />
                    {mode === 'create' && currentUser && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  
                  {mode === 'create' && currentUser && (
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-700">
                        Workload akan dibuat atas nama: <span className="font-semibold">{currentUser.nama || currentUser.name || currentUser.email}</span>
                      </p>
                    </div>
                  )}
                  
                  {errors.nama && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errors.nama.message}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Type Field */}
                <div className="space-y-3">
                  <Label htmlFor="type" className="font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedType}
                    onValueChange={(value) => setValue('type', value, { shouldDirty: true })}
                  >
                    <SelectTrigger 
                      id="type" 
                      className={`h-12 transition-all duration-200 ${
                        errors.type 
                          ? 'border-red-300 bg-red-50 focus:border-red-400' 
                          : 'hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      }`}
                    >
                      <SelectValue placeholder="Select workload type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKLOAD_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="cursor-pointer">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errors.type.message}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Status Field */}
                <div className="space-y-3">
                  <Label htmlFor="status" className="font-medium text-slate-700 flex items-center gap-2">
                    <currentStatusConfig.icon className={`w-4 h-4 ${currentStatusConfig.color}`} />
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watchedStatus}
                    onValueChange={(value) => setValue('status', value as any, { shouldDirty: true })}
                  >
                    <SelectTrigger 
                      id="status" 
                      className={`h-12 transition-all duration-200 ${
                        errors.status 
                          ? 'border-red-300 bg-red-50 focus:border-red-400' 
                          : 'hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                      }`}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKLOAD_STATUS.map(status => (
                        <SelectItem key={status.value} value={status.value} className="cursor-pointer">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-3 ${status.color}`}></div>
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errors.status.message}</p>
                    </div>
                  )}
                </div>

                {/* Enhanced Fungsi Field */}
                <div className="space-y-3">
                  <Label htmlFor="fungsi" className="font-medium text-slate-700 flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    Fungsi
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Optional</span>
                  </Label>
                  <Select
                    value={watch('fungsi') || 'none'}
                    onValueChange={(value) => setValue('fungsi', value === 'none' ? '' : value, { shouldDirty: true })}
                  >
                    <SelectTrigger id="fungsi" className="h-12 transition-all duration-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                      <SelectValue placeholder="Select fungsi (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="cursor-pointer">No Fungsi</SelectItem>
                      {FUNGSI_OPTIONS.map(fungsi => (
                        <SelectItem key={fungsi} value={fungsi} className="cursor-pointer">
                          {fungsi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Enhanced Date Field */}
                <div className="space-y-3">
                  <Label htmlFor="tgl_diterima" className="font-medium text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    Tanggal Diterima
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Optional</span>
                  </Label>
                  <Input
                    id="tgl_diterima"
                    type="date"
                    {...register('tgl_diterima')}
                    className={`h-12 transition-all duration-200 ${
                      errors.tgl_diterima 
                        ? 'border-red-300 bg-red-50 focus:border-red-400' 
                        : 'hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {errors.tgl_diterima && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">{errors.tgl_diterima.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Task Description</h3>
                  <p className="text-sm text-slate-600">Detailed information and objectives</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="deskripsi" className="font-medium text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Deskripsi Workload
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Optional</span>
                </Label>
                <Textarea
                  id="deskripsi"
                  {...register('deskripsi')}
                  placeholder="Describe the workload task, objectives, and any relevant details..."
                  rows={5}
                  className={`transition-all duration-200 resize-none ${
                    errors.deskripsi 
                      ? 'border-red-300 bg-red-50 focus:border-red-400' 
                      : 'hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                {errors.deskripsi && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errors.deskripsi.message}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <p className="text-sm text-slate-600">
                    Provide a clear description of the task, objectives, and any relevant details to help track progress effectively.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Information Panel */}
            <div className={`p-6 rounded-xl border-2 ${currentStatusConfig.bg} ${currentStatusConfig.border} transition-all duration-300`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                  <currentStatusConfig.icon className={`w-6 h-6 ${currentStatusConfig.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${currentStatusConfig.color} mb-3`}>Status Information Guide</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="font-medium text-amber-700">Pending</span>
                      </div>
                      <p className="text-amber-600 text-xs">Task has been assigned but not yet started</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-blue-700">In Progress</span>
                      </div>
                      <p className="text-blue-600 text-xs">Task is currently being worked on</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium text-green-700">Done</span>
                      </div>
                      <p className="text-green-600 text-xs">Task has been completed successfully</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Form Actions */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200 p-6 -mx-8 -mb-8 mt-8">
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="h-12 px-6 transition-all duration-200 hover:bg-slate-50 hover:border-slate-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                
                <GovButton
                  type="submit"
                  variant={mode === 'create' ? 'success' : 'primary'}
                  size="md"
                  loading={isSubmitting}
                  loadingText={mode === 'create' ? 'Creating...' : 'Saving...'}
                  disabled={isSubmitting || !isDirty}
                  className="h-12 px-8 min-w-[140px]"
                  icon={mode === 'create' ? Save : Save}
                >
                  {mode === 'create' ? 'Create Workload' : 'Save Changes'}
                </GovButton>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}