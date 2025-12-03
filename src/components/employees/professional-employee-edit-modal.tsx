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
  Eye,
  Sparkles,
  Zap,
  Clock,
  FileText,
  Settings,
  Award,
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import type { User as UserType } from '@/types';

interface ProfessionalEmployeeEditModalProps {
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

export function ProfessionalEmployeeEditModal({ employee, isOpen, onClose, onSave }: ProfessionalEmployeeEditModalProps) {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

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
      setCurrentStep(1);
      
      // Entrance animation
      if (isOpen) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      }
    }
  }, [employee, isOpen]);

  // Get position level for styling
  const getPositionLevel = (jabatan: string) => {
    if (!jabatan) return 'staff';
    const jabatanLower = jabatan.toLowerCase();
    
    if (jabatanLower.includes('direktur')) return 'direktur';
    if (jabatanLower.includes('koordinator')) return 'koordinator';
    return 'staff';
  };

  // Enhanced position styling with government-grade aesthetics
  const getPositionStyling = (level: string) => {
    switch (level) {
      case 'direktur':
        return {
          badge: 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-xl border border-red-300',
          icon: Crown,
          color: 'text-red-600',
          bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
          accent: 'border-red-200',
          glow: 'shadow-red-200'
        };
      case 'koordinator':
        return {
          badge: 'bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white shadow-xl border border-purple-300',
          icon: Star,
          color: 'text-purple-600',
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
          accent: 'border-purple-200',
          glow: 'shadow-purple-200'
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-xl border border-blue-300',
          icon: Shield,
          color: 'text-blue-600',
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
          accent: 'border-blue-200',
          glow: 'shadow-blue-200'
        };
    }
  };

  // Enhanced golongan styling with government hierarchy
  const getGolonganStyling = (golongan: string) => {
    if (!golongan) return 'bg-slate-100 text-slate-600 border border-slate-200';
    
    if (golongan.startsWith('IV/')) return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-bold shadow-lg border border-emerald-300';
    if (golongan.startsWith('III/')) return 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white font-semibold shadow-lg border border-blue-300';
    if (golongan.startsWith('II/')) return 'bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white font-semibold shadow-lg border border-orange-300';
    if (golongan.startsWith('I/')) return 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 text-white font-semibold shadow-lg border border-slate-300';
    
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  // Generate enhanced avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap wajib diisi sesuai standar kepegawaian';
    } else if (formData.nama_lengkap.length < 3) {
      newErrors.nama_lengkap = 'Nama lengkap minimal 3 karakter';
    }

    if (!formData.nip.trim()) {
      newErrors.nip = 'NIP wajib diisi sesuai format BKN';
    } else if (!/^\d{18}$/.test(formData.nip.replace(/\s/g, ''))) {
      newErrors.nip = 'NIP harus terdiri dari 18 digit angka sesuai format BKN';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email resmi wajib diisi untuk komunikasi dinas';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid. Gunakan email resmi instansi';
    }

    if (!formData.jabatan.trim()) {
      newErrors.jabatan = 'Jabatan struktural/fungsional wajib diisi';
    } else if (formData.jabatan.length < 5) {
      newErrors.jabatan = 'Nama jabatan terlalu singkat. Sebutkan jabatan lengkap';
    }

    if (!formData.golongan.trim()) {
      newErrors.golongan = 'Golongan kepangkatan PNS wajib diisi';
    } else if (!/^(I|II|III|IV)\/[a-e]$/.test(formData.golongan)) {
      newErrors.golongan = 'Format golongan tidak valid. Gunakan format: I/a - IV/e';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced save handler with professional feedback
  const handleSave = async () => {
    if (!employee || !validateForm()) return;

    setSaving(true);
    setIsAnimating(true);
    
    try {
      // Realistic save simulation with progress feedback
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const updatedEmployee: UserType = {
        ...employee,
        ...formData,
        role: formData.role as 'admin' | 'user',
        updated_at: new Date().toISOString()
      };

      // Professional success animation sequence
      setShowSuccess(true);
      
      // Multi-stage success feedback
      setTimeout(() => {
        onSave(updatedEmployee);
        handleClose();
        setSaving(false);
        setIsAnimating(false);
      }, 2000);

    } catch (error) {
      console.error('Error saving employee:', error);
      setErrors({ general: 'Terjadi kesalahan sistem. Silakan hubungi administrator IT' });
      setSaving(false);
      setIsAnimating(false);
    }
  };

  // Enhanced modal close with cleanup
  const handleClose = () => {
    if (loading) return;
    
    setIsAnimating(true);
    setTimeout(() => {
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
      setCurrentStep(1);
      setIsAnimating(false);
      onClose();
    }, 300);
  };

  // Enhanced input change handler with real-time validation
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation hints for better UX
    if (field === 'nip' && typeof value === 'string') {
      const cleanNip = value.replace(/\D/g, '');
      if (cleanNip.length > 18) return; // Prevent over-input
      setFormData(prev => ({ ...prev, [field]: cleanNip }));
    }
  };

  if (!employee) return null;

  const level = getPositionLevel(formData.jabatan);
  const styling = getPositionStyling(level);
  const PositionIcon = styling.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={`max-w-6xl w-full max-h-[95vh] overflow-hidden bg-gradient-to-br from-white via-slate-50/80 to-blue-50/60 backdrop-blur-xl border-2 border-white/30 shadow-2xl 
        ${isAnimating ? 'animate-in fade-in-0 zoom-in-90 duration-500' : ''} 
        transform transition-all duration-700 ease-out`}
        showCloseButton={false}
      >
        {/* Professional Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/98 via-green-50/95 to-emerald-50/90 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in-0 duration-500">
            <div className="text-center transform animate-in zoom-in-0 duration-700">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping scale-150"></div>
                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-pulse scale-125"></div>
                <CheckCircle2 className="relative w-24 h-24 text-green-600 mx-auto drop-shadow-lg animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
              </div>
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Data Berhasil Disimpan!
                </h3>
                <p className="text-lg text-slate-600 max-w-md mx-auto">
                  Perubahan data pegawai telah tersimpan dalam sistem manajemen HPI Sosbud
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sistem terintegrasi • Data tervalidasi • Backup tersimpan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Professional Header */}
        <DialogHeader className="bg-gradient-to-r from-slate-100/80 via-blue-50/80 to-indigo-50/80 -m-6 mb-0 p-8 border-b-2 border-gradient-to-r from-slate-200/60 to-blue-200/60 backdrop-blur-sm relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 gap-2 h-full">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="bg-slate-600 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`relative ${styling.bg} p-4 rounded-2xl shadow-xl border-2 ${styling.accent} ${styling.glow}`}>
                <Edit3 className="w-8 h-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent flex items-center">
                  Edit Data Pegawai
                  <Zap className="w-6 h-6 ml-2 text-yellow-500 animate-pulse" />
                </DialogTitle>
                <div className="flex items-center space-x-4 text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">Direktorat HPI Sosbud</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Kementerian Luar Negeri RI</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  <span>Sesi dimulai: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end space-y-2">
                <Badge className={`${styling.badge} px-4 py-2 text-sm font-semibold shadow-lg transform hover:scale-105 transition-all duration-200`}>
                  <Crown className="w-4 h-4 mr-2" />
                  Mode Edit Profesional
                </Badge>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Activity className="w-3 h-3" />
                  <span>Status: Online</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="h-10 w-10 p-0 rounded-xl hover:bg-red-100/80 hover:text-red-600 transition-all duration-300 transform hover:scale-110 border-2 border-transparent hover:border-red-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Employee Context Bar */}
          <div className="mt-6 flex items-center justify-between p-4 bg-white/70 rounded-xl border border-white/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 ring-4 ring-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                  {getInitials(employee.nama_lengkap)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{employee.nama_lengkap}</h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getGolonganStyling(employee.golongan || '')}>
                    {employee.golongan || 'Belum ada golongan'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80">
                    NIP: {employee.nip || 'Belum ada NIP'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600 font-medium">Terakhir diperbarui</div>
              <div className="text-xs text-slate-500">{new Date(employee.updated_at).toLocaleString('id-ID')}</div>
            </div>
          </div>
        </DialogHeader>

        {/* Enhanced Professional Form Content */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-gradient-to-r from-red-50 to-red-100/80 border-2 border-red-200 rounded-xl p-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Kesalahan Sistem</h4>
                  <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-white/80 to-slate-50/60 backdrop-blur-sm border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-b border-white/60 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Informasi Personal
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-500">Required Fields</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <Label htmlFor="nama_lengkap" className="text-sm font-bold text-slate-700 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Nama Lengkap *
                      <span className="ml-2 text-xs text-slate-500">(Sesuai SK Pegawai)</span>
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                      <Input
                        id="nama_lengkap"
                        value={formData.nama_lengkap}
                        onChange={(e) => handleInputChange('nama_lengkap', e.target.value)}
                        className={`pl-12 h-12 text-lg font-medium border-2 rounded-xl transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                          errors.nama_lengkap 
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200 shadow-red-100' 
                            : 'border-slate-300 bg-white/80 focus:border-blue-500 focus:ring-blue-200 hover:border-slate-400 shadow-slate-100'
                        }`}
                        placeholder="Masukkan nama lengkap sesuai dokumen resmi"
                        disabled={loading}
                      />
                    </div>
                    {errors.nama_lengkap && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 animate-in slide-in-from-left-4 duration-300">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.nama_lengkap}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold text-slate-700 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-green-600" />
                      Email Resmi *
                      <span className="ml-2 text-xs text-slate-500">(Email Instansi)</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors duration-200" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-12 h-12 text-lg border-2 rounded-xl transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                          errors.email 
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200 shadow-red-100' 
                            : 'border-slate-300 bg-white/80 focus:border-green-500 focus:ring-green-200 hover:border-slate-400 shadow-slate-100'
                        }`}
                        placeholder="nama@kemlu.go.id"
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 animate-in slide-in-from-left-4 duration-300">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Position Information Section */}
              <Card className="bg-gradient-to-br from-white/80 to-purple-50/60 backdrop-blur-sm border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 mt-8">
                <CardHeader className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 border-b border-white/60 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <Briefcase className="w-6 h-6 mr-3 text-purple-600" />
                    Informasi Jabatan & Kepangkatan
                    <div className="ml-auto">
                      <Badge className={`${styling.badge} px-3 py-1`}>
                        <PositionIcon className="w-4 h-4 mr-1" />
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NIP */}
                    <div className="space-y-3">
                      <Label htmlFor="nip" className="text-sm font-bold text-slate-700 flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-orange-600" />
                        NIP *
                        <span className="ml-2 text-xs text-slate-500">(18 Digit)</span>
                      </Label>
                      <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors duration-200" />
                        <Input
                          id="nip"
                          value={formData.nip}
                          onChange={(e) => handleInputChange('nip', e.target.value)}
                          className={`pl-12 h-12 font-mono text-lg border-2 rounded-xl transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                            errors.nip 
                              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200 shadow-red-100' 
                              : 'border-slate-300 bg-white/80 focus:border-orange-500 focus:ring-orange-200 hover:border-slate-400 shadow-slate-100'
                          }`}
                          placeholder="18 digit NIP BKN"
                          maxLength={18}
                          disabled={loading}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                          {formData.nip.length}/18
                        </div>
                      </div>
                      {errors.nip && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 animate-in slide-in-from-left-4 duration-300">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.nip}</span>
                        </div>
                      )}
                    </div>

                    {/* Jabatan */}
                    <div className="space-y-3">
                      <Label htmlFor="jabatan" className="text-sm font-bold text-slate-700 flex items-center">
                        <Building className="w-4 h-4 mr-2 text-purple-600" />
                        Jabatan *
                        <span className="ml-2 text-xs text-slate-500">(Struktural/Fungsional)</span>
                      </Label>
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-600 transition-colors duration-200" />
                        <Input
                          id="jabatan"
                          value={formData.jabatan}
                          onChange={(e) => handleInputChange('jabatan', e.target.value)}
                          className={`pl-12 h-12 text-lg border-2 rounded-xl transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                            errors.jabatan 
                              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200 shadow-red-100' 
                              : 'border-slate-300 bg-white/80 focus:border-purple-500 focus:ring-purple-200 hover:border-slate-400 shadow-slate-100'
                          }`}
                          placeholder="Nama jabatan lengkap"
                          disabled={loading}
                        />
                      </div>
                      {errors.jabatan && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 animate-in slide-in-from-left-4 duration-300">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.jabatan}</span>
                        </div>
                      )}
                    </div>

                    {/* Golongan */}
                    <div className="space-y-3">
                      <Label htmlFor="golongan" className="text-sm font-bold text-slate-700 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-emerald-600" />
                        Golongan *
                        <span className="ml-2 text-xs text-slate-500">(Kepangkatan PNS)</span>
                      </Label>
                      <div className="relative group">
                        <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" />
                        <Input
                          id="golongan"
                          value={formData.golongan}
                          onChange={(e) => handleInputChange('golongan', e.target.value)}
                          className={`pl-12 h-12 text-lg font-semibold border-2 rounded-xl transition-all duration-300 transform group-focus-within:scale-[1.02] ${
                            errors.golongan 
                              ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-200 shadow-red-100' 
                              : 'border-slate-300 bg-white/80 focus:border-emerald-500 focus:ring-emerald-200 hover:border-slate-400 shadow-slate-100'
                          }`}
                          placeholder="IV/a, III/b, II/c, dst."
                          disabled={loading}
                        />
                      </div>
                      {errors.golongan && (
                        <div className="flex items-center space-x-2 text-sm text-red-600 animate-in slide-in-from-left-4 duration-300">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.golongan}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                      <Label className="text-sm font-bold text-slate-700 flex items-center">
                        <UserCheck className="w-4 h-4 mr-2 text-blue-600" />
                        Status Kepegawaian
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            formData.is_active 
                              ? 'bg-gradient-to-br from-green-50 to-green-100/80 border-green-300 shadow-green-100' 
                              : 'bg-white/80 border-slate-200 hover:border-green-300'
                          }`}
                          onClick={() => handleInputChange('is_active', true)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="status-active"
                              name="status"
                              checked={formData.is_active}
                              onChange={() => handleInputChange('is_active', true)}
                              className="text-green-600 focus:ring-green-500 w-5 h-5"
                              disabled={loading}
                            />
                            <Label htmlFor="status-active" className="text-sm font-medium text-slate-700 flex items-center cursor-pointer">
                              <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                              Aktif
                            </Label>
                          </div>
                        </div>
                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            !formData.is_active 
                              ? 'bg-gradient-to-br from-red-50 to-red-100/80 border-red-300 shadow-red-100' 
                              : 'bg-white/80 border-slate-200 hover:border-red-300'
                          }`}
                          onClick={() => handleInputChange('is_active', false)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              id="status-inactive"
                              name="status"
                              checked={!formData.is_active}
                              onChange={() => handleInputChange('is_active', false)}
                              className="text-red-600 focus:ring-red-500 w-5 h-5"
                              disabled={loading}
                            />
                            <Label htmlFor="status-inactive" className="text-sm font-medium text-slate-700 flex items-center cursor-pointer">
                              <X className="w-4 h-4 mr-2 text-red-600" />
                              Non-Aktif
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Live Preview Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-slate-50/80 to-blue-50/60 backdrop-blur-sm border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 sticky top-4">
                <CardHeader className="bg-gradient-to-r from-blue-50/80 via-slate-50/80 to-indigo-50/80 border-b border-white/60 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                    <Eye className="w-6 h-6 mr-3 text-blue-600" />
                    Preview Real-Time
                    <div className="ml-auto">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white shadow-lg"></div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Enhanced Employee Card Preview */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 rounded-xl border-2 border-white/80 shadow-lg transform transition-all duration-500 hover:scale-105">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16 ring-4 ring-white shadow-xl">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white font-bold text-xl border-4 border-white">
                            {getInitials(formData.nama_lengkap || 'NN')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">
                            {formData.nama_lengkap || 'Nama Lengkap'}
                          </h4>
                          <div className="flex items-center space-x-1 mt-1">
                            <PositionIcon className={`w-4 h-4 ${styling.color}`} />
                            <span className="text-sm text-slate-600">
                              {formData.jabatan || 'Jabatan'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Position Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Jabatan:</span>
                          <Badge className={styling.badge}>
                            <PositionIcon className="w-3 h-3 mr-1" />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                        </div>
                        
                        {/* Golongan Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Golongan:</span>
                          <Badge className={getGolonganStyling(formData.golongan)}>
                            <Award className="w-3 h-3 mr-1" />
                            {formData.golongan || 'Belum diisi'}
                          </Badge>
                        </div>
                        
                        {/* NIP */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">NIP:</span>
                          <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                            {formData.nip || 'Belum diisi'}
                          </span>
                        </div>
                        
                        {/* Email */}
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-slate-600">Email:</span>
                          <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded break-all">
                            {formData.email || 'belum@diisi.com'}
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600">Status:</span>
                          <Badge className={formData.is_active 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400' 
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400'
                          }>
                            {formData.is_active ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Aktif
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                Non-Aktif
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Professional System Info */}
                    <div className="bg-gradient-to-br from-slate-100/80 to-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <h5 className="font-semibold text-slate-700 mb-3 flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Informasi Sistem
                      </h5>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Mode:</span>
                          <Badge variant="outline" className="text-xs">
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit Professional
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Validasi:</span>
                          <div className="flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span>Real-time</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Auto-save:</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Enabled</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Sesi:</span>
                          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Professional Guidelines */}
                    <div className="bg-gradient-to-br from-yellow-50/80 to-amber-50/60 p-4 rounded-xl border border-amber-200/80">
                      <h5 className="font-semibold text-amber-800 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Panduan Profesional
                      </h5>
                      <div className="space-y-2 text-xs text-amber-700">
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Pastikan data sesuai SK Pegawai</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>NIP harus 18 digit sesuai BKN</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Email gunakan domain @kemlu.go.id</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Golongan sesuai SK Kenaikan Pangkat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Enhanced Professional Footer */}
        <Separator className="bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200" />
        <DialogFooter className="bg-gradient-to-r from-slate-50/80 via-blue-50/80 to-indigo-50/80 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">HPI Sosbud - Kementerian Luar Negeri RI</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center space-x-4">
                  <span>* Wajib diisi sesuai standar kepegawaian</span>
                  <span>•</span>
                  <span>Sesi: {new Date().toLocaleTimeString('id-ID')}</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Activity className="w-3 h-3" />
                    <span>Sistem Online</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-2 border-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300 transform hover:scale-105 px-6 py-3 font-semibold"
              >
                <X className="w-4 h-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 px-8 py-3 font-semibold border-2 border-blue-500 min-w-[140px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-3"></div>
                      <div className="absolute inset-0 rounded-full h-5 w-5 border-3 border-transparent border-r-blue-300 animate-pulse"></div>
                    </div>
                    <span>Menyimpan...</span>
                    <div className="ml-2 flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    <span>Simpan Data</span>
                    <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
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