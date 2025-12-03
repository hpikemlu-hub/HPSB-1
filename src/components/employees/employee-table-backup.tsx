'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfessionalEmployeeEditModal } from './professional-employee-edit-modal';
import { EmployeeCascadeDeletionModal } from './employee-cascade-deletion-modal';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Crown, 
  Star, 
  Shield,
  User as UserIcon,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Award,
  Users,
  FileText
} from 'lucide-react';
import type { User } from '@/types';

interface EmployeeTableProps {
  employees: User[];
  onEmployeeUpdate?: (updatedEmployee: User) => void;
  onEmployeeDeletion?: (deletedEmployeeId: string) => void;
}

export function EmployeeTable({ employees, onEmployeeUpdate, onEmployeeDeletion }: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();

  // Enhanced position level detection
  const getPositionLevel = (jabatan?: string) => {
    if (!jabatan) return 'staff';
    const jabatanLower = jabatan.toLowerCase();
    
    if (jabatanLower.includes('direktur') || jabatanLower.includes('kepala')) return 'direktur';
    if (jabatanLower.includes('koordinator') || jabatanLower.includes('kasubdit')) return 'koordinator';
    if (jabatanLower.includes('analis') || jabatanLower.includes('ahli')) return 'analis';
    return 'staff';
  };

  // Enhanced position styling with more professional appearance
  const getPositionStyling = (level: string) => {
    switch (level) {
      case 'direktur':
        return {
          badge: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg border border-red-500/30',
          icon: Crown,
          bgColor: 'bg-gradient-to-r from-red-50 to-red-100 border-red-200',
          textColor: 'text-red-800'
        };
      case 'koordinator':
        return {
          badge: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border border-purple-500/30',
          icon: Star,
          bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200',
          textColor: 'text-purple-800'
        };
      case 'analis':
        return {
          badge: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg border border-emerald-500/30',
          icon: Award,
          bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200',
          textColor: 'text-emerald-800'
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg border border-blue-500/30',
          icon: UserIcon,
          bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200',
          textColor: 'text-blue-800'
        };
    }
  };

  // Enhanced golongan styling with better visual hierarchy
  const getGolonganStyling = (golongan?: string) => {
    if (!golongan) return 'bg-gray-100 text-gray-800 border border-gray-200';
    
    if (golongan.startsWith('IV/')) 
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold shadow-lg border border-yellow-400/50';
    if (golongan.startsWith('III/')) 
      return 'bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow-md border border-green-500/50';
    if (golongan.startsWith('II/')) 
      return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-md border border-orange-400/50';
    if (golongan.startsWith('I/')) 
      return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium shadow-md border border-slate-400/50';
    
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Generate professional avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Enhanced data safety check
  const safeDisplayValue = (value?: string, fallback = '-') => {
    return value && value.trim() !== '' ? value : fallback;
  };

  const handleViewDetails = (employee: User) => {
    setSelectedEmployee(employee);
  };

  const handleEdit = (e: React.MouseEvent, employee: User) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to edit page instead of opening modal
    router.push(`/employees/${employee.id}/edit`);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (updatedEmployee: User) => {
    try {
      const supabase = createClientSupabaseClient();
      const { error } = await supabase
        .from('users')
        .update({
          nama_lengkap: updatedEmployee.nama_lengkap,
          nip: updatedEmployee.nip,
          golongan: updatedEmployee.golongan,
          jabatan: updatedEmployee.jabatan,
          username: updatedEmployee.username,
          email: updatedEmployee.email,
          role: updatedEmployee.role,
          is_active: updatedEmployee.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedEmployee.id);

      if (error) {
        console.error('Employee update error:', error);
        toast.error('Gagal memperbarui data pegawai');
        throw error;
      }

      // Call parent update handler if provided
      onEmployeeUpdate?.(updatedEmployee);
      toast.success('Data pegawai berhasil diperbarui');
    } catch (error) {
      console.error('Database error:', error);
      toast.error('Terjadi kesalahan saat memperbarui data');
    }
  };

  const handleDelete = (e: React.MouseEvent, employee: User) => {
    e.preventDefault();
    e.stopPropagation();
    // Open professional cascade deletion modal
    setDeletingEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    // Call parent deletion handler if provided, otherwise fallback to page reload
    if (onEmployeeDeletion && deletingEmployee) {
      onEmployeeDeletion(deletingEmployee.id);
    } else {
      // Fallback to page reload if no callback provided
      window.location.reload();
    }
    // Close the modal
    handleCloseDeleteModal();
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
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
                  <TableHead className="min-w-[220px] font-bold text-slate-700 py-4">Jabatan</TableHead>
                  <TableHead className="w-[150px] text-center font-bold text-slate-700 py-4">Golongan</TableHead>
                  <TableHead className="w-[180px] text-center font-bold text-slate-700 py-4">NIP</TableHead>
                  <TableHead className="w-[130px] text-center font-bold text-slate-700 py-4">Status</TableHead>
                  <TableHead className="w-[160px] text-center font-bold text-slate-700 py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee, index) => {
                  const level = getPositionLevel(employee.jabatan);
                  const styling = getPositionStyling(level);
                  const PositionIcon = styling.icon;

                  return (
                    <TableRow 
                      key={employee.id} 
                      className={`
                        border-slate-200/60 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-slate-50/70 
                        hover:shadow-md hover:border-blue-300/50 hover:scale-[1.01] 
                        transition-all duration-300 ease-out group cursor-pointer
                        animate-in slide-in-from-left-4 fade-in-50
                        ${styling.bgColor}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-bold text-slate-600">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-700 group-hover:from-blue-200 group-hover:to-blue-300 group-hover:text-blue-800 transition-all duration-300 shadow-md">
                          {index + 1}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-4 py-2">
                          <Avatar className="w-12 h-12 ring-2 ring-white shadow-lg group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-110">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300">
                              {getInitials(employee.nama_lengkap)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold ${styling.textColor} group-hover:text-blue-700 transition-all duration-300 truncate text-base`}>
                              {employee.nama_lengkap}
                            </div>
                            {employee.email && (
                              <div className="flex items-center text-xs text-slate-600 mt-1 group-hover:text-slate-700 transition-colors">
                                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{employee.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <PositionIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          <Badge className={`${styling.badge} px-3 py-2 font-semibold text-sm group-hover:shadow-lg transition-all duration-300`}>
                            {safeDisplayValue(employee.jabatan, 'Belum Ditentukan')}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge className={`${getGolonganStyling(employee.golongan)} px-3 py-2 font-bold text-sm group-hover:shadow-lg transition-all duration-300`}>
                          {safeDisplayValue(employee.golongan, 'N/A')}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="font-mono text-sm text-slate-700 bg-gradient-to-r from-slate-100/80 to-slate-200/60 px-3 py-2 rounded-lg border border-slate-200 group-hover:from-blue-100/80 group-hover:to-blue-200/60 group-hover:border-blue-300 transition-all duration-300 shadow-sm">
                          {safeDisplayValue(employee.nip, 'Belum Ada')}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {employee.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 animate-pulse" />
                              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 font-semibold text-sm shadow-md group-hover:shadow-lg transition-all duration-300">
                                Aktif
                              </Badge>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 font-semibold text-sm shadow-md group-hover:shadow-lg transition-all duration-300">
                                Nonaktif
                              </Badge>
                            </>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-blue-100 hover:text-blue-600 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-blue-200"
                            onClick={() => handleViewDetails(employee)}
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl hover:bg-orange-100 hover:text-orange-600 hover:scale-110 transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-orange-200"
                            onClick={(e) => handleEdit(e, employee)}
                            title="Edit Pegawai"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
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

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <UserIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Detail Pegawai
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmployee(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                    {getInitials(selectedEmployee.nama_lengkap)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedEmployee.nama_lengkap}</h3>
                  <p className="text-slate-600">{selectedEmployee.jabatan}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">NIP</label>
                    <div className="font-mono text-slate-800 bg-slate-100 p-2 rounded">{selectedEmployee.nip}</div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Golongan</label>
                    <div className="mt-1">
                      <Badge className={getGolonganStyling(selectedEmployee.golongan)}>
                        {selectedEmployee.golongan}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Email</label>
                    <div className="flex items-center space-x-2 text-slate-800">
                      <Mail className="w-4 h-4" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Status</label>
                    <div className="mt-1">
                      {selectedEmployee.is_active ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                          Tidak Aktif
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  Terdaftar: {new Date(selectedEmployee.created_at).toLocaleDateString('id-ID')}
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleEdit(e, selectedEmployee)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSelectedEmployee(null)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Professional Employee Edit Modal */}
      <ProfessionalEmployeeEditModal
        employee={editingEmployee}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEmployee}
      />

      {/* Employee Cascade Deletion Modal */}
      <EmployeeCascadeDeletionModal
        employee={deletingEmployee}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}