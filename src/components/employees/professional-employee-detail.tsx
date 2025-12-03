'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Edit,
  User as UserIcon,
  Mail,
  Hash,
  Award,
  Briefcase,
  Calendar,
  Shield,
  Crown,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { User } from '@/types';

interface ProfessionalEmployeeDetailProps {
  employee: User;
  currentUser: User;
}

export function ProfessionalEmployeeDetail({ employee, currentUser }: ProfessionalEmployeeDetailProps) {
  const router = useRouter();

  // Check if user has government fields (not admin)
  const hasGovernmentFields = (user: User): boolean => {
    return user.role !== 'admin';
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Enhanced position level detection
  const getPositionLevel = (jabatan?: string) => {
    if (!jabatan) return 'staff';
    const jabatanLower = jabatan.toLowerCase();
    
    if (jabatanLower.includes('direktur')) return 'director';
    if (jabatanLower.includes('koordinator')) return 'coordinator';
    return 'staff';
  };

  // Position badge styling
  const getPositionStyling = (level: string) => {
    switch (level) {
      case 'director':
        return {
          badge: 'bg-gradient-to-r from-red-600 to-red-700 text-white',
          icon: Crown
        };
      case 'coordinator':
        return {
          badge: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
          icon: Star
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
          icon: Shield
        };
    }
  };

  // Golongan badge styling
  const getGolonganStyling = (golongan?: string) => {
    if (!golongan) return 'bg-slate-100 text-slate-600';
    
    if (golongan.startsWith('IV')) return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    if (golongan.startsWith('III')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    if (golongan.startsWith('II')) return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
  };

  // Permission checks
  const canEdit = (): boolean => {
    return currentUser.role === 'admin' || currentUser.id === employee.id;
  };

  const showGovFields = hasGovernmentFields(employee);
  const level = getPositionLevel(employee.jabatan);
  const positionStyle = getPositionStyling(level);
  const PositionIcon = positionStyle.icon;

  return (
    <div className="professional-employee-detail bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-screen">
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
          <span className="text-slate-600 font-medium">Detail Pegawai</span>
        </nav>
      </div>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        {/* Professional Header */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20 ring-4 ring-blue-200 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
                    {getInitials(employee.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-slate-800">
                    {employee.nama_lengkap}
                  </h1>
                  
                  {showGovFields && employee.jabatan && (
                    <Badge className={`${positionStyle.badge} text-lg px-4 py-2 font-semibold shadow-lg`}>
                      <PositionIcon className="w-5 h-5 mr-2" />
                      {employee.jabatan}
                    </Badge>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={`text-sm px-3 py-1 ${employee.role === 'admin' 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                      {employee.role === 'admin' ? 'Administrator' : 'Pegawai'}
                    </Badge>
                    
                    {employee.is_active ? (
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <XCircle className="w-4 h-4 mr-1" />
                        Tidak Aktif
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {canEdit() && (
                  <Button
                    onClick={() => router.push(`/employees/${employee.id}/edit`)}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Pegawai
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/employees')}
                  className="hover:bg-slate-100 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                Informasi Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <InfoRow 
                label="Email" 
                value={employee.email || 'Tidak ada'} 
                icon={<Mail className="w-5 h-5 text-blue-500" />}
              />
              <InfoRow 
                label="Username" 
                value={employee.username || 'Tidak ada'} 
                icon={<Hash className="w-5 h-5 text-slate-500" />}
              />
              <InfoRow 
                label="Role" 
                value={employee.role === 'admin' ? 'Administrator' : 'Pengguna'} 
                icon={<Shield className="w-5 h-5 text-purple-500" />}
              />
              <InfoRow 
                label="Status Akun" 
                value={employee.is_active ? 'Aktif' : 'Tidak Aktif'} 
                icon={employee.is_active ? 
                  <CheckCircle className="w-5 h-5 text-green-500" /> : 
                  <XCircle className="w-5 h-5 text-red-500" />
                }
              />
              <InfoRow 
                label="Terdaftar" 
                value={new Date(employee.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 
                icon={<Calendar className="w-5 h-5 text-orange-500" />}
              />
            </CardContent>
          </Card>

          {/* Government Information - Only for non-admin */}
          {showGovFields && (
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-slate-600" />
                  Informasi Kepegawaian
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow 
                  label="NIP" 
                  value={employee.nip || 'Belum diisi'} 
                  icon={<Hash className="w-5 h-5 text-blue-500" />}
                  isCode={!!employee.nip}
                />
                <InfoRow 
                  label="Golongan" 
                  value={employee.golongan || 'Belum diisi'} 
                  icon={<Award className="w-5 h-5 text-red-500" />}
                  badge={employee.golongan ? getGolonganStyling(employee.golongan) : undefined}
                />
                <InfoRow 
                  label="Jabatan" 
                  value={employee.jabatan || 'Belum diisi'} 
                  icon={<PositionIcon className="w-5 h-5 text-purple-500" />}
                  badge={employee.jabatan ? positionStyle.badge : undefined}
                />
                <InfoRow 
                  label="Terakhir Update" 
                  value={new Date(employee.updated_at).toLocaleDateString('id-ID')} 
                  icon={<Calendar className="w-5 h-5 text-green-500" />}
                />
              </CardContent>
            </Card>
          )}

          {/* System Information for Admin */}
          {!showGovFields && (
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-slate-200">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Crown className="w-6 h-6 mr-3 text-red-600" />
                  Informasi Administrator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <InfoRow 
                  label="Level Akses" 
                  value="Administrator Sistem" 
                  icon={<Crown className="w-5 h-5 text-red-500" />}
                  badge="bg-gradient-to-r from-red-600 to-red-700 text-white"
                />
                <InfoRow 
                  label="Privilege" 
                  value="Full System Access" 
                  icon={<Shield className="w-5 h-5 text-red-500" />}
                />
                <InfoRow 
                  label="Catatan" 
                  value="Admin tidak memiliki data kepegawaian" 
                  icon={<UserIcon className="w-5 h-5 text-slate-500" />}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for information rows
interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: string;
  isCode?: boolean;
}

function InfoRow({ label, value, icon, badge, isCode }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-slate-600">{label}</span>
      </div>
      <div className="text-right">
        {badge ? (
          <Badge className={badge}>
            {value}
          </Badge>
        ) : isCode ? (
          <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-sm">
            {value}
          </code>
        ) : (
          <span className="font-semibold text-slate-800">{value}</span>
        )}
      </div>
    </div>
  );
}