'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { GovForm, GovFormSection, GovFormField, GovFormGrid, GovFormActions } from '@/components/ui/gov-form';
import { GovInput, GovSelect } from '@/components/ui/gov-input';
import { GovButton } from '@/components/ui/gov-button';
import { GovStatusIndicator, GovProgressRing } from '@/components/ui/gov-status';
import { 
  User, 
  Briefcase, 
  Shield, 
  Save, 
  X, 
  ArrowLeft,
  Mail,
  Hash,
  Award,
  UserCheck,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormData } from '@/lib/validations';
import { USER_ROLES, GOLONGAN_OPTIONS, JABATAN_OPTIONS } from '@/constants';
import type { User as UserType } from '@/types';

interface ProfessionalEmployeeEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfessionalEmployeeEditPage({ params }: ProfessionalEmployeeEditPageProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [employee, setEmployee] = useState<UserType | null>(null);
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
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
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
        loadEmployee(resolvedParams.id);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router, resolvedParams.id]);

  const loadEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const supabase = createClientSupabaseClient();

      const { data: employeeData, error } = await supabase
        .from('users')
        .select(`
          id, nama_lengkap, nip, golongan, jabatan, username, role, email, is_active, 
          created_at, updated_at
        `)
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Employee fetch error:', error);
        toast.error('Gagal memuat data pegawai');
        router.push('/employees');
        return;
      }

      if (!employeeData) {
        toast.error('Pegawai tidak ditemukan');
        router.push('/employees');
        return;
      }

      setEmployee(employeeData);
      
      // Set form default values
      setValue('nama_lengkap', employeeData.nama_lengkap);
      setValue('nip', employeeData.nip || '');
      setValue('golongan', employeeData.golongan || '');
      setValue('jabatan', employeeData.jabatan || '');
      setValue('username', employeeData.username || '');
      setValue('email', employeeData.email || '');
      setValue('role', employeeData.role);

    } catch (error) {
      console.error('Database error:', error);
      toast.error('Terjadi kesalahan saat memuat data');
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: UserFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClientSupabaseClient();
      
      const { error } = await supabase
        .from('users')
        .update({
          nama_lengkap: formData.nama_lengkap,
          nip: formData.nip,
          golongan: formData.golongan,
          jabatan: formData.jabatan,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedParams.id);

      if (error) {
        console.error('Employee update error:', error);
        toast.error('Gagal memperbarui data pegawai');
        throw error;
      }

      toast.success('Data pegawai berhasil diperbarui!', {
        description: `${formData.nama_lengkap} - ${formData.jabatan}`,
        duration: 3000,
      });
      
      router.push(`/employees/${resolvedParams.id}`);
    } catch (error) {
      console.error('Database error:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/employees/${resolvedParams.id}`);
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <GovProgressRing progress={50} animated className="mb-6">
            <User className="w-8 h-8 text-blue-600" />
          </GovProgressRing>
          <div className="space-y-2">
            <h2 className="gov-heading-sm text-slate-800">Loading Employee Data</h2>
            <p className="gov-body-sm text-slate-600">Preparing professional edit interface...</p>
          </div>
        </div>
      </div>
    );
  }

  // Employee not found
  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-slate-400 mb-4 mx-auto" />
          <h2 className="gov-heading-md text-slate-800 mb-2">Employee Not Found</h2>
          <p className="gov-body-md text-slate-600 mb-6">
            The employee you're looking for doesn't exist or has been removed.
          </p>
          <GovButton
            variant="primary"
            icon={ArrowLeft}
            onClick={() => router.push('/employees')}
          >
            Back to Employee List
          </GovButton>
        </div>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Form */}
            <div className="xl:col-span-3">
              <GovForm
                title="Edit Employee Profile"
                subtitle={`${employee.nama_lengkap} - ${employee.jabatan}`}
                icon={User}
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Personal Information Section */}
                  <GovFormSection
                    title="Personal Information"
                    description="Basic employee identification and contact details"
                    icon={User}
                    delay={1}
                  >
                    <GovFormGrid cols={2}>
                      <GovFormField
                        label="Full Name"
                        required
                        icon={User}
                        error={errors.nama_lengkap?.message}
                        success={watchedValues.nama_lengkap && !errors.nama_lengkap ? "Valid name format" : undefined}
                      >
                        <GovInput
                          {...register('nama_lengkap')}
                          placeholder="Enter employee full name"
                          validation={
                            errors.nama_lengkap ? 
                              { state: 'error' as const, message: errors.nama_lengkap.message || 'Error' } :
                            watchedValues.nama_lengkap && !errors.nama_lengkap ?
                              { state: 'success', message: 'Valid name format' } :
                              undefined
                          }
                        />
                      </GovFormField>

                      <GovFormField
                        label="NIP (Employee ID)"
                        icon={Hash}
                        error={errors.nip?.message}
                        helpText="Optional: Government employee identification number"
                      >
                        <GovInput
                          {...register('nip')}
                          placeholder="Enter NIP if applicable"
                          validation={errors.nip ? { state: 'error' as const, message: errors.nip.message || 'Error' } : undefined}
                        />
                      </GovFormField>

                      <GovFormField
                        label="Email Address"
                        icon={Mail}
                        error={errors.email?.message}
                        success={watchedValues.email && !errors.email ? "Valid email format" : undefined}
                      >
                        <GovInput
                          {...register('email')}
                          type="email"
                          placeholder="employee@example.com"
                          validation={
                            errors.email ? 
                              { state: 'error', message: errors.email.message } :
                            watchedValues.email && !errors.email ?
                              { state: 'success', message: 'Valid email format' } :
                              undefined
                          }
                        />
                      </GovFormField>

                      <GovFormField
                        label="Username"
                        icon={UserCheck}
                        error={errors.username?.message}
                        helpText="Used for system login"
                      >
                        <GovInput
                          {...register('username')}
                          placeholder="Enter username"
                          validation={errors.username ? { state: 'error', message: errors.username.message } : undefined}
                        />
                      </GovFormField>
                    </GovFormGrid>
                  </GovFormSection>

                  {/* Position & Authority Section */}
                  <GovFormSection
                    title="Position & Authority"
                    description="Employment rank, position, and organizational role"
                    icon={Briefcase}
                    delay={2}
                  >
                    <GovFormGrid cols={2}>
                      <GovFormField
                        label="Golongan (Rank)"
                        icon={Award}
                        error={errors.golongan?.message}
                        helpText="Government employment rank classification"
                      >
                        <GovSelect
                          {...register('golongan')}
                          options={GOLONGAN_OPTIONS.map(g => ({ value: g, label: g }))}
                          placeholder="Select golongan rank"
                          validation={errors.golongan ? { state: 'error', message: errors.golongan.message } : undefined}
                        />
                      </GovFormField>

                      <GovFormField
                        label="Jabatan (Position)"
                        icon={Briefcase}
                        error={errors.jabatan?.message}
                        helpText="Current organizational position"
                      >
                        <GovSelect
                          {...register('jabatan')}
                          options={JABATAN_OPTIONS.map(j => ({ value: j, label: j }))}
                          placeholder="Select position"
                          validation={errors.jabatan ? { state: 'error', message: errors.jabatan.message } : undefined}
                        />
                      </GovFormField>
                    </GovFormGrid>
                  </GovFormSection>

                  {/* System Access & Security Section */}
                  <GovFormSection
                    title="System Access & Security"
                    description="Account permissions and access control settings"
                    icon={Shield}
                    delay={3}
                  >
                    <GovFormField
                      label="System Role"
                      required
                      icon={Shield}
                      error={errors.role?.message}
                      helpText="Determines system access level and permissions"
                    >
                      <GovSelect
                        {...register('role')}
                        options={[
                          { value: 'user', label: 'User - Standard Access' },
                          { value: 'admin', label: 'Administrator - Full Access' }
                        ]}
                        validation={errors.role ? { state: 'error', message: errors.role.message } : undefined}
                      />
                    </GovFormField>

                    {/* Role Information Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Access Level Information
                      </h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Administrator:</strong> Full system access - manage all employees, workloads, and system settings</p>
                        <p><strong>User:</strong> Standard access - manage personal workload and view shared information</p>
                      </div>
                    </div>
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
                      loadingText="Saving Changes..."
                      disabled={!isDirty || !isValid}
                    >
                      Save Employee Changes
                    </GovButton>
                  </GovFormActions>
                </form>
              </GovForm>
            </div>

            {/* Professional Sidebar */}
            <div className="xl:col-span-1">
              <EmployeeEditSidebar 
                employee={employee}
                formData={watchedValues}
                progress={formProgress}
                onPreview={() => router.push(`/employees/${resolvedParams.id}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Helper component for the sidebar
function EmployeeEditSidebar({ 
  employee, 
  formData, 
  progress,
  onPreview 
}: { 
  employee: UserType;
  formData: Partial<UserFormData>;
  progress: number;
  onPreview: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Form Progress */}
      <div className="gov-card">
        <div className="gov-card-content text-center">
          <GovProgressRing progress={progress} animated className="mb-4">
            <span className="text-sm font-semibold text-slate-600">{Math.round(progress)}%</span>
          </GovProgressRing>
          <h3 className="gov-heading-sm mb-2">Form Completion</h3>
          <p className="gov-body-sm text-slate-600">
            {progress === 100 ? 'All fields completed!' : 'Continue filling required fields'}
          </p>
        </div>
      </div>

      {/* Employee Preview */}
      <div className="gov-card">
        <div className="gov-card-header">
          <h3 className="gov-heading-sm">Employee Preview</h3>
        </div>
        <div className="gov-card-content space-y-4">
          {/* Profile Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-3">
              {(formData.nama_lengkap || employee.nama_lengkap)?.charAt(0).toUpperCase()}
            </div>
            <h4 className="font-semibold text-slate-800">
              {formData.nama_lengkap || employee.nama_lengkap}
            </h4>
            <p className="text-sm text-slate-600">
              {formData.jabatan || employee.jabatan}
            </p>
          </div>

          {/* Quick Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Role:</span>
              <GovStatusIndicator 
                status={formData.role === 'admin' ? 'done' : 'pending'}
                size="sm"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Email:</span>
              <span className="font-medium truncate ml-2">
                {formData.email || employee.email || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Golongan:</span>
              <span className="font-medium">
                {formData.golongan || employee.golongan || 'Not set'}
              </span>
            </div>
          </div>

          {/* Preview Actions */}
          <div className="border-t pt-4">
            <GovButton
              variant="ghost"
              icon={Eye}
              fullWidth
              size="sm"
              onClick={onPreview}
            >
              View Full Profile
            </GovButton>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-slate-800 mb-2">Last Updated</h4>
        <p className="text-slate-600">
          {new Date(employee.updated_at).toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}

// Helper function to calculate form progress
function calculateFormProgress(formData: Partial<UserFormData>): number {
  const requiredFields = ['nama_lengkap', 'role'];
  const optionalFields = ['nip', 'email', 'username', 'golongan', 'jabatan'];
  
  let filledRequired = 0;
  let filledOptional = 0;
  
  requiredFields.forEach(field => {
    if (formData[field as keyof UserFormData]) filledRequired++;
  });
  
  optionalFields.forEach(field => {
    if (formData[field as keyof UserFormData]) filledOptional++;
  });
  
  // Required fields worth 60%, optional fields worth 40%
  const requiredProgress = (filledRequired / requiredFields.length) * 60;
  const optionalProgress = (filledOptional / optionalFields.length) * 40;
  
  return Math.round(requiredProgress + optionalProgress);
}