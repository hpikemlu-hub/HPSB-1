'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Crown, 
  Star, 
  Shield,
  Save, 
  X, 
  AlertCircle,
  CheckCircle2,
  Edit3,
  UserCheck,
  Briefcase,
  Hash,
  MapPin,
  Eye
} from 'lucide-react';
import type { User as UserType } from '@/types';

interface EmployeeEditModalProps {
  employee: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEmployee: UserType) => void;
}

interface FormData {
  nama_lengkap: string;
  nip: string;
  email: string;
  jabatan: string;
  golongan: string;
  is_active: boolean;
  role: string;
}

export function EmployeeEditModal({ employee, isOpen, onClose, onSave }: EmployeeEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: '',
    nip: '',
    email: '',
    jabatan: '',
    golongan: '',
    is_active: true,
    role: 'user'
  });
  
  const [loading, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({
        nama_lengkap: employee.nama_lengkap || '',
        nip: employee.nip || '',
        email: employee.email || '',
        jabatan: employee.jabatan || '',
        golongan: employee.golongan || '',
        is_active: employee.is_active ?? true,
        role: employee.role || 'user'
      });
      setErrors({});
      setShowSuccess(false);
    }
  }, [employee]);

  // Get position level for styling
  const getPositionLevel = (jabatan: string) => {
    if (!jabatan) return 'staff';
    const jabatanLower = jabatan.toLowerCase();
    
    if (jabatanLower.includes('direktur')) return 'direktur';
    if (jabatanLower.includes('koordinator')) return 'koordinator';
    return 'staff';
  };

  // Get position styling
  const getPositionStyling = (level: string) => {
    switch (level) {
      case 'direktur':
        return {
          badge: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg',
          icon: Crown,
          color: 'text-red-600',
          bg: 'bg-red-50'
        };
      case 'koordinator':
        return {
          badge: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg',
          icon: Star,
          color: 'text-purple-600',
          bg: 'bg-purple-50'
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          icon: Shield,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        };
    }
  };

  // Get golongan styling
  const getGolonganStyling = (golongan: string) => {
    if (!golongan) return 'bg-gray-100 text-gray-800';
    
    if (golongan.startsWith('IV/')) return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold';
    if (golongan.startsWith('III/')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    if (golongan.startsWith('II/')) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    if (golongan.startsWith('I/')) return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    
    return 'bg-gray-100 text-gray-800';
  };

  // Generate avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
    }

    if (!formData.nip.trim()) {
      newErrors.nip = 'NIP wajib diisi';
    } else if (!/^\d{18}$/.test(formData.nip.replace(/\s/g, ''))) {
      newErrors.nip = 'NIP harus terdiri dari 18 digit angka';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.jabatan.trim()) {
      newErrors.jabatan = 'Jabatan wajib diisi';
    }

    if (!formData.golongan.trim()) {
      newErrors.golongan = 'Golongan wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSave = async () => {
    if (!employee || !validateForm()) return;

    setSaving(true);
    
    try {
      // Simulate API call delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedEmployee: UserType = {
        ...employee,
        ...formData,
        role: formData.role as 'admin' | 'user',
        updated_at: new Date().toISOString()
      };

      // Show success animation
      setShowSuccess(true);
      
      // Wait for success animation
      setTimeout(() => {
        onSave(updatedEmployee);
        handleClose();
        setSaving(false);
      }, 1500);

    } catch (error) {
      console.error('Error saving employee:', error);
      setErrors({ general: 'Terjadi kesalahan saat menyimpan data' });
      setSaving(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (loading) return;
    
    setFormData({
      nama_lengkap: '',
      nip: '',
      email: '',
      jabatan: '',
      golongan: '',
      is_active: true,
      role: 'user'
    });
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!employee) return null;

  const level = getPositionLevel(formData.jabatan);
  const styling = getPositionStyling(level);
  const PositionIcon = styling.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-5xl w-full max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300"
        showCloseButton={false}
      >
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-300">
            <div className="text-center">
              <div className="relative">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto animate-in zoom-in-0 duration-500" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-green-200 rounded-full animate-ping mx-auto"></div>
              </div>
              <div className="mt-6 space-y-2 animate-in slide-in-from-bottom-4 duration-700">
                <h3 className="text-xl font-bold text-slate-800">Data Berhasil Disimpan!</h3>
                <p className="text-slate-600">Perubahan data pegawai telah tersimpan</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-50 to-blue-50 -m-6 mb-0 p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                  Edit Data Pegawai
                </DialogTitle>
                <p className="text-slate-600 mt-1">
                  Perbarui informasi pegawai - HPI Sosbud Kemlu RI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-white/80 border-blue-200">
                <Crown className="w-3 h-3 mr-1 text-red-500" />
                Edit Mode
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Employee Header */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 -mx-6 px-6 py-4 border-b border-slate-200/60">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                {getInitials(formData.nama_lengkap || employee.nama_lengkap)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800">{employee.nama_lengkap}</h3>
              <div className="flex items-center space-x-3 mt-2">
                <PositionIcon className={`w-4 h-4 ${styling.color}`} />
                <Badge className={styling.badge}>
                  {employee.jabatan}
                </Badge>
                <Badge className={getGolonganStyling(employee.golongan || '')}>
                  {employee.golongan}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">NIP</div>
              <div className="font-mono text-slate-800 bg-white/80 px-3 py-1 rounded-lg border">
                {employee.nip}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Error Message */}
          {errors.general && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{errors.general}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200/60">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap" className="text-sm font-semibold text-slate-700">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={(e) => handleInputChange('nama_lengkap', e.target.value)}
                    className={`transition-all duration-200 ${errors.nama_lengkap ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`}
                    placeholder="Masukkan nama lengkap"
                    disabled={loading}
                  />
                  {errors.nama_lengkap && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.nama_lengkap}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 transition-all duration-200 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`}
                      placeholder="nama@kemlu.go.id"
                      disabled={loading}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>


              </div>
            </CardContent>
          </Card>

          {/* Position Information Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200/60">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                Informasi Jabatan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nip" className="text-sm font-semibold text-slate-700">
                    NIP *
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="nip"
                      value={formData.nip}
                      onChange={(e) => handleInputChange('nip', e.target.value)}
                      className={`pl-10 font-mono transition-all duration-200 ${errors.nip ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`}
                      placeholder="18 digit NIP"
                      disabled={loading}
                    />
                  </div>
                  {errors.nip && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.nip}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jabatan" className="text-sm font-semibold text-slate-700">
                    Jabatan *
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="jabatan"
                      value={formData.jabatan}
                      onChange={(e) => handleInputChange('jabatan', e.target.value)}
                      className={`pl-10 transition-all duration-200 ${errors.jabatan ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`}
                      placeholder="Nama jabatan"
                      disabled={loading}
                    />
                  </div>
                  {errors.jabatan && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.jabatan}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="golongan" className="text-sm font-semibold text-slate-700">
                    Golongan *
                  </Label>
                  <Input
                    id="golongan"
                    value={formData.golongan}
                    onChange={(e) => handleInputChange('golongan', e.target.value)}
                    className={`transition-all duration-200 ${errors.golongan ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'}`}
                    placeholder="II/a, III/b, IV/c, dst."
                    disabled={loading}
                  />
                  {errors.golongan && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.golongan}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Status</Label>
                  <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="status-active"
                        name="status"
                        checked={formData.is_active}
                        onChange={() => handleInputChange('is_active', true)}
                        className="text-green-600 focus:ring-green-500"
                        disabled={loading}
                      />
                      <Label htmlFor="status-active" className="text-sm font-medium text-slate-700 flex items-center">
                        <UserCheck className="w-4 h-4 mr-1 text-green-600" />
                        Aktif
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="status-inactive"
                        name="status"
                        checked={!formData.is_active}
                        onChange={() => handleInputChange('is_active', false)}
                        className="text-red-600 focus:ring-red-500"
                        disabled={loading}
                      />
                      <Label htmlFor="status-inactive" className="text-sm font-medium text-slate-700 flex items-center">
                        <X className="w-4 h-4 mr-1 text-red-600" />
                        Tidak Aktif
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-slate-100 border-b border-blue-200">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Preview Perubahan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <Avatar className="w-12 h-12 ring-2 ring-blue-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                    {getInitials(formData.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{formData.nama_lengkap || 'Nama Lengkap'}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <PositionIcon className={`w-4 h-4 ${styling.color}`} />
                    <Badge className={styling.badge}>
                      {formData.jabatan || 'Jabatan'}
                    </Badge>
                    <Badge className={getGolonganStyling(formData.golongan)}>
                      {formData.golongan || 'Golongan'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Status</div>
                  <Badge className={formData.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {formData.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Footer */}
        <Separator />
        <DialogFooter className="p-6 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-slate-600">
              * Wajib diisi | Terakhir diedit: {new Date().toLocaleTimeString('id-ID')}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}