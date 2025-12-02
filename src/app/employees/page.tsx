'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { EmployeeTable } from '@/components/employees/employee-table';
import { EmployeeFilters } from '@/components/employees/employee-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Shield, UserCheck, Search, Crown, Star, TrendingUp, X, RefreshCw } from 'lucide-react';
import { 
  fetchEmployees, 
  sortEmployeesByHierarchy, 
  filterEmployees,
  groupEmployeesByHierarchy,
  getPositionLevel
} from '@/lib/employee-operations';
import { toast } from 'sonner';
import type { User } from '@/types';

interface EmployeeFiltersType {
  nama?: string;
  jabatan?: string;
  golongan?: string;
  status?: string;
}

// System accounts to hide from UI
const HIDDEN_SYSTEM_ACCOUNTS = ['Administrator', 'Tes Admin API'];

export default function EmployeesPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const { user, loading } = useAuth();
  const [dataLoading, setDataLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  const [filters, setFilters] = useState<EmployeeFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();

  // Session check now handled by useAuth hook

  // Enhanced fetchEmployees function with refresh capability
  const loadEmployees = useCallback(async (showToast = false) => {
    setDataLoading(true);
    try {
      const employeesData = await fetchEmployees(showToast);
      
      // Filter out system accounts first, then sort
      const visibleEmployees = employeesData.filter(employee => 
        !HIDDEN_SYSTEM_ACCOUNTS.includes(employee.nama_lengkap)
      );
      
      const sortedEmployees = sortEmployeesByHierarchy(visibleEmployees);
      setEmployees(sortedEmployees);
      setFilteredEmployees(sortedEmployees);
      
      console.log('✅ System accounts hidden:', HIDDEN_SYSTEM_ACCOUNTS);
      console.log('📊 Visible employees after filtering:', sortedEmployees.length);
      
    } catch (error) {
      console.error('❌ Load employees error:', error);
      // Set empty arrays on error
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadEmployees(true);
      toast.success('Data pegawai berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui data pegawai');
    } finally {
      setRefreshing(false);
    }
  }, [loadEmployees]);

  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user, loadEmployees]);

  // Add page focus refresh handler to update data when returning from edit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Page became visible again - refresh data silently
        loadEmployees(false);
      }
    };

    const handleFocus = () => {
      if (user) {
        // Window focused - refresh data silently  
        loadEmployees(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loadEmployees]);

  // Enhanced filter employees with loading states
  useEffect(() => {
    if (employees.length === 0) {
      setFilteredEmployees([]);
      return;
    }

    setDataLoading(true);
    
    // Use setTimeout for smooth filtering animation
    const filterTimeout = setTimeout(() => {
      const filtered = filterEmployees(employees, searchQuery, filters);
      setFilteredEmployees(filtered);
      setDataLoading(false);
    }, 200);

    return () => clearTimeout(filterTimeout);
  }, [searchQuery, filters, employees]);

  const handleFiltersChange = (newFilters: EmployeeFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleEmployeeUpdate = useCallback((updatedEmployee: User) => {
    // Update the employee in both main list and filtered list
    setEmployees(prev => {
      const updated = prev.map(emp => 
        emp.id === updatedEmployee.id ? { ...updatedEmployee, updated_at: new Date().toISOString() } : emp
      );
      return sortEmployeesByHierarchy(updated);
    });
    
    setFilteredEmployees(prev => {
      const updated = prev.map(emp => 
        emp.id === updatedEmployee.id ? { ...updatedEmployee, updated_at: new Date().toISOString() } : emp
      );
      return sortEmployeesByHierarchy(updated);
    });
    
    console.log('Employee updated in parent:', updatedEmployee);
    toast.success(`Data ${updatedEmployee.nama_lengkap} berhasil diperbarui`);
  }, []);

  const handleEmployeeDeletion = useCallback((deletedEmployeeId: string) => {
    // Remove employee from both main list and filtered list after successful deletion
    setEmployees(prev => prev.filter(emp => emp.id !== deletedEmployeeId));
    setFilteredEmployees(prev => prev.filter(emp => emp.id !== deletedEmployeeId));
    
    console.log('Employee removed from UI:', deletedEmployeeId);
    toast.success('Pegawai berhasil dihapus dari sistem');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Employee Directory</p>
            <p className="text-sm text-slate-600">Preparing organizational hierarchy...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Calculate hierarchical statistics
  const { directors, coordinators, staff } = groupEmployeesByHierarchy(employees);
  const activeEmployees = employees.filter(emp => emp.is_active).length;
  const direkturCount = directors.length;
  const koordinatorCount = coordinators.length;
  const staffCount = staff.length;

  return (
    <MainLayout user={user}>
      {/* Professional Government Background */}
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" data-animated="employees">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30 bg-grid-pattern pointer-events-none"></div>
        
        <div className={`relative p-6 space-y-8 max-w-none anim-fade-in motion-reduce:transition-none motion-reduce:opacity-100 ${mounted ? '' : 'opacity-0'}`}>
          {/* Header Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg transform transition-all duration-700 ease-out animate-in slide-in-from-top-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    Direktori Pegawai
                  </h1>
                  <p className="text-slate-600 mt-2">
                    Struktur Organisasi HPI Sosbud - Kementerian Luar Negeri RI
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <Crown className="w-4 h-4 mr-2 text-blue-600" />
                  Hierarki Struktural
                </Badge>
                
                <Button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Memperbarui...' : 'Refresh'}
                </Button>
                
                {user.role === 'admin' && (
                  <Button 
                    onClick={() => router.push('/employees/new')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pegawai
                  </Button>
                )}
                
                {user.role === 'user' && (
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-700 px-4 py-2">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Mode Pegawai: Hanya Edit Profil Sendiri
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hierarchical Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transform transition-all duration-700 ease-out animate-in slide-in-from-top-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Direktur</CardTitle>
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg group-hover:from-red-600 group-hover:to-red-700 transition-all">
                  <Crown className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{direkturCount}</div>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-red-500" />
                  Level 1 - Tertinggi
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Koordinator</CardTitle>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{koordinatorCount}</div>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <Shield className="w-3 h-3 mr-1 text-purple-500" />
                  Level 2 - Koordinator
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Staff PNS</CardTitle>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{staffCount}</div>
                <p className="text-xs text-slate-600 flex items-center mt-1">
                  <Shield className="w-3 h-3 mr-1 text-blue-500" />
                  Level 3 - Staff
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Status Aktif</CardTitle>
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg group-hover:from-green-600 group-hover:to-green-700 transition-all">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">{activeEmployees}</div>
                <div className="text-xs text-slate-600 flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Total pegawai aktif
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Search Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg transform transition-all duration-700 ease-out animate-in slide-in-from-left-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 lg:max-w-lg">
                <label htmlFor="search" className="sr-only">Cari pegawai</label>
                <div className="relative group">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-300 ${searchQuery ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  <input
                    id="search"
                    type="text"
                    placeholder="Cari berdasarkan nama, NIP, jabatan, golongan..."
                    className={`pl-10 pr-4 py-3 w-full border rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${searchQuery ? 'border-blue-300 shadow-md' : 'border-slate-200'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className={`transition-all duration-300 ${dataLoading ? 'animate-pulse bg-blue-50 border-blue-200' : 'bg-white/80 border-blue-200'}`}>
                  <span className="text-blue-700 font-semibold">{dataLoading ? '...' : filteredEmployees.length}</span>
                  <span className="text-slate-600 ml-1">dari {employees.length} pegawai</span>
                </Badge>
                {(searchQuery || Object.values(filters).some(f => f)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({});
                    }}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-right-4">
            <EmployeeFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Enhanced Employee Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-4 relative">
            {dataLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700">Memuat data...</p>
                    <p className="text-xs text-slate-600">Mengurutkan hierarki struktural</p>
                  </div>
                </div>
              </div>
            )}
            <EmployeeTable 
              employees={filteredEmployees}
              onEmployeeDeletion={handleEmployeeDeletion}
              currentUser={user}
            />
          </div>

          {/* Professional Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-4">
                <span>© 2025 Penata Layanan Oprasional - Direktorat Hukum dan Perjanjian Sosial Budaya</span>
                <span className="text-slate-400">|</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Sistem Online</span>
                </span>
              </div>
              <div className="text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}