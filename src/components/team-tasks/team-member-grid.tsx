'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search,
  Eye,
  ArrowRight,
  Mail,
  Building,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { TeamMember, User, Workload } from '@/types';
import { toast } from 'sonner';

interface TeamMemberGridProps {
  onMemberSelect: (member: TeamMember) => void;
}

export function TeamMemberGrid({ onMemberSelect }: TeamMemberGridProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Import supabase client
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
      console.log('🔄 Fetching team members from database...');
      
      // Fetch users data first
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          id, nama_lengkap, jabatan, email, is_active
        `)
        .eq('is_active', true)
        .order('nama_lengkap', { ascending: true });

      if (usersError) {
        console.error('❌ Users query error:', usersError.message);
        throw new Error('Gagal mengambil data tim dari database');
      }

      // Fetch workload data separately and group by user_id
      const { data: workloads, error: workloadError } = await supabase
        .from('workload')
        .select(`
          id, user_id, nama, type, status, tgl_diterima, fungsi, deskripsi, created_at
        `)
        .order('created_at', { ascending: false });

      if (workloadError) {
        console.error('❌ Workload query error:', workloadError.message);
        console.warn('⚠️ Continuing without workload data...');
      }

      if (!users || users.length === 0) {
        console.warn('⚠️ No active users found in database');
        setTeamMembers([]);
        return;
      }

      // Group workloads by user_id
      const workloadsByUser = (workloads || []).reduce((acc: any, workload: any) => {
        if (!acc[workload.user_id]) {
          acc[workload.user_id] = [];
        }
        acc[workload.user_id].push(workload);
        return acc;
      }, {});

      console.log(`📊 Found ${users.length} users and ${workloads?.length || 0} workloads`);

      // Transform database data to TeamMember format
      const teamMembers: TeamMember[] = users.map((user: any) => {
        // Extract department from jabatan
        const departemen = extractDepartment(user.jabatan || '');
        
        // Get user's workloads
        const userWorkloads = workloadsByUser[user.id] || [];
        
        // Transform workload to todos
        const todos = userWorkloads.map((w: any) => ({
          id: w.id,
          deskripsi: w.nama || w.deskripsi || 'Tidak ada deskripsi',
          status: w.status,
          tgl_diterima: w.tgl_diterima || new Date().toISOString().split('T')[0],
          type: w.type,
          fungsi: w.fungsi,
          nama: user.nama_lengkap,
          user_id: user.id,
          // Add default values for optional fields
          tgl_deadline: undefined,
          priority: 'medium' as const
        })) || [];

        return {
          id: user.id,
          nama_lengkap: user.nama_lengkap,
          jabatan: user.jabatan || 'Staff',
          departemen,
          email: user.email,
          todos
        };
      });

      console.log(`✅ Successfully loaded ${teamMembers.length} team members from database`);
      console.log(`📊 Total workload items: ${teamMembers.reduce((total, member) => total + (member.todos?.length || 0), 0)}`);
      
      setTeamMembers(teamMembers);
      
      toast.success('Data tim berhasil dimuat', {
        description: `${teamMembers.length} anggota tim aktif dari database`,
      });

    } catch (error) {
      console.error('💥 Error fetching team data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga';
      setError(errorMessage);
      
      toast.error('Gagal memuat data tim', {
        description: errorMessage,
        action: {
          label: 'Coba Lagi',
          onClick: () => fetchTeamData()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract department from jabatan
  const extractDepartment = (jabatan: string): string => {
    const jabatanLower = jabatan.toLowerCase();
    if (jabatanLower.includes('sosterasi')) return 'SOSTERASI';
    if (jabatanLower.includes('hpiksp') || jabatanLower.includes('hpi')) return 'HPIKSP';
    if (jabatanLower.includes('butek')) return 'BUTEK';
    if (jabatanLower.includes('kamil')) return 'KAMIL';
    if (jabatanLower.includes('dirjen') || jabatanLower.includes('direktur')) return 'LEADERSHIP';
    return 'UMUM';
  };

  // Filter team members based on search term
  const filteredTeamMembers = teamMembers.filter(member =>
    member.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.departemen && member.departemen.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusCounts = (todos: any[]) => {
    const pending = todos.filter(t => t.status === 'pending').length;
    const onProgress = todos.filter(t => t.status === 'on-progress').length;
    const done = todos.filter(t => t.status === 'done').length;
    return { pending, onProgress, done };
  };

  const getDepartmentColor = (departemen?: string) => {
    switch (departemen) {
      case 'SOSTERASI': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HPIKSP': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BUTEK': return 'bg-green-100 text-green-800 border-green-200';
      case 'KAMIL': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LEADERSHIP': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-lg font-semibold text-slate-800">Loading Team Data</p>
              <p className="text-sm text-slate-600">Mengambil data anggota tim dari database...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-16 text-center">
          <AlertCircle className="mx-auto h-24 w-24 text-red-300 mb-6" />
          <h3 className="text-2xl font-bold text-red-700 mb-4">
            Gagal Memuat Data Tim
          </h3>
          <p className="text-lg text-red-600 mb-8">
            {error}
          </p>
          <Button onClick={fetchTeamData} className="px-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Cari anggota tim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-base font-semibold">
            <Users className="h-4 w-4 mr-2" />
            {filteredTeamMembers.length} anggota tim
          </Badge>
          <Button
            variant="outline"
            size="lg"
            onClick={fetchTeamData}
            className="border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Team Members Grid */}
      {filteredTeamMembers.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <Users className="mx-auto h-24 w-24 text-slate-300 mb-6" />
            <h3 className="text-2xl font-bold text-slate-700 mb-4">
              {searchTerm ? 'Tidak Ada Hasil' : 'Tidak Ada Anggota Tim'}
            </h3>
            <p className="text-lg text-slate-500">
              {searchTerm 
                ? `Tidak ditemukan anggota tim dengan kata kunci "${searchTerm}"`
                : 'Belum ada anggota tim yang terdaftar dalam sistem'
              }
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Hapus Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers.map((member, index) => {
            const statusCounts = getStatusCounts(member.todos || []);
            const totalTodos = member.todos?.length || 0;
            
            return (
              <Card 
                key={member.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border-l-4 border-l-blue-500"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onMemberSelect(member)}
              >
                <CardContent className="p-6 space-y-6">
                  {/* Member Header */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 ring-4 ring-blue-100 shadow-lg group-hover:ring-blue-200 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                        {member.nama_lengkap.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {member.nama_lengkap}
                      </h3>
                      <p className="text-base text-slate-600 truncate">{member.jabatan}</p>
                      {member.departemen && (
                        <Badge 
                          variant="outline" 
                          className={`mt-2 ${getDepartmentColor(member.departemen)} text-xs font-semibold`}
                        >
                          {member.departemen}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {member.email && (
                    <div className="flex items-center space-x-3 text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium truncate">{member.email}</span>
                    </div>
                  )}

                  {/* Task Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Total Tugas:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">
                        {totalTodos}
                      </Badge>
                    </div>

                    {totalTodos > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-3 rounded-lg bg-red-50">
                          <div className="text-lg font-bold text-red-600">{statusCounts.pending}</div>
                          <div className="text-xs font-semibold text-red-700">Pending</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-yellow-50">
                          <div className="text-lg font-bold text-yellow-600">{statusCounts.onProgress}</div>
                          <div className="text-xs font-semibold text-yellow-700">Progress</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-green-50">
                          <div className="text-lg font-bold text-green-600">{statusCounts.done}</div>
                          <div className="text-xs font-semibold text-green-700">Done</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 group-hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMemberSelect(member);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail Tugas
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}