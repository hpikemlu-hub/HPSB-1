'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Loader2, User, Mail, Hash, Award, Briefcase } from 'lucide-react';
import { userSchema } from '@/lib/validations';
import { USER_ROLES } from '@/constants';
import type { UserFormData } from '@/lib/validations';

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EmployeeForm({ mode, defaultValues, onSubmit, onCancel, isSubmitting }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama_lengkap: '',
      nip: '',
      golongan: '',
      jabatan: '',
      username: '',
      role: 'user',
      ...defaultValues
    }
  });

  const watchedRole = watch('role');

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Generate username suggestion based on full name
  const generateUsername = (fullName: string) => {
    return fullName
      .toLowerCase()
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2) // Take first two names
      .join('.')
      .replace(/[^a-z.]/g, ''); // Remove non-alphabetic characters except dots
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'New Employee Information' : 'Edit Employee Information'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <User className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="nama_lengkap">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_lengkap"
                  {...register('nama_lengkap')}
                  placeholder="Enter full name"
                  className={errors.nama_lengkap ? 'border-red-500' : ''}
                  onBlur={(e) => {
                    // Auto-generate username suggestion
                    if (mode === 'create' && e.target.value && !watch('username')) {
                      const suggestion = generateUsername(e.target.value);
                      setValue('username', suggestion);
                    }
                  }}
                />
                {errors.nama_lengkap && (
                  <p className="text-sm text-red-600">{errors.nama_lengkap.message}</p>
                )}
              </div>

              {/* NIP */}
              <div className="space-y-2">
                <Label htmlFor="nip">
                  <Hash className="h-4 w-4 inline mr-1" />
                  NIP (Civil Service ID)
                </Label>
                <Input
                  id="nip"
                  {...register('nip')}
                  placeholder="18-digit NIP number (optional)"
                  className={errors.nip ? 'border-red-500' : ''}
                  maxLength={18}
                />
                {errors.nip && (
                  <p className="text-sm text-red-600">{errors.nip.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Optional for external staff or consultants
                </p>
              </div>

              {/* Golongan */}
              <div className="space-y-2">
                <Label htmlFor="golongan">
                  <Award className="h-4 w-4 inline mr-1" />
                  Golongan (Grade)
                </Label>
                <Input
                  id="golongan"
                  {...register('golongan')}
                  placeholder="Contoh: III/a, IV/b, II/c"
                  className={errors.golongan ? 'border-red-500' : ''}
                  maxLength={50}
                />
                {errors.golongan && (
                  <p className="text-sm text-red-600">{errors.golongan.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter golongan freely (e.g., III/a, IV/b, II/c)
                </p>
              </div>

              {/* Jabatan */}
              <div className="space-y-2">
                <Label htmlFor="jabatan">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Jabatan (Position)
                </Label>
                <Input
                  id="jabatan"
                  {...register('jabatan')}
                  placeholder="Contoh: Analis, Koordinator, Staff"
                  className={errors.jabatan ? 'border-red-500' : ''}
                  maxLength={50}
                />
                {errors.jabatan && (
                  <p className="text-sm text-red-600">{errors.jabatan.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter jabatan freely (e.g., Analis, Koordinator, Staff)
                </p>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Mail className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="Enter username for login"
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Used for login. Format: firstname.lastname
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="name@kemlu.go.id"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Official government email preferred
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">
                  System Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedRole}
                  onValueChange={(value) => setValue('role', value as any, { shouldDirty: true })}
                >
                  <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                        {role.value === 'admin' && (
                          <span className="text-xs text-red-600 ml-2">(Full Access)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Admin:</strong> Full system access - can manage all employees, workloads, and settings</p>
              <p><strong>User:</strong> Limited access - can manage own workload and view shared information</p>
            </div>
          </div>

          {/* Default Password Information */}
          {mode === 'create' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 mb-2">Default Login Credentials</h4>
              <div className="text-sm text-amber-700 space-y-1">
                <p><strong>Password:</strong> New employees will receive a temporary password: <code className="bg-amber-100 px-1 rounded">password123</code></p>
                <p>They will be required to change this on first login for security.</p>
              </div>
            </div>
          )}

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
                  {mode === 'create' ? 'Create Employee' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}