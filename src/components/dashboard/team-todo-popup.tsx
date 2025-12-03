'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  ListTodo, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  User,
  Calendar,
  MapPin,
  Search,
  X,
  ChevronLeft,
  Target,
  Briefcase,
  Filter,
  ArrowRight,
  Eye
} from 'lucide-react';

// Extended interfaces for team functionality
interface TeamMember {
  id: string;
  nama_lengkap: string;
  jabatan: string;
  todos: TodoItem[];
}

interface TodoItem {
  id: string;
  deskripsi: string;
  status: 'pending' | 'on-progress' | 'done';
  tgl_diterima: string;
  type: string;
  fungsi?: string;
  nama: string;
  user_id: string;
  tgl_deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

type ViewMode = 'team-selection' | 'member-todos';

export function TeamTodoPopup() {
  const [open, setOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('team-selection');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // This component uses mock data - not currently used in main dashboard
  const mockTeamMembers: TeamMember[] = [
    {
      id: 'user-1',
      nama_lengkap: 'Yustisia Pratiwi',
      jabatan: 'Kasubdit SOSTERASI',
      todos: [
        {
          id: 't1',
          deskripsi: 'Review MoU kerjasama sosial budaya RI-PNG',
          status: 'on-progress',
          tgl_diterima: '2025-11-29',
          tgl_deadline: '2025-12-05',
          type: 'Tanggapan',
          fungsi: 'SOSTERASI',
          nama: 'Yustisia Pratiwi',
          user_id: 'user-1',
          priority: 'high'
        },
        {
          id: 't2',
          deskripsi: 'Koordinasi program pertukaran mahasiswa',
          status: 'pending',
          tgl_diterima: '2025-11-28',
          tgl_deadline: '2025-12-10',
          type: 'Rapat',
          fungsi: 'SOSTERASI',
          nama: 'Yustisia Pratiwi',
          user_id: 'user-1',
          priority: 'medium'
        },
        {
          id: 't3',
          deskripsi: 'Laporan bulanan kegiatan SOSTERASI',
          status: 'done',
          tgl_diterima: '2025-11-25',
          type: 'Laporan',
          fungsi: 'SOSTERASI',
          nama: 'Yustisia Pratiwi',
          user_id: 'user-1',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'user-2',
      nama_lengkap: 'Muhammad Shalahuddin',
      jabatan: 'Kasubdit HPIKSP',
      todos: [
        {
          id: 't4',
          deskripsi: 'Analisis kerjasama bilateral RI-Jerman',
          status: 'on-progress',
          tgl_diterima: '2025-11-27',
          tgl_deadline: '2025-12-03',
          type: 'Administrasi',
          fungsi: 'HPIKSP',
          nama: 'Muhammad Shalahuddin',
          user_id: 'user-2',
          priority: 'high'
        },
        {
          id: 't5',
          deskripsi: 'Persiapan dokumen kunjungan delegasi',
          status: 'pending',
          tgl_diterima: '2025-11-26',
          tgl_deadline: '2025-12-08',
          type: 'Side Job',
          fungsi: 'HPIKSP',
          nama: 'Muhammad Shalahuddin',
          user_id: 'user-2',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'user-3',
      nama_lengkap: 'Rina Sari Dewi',
      jabatan: 'Kasubdit BUTEK',
      todos: [
        {
          id: 't6',
          deskripsi: 'Finalisasi laporan E-Kinerja November',
          status: 'on-progress',
          tgl_diterima: '2025-11-29',
          tgl_deadline: '2025-12-02',
          type: 'Laporan',
          fungsi: 'BUTEK',
          nama: 'Rina Sari Dewi',
          user_id: 'user-3',
          priority: 'high'
        },
        {
          id: 't7',
          deskripsi: 'Review sistem manajemen dokumen',
          status: 'done',
          tgl_diterima: '2025-11-24',
          type: 'Administrasi',
          fungsi: 'BUTEK',
          nama: 'Rina Sari Dewi',
          user_id: 'user-3',
          priority: 'low'
        }
      ]
    },
    {
      id: 'user-4',
      nama_lengkap: 'Ahmad Fauzi Rahman',
      jabatan: 'Staf SOSTERASI',
      todos: [
        {
          id: 't8',
          deskripsi: 'Input data program beasiswa luar negeri',
          status: 'pending',
          tgl_diterima: '2025-11-28',
          tgl_deadline: '2025-12-07',
          type: 'Administrasi',
          fungsi: 'SOSTERASI',
          nama: 'Ahmad Fauzi Rahman',
          user_id: 'user-4',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'user-5',
      nama_lengkap: 'Siti Nurhaliza',
      jabatan: 'Staf HPIKSP',
      todos: [
        {
          id: 't9',
          deskripsi: 'Penyusunan draft nota kesepahaman',
          status: 'on-progress',
          tgl_diterima: '2025-11-27',
          tgl_deadline: '2025-12-06',
          type: 'Tanggapan',
          fungsi: 'HPIKSP',
          nama: 'Siti Nurhaliza',
          user_id: 'user-5',
          priority: 'high'
        },
        {
          id: 't10',
          deskripsi: 'Koordinasi acara seminar internasional',
          status: 'pending',
          tgl_diterima: '2025-11-25',
          tgl_deadline: '2025-12-15',
          type: 'Rapat',
          fungsi: 'HPIKSP',
          nama: 'Siti Nurhaliza',
          user_id: 'user-5',
          priority: 'medium'
        }
      ]
    },
    {
      id: 'user-6',
      nama_lengkap: 'Budi Santoso',
      jabatan: 'Staf BUTEK',
      todos: [
        {
          id: 't11',
          deskripsi: 'Maintenance sistem IT kantor',
          status: 'done',
          tgl_diterima: '2025-11-23',
          type: 'Side Job',
          fungsi: 'BUTEK',
          nama: 'Budi Santoso',
          user_id: 'user-6',
          priority: 'medium'
        }
      ]
    }
  ];

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        // TODO: Replace with real team member data from Supabase
        setTeamMembers(mockTeamMembers);
        setLoading(false);
      }, 800);
    }
  }, [open]);

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
    setViewMode('member-todos');
  };

  const handleBackToTeamSelection = () => {
    setViewMode('team-selection');
    setSelectedMember(null);
    setSearchTerm('');
    setFilterStatus('all');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'on-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on-progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredMembers = teamMembers.filter(member =>
    member.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTodos = selectedMember?.todos.filter(todo => {
    if (filterStatus === 'all') return true;
    return todo.status === filterStatus;
  }) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
        >
          <Users className="h-4 w-4 mr-2" />
          Lihat Tim
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-0 gap-0 sm:rounded-2xl">
        {/* Full Screen Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {viewMode === 'member-todos' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToTeamSelection}
                  className="hover:bg-blue-100"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Kembali
                </Button>
              )}
              
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                  {viewMode === 'team-selection' ? (
                    <>
                      <Users className="h-6 w-6 text-blue-600" />
                      <span>Pilih Anggota Tim</span>
                    </>
                  ) : (
                    <>
                      <User className="h-6 w-6 text-blue-600" />
                      <span>Todo List - {selectedMember?.nama_lengkap}</span>
                    </>
                  )}
                </DialogTitle>
                <p className="text-slate-600 mt-1">
                  {viewMode === 'team-selection' 
                    ? 'Klik pada anggota tim untuk melihat todo list mereka'
                    : `${selectedMember?.jabatan} • ${filteredTodos.length} tugas total`
                  }
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Full Screen Content */}
        <div className="flex-1 overflow-hidden p-6">
          {viewMode === 'team-selection' ? (
            /* STEP 1: Team Member Selection */
            <div className="h-full space-y-6">
              {/* Enhanced Search Bar */}
              <div className="flex items-center space-x-6">
                <div className="relative flex-1 max-w-2xl">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Cari nama atau jabatan anggota tim..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg font-medium border-2 border-slate-200 focus:border-blue-400 rounded-xl shadow-sm"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="px-6 py-3 text-base font-semibold bg-blue-50 text-blue-700 border-blue-200">
                    <Users className="h-4 w-4 mr-2" />
                    {filteredMembers.length} anggota
                  </Badge>
                </div>
              </div>

              {/* Team Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-16 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                  {filteredMembers.map((member) => {
                    const pendingTodos = member.todos.filter(t => t.status === 'pending').length;
                    const onProgressTodos = member.todos.filter(t => t.status === 'on-progress').length;
                    const doneTodos = member.todos.filter(t => t.status === 'done').length;
                    
                    return (
                      <Card 
                        key={member.id} 
                        className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:border-blue-300 hover:scale-105"
                        onClick={() => handleMemberSelect(member)}
                      >
                        <CardContent className="p-16">
                          <div className="space-y-12">
                            {/* Member Info */}
                            <div className="flex flex-col items-center text-center space-y-8">
                              <Avatar className="h-40 w-40 ring-8 ring-blue-100 group-hover:ring-blue-300 transition-all shadow-xl">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold">
                                  {member.nama_lengkap.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-4">
                                <h3 className="font-bold text-3xl text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                                  {member.nama_lengkap}
                                </h3>
                                <p className="text-2xl text-slate-600 font-medium">
                                  {member.jabatan}
                                </p>
                                <Badge variant="outline" className="text-lg px-6 py-3 font-semibold">
                                  {member.todos.length} total tugas
                                </Badge>
                              </div>
                            </div>

                            {/* Todo Summary */}
                            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-slate-200">
                              <div className="text-center p-8 rounded-2xl bg-red-50 group-hover:bg-red-100 transition-colors">
                                <div className="text-6xl font-bold text-red-600 mb-4">{pendingTodos}</div>
                                <div className="text-lg font-bold text-red-700 uppercase tracking-wide">Pending</div>
                              </div>
                              <div className="text-center p-8 rounded-2xl bg-yellow-50 group-hover:bg-yellow-100 transition-colors">
                                <div className="text-6xl font-bold text-yellow-600 mb-4">{onProgressTodos}</div>
                                <div className="text-lg font-bold text-yellow-700 uppercase tracking-wide">Progress</div>
                              </div>
                              <div className="text-center p-8 rounded-2xl bg-green-50 group-hover:bg-green-100 transition-colors">
                                <div className="text-6xl font-bold text-green-600 mb-4">{doneTodos}</div>
                                <div className="text-lg font-bold text-green-700 uppercase tracking-wide">Done</div>
                              </div>
                            </div>

                            {/* View Button */}
                            <Button 
                              className="w-full h-20 group-hover:bg-blue-600 transition-colors text-2xl font-bold" 
                              size="lg"
                            >
                              <Eye className="h-8 w-8 mr-6" />
                              Lihat Todo List
                              <ArrowRight className="ml-6 h-8 w-8 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Member Todo List Display */
            <div className="h-full space-y-6">
              {/* Enhanced Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-4">
                    <Filter className="h-6 w-6 text-slate-400" />
                    <span className="text-xl font-semibold text-slate-700">Filter Status:</span>
                  </div>
                  <div className="flex space-x-4">
                    {['all', 'pending', 'on-progress', 'done'].map((status) => (
                      <Button
                        key={status}
                        variant={filterStatus === status ? "default" : "outline"}
                        size="lg"
                        onClick={() => setFilterStatus(status)}
                        className="capitalize px-8 py-3 text-lg font-medium h-12"
                      >
                        {status === 'all' ? 'Semua' : status === 'on-progress' ? 'Progress' : status}
                      </Button>
                    ))}
                  </div>
                </div>
                <Badge variant="secondary" className="px-8 py-4 text-lg font-semibold bg-slate-100 text-slate-700">
                  <ListTodo className="h-5 w-5 mr-3" />
                  {filteredTodos.length} tugas ditampilkan
                </Badge>
              </div>

              {/* Todo List */}
              <div className="space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto pr-4">
                {filteredTodos.length === 0 ? (
                  <Card>
                    <CardContent className="p-24 text-center">
                      <ListTodo className="mx-auto h-32 w-32 text-slate-300 mb-8" />
                      <h3 className="text-4xl font-bold text-slate-700 mb-6">
                        {filterStatus === 'all' ? 'Tidak Ada Tugas' : `Tidak Ada Tugas ${filterStatus}`}
                      </h3>
                      <p className="text-2xl text-slate-500">
                        {selectedMember?.nama_lengkap} belum memiliki tugas dengan status ini.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTodos.map((todo, index) => {
                    const daysUntil = getDaysUntilDeadline(todo.tgl_deadline);
                    
                    return (
                      <Card 
                        key={todo.id} 
                        className="hover:shadow-xl transition-all duration-300 border-l-8 border-l-blue-500 hover:scale-[1.02]"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-16">
                          <div className="space-y-12">
                            {/* Todo Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-6">
                                <div className="flex items-center space-x-8">
                                  <div className="h-8 w-8">{getStatusIcon(todo.status)}</div>
                                  <h3 className="text-4xl font-bold text-slate-900 leading-tight">
                                    {todo.deskripsi}
                                  </h3>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-6">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-8 py-4 text-xl font-bold">
                                    {todo.type}
                                  </Badge>
                                  {todo.fungsi && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-8 py-4 text-xl font-bold">
                                      {todo.fungsi}
                                    </Badge>
                                  )}
                                  {todo.priority && (
                                    <Badge variant="outline" className={`${getPriorityColor(todo.priority)} px-8 py-4 text-xl font-bold`}>
                                      {todo.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <Badge className={`${getStatusColor(todo.status)} px-12 py-6 text-2xl font-bold`}>
                                {todo.status === 'on-progress' ? 'In Progress' : 
                                 todo.status === 'pending' ? 'Pending' : 'Done'}
                              </Badge>
                            </div>

                            {/* Todo Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-2xl">
                              <div className="flex items-center space-x-6 text-slate-700 bg-slate-50 p-10 rounded-2xl">
                                <Calendar className="h-10 w-10 text-slate-500" />
                                <div>
                                  <span className="font-bold text-slate-600 block text-xl">Diterima:</span>
                                  <span className="font-semibold text-2xl">{new Date(todo.tgl_diterima).toLocaleDateString('id-ID')}</span>
                                </div>
                              </div>
                              
                              {todo.tgl_deadline && (
                                <div className="flex items-center space-x-6 bg-slate-50 p-10 rounded-2xl">
                                  <AlertCircle className={`h-10 w-10 ${daysUntil && daysUntil < 0 ? 'text-red-500' : 
                                    daysUntil && daysUntil <= 2 ? 'text-yellow-500' : 'text-slate-500'}`} />
                                  <div>
                                    <span className="font-bold text-slate-600 block text-xl">Deadline:</span>
                                    <span className={daysUntil && daysUntil < 0 ? 'text-red-600 font-bold text-2xl' : 
                                      daysUntil && daysUntil <= 2 ? 'text-yellow-600 font-bold text-2xl' : 'text-slate-700 font-semibold text-2xl'}>
                                      {new Date(todo.tgl_deadline).toLocaleDateString('id-ID')}
                                      {daysUntil !== null && (
                                        <span className="block text-lg font-medium">
                                          ({daysUntil < 0 ? `${Math.abs(daysUntil)} hari terlambat` : 
                                            daysUntil === 0 ? 'hari ini' : 
                                            `${daysUntil} hari lagi`})
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-6 text-slate-700 bg-slate-50 p-10 rounded-2xl">
                                <Briefcase className="h-10 w-10 text-slate-500" />
                                <div>
                                  <span className="font-bold text-slate-600 block text-xl">Assigned:</span>
                                  <span className="font-semibold text-2xl">{todo.nama}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar for In Progress Items */}
                            {todo.status === 'on-progress' && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-base text-slate-600">
                                  <span>Progress Estimasi</span>
                                  <span>65%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                  <div 
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: '65%' }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}