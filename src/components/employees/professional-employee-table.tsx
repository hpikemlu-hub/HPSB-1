'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ProfessionalBadge, 
  getHierarchyBadgeProps, 
  getGolonganBadgeProps, 
  getStatusBadgeProps, 
  getRoleBadgeProps 
} from '@/components/ui/professional-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmployeeCascadeDeletionModal } from './employee-cascade-deletion-modal';
import { 
  groupEmployeesByHierarchy,
  getPositionLevel,
  detectPositionType
} from '@/lib/employee-operations';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Crown, 
  Star, 
  Shield,
  User as UserIcon,
  Building,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  ChevronRight,
  Award,
  Briefcase,
  Plus
} from 'lucide-react';
import type { User } from '@/types';

interface ProfessionalEmployeeTableProps {
  employees: User[];
  onEmployeeDeletion?: (deletedEmployeeId: string) => void;
  currentUser: User;
}

export function ProfessionalEmployeeTable({ 
  employees, 
  onEmployeeDeletion, 
  currentUser 
}: ProfessionalEmployeeTableProps) {
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  // Group employees by hierarchical level
  const { directors, coordinators, staff } = groupEmployeesByHierarchy(employees);

  // Government golongan badge styling
  const getGolonganStyling = (golongan?: string) => {
    if (!golongan) return 'bg-slate-100 text-slate-600 border-slate-200';
    
    if (golongan.startsWith('IV')) return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-md';
    if (golongan.startsWith('III')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300 shadow-md';
    if (golongan.startsWith('II')) return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300 shadow-md';
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-300 shadow-md';
  };

  // Enhanced position styling for hierarchy levels
  const getHierarchyLevelStyling = (level: 'director' | 'coordinator' | 'staff') => {
    switch (level) {
      case 'director':
        return {
          headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
          headerText: 'text-white',
          icon: Crown,
          rowBg: 'bg-red-50/30',
          borderColor: 'border-red-200',
          indentation: 'pl-4'
        };
      case 'coordinator':
        return {
          headerBg: 'bg-gradient-to-r from-purple-600 to-purple-700',
          headerText: 'text-white',
          icon: Star,
          rowBg: 'bg-purple-50/30',
          borderColor: 'border-purple-200',
          indentation: 'pl-8'
        };
      default:
        return {
          headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
          headerText: 'text-white',
          icon: Shield,
          rowBg: 'bg-blue-50/30',
          borderColor: 'border-blue-200',
          indentation: 'pl-12'
        };
    }
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

  // Check if user has government fields (not admin)
  const hasGovernmentFields = (employee: User): boolean => {
    return employee.role !== 'admin';
  };

  // Navigation handlers
  const handleViewDetail = (employee: User) => {
    router.push(`/employees/${employee.id}`);
  };

  const handleEdit = (employee: User) => {
    router.push(`/employees/${employee.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent, employee: User) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (onEmployeeDeletion && deletingEmployee) {
      onEmployeeDeletion(deletingEmployee.id);
    }
    handleCloseDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
  };

  // Permission checks
  const canEdit = (employee: User): boolean => {
    return currentUser.role === 'admin' || currentUser.id === employee.id;
  };

  const canDelete = (employee: User): boolean => {
    return currentUser.role === 'admin' && employee.role !== 'admin';
  };

  // Component to render a hierarchical section
  const renderHierarchySection = (
    title: string,
    employees: User[],
    level: 'director' | 'coordinator' | 'staff',
    startIndex: number
  ) => {
    if (employees.length === 0) return null;

    const styling = getHierarchyLevelStyling(level);
    const IconComponent = styling.icon;

    return (
      <div className="mb-6">
        {/* Section Header */}
        <div className={`${styling.headerBg} ${styling.headerText} px-6 py-3 rounded-t-lg border ${styling.borderColor} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm opacity-90">
                  {employees.length} {employees.length === 1 ? 'posisi' : 'posisi'}
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Level {level === 'director' ? '1' : level === 'coordinator' ? '2' : '3'}
            </Badge>
          </div>
        </div>

        {/* Section Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-b-lg border-x border-b border-slate-200/60 overflow-hidden">
          <Table>
            <TableBody>
              {employees.map((employee, index) => (
                <TableRow 
                  key={employee.id}
                  className={`
                    ${styling.rowBg} border-slate-100 hover:bg-white/80 transition-all duration-200 cursor-pointer
                    hover:shadow-sm group
                  `}
                  onClick={() => handleViewDetail(employee)}
                >
                  <TableCell className="w-12 font-mono text-sm text-slate-500 text-center">
                    {String(startIndex + index + 1).padStart(2, '0')}
                  </TableCell>
                  
                  <TableCell className={styling.indentation}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-12 bg-current opacity-20 rounded-full"></div>
                        <Avatar className="h-12 w-12 shadow-md group-hover:shadow-lg transition-shadow">
                          <AvatarFallback className={`bg-gradient-to-r ${level === 'director' ? 'from-red-500 to-red-600' : level === 'coordinator' ? 'from-purple-500 to-purple-600' : 'from-blue-500 to-blue-600'} text-white font-semibold`}>
                            {getInitials(employee.nama_lengkap)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {employee.nama_lengkap}
                          </h4>
                          <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="space-y-1">
                          {employee.nip && (
                            <p className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                              NIP: {employee.nip}
                            </p>
                          )}
                          <p className="text-xs text-slate-500">
                            @{employee.username}
                          </p>
                          {employee.email && (
                            <p className="text-xs text-slate-500 truncate">
                              {employee.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-center min-w-[200px]">
                    {hasGovernmentFields(employee) ? (
                      <div className="space-y-1">
                        <Badge className={`${level === 'director' ? 'bg-gradient-to-r from-red-500 to-red-600' : level === 'coordinator' ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'} text-white border-transparent shadow-sm`}>
                          <Briefcase className="w-3 h-3 mr-1" />
                          {detectPositionType(employee.jabatan)}
                        </Badge>
                        <p className="text-xs text-slate-600">{employee.jabatan}</p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="border-slate-300 text-slate-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    {hasGovernmentFields(employee) && employee.golongan ? (
                      <Badge className={`${getGolonganStyling(employee.golongan)} font-semibold`}>
                        <Award className="w-3 h-3 mr-1" />
                        {employee.golongan}
                      </Badge>
                    ) : (
                      <span className="text-slate-400 text-sm">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={employee.role === 'admin' 
                        ? 'border-purple-300 text-purple-700 bg-purple-50' 
                        : 'border-blue-300 text-blue-700 bg-blue-50'
                      }
                    >
                      {employee.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={employee.is_active 
                        ? 'border-green-300 text-green-700 bg-green-50' 
                        : 'border-red-300 text-red-700 bg-red-50'
                      }
                    >
                      {employee.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Non-Aktif
                        </>
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(employee);
                        }}
                        className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {canEdit(employee) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(employee);
                          }}
                          className="h-8 w-8 p-0 hover:bg-amber-100 hover:text-amber-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {canDelete(employee) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(e, employee)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (employees.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Belum Ada Data Pegawai
              </h3>
              <p className="text-slate-600 max-w-sm mx-auto">
                Silakan tambahkan data pegawai untuk menampilkan struktur organisasi hierarkis
              </p>
            </div>
            {currentUser.role === 'admin' && (
              <Button 
                onClick={() => router.push('/employees/new')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pegawai Pertama
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-6 py-4 rounded-2xl border border-slate-600 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Struktur Organisasi Direktorat HPI Sosbud
              </h2>
              <p className="text-slate-300 text-sm">
                Direktorat Hukum dan Perjanjian Sosial Budaya
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Users className="w-4 h-4 mr-2" />
              {employees.length} Pegawai Total
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Crown className="w-4 h-4 mr-2" />
              Hierarki Struktural
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Table Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-700">
          <div className="text-center">#</div>
          <div>Pegawai</div>
          <div className="text-center">Jabatan & Posisi</div>
          <div className="text-center">Golongan PNS</div>
          <div className="text-center">Role</div>
          <div className="text-center">Status</div>
          <div className="text-center">Aksi</div>
        </div>
      </div>

      {/* Hierarchical Sections */}
      <div className="space-y-4">
        {renderHierarchySection(
          'LEVEL 1 - DIREKTUR',
          directors,
          'director',
          0
        )}
        
        {renderHierarchySection(
          'LEVEL 2 - KOORDINATOR FUNGSI',
          coordinators,
          'coordinator',
          directors.length
        )}
        
        {renderHierarchySection(
          'LEVEL 3 - STAFF PNS',
          staff,
          'staff',
          directors.length + coordinators.length
        )}
      </div>

      {/* Deletion Modal */}
      <EmployeeCascadeDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onDeleteSuccess={handleDeleteSuccess}
        employee={deletingEmployee}
      />
    </div>
  );
}