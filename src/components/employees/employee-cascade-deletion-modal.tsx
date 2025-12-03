'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle, 
  AlertTriangle, 
  Trash2, 
  ArrowRightLeft, 
  Check, 
  X, 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Search, 
  Filter,
  Settings,
  Database,
  UserX,
  CheckCircle2,
  Shield,
  Eye,
  Users
} from 'lucide-react';
import { 
  getEmployeeDeletionImpact,
  getTransferTargetEmployees,
  validateDeletionPrerequisites,
  retryDeletion,
  type DataImpact
} from '@/lib/cascade-deletion-utils';
import { deleteEmployee } from '@/lib/employee-operations';
import { toast } from 'sonner';
import type { User } from '@/types';

interface EmployeeCascadeDeletionModalProps {
  employee: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


interface DeletionStep {
  step: 1 | 2 | 3 | 4;
  choice: 'transfer' | 'delete' | null;
  targetEmployee: User | null;
  isProcessing: boolean;
  processingStage: number;
}

export function EmployeeCascadeDeletionModal({ 
  employee, 
  isOpen, 
  onClose, 
  onSuccess 
}: EmployeeCascadeDeletionModalProps) {
  const [state, setState] = useState<DeletionStep>({
    step: 1,
    choice: null,
    targetEmployee: null,
    isProcessing: false,
    processingStage: 0
  });

  const [dataImpact, setDataImpact] = useState<DataImpact>({
    workloadCount: 0,
    calendarCount: 0,
    totalImpact: 0
  });

  const [availableEmployees, setAvailableEmployees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch data impact when modal opens
  useEffect(() => {
    if (employee && isOpen) {
      fetchDataImpact();
    }
  }, [employee, isOpen]);

  // Fetch available employees for transfer
  useEffect(() => {
    if (state.step === 3) {
      fetchAvailableEmployees();
    }
  }, [state.step]);

  const fetchDataImpact = async () => {
    if (!employee) return;

    try {
      setLoading(true);
      const impact = await getEmployeeDeletionImpact(employee.id);
      setDataImpact(impact);
    } catch (error) {
      console.error('Error fetching data impact:', error);
      toast.error('Gagal memuat data terkait pegawai');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    if (!employee) return;

    try {
      setLoading(true);
      const employees = await getTransferTargetEmployees(employee.id);
      setAvailableEmployees(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Gagal memuat daftar pegawai');
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceSelection = (choice: 'transfer' | 'delete') => {
    setState(prev => ({ ...prev, choice }));
  };

  const handleNextStep = () => {
    if (state.step === 1 && dataImpact.totalImpact === 0) {
      // Skip to step 4 if no data impact
      setState(prev => ({ ...prev, step: 4 }));
    } else if (state.step === 2 && state.choice === 'delete') {
      // Skip transfer selection for delete choice
      setState(prev => ({ ...prev, step: 4 }));
    } else if (state.step < 4) {
      setState(prev => ({ ...prev, step: (prev.step + 1) as 1 | 2 | 3 | 4 }));
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 | 4 }));
    }
  };

  const handleEmployeeSelect = (selectedEmployee: User) => {
    setState(prev => ({ ...prev, targetEmployee: selectedEmployee }));
  };

  const handleConfirmDeletion = async () => {
    if (!employee) return;

    setState(prev => ({ ...prev, isProcessing: true, processingStage: 1 }));

    try {
      // Stage 1: Preparation & Validation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validate deletion prerequisites
      const validation = await validateDeletionPrerequisites(employee.id);
      if (!validation.canDelete) {
        throw new Error(validation.issues.join(', '));
      }

      setState(prev => ({ ...prev, processingStage: 2 }));

      // Stage 2: Execute cascade deletion via server-side API
      console.log('🚀 Calling server-side cascade deletion API...');
      
      const response = await fetch('/api/admin/cascade-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employee.id,
          action: state.choice || 'delete',
          targetEmployeeId: state.targetEmployee?.id
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Server-side cascade deletion failed');
      }

      console.log('✅ Server-side cascade deletion completed successfully');

      setState(prev => ({ ...prev, processingStage: 3 }));
      await new Promise(resolve => setTimeout(resolve, 800));

      setState(prev => ({ ...prev, processingStage: 4 }));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success handled by the backend utility (toast notifications)
      onSuccess();
      handleClose();

    } catch (error) {
      console.error('🚨 Error during deletion:', error);
      setState(prev => ({ ...prev, isProcessing: false, processingStage: 0 }));
      
      // Enhanced error categorization and user feedback
      let errorCategory = 'Unknown';
      let userMessage = 'Terjadi kesalahan sistem';
      let technicalDetails = '';
      
      if (error instanceof Error) {
        technicalDetails = error.message;
        
        // Categorize errors for better user feedback
        if (error.message.includes('RLS') || error.message.includes('policy')) {
          errorCategory = 'Permission';
          userMessage = 'Kesalahan izin database. Pastikan Anda memiliki hak akses admin.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorCategory = 'Network';
          userMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
        } else if (error.message.includes('foreign key') || error.message.includes('constraint')) {
          errorCategory = 'Data Integrity';
          userMessage = 'Data masih terkait dengan record lain. Coba transfer data terlebih dahulu.';
        } else {
          errorCategory = 'System';
          userMessage = error.message;
        }
      }
      
      console.log(`📊 Error Category: ${errorCategory}`);
      console.log(`🔍 Technical Details: ${technicalDetails}`);
      
      // Provide enhanced retry option with error context
      toast.error(`❌ Gagal menghapus pegawai (${errorCategory})`, {
        description: userMessage,
        duration: 10000,
        action: {
          label: "🔄 Coba Lagi",
          onClick: () => {
            console.log('🔄 User initiated retry after error:', errorCategory);
            retryDeletion(employee, state.choice || 'delete', state.targetEmployee || undefined);
          }
        }
      });
    }
  };

  const handleClose = () => {
    setState({
      step: 1,
      choice: null,
      targetEmployee: null,
      isProcessing: false,
      processingStage: 0
    });
    setSearchTerm('');
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const filteredEmployees = availableEmployees.filter(emp =>
    emp.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-red-200 shadow-2xl">
        
        {/* STEP 1: IMPACT PREVIEW */}
        {state.step === 1 && (
          <div className="animate-in slide-in-from-bottom-4 fade-in-50 duration-300">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-red-500" />
                  Konfirmasi Penghapusan Pegawai
                </DialogTitle>
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  Operasi Berisiko Tinggi
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Employee Card */}
              <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16 ring-2 ring-white shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold">
                        {getInitials(employee.nama_lengkap)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800">{employee.nama_lengkap}</h3>
                      <p className="text-slate-600 text-lg">{employee.jabatan}</p>
                      <p className="text-slate-500 font-mono">{employee.nip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Briefcase className="w-8 h-8 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {dataImpact.workloadCount}
                        </div>
                        <div className="text-slate-600">Workload Terdampak</div>
                        <div className="text-sm text-orange-600 font-medium">
                          Memerlukan Penanganan
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Calendar className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {dataImpact.calendarCount}
                        </div>
                        <div className="text-slate-600">Acara Kalender</div>
                        <div className="text-sm text-blue-600 font-medium">
                          Akan Terhapus
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Warning Box */}
              {dataImpact.totalImpact > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 animate-pulse" />
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-2">
                          Peringatan Data Terkait
                        </h4>
                        <p className="text-orange-700">
                          Penghapusan pegawai akan mempengaruhi <strong>{dataImpact.totalImpact} data terkait</strong>. 
                          Anda perlu memilih cara penanganan data workload pada langkah berikutnya.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button variant="ghost" onClick={handleClose}>
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
                <Button 
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  Lanjutkan
                  <ArrowRightLeft className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATA HANDLING SELECTION */}
        {state.step === 2 && (
          <div className="animate-in slide-in-from-right-4 fade-in-50 duration-300">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-800">
                  Pilih Penanganan Data
                </DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Langkah 2 dari 4</span>
                </div>
              </div>
              <p className="text-slate-600">
                Tentukan cara menangani data workload milik pegawai yang akan dihapus
              </p>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Choice Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transfer Option */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    state.choice === 'transfer' 
                      ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                      : 'hover:border-blue-200 hover:bg-blue-50/50'
                  }`}
                  onClick={() => handleChoiceSelection('transfer')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <ArrowRightLeft className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Transfer Data</h3>
                        <p className="text-slate-600">Pindahkan ke pegawai lain</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Data tetap terpelihara
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Kontinuitas kerja terjaga
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Riwayat lengkap tersimpan
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delete Option */}
                <Card 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    state.choice === 'delete' 
                      ? 'ring-2 ring-red-500 bg-red-50 border-red-200' 
                      : 'hover:border-red-200 hover:bg-red-50/50'
                  }`}
                  onClick={() => handleChoiceSelection('delete')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <Trash2 className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">Hapus Permanen</h3>
                        <p className="text-slate-600">Hapus semua data terkait</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Data tidak dapat dipulihkan
                      </div>
                      <div className="flex items-center text-sm text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Riwayat akan hilang
                      </div>
                      <div className="flex items-center text-sm text-red-600">
                        <X className="w-4 h-4 mr-2" />
                        Proses tidak dapat dibatalkan
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Preview */}
              {state.choice && (
                <Card className="bg-slate-50 border-slate-200 animate-in slide-in-from-bottom-2 fade-in-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-slate-800 mb-3">Preview Dampak:</h4>
                    {state.choice === 'transfer' ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-blue-600">
                          <ArrowRightLeft className="w-4 h-4 mr-2" />
                          {dataImpact.workloadCount} workload akan dipindahkan ke pegawai lain
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dataImpact.calendarCount} acara kalender tetap atas nama pegawai
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {dataImpact.workloadCount} workload akan dihapus permanen
                        </div>
                        <div className="flex items-center text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {dataImpact.calendarCount} acara kalender akan dihapus
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!state.choice}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Lanjutkan
                  <ArrowRightLeft className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSFER TARGET SELECTION */}
        {state.step === 3 && state.choice === 'transfer' && (
          <div className="animate-in slide-in-from-right-4 fade-in-50 duration-300">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-800">
                  Pilih Target Transfer
                </DialogTitle>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Langkah 3 dari 4</span>
                </div>
              </div>
              <p className="text-slate-600">
                Pilih pegawai yang akan menerima transfer {dataImpact.workloadCount} workload
              </p>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Search Interface */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari nama pegawai atau jabatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/70 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Employee Grid */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredEmployees.map((emp) => (
                  <Card 
                    key={emp.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      state.targetEmployee?.id === emp.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                        : 'hover:border-blue-200 hover:bg-blue-50/50'
                    }`}
                    onClick={() => handleEmployeeSelect(emp)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-white shadow">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                            {getInitials(emp.nama_lengkap)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{emp.nama_lengkap}</h4>
                          <p className="text-slate-600">{emp.jabatan}</p>
                          <p className="text-sm text-slate-500">{emp.nip}</p>
                        </div>
                        {state.targetEmployee?.id === emp.id && (
                          <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Transfer Preview */}
              {state.targetEmployee && (
                <Card className="bg-blue-50 border-blue-200 animate-in slide-in-from-bottom-2 fade-in-50">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Preview Transfer:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-blue-600">
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Transfer ke: <strong>{state.targetEmployee.nama_lengkap}</strong>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {dataImpact.workloadCount} workload akan dipindahkan
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={!state.targetEmployee}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Lanjutkan
                  <Shield className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL CONFIRMATION */}
        {state.step === 4 && !state.isProcessing && (
          <div className="animate-in slide-in-from-right-4 fade-in-50 duration-300">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-blue-600" />
                  Konfirmasi Final
                </DialogTitle>
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  Langkah Terakhir
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Operation Summary */}
              <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800">
                    Ringkasan Operasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-600">Pegawai yang Dihapus:</label>
                    <div className="text-lg font-semibold text-slate-800">{employee.nama_lengkap}</div>
                  </div>

                  <div className="space-y-3">
                    {state.choice === 'transfer' ? (
                      <div className="flex items-start space-x-3 p-4 bg-blue-100 rounded-lg">
                        <ArrowRightLeft className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <div className="font-semibold text-blue-800">Transfer Data ke:</div>
                          <div className="text-blue-700">{state.targetEmployee?.nama_lengkap}</div>
                          <div className="text-sm text-blue-600 mt-1">
                            {dataImpact.workloadCount} workload akan dipindahkan
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 p-4 bg-red-100 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-600 mt-1" />
                        <div>
                          <div className="font-semibold text-red-800">Hapus Permanen</div>
                          <div className="text-sm text-red-600 mt-1">
                            {dataImpact.workloadCount} workload dan {dataImpact.calendarCount} acara akan dihapus
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Final Warning */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 border-2">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-orange-800 mb-2">
                        Konfirmasi Terakhir
                      </h4>
                      <p className="text-orange-700">
                        Operasi ini akan segera dieksekusi dan <strong>tidak dapat dibatalkan</strong>. 
                        Pastikan semua informasi sudah benar sebelum melanjutkan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <Button 
                  onClick={handleConfirmDeletion}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Konfirmasi & Jalankan
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PROCESSING STAGE */}
        {state.isProcessing && (
          <div className="animate-in fade-in-50 duration-300">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800 text-center">
                Memproses Penghapusan Pegawai
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 mt-8 py-8">
              {/* Processing Stages */}
              <div className="space-y-6">
                {/* Stage 1 */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  state.processingStage >= 1 ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    state.processingStage >= 1 ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    <Settings className={`w-6 h-6 text-white ${
                      state.processingStage === 1 ? 'animate-spin' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Mempersiapkan operasi...</div>
                    <div className="text-sm text-slate-600">Validasi data dan akses</div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  state.processingStage >= 2 ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    state.processingStage >= 2 ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    <Database className={`w-6 h-6 text-white ${
                      state.processingStage === 2 ? 'animate-pulse' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Memproses data workload...</div>
                    <div className="text-sm text-slate-600">
                      {state.choice === 'transfer' ? 'Memindahkan data' : 'Menghapus data'}
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  state.processingStage >= 3 ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    state.processingStage >= 3 ? 'bg-blue-500' : 'bg-slate-300'
                  }`}>
                    <UserX className={`w-6 h-6 text-white ${
                      state.processingStage === 3 ? 'animate-bounce' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Menghapus data pegawai...</div>
                    <div className="text-sm text-slate-600">Menonaktifkan akun pegawai</div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${
                  state.processingStage >= 4 ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  <div className={`p-2 rounded-lg ${
                    state.processingStage >= 4 ? 'bg-green-500' : 'bg-slate-300'
                  }`}>
                    <CheckCircle2 className={`w-6 h-6 text-white ${
                      state.processingStage === 4 ? 'animate-pulse' : ''
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Operasi selesai!</div>
                    <div className="text-sm text-slate-600">Pegawai berhasil dihapus</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(state.processingStage / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}