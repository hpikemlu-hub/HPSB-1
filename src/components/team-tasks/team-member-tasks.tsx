'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ListTodo,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Target,
  ArrowLeft,
  Plane
} from 'lucide-react';
import type { TeamMember, CalendarEvent } from '@/types';
import { CalendarEventsList } from '@/components/calendar/calendar-events-list';
import { fetchUserCalendarEvents } from '@/lib/api/calendar';

interface TeamMemberTasksProps {
  member: TeamMember | null;
  onBackToGrid: () => void;
}

export function TeamMemberTasks({ member, onBackToGrid }: TeamMemberTasksProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [memberEvents, setMemberEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (member?.id) {
      fetchMemberEvents();
    }
  }, [member?.id]);

  const fetchMemberEvents = async () => {
    if (!member) return;
    
    try {
      setEventsLoading(true);
      const events = await fetchUserCalendarEvents(member.id);
      setMemberEvents(events);
    } catch (error) {
      console.error('Error fetching member calendar events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  if (!member) {
    return (
      <Card>
        <CardContent className="p-16 text-center">
          <User className="mx-auto h-24 w-24 text-slate-300 mb-6" />
          <h3 className="text-2xl font-bold text-slate-700 mb-4">
            Anggota tim tidak ditemukan
          </h3>
          <p className="text-lg text-slate-500 mb-8">
            Silakan pilih anggota tim dari halaman sebelumnya.
          </p>
          <Button onClick={onBackToGrid} className="px-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Tim
          </Button>
        </CardContent>
      </Card>
    );
  }

  const filteredTodos = member.todos?.filter(todo => {
    if (filterStatus === 'all') return true;
    return todo.status === filterStatus;
  }) || [];

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

  const getProgressEstimate = (todo: any) => {
    // Calculate realistic progress based on status and time elapsed
    if (todo.status === 'done') return 100;
    if (todo.status === 'pending') return 0;
    
    // For on-progress items, calculate based on days since received
    const today = new Date();
    const receivedDate = new Date(todo.tgl_diterima);
    const daysElapsed = Math.ceil((today.getTime() - receivedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Estimate progress: more days = more progress, cap at 90% for on-progress
    const progress = Math.min(90, Math.max(10, daysElapsed * 5));
    return Math.round(progress);
  };

  const totalTodos = member.todos?.length || 0;
  const pendingTodos = member.todos?.filter(t => t.status === 'pending').length || 0;
  const onProgressTodos = member.todos?.filter(t => t.status === 'on-progress').length || 0;
  const doneTodos = member.todos?.filter(t => t.status === 'done').length || 0;

  return (
    <div className="space-y-6">
      {/* Member Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-blue-100 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {member.nama_lengkap.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{member.nama_lengkap}</h2>
              <p className="text-xl text-slate-600 mb-3">{member.jabatan}</p>
              <div className="flex items-center space-x-4">
                {member.departemen && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2">
                    {member.departemen}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
                  <Target className="h-4 w-4 mr-2" />
                  {totalTodos} total tugas
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-red-50">
                <div className="text-2xl font-bold text-red-600 mb-1">{pendingTodos}</div>
                <div className="text-sm font-semibold text-red-700">Pending</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600 mb-1">{onProgressTodos}</div>
                <div className="text-sm font-semibold text-yellow-700">Progress</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50">
                <div className="text-2xl font-bold text-green-600 mb-1">{doneTodos}</div>
                <div className="text-sm font-semibold text-green-700">Done</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Filter className="h-5 w-5 text-slate-400" />
            <span className="text-lg font-semibold text-slate-700">Filter Status:</span>
          </div>
          <div className="flex space-x-3">
            {['all', 'pending', 'on-progress', 'done'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize px-6 py-2 font-medium"
              >
                {status === 'all' ? 'Semua' : status === 'on-progress' ? 'Progress' : status}
              </Button>
            ))}
          </div>
        </div>
        <Badge variant="secondary" className="px-6 py-3 text-base font-semibold bg-slate-100 text-slate-700">
          <ListTodo className="h-4 w-4 mr-2" />
          {filteredTodos.length} tugas ditampilkan
        </Badge>
      </div>

      {/* Tasks List */}
      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-4">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <ListTodo className="mx-auto h-24 w-24 text-slate-300 mb-6" />
              <h3 className="text-2xl font-bold text-slate-700 mb-4">
                {filterStatus === 'all' ? 'Tidak Ada Tugas' : `Tidak Ada Tugas ${filterStatus}`}
              </h3>
              <p className="text-lg text-slate-500">
                {member.nama_lengkap} belum memiliki tugas dengan status ini.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo, index) => {
            const daysUntil = getDaysUntilDeadline(todo.tgl_deadline);
            
            return (
              <Card 
                key={todo.id} 
                className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Task Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-6 w-6">{getStatusIcon(todo.status)}</div>
                          <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            {todo.deskripsi}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1 font-semibold">
                            {todo.type}
                          </Badge>
                          {todo.fungsi && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-1 font-semibold">
                              {todo.fungsi}
                            </Badge>
                          )}
                          {todo.priority && (
                            <Badge variant="outline" className={`${getPriorityColor(todo.priority)} px-4 py-1 font-semibold`}>
                              {todo.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Badge className={`${getStatusColor(todo.status)} px-6 py-2 text-sm font-bold`}>
                        {todo.status === 'on-progress' ? 'In Progress' : 
                         todo.status === 'pending' ? 'Pending' : 'Done'}
                      </Badge>
                    </div>

                    {/* Task Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center space-x-3 text-slate-700 bg-slate-50 p-4 rounded-lg">
                        <Calendar className="h-5 w-5 text-slate-500" />
                        <div>
                          <span className="font-semibold text-slate-600 block text-sm">Diterima:</span>
                          <span className="font-semibold">{new Date(todo.tgl_diterima).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                      
                      {todo.tgl_deadline && (
                        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg">
                          <AlertCircle className={`h-5 w-5 ${daysUntil && daysUntil < 0 ? 'text-red-500' : 
                            daysUntil && daysUntil <= 2 ? 'text-yellow-500' : 'text-slate-500'}`} />
                          <div>
                            <span className="font-semibold text-slate-600 block text-sm">Deadline:</span>
                            <span className={daysUntil && daysUntil < 0 ? 'text-red-600 font-bold' : 
                              daysUntil && daysUntil <= 2 ? 'text-yellow-600 font-bold' : 'text-slate-700 font-semibold'}>
                              {new Date(todo.tgl_deadline).toLocaleDateString('id-ID')}
                              {daysUntil !== null && (
                                <span className="block text-sm font-medium">
                                  ({daysUntil < 0 ? `${Math.abs(daysUntil)} hari terlambat` : 
                                    daysUntil === 0 ? 'hari ini' : 
                                    `${daysUntil} hari lagi`})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 text-slate-700 bg-slate-50 p-4 rounded-lg">
                        <Briefcase className="h-5 w-5 text-slate-500" />
                        <div>
                          <span className="font-semibold text-slate-600 block text-sm">Assigned:</span>
                          <span className="font-semibold">{todo.nama}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for In Progress Items */}
                    {todo.status === 'on-progress' && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Progress Estimasi</span>
                          <span>{getProgressEstimate(todo)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${getProgressEstimate(todo)}%` }}
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

      {/* Member Calendar Events */}
      {memberEvents.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                Perjalanan Dinas
              </h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {memberEvents.length} event
              </Badge>
            </div>
            
            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Memuat perjalanan dinas...</p>
              </div>
            ) : (
              <CalendarEventsList
                events={memberEvents}
                showStatus={true}
                emptyMessage="Tidak ada perjalanan dinas"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}