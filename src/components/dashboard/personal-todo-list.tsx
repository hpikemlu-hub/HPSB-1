'use client';

import { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  Filter, 
  Search,
  Plus,
  ChevronDown,
  Users,
  ArrowRight,
  Edit,
  Check,
  X,
  Plane
} from 'lucide-react';
import Link from 'next/link';
import type { User as UserType } from '@/types';
import { CalendarEventsList } from '@/components/calendar/calendar-events-list';
import { fetchOngoingEvents, fetchUpcomingEvents } from '@/lib/api/calendar';
import type { CalendarEvent } from '@/types';
// Removed TeamTodoPopup - now using dedicated page

interface TodoItem {
  id: string;
  deskripsi: string;
  status: 'pending' | 'on-progress' | 'done';
  tgl_deadline?: string;
  tgl_diterima: string;
  nama: string;
  user_id: string;
  type: string;
  fungsi?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface PersonalTodoListProps {
  user: UserType;
}

export function PersonalTodoList({ user }: PersonalTodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue'>('active');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'on-progress' | 'done'>('pending');
  
  // Calendar events state
  const [ongoingTrips, setOngoingTrips] = useState<CalendarEvent[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchPersonalTodos();
    fetchCalendarEvents();
  }, [user.id]);

  const fetchCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const [ongoing, upcoming] = await Promise.all([
        fetchOngoingEvents(user.id),
        fetchUpcomingEvents(user.id, 5),
      ]);
      setOngoingTrips(ongoing);
      setUpcomingTrips(upcoming);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchPersonalTodos = async () => {
    try {
      setLoading(true);
      
      // Fetch real personal workload data from Supabase
      const { data: workloads, error } = await supabase
        .from('workload')
        .select('*')
        .eq('user_id', user.id)
        .order('tgl_diterima', { ascending: false });

      if (error) {
        console.error('Error fetching personal workloads:', error);
        setTodos([]);
        return;
      }

      // Transform workload data to TodoItem format
      const personalTodos: TodoItem[] = (workloads || []).map(workload => ({
        id: workload.id,
        deskripsi: workload.deskripsi || workload.nama || 'Tugas tanpa deskripsi',
        status: workload.status || 'pending',
        tgl_diterima: workload.tgl_diterima,
        tgl_deadline: workload.tgl_deadline,
        nama: user.nama_lengkap,
        user_id: user.id,
        type: workload.type || 'Lainnya',
        fungsi: workload.fungsi || 'NON FUNGSI',
        priority: 'medium' // Default priority, could be derived from other fields
      }));
      
      setTodos(personalTodos);

      // Old demo data (removed):
      const demoTodos: TodoItem[] = [
        {
          id: '1',
          deskripsi: 'Pengembangan aplikasi workload sistem modern',
          status: 'on-progress',
          tgl_diterima: '2025-11-29',
          tgl_deadline: '2025-12-05',
          nama: user.nama_lengkap,
          user_id: user.id,
          type: 'Administrasi',
          fungsi: 'NON FUNGSI',
          priority: 'high'
        },
        {
          id: '2',
          deskripsi: 'Review perjanjian RI-PNG bidang sosial budaya',
          status: 'pending',
          tgl_diterima: '2025-11-28',
          tgl_deadline: '2025-12-10',
          nama: user.nama_lengkap,
          user_id: user.id,
          type: 'Tanggapan',
          fungsi: 'SOSTERASI',
          priority: 'medium'
        },
        {
          id: '3',
          deskripsi: 'Koordinasi kerjasama bilateral RI-Jerman',
          status: 'on-progress',
          tgl_diterima: '2025-11-27',
          tgl_deadline: '2025-12-03',
          nama: user.nama_lengkap,
          user_id: user.id,
          type: 'Rapat',
          fungsi: 'HPIKSP',
          priority: 'high'
        }
      ];

      // setTodos(demoTodos); // Removed demo data
    } catch (error) {
      console.error('Error in fetchPersonalTodos:', error);
      setTodos([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (todoId: string, newStatus: 'pending' | 'on-progress' | 'done') => {
    try {
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, status: newStatus } : todo
      ));
      setEditingTask(null);
      console.log(`Task ${todoId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskComplete = async (todoId: string, isCompleted: boolean) => {
    try {
      const newStatus = isCompleted ? 'done' : 'pending';
      
      const { error } = await supabase
        .from('workload')
        .update({ status: newStatus })
        .eq('id', todoId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // Update local state
      setTodos(prev => 
        prev.map(todo => 
          todo.id === todoId 
            ? { ...todo, status: newStatus }
            : todo
        )
      );
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => todo.status !== 'done');
      case 'overdue':
        return todos.filter(todo => {
          if (!todo.tgl_deadline || todo.status === 'done') return false;
          return new Date(todo.tgl_deadline) < new Date();
        });
      default:
        return todos;
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDueDateColor = (status: string, deadline?: string) => {
    if (status === 'done') return 'text-green-600';
    if (!deadline) return 'text-gray-500';
    
    const daysUntil = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntil < 0) return 'text-red-600 font-semibold'; // Overdue
    if (daysUntil <= 1) return 'text-orange-600 font-semibold'; // Due soon
    if (daysUntil <= 3) return 'text-yellow-600'; // Due this week
    return 'text-gray-600';
  };

  const formatDueDate = (deadline?: string) => {
    if (!deadline) return 'No deadline';
    
    const date = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return `Overdue ${Math.abs(daysUntil)} days`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter(t => t.status !== 'done').length;
  const overdueCount = todos.filter(t => isOverdue(t.tgl_deadline) && t.status !== 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span>Tugas Saya</span>
          </h3>
          <p className="text-sm text-slate-600">
            Kelola tugas dan prioritas personal Anda
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Tugas Aktif ({activeCount})</option>
              <option value="overdue">Terlambat ({overdueCount})</option>
              <option value="all">Semua Tugas ({todos.length})</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <Button variant="outline" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700">
            <Link href="/workload">
              <Search className="h-4 w-4 mr-2" />
              Lihat Semua
            </Link>
          </Button>
          
          {/* Team Tasks Button */}
          <Button variant="outline" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
            <Link href="/team-tasks">
              <Users className="h-4 w-4 mr-2" />
              Lihat Tim
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/workload/new">
              <Plus className="h-4 w-4 mr-2" />
              Tugas Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* Todo List Card */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Memuat tugas...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckSquare className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h4 className="text-lg font-semibold text-slate-700 mb-2">
                {filter === 'active' ? 'Tidak ada tugas aktif' : 
                 filter === 'overdue' ? 'Tidak ada tugas terlambat' : 
                 'Belum ada tugas'}
              </h4>
              <p className="text-sm mb-4">
                {filter === 'active' ? 'Semua tugas telah selesai!' : 
                 'Mulai dengan menambahkan tugas baru'}
              </p>
              <Button asChild>
                <Link href="/workload/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Tugas
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTodos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`
                    group p-6 hover:bg-gray-50 transition-colors duration-200
                    ${todo.status === 'done' ? 'opacity-60' : ''}
                    ${isOverdue(todo.tgl_deadline) && todo.status !== 'done' ? 'border-l-4 border-red-500' : ''}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        checked={todo.status === 'done'}
                        onCheckedChange={(checked: boolean) => 
                          handleTaskComplete(todo.id, checked)
                        }
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          {/* Task Title */}
                          <h4 className={`
                            text-base font-semibold leading-tight
                            ${todo.status === 'done' 
                              ? 'text-gray-500 line-through' 
                              : 'text-slate-900 group-hover:text-blue-700'
                            }
                          `}>
                            {todo.deskripsi || 'Tidak ada deskripsi'}
                          </h4>
                          
                          {/* Task Meta */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            {/* Type Badge */}
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {todo.type}
                            </Badge>
                            
                            {/* Function Badge */}
                            {todo.fungsi && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {todo.fungsi}
                              </Badge>
                            )}
                            
                            {/* Assignment */}
                            <div className="flex items-center space-x-1 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{todo.nama === user.nama_lengkap ? 'Self-assigned' : `From: ${todo.nama}`}</span>
                            </div>
                          </div>
                          
                          {/* Due Date */}
                          <div className={`flex items-center space-x-1 text-sm ${getDueDateColor(todo.status, todo.tgl_deadline)}`}>
                            <Calendar className="h-4 w-4" />
                            <span>{formatDueDate(todo.tgl_deadline)}</span>
                            {isOverdue(todo.tgl_deadline) && todo.status !== 'done' && (
                              <AlertCircle className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge with Edit */}
                        <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                          {editingTask === todo.id ? (
                            /* Edit Mode */
                            <div className="flex items-center space-x-2">
                              <select 
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as 'pending' | 'on-progress')}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="on-progress">Progress</option>
                              </select>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(todo.id, editStatus)}
                                className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingTask(null)}
                                className="h-6 w-6 p-0 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            /* Display Mode */
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary"
                                className={`
                                  ${todo.status === 'done' ? 'bg-green-100 text-green-700' :
                                    todo.status === 'on-progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'}
                                `}
                              >
                                {todo.status === 'done' ? 'Selesai' :
                                 todo.status === 'on-progress' ? 'Progress' :
                                 'Pending'}
                              </Badge>
                              {todo.status !== 'done' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTask(todo.id);
                                    setEditStatus(todo.status);
                                  }}
                                  className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit Status"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Calendar Events Section */}
      {(ongoingTrips.length > 0 || upcomingTrips.length > 0) && (
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-600" />
              Perjalanan Dinas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {calendarLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Memuat perjalanan dinas...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ongoing Trips */}
                {ongoingTrips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      Sedang Berlangsung
                    </h4>
                    <CalendarEventsList
                      events={ongoingTrips}
                      showStatus={true}
                      emptyMessage="Tidak ada perjalanan yang sedang berlangsung"
                    />
                  </div>
                )}

                {/* Upcoming Trips */}
                {upcomingTrips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Akan Datang
                    </h4>
                    <CalendarEventsList
                      events={upcomingTrips}
                      showStatus={true}
                      emptyMessage="Tidak ada perjalanan yang akan datang"
                    />
                  </div>
                )}

                {/* View All Link */}
                <div className="pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      Lihat Semua Perjalanan Dinas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {todos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
              <div className="text-sm text-gray-600">Tugas Aktif</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {todos.filter(t => t.status === 'done').length}
              </div>
              <div className="text-sm text-gray-600">Selesai</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-sm text-gray-600">Terlambat</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}