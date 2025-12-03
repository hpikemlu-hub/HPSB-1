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
  Edit, 
  Trash2, 
  Crown, 
  Star, 
  Shield,
  User as UserIcon,
  Building,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  FileText
} from 'lucide-react';
import type { User } from '@/types';

interface EmployeeTableProps {
  employees: User[];
  onEmployeeDeletion?: (deletedEmployeeId: string) => void;
  currentUser: User;
}

export function EmployeeTable({ employees, onEmployeeDeletion, currentUser }: EmployeeTableProps) {
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  // Enhanced position level detection for government hierarchy
  const getPositionLevel = (jabatan?: string) => {
    if (!jabatan) return 'staff';
    const jabatanLower = jabatan.toLowerCase();
    
    if (jabatanLower.includes('direktur')) return 'director';
    if (jabatanLower.includes('koordinator')) return 'coordinator';
    return 'staff';
  };

  // Government golongan badge styling
  const getGolonganStyling = (golongan?: string) => {
    if (!golongan) return 'bg-slate-100 text-slate-600 border-slate-200';
    
    if (golongan.startsWith('IV')) return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300';
    if (golongan.startsWith('III')) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-300';
    if (golongan.startsWith('II')) return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-300';
    return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-300';
  };

  // Position badge styling
  const getPositionStyling = (level: string) => {
    switch (level) {
      case 'director':
        return {
          badge: 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-400',
          icon: Crown,
          bgClass: 'bg-red-50 border-red-200',
          priority: 1
        };
      case 'coordinator':
        return {
          badge: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-400',
          icon: Star,
          bgClass: 'bg-purple-50 border-purple-200',
          priority: 2
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400',
          icon: Shield,
          bgClass: 'bg-blue-50 border-blue-200',
          priority: 3
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

  // Navigation handlers - NO MORE POPUPS
  const handleViewDetails = (employee: User) => {
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

  if (employees.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="w-20 h-20 text-slate-400 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">Tidak Ada Data Pegawai</h3>
          <p className="text-slate-600 text-center max-w-md leading-relaxed">
            Tidak ada pegawai yang ditemukan berdasarkan filter yang diterapkan. 
            Coba ubah kriteria pencarian atau tambah pegawai baru.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border border-white/30 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50/90 to-blue-50/90 border-b border-slate-200/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <Building className="w-6 h-6 mr-3 text-blue-600" />
              Struktur Organisasi Direktorat HPI Sosbud
              <Badge variant="outline" className="ml-3 bg-blue-100/80 border-blue-300 text-blue-700 font-semibold">
                {employees.length} Pegawai
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 font-semibold shadow-lg">
                <FileText className="w-4 h-4 mr-2" />
                Data Lengkap
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-100/90 to-blue-100/90 border-b-2 border-slate-300/60 backdrop-blur-sm">
                <TableRow className="border-slate-300/60">
                  <TableHead className="w-[60px] text-center font-bold text-slate-700 py-4">No</TableHead>
                  <TableHead className="min-w-[350px] font-bold text-slate-700 py-4">Pegawai</TableHead>
                  <TableHead className="min-w-[220px] font-bold text-slate-700 py-4 text-center">Jabatan</TableHead>
                  <TableHead className="w-[150px] text-center font-bold text-slate-700 py-4">Golongan</TableHead>
                  <TableHead className="w-[180px] text-center font-bold text-slate-700 py-4">NIP</TableHead>
                  <TableHead className="w-[130px] text-center font-bold text-slate-700 py-4">Status</TableHead>
                  <TableHead className="w-[200px] text-center font-bold text-slate-700 py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee, index) => {
                  const level = getPositionLevel(employee.jabatan);
                  const positionStyle = getPositionStyling(level);
                  const PositionIcon = positionStyle.icon;
                  const showGovFields = hasGovernmentFields(employee);

                  return (
                    <TableRow 
                      key={employee.id}
                      className={`border-b border-slate-200/60 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-slate-50/30 transition-all duration-300 group ${positionStyle.bgClass} ${currentUser.id === employee.id ? 'ring-2 ring-green-300 bg-green-50/50' : ''}`}
                    >
                      {/* Row Number */}
                      <TableCell className="text-center py-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 group-hover:scale-110 ${positionStyle.badge}`}>
                          {index + 1}
                        </div>
                      </TableCell>

                      {/* Employee Info */}
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12 ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all duration-300">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                              {getInitials(employee.nama_lengkap)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 min-w-0">
                            <div className="font-semibold text-slate-800 truncate">
                              {employee.nama_lengkap}
                            </div>
                            <div className="text-sm text-slate-600 truncate">
                              {employee.email || 'No email'}
                            </div>
                            <div className="flex items-center space-x-2">
                              <ProfessionalBadge {...getRoleBadgeProps(employee.role)} />
                              {currentUser.id === employee.id && (
                                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 font-semibold">
                                  PROFIL SAYA
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Position */}
                      <TableCell className="py-4 text-center">
                        {showGovFields && employee.jabatan ? (
                          <div className="space-y-2">
                            <div className="inline-flex justify-center">
                              <ProfessionalBadge {...getHierarchyBadgeProps(employee.jabatan)} size="md" />
                            </div>
                            <div className="text-sm text-slate-600 whitespace-normal break-words [overflow-wrap:anywhere] leading-relaxed">
                              {employee.jabatan}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm block">Administrator</span>
                        )}
                      </TableCell>

                      {/* Golongan */}
                      <TableCell className="text-center py-4">
                        {showGovFields && employee.golongan ? (
                          <ProfessionalBadge {...getGolonganBadgeProps(employee.golongan)} size="md" />
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>

                      {/* NIP */}
                      <TableCell className="text-center py-4">
                        {showGovFields && employee.nip ? (
                          <div className="space-y-2">
                            <div className="inline-flex justify-center">
                              <ProfessionalBadge {...getHierarchyBadgeProps(employee.jabatan)} size="md">
                                NIP: {employee.nip}
                              </ProfessionalBadge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">-</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center py-4">
                        <ProfessionalBadge {...getStatusBadgeProps(employee.is_active ?? true)} size="md" />
                      </TableCell>

                      {/* Actions - NAVIGATION ONLY, NO POPUPS */}
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center space-x-2">
                          {/* View Detail Button - Navigate to detail page */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-blue-100 hover:text-blue-600 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-200"
                            onClick={() => handleViewDetails(employee)}
                            title="Lihat Detail Pegawai"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {/* Edit Button - Navigate to edit page */}
                          {canEdit(employee) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 rounded-xl hover:bg-green-100 hover:text-green-600 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-green-200"
                              onClick={() => handleEdit(employee)}
                              title={currentUser.id === employee.id ? "Edit Profil Saya" : "Edit Pegawai"}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Delete Button - Only for admins, not for other admins */}
                          {canDelete(employee) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 rounded-xl hover:bg-red-100 hover:text-red-600 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-red-200"
                              onClick={(e) => handleDelete(e, employee)}
                              title="Hapus Pegawai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cascade Deletion Modal - Only modal we keep */}
      <EmployeeCascadeDeletionModal
        employee={deletingEmployee}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}