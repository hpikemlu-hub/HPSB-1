'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Save, 
  X, 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Hash, 
  Award, 
  Briefcase,
  Shield,
  Crown,
  ArrowLeft,
  AlertTriangle,
  Key as KeyIcon,
  Eye,
  EyeOff,
  CheckCircle,
  Circle
} from 'lucide-react';
import { userSchema } from '@/lib/validations';
import { USER_ROLES } from '@/constants';
import type { UserFormData } from '@/lib/validations';
import type { User } from '@/types';

interface ProfessionalEmployeeEditFormProps {
  employee: User;
  currentUser: User;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProfessionalEmployeeEditForm({ 
  employee, 
  currentUser, 
  onSubmit, 
  isSubmitting 
}: ProfessionalEmployeeEditFormProps) {
  const router = useRouter();
  
  // Password management state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama_lengkap: employee.nama_lengkap,
      nip: employee.nip || '',
      golongan: employee.golongan || '',
      jabatan: employee.jabatan || '',
      username: employee.username || '',
      role: employee.role,
      email: employee.email || '',
      is_active: employee.is_active ?? true
    }
  });

  const watchedRole = watch('role');

  // Check if user has government fields (not admin)
  const hasGovernmentFields = (user: User): boolean => {
    return user.role !== 'admin';
  };

  // Permission checks
  const canEditRole = (): boolean => {
    return currentUser.role === 'admin' && currentUser.id !== employee.id;
  };

  const canEditStatus = (): boolean => {
    return currentUser.role === 'admin' && currentUser.id !== employee.id;
  };

  const showGovFields = hasGovernmentFields(employee);
  const isEditingSelf = currentUser.id === employee.id;

  // Password management helper functions
  const canUpdatePassword = (): boolean => {
    return (
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      newPassword === confirmPassword &&
      currentUser.role === 'admin' &&
      currentUser.id !== employee.id
    );
  };

  const handlePasswordUpdate = async () => {
    if (!canUpdatePassword()) return;
    
    setIsUpdatingPassword(true);
    try {
      const response = await fetch(`/api/employees/${employee.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Password updated successfully for ${employee.nama_lengkap}`);
        // Clear password fields
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Network error occurred');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFormSubmit = async (data: UserFormData) => {
    console.log('🎯 FORM SUBMIT TRIGGERED from ProfessionalEmployeeEditForm');
    console.log('📋 Form data being submitted:', data);
    console.log('👤 Current user role:', currentUser.role);
    console.log('🔄 Is submitting:', isSubmitting);
    
    try {
      // If user is admin, clear government fields
      if (data.role === 'admin') {
        console.log('🔧 Clearing admin government fields');
        data.nip = undefined;
        data.golongan = undefined;
        data.jabatan = undefined;
      }
      
      console.log('📤 Calling parent onSubmit function with data:', data);
      await onSubmit(data);
      console.log('✅ Parent onSubmit completed successfully');
    } catch (error) {
      console.error('❌ Form submission error:', error);
      // Re-throw to let parent handle
      throw error;
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = confirm('Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?');
      if (!confirmLeave) return;
    }
    router.push(`/employees/${employee.id}`);
  };

  // Helper component for password requirements
  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-slate-500'}`}>
      {met ? <CheckCircle className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
      {text}
    </div>
  );

  return (
    <div className="professional-employee-edit bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Home
          </button>
          <span className="text-slate-400">/</span>
          <button 
            onClick={() => router.push('/employees')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Pegawai
          </button>
          <span className="text-slate-400">/</span>
          <button 
            onClick={() => router.push(`/employees/${employee.id}`)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {employee.nama_lengkap}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600 font-medium">Edit</span>
        </nav>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Edit Pegawai: {employee.nama_lengkap}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {isEditingSelf ? 'Mengedit profil sendiri' : 'Mengedit data pegawai'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={`${employee.role === 'admin' 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                  {employee.role === 'admin' ? 'Administrator' : 'Pegawai'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap" className="text-sm font-semibold text-slate-700 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-blue-500" />
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="nama_lengkap"
                    {...register('nama_lengkap')}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.nama_lengkap && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.nama_lengkap.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-green-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="nama@kemlu.go.id"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-purple-500" />
                    Username *
                  </Label>
                  <Input
                    id="username"
                    {...register('username')}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="username"
                  />
                  {errors.username && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Government Information - Only show for non-admin or when converting from admin */}
          {(showGovFields || watchedRole !== 'admin') && (
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-slate-600" />
                  Informasi Kepegawaian
                  {watchedRole === 'admin' && (
                    <Badge className="ml-3 bg-red-100 text-red-700 border-red-200 text-xs">
                      Tidak berlaku untuk Admin
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {watchedRole === 'admin' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800">Perhatian</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Field kepegawaian tidak berlaku untuk akun Administrator. 
                          Field ini akan dikosongkan secara otomatis.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* NIP */}
                  <div className="space-y-2">
                    <Label htmlFor="nip" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-blue-500" />
                      NIP
                    </Label>
                    <Input
                      id="nip"
                      {...register('nip')}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 font-mono"
                      placeholder="123456789012345678"
                      disabled={watchedRole === 'admin'}
                    />
                    {errors.nip && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.nip.message}
                      </p>
                    )}
                  </div>

                  {/* Golongan */}
                  <div className="space-y-2">
                    <Label htmlFor="golongan" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-red-500" />
                      Golongan
                    </Label>
                    <Input
                      id="golongan"
                      {...register('golongan')}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 professional-input"
                      placeholder="Contoh: III/a, IV/b, II/c"
                      disabled={watchedRole === 'admin'}
                      maxLength={50}
                    />
                    {errors.golongan && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.golongan.message}
                      </p>
                    )}
                  </div>

                  {/* Jabatan */}
                  <div className="space-y-2">
                    <Label htmlFor="jabatan" className="text-sm font-semibold text-slate-700 flex items-center">
                      <Crown className="w-4 h-4 mr-2 text-purple-500" />
                      Jabatan
                    </Label>
                    <Input
                      id="jabatan"
                      {...register('jabatan')}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 professional-input"
                      placeholder="Contoh: Analis, Koordinator, Staff"
                      disabled={watchedRole === 'admin'}
                      maxLength={50}
                    />
                    {errors.jabatan && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.jabatan.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Settings - Only for admin */}
          {currentUser.role === 'admin' && (
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-slate-200">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-red-600" />
                  Pengaturan Sistem
                  <Badge className="ml-3 bg-red-100 text-red-700 border-red-200 text-xs">
                    Admin Only
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role */}
                  {canEditRole() && (
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-sm font-semibold text-slate-700 flex items-center">
                        <Crown className="w-4 h-4 mr-2 text-red-500" />
                        Role *
                      </Label>
                      <Select 
                        value={watch('role')} 
                        onValueChange={(value) => setValue('role', value as 'admin' | 'user')}
                      >
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center">
                                {role.value === 'admin' ? 
                                  <Crown className="w-4 h-4 mr-2 text-red-500" /> : 
                                  <UserIcon className="w-4 h-4 mr-2 text-blue-500" />
                                }
                                {role.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.role && (
                        <p className="text-red-600 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          {errors.role.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status */}
                  {canEditStatus() && (
                    <div className="space-y-2">
                      <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        Status Akun *
                      </Label>
                      <Select 
                        value={watch('is_active') ? 'true' : 'false'} 
                        onValueChange={(value) => setValue('is_active', value === 'true')}
                      >
                        <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Aktif
                            </div>
                          </SelectItem>
                          <SelectItem value="false">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Tidak Aktif
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Password Management Section - Only for admins editing other users */}
          {currentUser.role === 'admin' && currentUser.id !== employee.id && (
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-red-800 flex items-center">
                  <KeyIcon className="w-5 h-5 mr-2 text-red-600" />
                  Change User Password
                  <Badge className="ml-2 bg-red-100 text-red-600">Admin Only</Badge>
                </CardTitle>
                <p className="text-sm text-red-600">
                  As an administrator, you can reset this user's password
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 chars)"
                        className="pr-10 border-slate-300 focus:border-red-500 focus:ring-red-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-red-50"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Password Strength Validation */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">Password Strength:</div>
                    <div className="space-y-1">
                      <PasswordRequirement met={newPassword.length >= 8} text="At least 8 characters" />
                      <PasswordRequirement met={/[A-Z]/.test(newPassword)} text="One uppercase letter" />
                      <PasswordRequirement met={/[0-9]/.test(newPassword)} text="One number" />
                      {newPassword !== confirmPassword && confirmPassword && (
                        <div className="text-red-600 text-sm flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Passwords do not match
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Update Password Button */}
                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={isUpdatingPassword || !canUpdatePassword()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <KeyIcon className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="hover:bg-slate-100 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>

                <div className="flex items-center space-x-4">
                  {isDirty && (
                    <p className="text-sm text-amber-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Ada perubahan yang belum disimpan
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}