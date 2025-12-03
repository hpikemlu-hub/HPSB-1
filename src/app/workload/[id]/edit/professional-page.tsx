'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { GovForm, GovFormSection, GovFormField, GovFormGrid, GovFormActions } from '@/components/ui/gov-form';
import { GovInput, GovSelect, GovTextarea } from '@/components/ui/gov-input';
import { GovButton } from '@/components/ui/gov-button';
import { GovStatusIndicator, GovProgressRing, GovTimeline, GovStatusCards } from '@/components/ui/gov-status';
import { 
  Briefcase, 
  FileText, 
  Users, 
  Calendar,
  Save, 
  X, 
  ArrowLeft,
  Clock,
  Play,
  CheckCircle,
  Eye,
  Target,
  User
} from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workloadSchema, type WorkloadFormData } from '@/lib/validations';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { User as UserType, Workload } from '@/types';

interface ProfessionalWorkloadEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfessionalWorkloadEditPage({ params }: ProfessionalWorkloadEditPageProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const resolvedParams = use(params);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid }
  } = useForm<WorkloadFormData>({
    resolver: zodResolver(workloadSchema),
    mode: 'onBlur'
  });

  const watchedValues = watch();
  const formProgress = calculateFormProgress(watchedValues);

  useEffect(() => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        loadWorkload(resolvedParams.id);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router, resolvedParams.id]);

  const loadWorkload = async (id: string) => {
    try {
      setLoading(true);
      let workloadData: Workload | null = null;
      let usingDemoData = false;
      
      try {
        const supabase = createClientSupabaseClient();
        
        const { data, error } = await supabase
          .from('workload')
          .select(`
            id, user_id, nama, type, deskripsi, status,
            tgl_diterima, fungsi, created_at, updated_at
          `)
          .eq('id', id)
          .single();

        if (error || !data) {
          console.warn('Database error, falling back to demo data:', error?.message);
          usingDemoData = true;
        } else {
          workloadData = data;
          console.log('✅ Successfully loaded workload from DATABASE for editing');
        }
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        usingDemoData = true;
      }

      // Demo data fallback
      if (usingDemoData || !workloadData) {
        const demoWorkloads: Workload[] = [
          {
            id: '1',
            user_id: '1',
            nama: 'Rifqi Maulana',
            type: 'Administrasi',
            deskripsi: 'Pengembangan aplikasi workload sistem modern untuk digitalisasi proses kerja di Direktorat HPI Sosbud.',
            status: 'done',
            tgl_diterima: '2025-11-29',
            fungsi: 'NON FUNGSI',
            created_at: '2025-11-29T08:00:00Z',
            updated_at: '2025-11-29T16:30:00Z'
          },
          {
            id: '2',
            user_id: '2',
            nama: 'Yustisia Pratiwi Pramesti',
            type: 'Tanggapan',
            deskripsi: 'Review komprehensif draft perjanjian kerjasama RI-PNG bidang sosial budaya dan pendidikan.',
            status: 'on-progress',
            tgl_diterima: '2025-11-28',
            fungsi: 'SOSTERASI',
            created_at: '2025-11-28T09:15:00Z',
            updated_at: '2025-11-29T14:20:00Z'
          }
        ];

        const foundDemoWorkload = demoWorkloads.find(w => w.id === id);
        if (foundDemoWorkload) {
          workloadData = foundDemoWorkload;
          console.log(`⚠️ Using DEMO workload for editing ID: ${id}`);
        }
      }

      if (workloadData) {
        setWorkload(workloadData);
        
        // Set form default values
        setValue('nama', workloadData.nama);
        setValue('type', workloadData.type);
        setValue('deskripsi', workloadData.deskripsi || '');
        setValue('status', workloadData.status);
        setValue('tgl_diterima', workloadData.tgl_diterima || '');
        setValue('fungsi', workloadData.fungsi || '');
      } else {
        console.error(`❌ Workload not found for editing: ${id}`);
        toast.error('Workload tidak ditemukan');
        router.push('/workload');
        return;
      }
      
    } catch (error) {
      console.error('Error loading workload for editing:', error);
      toast.error('Terjadi kesalahan saat memuat data workload');
      router.push('/workload');
      return;
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: WorkloadFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClientSupabaseClient();
      
      const updateData = {
        nama: formData.nama,
        type: formData.type,
        deskripsi: formData.deskripsi || '',
        status: formData.status,
        tgl_diterima: formData.tgl_diterima || '',
        fungsi: formData.fungsi || '',
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedData, error } = await supabase
        .from('workload')
        .update(updateData)
        .eq('id', resolvedParams.id)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Database UPDATE failed:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('✅ Workload updated successfully:', updatedData);
      
      toast.success('Workload berhasil diperbarui!', {
        description: `${formData.nama} - ${formData.type}`,
        duration: 3000,
      });
      
      router.push('/workload');
      
    } catch (error) {
      console.error('💥 Error updating workload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      
      toast.error('Gagal memperbarui workload', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/workload/${resolvedParams.id}`);
  };

  // Status options for the status cards
  const statusOptions = [
    {
      value: 'pending',
      label: 'Pending',
      description: 'Task awaiting initiation',
      icon: Clock,
      color: '#94a3b8'
    },
    {
      value: 'on-progress',
      label: 'In Progress',
      description: 'Currently being executed',
      icon: Play,
      color: '#f59e0b'
    },
    {
      value: 'done',
      label: 'Completed',
      description: 'Successfully finished',
      icon: CheckCircle,
      color: '#059669'
    }
  ];

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <GovProgressRing progress={60} animated className="mb-6">
            <Briefcase className="w-8 h-8 text-amber-600" />
          </GovProgressRing>
          <div className="space-y-2">
            <h2 className="gov-heading-sm text-slate-800">Loading Workload Data</h2>
            <p className="gov-body-sm text-slate-600">Preparing professional task editor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Workload not found
  if (!workload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Briefcase className="w-16 h-16 text-slate-400 mb-4 mx-auto" />
          <h2 className="gov-heading-md text-slate-800 mb-2">Workload Not Found</h2>
          <p className="gov-body-md text-slate-600 mb-6">
            The workload task you're trying to edit doesn't exist or has been removed.
          </p>
          <GovButton
            variant="primary"
            icon={ArrowLeft}
            onClick={() => router.push('/workload')}
          >
            Back to Workload List
          </GovButton>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Form */}
            <div className="xl:col-span-3">
              <GovForm
                title="Edit Workload Task"
                subtitle={`${workload.nama} - ${workload.type}`}
                icon={Briefcase}
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Task Information Section */}
                  <GovFormSection
                    title="Task Information"
                    description="Basic task details and identification"
                    icon={FileText}
                    delay={1}
                  >
                    <GovFormGrid cols={2}>
                      <GovFormField
                        label="Task Owner"
                        required
                        icon={User}
                        error={errors.nama?.message}
                        success={watchedValues.nama && !errors.nama ? "Valid name format" : undefined}
                      >
                        <GovInput
                          {...register('nama')}
                          placeholder="Enter task owner name"
                          validation={
                            errors.nama ? 
                              { state: 'error', message: errors.nama.message || 'Invalid name' } :
                            watchedValues.nama && !errors.nama ?
                              { state: 'success', message: 'Valid name format' } :
                              undefined
                          }
                        />
                      </GovFormField>

                      <GovFormField
                        label="Task Type"
                        required
                        icon={Target}
                        error={errors.type?.message}
                        helpText="Categorization of workload task"
                      >
                        <GovSelect
                          {...register('type')}
                          options={WORKLOAD_TYPES.map(type => ({ value: type, label: type }))}
                          placeholder="Select task type"
                          validation={errors.type ? { state: 'error', message: errors.type.message || 'Invalid type' } : undefined}
                        />
                      </GovFormField>
                    </GovFormGrid>

                    <GovFormField
                      label="Task Description"
                      icon={FileText}
                      error={errors.deskripsi?.message}
                      helpText="Detailed description of the task objectives and requirements"
                    >
                      <GovTextarea
                        {...register('deskripsi')}
                        placeholder="Provide a comprehensive description of the task, objectives, deliverables, and any relevant details..."
                        rows={4}
                        characterCount
                        maxLength={500}
                        validation={errors.deskripsi ? { state: 'error', message: errors.deskripsi.message || 'Invalid description' } : undefined}
                      />
                    </GovFormField>
                  </GovFormSection>

                  {/* Assignment & Responsibility Section */}
                  <GovFormSection
                    title="Assignment & Responsibility"
                    description="Organizational assignment and functional categorization"
                    icon={Users}
                    delay={2}
                  >
                    <GovFormField
                      label="Functional Unit"
                      icon={Users}
                      error={errors.fungsi?.message}
                      helpText="Organizational function responsible for this task"
                    >
                      <GovSelect
                        {...register('fungsi')}
                        options={[
                          { value: '', label: 'No Specific Function' },
                          ...FUNGSI_OPTIONS.map(fungsi => ({ value: fungsi, label: fungsi }))
                        ]}
                        placeholder="Select responsible function"
                        validation={errors.fungsi ? { state: 'error', message: errors.fungsi.message || 'Invalid function' } : undefined}
                      />
                    </GovFormField>
                  </GovFormSection>

                  {/* Timeline & Progress Section */}
                  <GovFormSection
                    title="Timeline & Progress"
                    description="Task scheduling and current progress status"
                    icon={Calendar}
                    delay={3}
                  >
                    <GovFormGrid cols={2}>
                      <GovFormField
                        label="Date Received"
                        icon={Calendar}
                        error={errors.tgl_diterima?.message}
                        helpText="When the task was officially assigned"
                      >
                        <GovInput
                          {...register('tgl_diterima')}
                          type="date"
                          validation={errors.tgl_diterima ? { state: 'error', message: errors.tgl_diterima.message || 'Invalid date' } : undefined}
                        />
                      </GovFormField>

                      <div className="flex flex-col">
                        <GovFormField
                          label="Task Status"
                          required
                          error={errors.status?.message}
                          helpText="Current progress status of the task"
                        >
                          <div className="space-y-4">
                            <GovStatusCards
                              options={statusOptions}
                              value={watchedValues.status || 'pending'}
                              onChange={(value) => setValue('status', value as any, { shouldDirty: true })}
                            />
                            {errors.status && (
                              <p className="text-sm text-red-600 flex items-center">
                                <span>⚠️ {errors.status.message}</span>
                              </p>
                            )}
                          </div>
                        </GovFormField>
                      </div>
                    </GovFormGrid>
                  </GovFormSection>

                  {/* Form Actions */}
                  <GovFormActions>
                    <GovButton
                      type="button"
                      variant="secondary"
                      icon={X}
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </GovButton>
                    
                    <GovButton
                      type="submit"
                      variant="primary"
                      icon={Save}
                      loading={isSubmitting}
                      loadingText="Updating Task..."
                      disabled={!isDirty || !isValid}
                    >
                      Update Workload
                    </GovButton>
                  </GovFormActions>
                </form>
              </GovForm>
            </div>

            {/* Professional Sidebar */}
            <div className="xl:col-span-1">
              <WorkloadEditSidebar 
                workload={workload}
                formData={watchedValues}
                progress={formProgress}
                onPreview={() => router.push(`/workload/${resolvedParams.id}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Helper component for the sidebar
function WorkloadEditSidebar({ 
  workload, 
  formData, 
  progress,
  onPreview 
}: { 
  workload: Workload;
  formData: Partial<WorkloadFormData>;
  progress: number;
  onPreview: () => void;
}) {
  // Timeline data for task progress
  const timelineItems = [
    {
      id: 'received',
      title: 'Task Received',
      description: 'Task officially assigned',
      status: 'completed' as const,
      date: workload.tgl_diterima || 'Not set',
      icon: Calendar
    },
    {
      id: 'progress',
      title: 'In Progress',
      description: 'Task is being worked on',
      status: formData.status === 'on-progress' || formData.status === 'done' ? 'completed' as const : 
              formData.status === 'pending' ? 'pending' as const : 'current' as const,
      icon: Play
    },
    {
      id: 'completed',
      title: 'Completed',
      description: 'Task successfully finished',
      status: formData.status === 'done' ? 'completed' as const : 'pending' as const,
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Form Progress */}
      <div className="gov-card">
        <div className="gov-card-content text-center">
          <GovProgressRing progress={progress} animated className="mb-4">
            <span className="text-sm font-semibold text-slate-600">{Math.round(progress)}%</span>
          </GovProgressRing>
          <h3 className="gov-heading-sm mb-2">Edit Progress</h3>
          <p className="gov-body-sm text-slate-600">
            {progress === 100 ? 'All fields completed!' : 'Continue updating task details'}
          </p>
        </div>
      </div>

      {/* Task Timeline */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 className="gov-heading-sm">Task Timeline</h3>
        </div>
        <div className="gov-card-content">
          <GovTimeline items={timelineItems} />
        </div>
      </div>

      {/* Task Preview */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 className="gov-heading-sm">Task Preview</h3>
        </div>
        <div className="gov-card-content space-y-4">
          {/* Task Header */}
          <div>
            <h4 className="font-semibold text-slate-800">
              {formData.nama || workload.nama}
            </h4>
            <p className="text-sm text-slate-600">
              {formData.type || workload.type}
            </p>
          </div>

          {/* Current Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Status:</span>
            <GovStatusIndicator 
              status={(formData.status || workload.status) as 'pending' | 'on-progress' | 'done'}
              size="sm"
              animated={formData.status === 'on-progress'}
            />
          </div>

          {/* Function Assignment */}
          {(formData.fungsi || workload.fungsi) && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Function:</span>
              <span className="font-medium">
                {formData.fungsi || workload.fungsi}
              </span>
            </div>
          )}

          {/* Preview Actions */}
          <div className="border-t pt-4">
            <GovButton
              variant="ghost"
              icon={Eye}
              fullWidth
              size="sm"
              onClick={onPreview}
            >
              View Task Details
            </GovButton>
          </div>
        </div>
      </div>

      {/* Task Metadata */}
      <div className="bg-amber-50 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-slate-800 mb-2">Task Information</h4>
        <div className="space-y-1 text-slate-600">
          <p><span className="font-medium">Created:</span> {new Date(workload.created_at).toLocaleDateString('id-ID')}</p>
          <p><span className="font-medium">Last Updated:</span> {new Date(workload.updated_at).toLocaleDateString('id-ID')}</p>
          <p><span className="font-medium">Task ID:</span> <code className="bg-amber-100 px-1 rounded text-xs">{workload.id}</code></p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate form progress
function calculateFormProgress(formData: Partial<WorkloadFormData>): number {
  const requiredFields = ['nama', 'type', 'status'];
  const optionalFields = ['deskripsi', 'tgl_diterima', 'fungsi'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  requiredFields.forEach(field => {
    if (formData[field as keyof WorkloadFormData]) filledRequired++;
  });
  
  optionalFields.forEach(field => {
    if (formData[field as keyof WorkloadFormData]) filledOptional++;
  });
  
  // Required fields worth 70%, optional fields worth 30%
  const requiredProgress = (filledRequired / requiredFields.length) * 70;
  const optionalProgress = (filledOptional / optionalFields.length) * 30;
  
  return Math.round(requiredProgress + optionalProgress);
}