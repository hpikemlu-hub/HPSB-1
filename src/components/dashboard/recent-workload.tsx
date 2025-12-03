'use client';

import { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, AlertCircle, ListTodo, User, Calendar, MapPin, Filter, Search, Check, X, Edit3, Undo, Users } from 'lucide-react';
import Link from 'next/link';
import { TeamTodoPopup } from './team-todo-popup';
import type { Workload } from '@/types';

// Undo state interface
interface UndoState {
  recentlyCompleted: Workload[];
  timestamp: number;
}

export function RecentWorkload() {
  const [todoItems, setTodoItems] = useState<Workload[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [undoTimer, setUndoTimer] = useState<number>(0);
  const supabase = createClientSupabaseClient();
  
  // This component is not used in dashboard - replaced by PersonalTodoList
  
  // Undo timeout in seconds
  const UNDO_TIMEOUT = 10;

  useEffect(() => {
    // Load real workload data for current user, excluding completed tasks
    const allWorkload = [
      {
        id: '1',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Administrasi',
        deskripsi: 'Pengembangan aplikasi workload sistem modern',
        status: 'on-progress' as const,
        tgl_diterima: '2025-11-29',
        fungsi: 'NON FUNGSI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Tanggapan',
        deskripsi: 'Review perjanjian RI-PNG bidang sosial budaya',
        status: 'pending' as const,
        tgl_diterima: '2025-11-28',
        fungsi: 'SOSTERASI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Rapat',
        deskripsi: 'Koordinasi kerjasama bilateral RI-Jerman',
        status: 'on-progress' as const,
        tgl_diterima: '2025-11-27',
        fungsi: 'HPIKSP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Side Job',
        deskripsi: 'Persiapan dokumentasi E-Kinerja November',
        status: 'pending' as const,
        tgl_diterima: '2025-11-26',
        fungsi: 'BUTEK',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Laporan',
        deskripsi: 'Finalisasi laporan bulanan kegiatan HPI Sosbud',
        status: 'on-progress' as const,
        tgl_diterima: '2025-11-25',
        fungsi: 'SOSTERASI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Include completed task to show filtering works
      {
        id: '99',
        user_id: '73a1fbe0-90cd-4753-bede-58862b112e56',
        nama: 'Administrator HPI Sosbud',
        type: 'Administrasi',
        deskripsi: 'Task yang sudah selesai - tidak akan muncul',
        status: 'done' as const,
        tgl_diterima: '2025-11-24',
        fungsi: 'NON FUNGSI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Filter: current user only + exclude completed tasks
    const filteredTodos = allWorkload.filter(item => 
      item.user_id === '73a1fbe0-90cd-4753-bede-58862b112e56' && 
      item.status !== 'done'
    );
    
    setTodoItems(filteredTodos);
    setLoading(false);
  }, []);

  // Undo timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (undoState && undoTimer > 0) {
      interval = setInterval(() => {
        setUndoTimer(prev => {
          if (prev <= 1) {
            // Timer expired, clear undo state
            setUndoState(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [undoState, undoTimer]);

  const handleToggleComplete = async (taskId: string) => {
    try {
      const taskToComplete = todoItems.find(item => item.id === taskId);
      if (!taskToComplete) return;

      // Mark task as completed and remove from active list
      setTodoItems(prev => prev.filter(item => item.id !== taskId));
      
      // Store in undo state with timestamp
      const completedTask = { ...taskToComplete, status: 'done' as const, updated_at: new Date().toISOString() };
      setUndoState({
        recentlyCompleted: [completedTask],
        timestamp: Date.now()
      });
      setUndoTimer(UNDO_TIMEOUT);
      
      // In real app, this would update the database
      // await supabase.from('workload').update({ status: 'done' }).eq('id', taskId);
      
    } catch (error) {
      console.error('Error completing task:', error);
      // Revert optimistic update on error - restore the task
      const taskToRestore = undoState?.recentlyCompleted.find(item => item.id === taskId);
      if (taskToRestore) {
        setTodoItems(prev => [...prev, { ...taskToRestore, status: 'on-progress' as const }]);
      }
    }
  };

  const handleUndo = () => {
    if (undoState && undoState.recentlyCompleted.length > 0) {
      // Restore the completed task back to active list
      const taskToRestore = undoState.recentlyCompleted[0];
      const restoredTask = { ...taskToRestore, status: 'on-progress' as const };
      
      setTodoItems(prev => [...prev, restoredTask]);
      setUndoState(null);
      setUndoTimer(0);
      
      // In real app, revert database update
      // await supabase.from('workload').update({ status: 'on-progress' }).eq('id', taskToRestore.id);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTodoItems(prev => prev.filter(item => item.id !== taskId));
      // In real app: await supabase.from('workload').delete().eq('id', taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'on-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Done';
      case 'on-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <ListTodo className="h-5 w-5 text-blue-600" />
            <span>Todo List Pribadi</span>
          </h3>
          <p className="text-sm text-slate-600">
            Kelola dan pantau tugas-tugas Anda yang masih perlu diselesaikan
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            {todoItems.length} tugas tersisa
          </Badge>
          <TeamTodoPopup />
          <Button variant="outline" size="sm" asChild className="hover:bg-green-50 hover:text-green-700">
            <Link href="/workload/new">
              <ListTodo className="h-4 w-4 mr-2" />
              Tambah Tugas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Undo Notification */}
      {undoState && undoTimer > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Tugas "{undoState.recentlyCompleted[0]?.deskripsi}" telah diselesaikan
              </p>
              <p className="text-xs text-green-600">
                Akan dihapus dalam {undoTimer} detik
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            className="bg-white hover:bg-green-50 text-green-700 border-green-300"
          >
            <Undo className="h-4 w-4 mr-2" />
            Undo
          </Button>
        </div>
      )}

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {todoItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ListTodo className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <h4 className="text-lg font-semibold text-slate-700 mb-2">Semua Tugas Selesai! 🎉</h4>
              <p className="text-sm">Anda telah menyelesaikan semua tugas. Saatnya istirahat atau tambah tugas baru.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/workload/new">
                  <ListTodo className="h-4 w-4 mr-2" />
                  Tambah Tugas Baru
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todoItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`
                    group relative p-5 border border-slate-200 rounded-xl 
                    hover:shadow-md hover:border-blue-200 transition-all duration-300
                    bg-gradient-to-r from-white to-slate-50
                    transform hover:scale-[1.02]
                    animate-in slide-in-from-left-4 duration-500
                    ${item.status === 'done' ? 'opacity-50 bg-green-50 border-green-200' : ''}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Priority Indicator */}
                  <div className={`
                    absolute left-0 top-0 bottom-0 w-1 rounded-l-xl
                    ${item.status === 'done' ? 'bg-green-500' : 
                      item.status === 'on-progress' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }
                  `} />
                  
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          transition-all duration-300 hover:scale-110
                          ${item.status === 'done' 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-slate-300 hover:border-blue-500'
                          }
                        `}
                      >
                        {item.status === 'done' && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Task Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-base font-semibold transition-colors leading-tight ${
                            item.status === 'done' 
                              ? 'text-slate-500 line-through' 
                              : 'text-slate-900 group-hover:text-blue-700'
                          }`}>
                            {item.deskripsi || 'Tidak ada deskripsi'}
                          </h4>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                              {item.type}
                            </Badge>
                            {item.fungsi && (
                              <Badge variant="outline" className="text-xs font-medium bg-purple-50 text-purple-700 border-purple-200">
                                {item.fungsi}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{item.nama}</span>
                        </div>
                        {item.tgl_diterima && (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{new Date(item.tgl_diterima).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>Kemlu RI</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Link href={`/workload/${item.id}`}>
                            <Edit3 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(item.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${getStatusColor(item.status)} 
                          px-3 py-2 text-xs font-semibold
                          group-hover:scale-105 transition-transform duration-200
                        `}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Indicator for In Progress Items */}
                  {item.status === 'on-progress' && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: '65%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Todo Stats */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-yellow-600">{todoItems.filter(w => w.status === 'on-progress').length}</div>
                <div className="text-sm text-slate-600">Dalam Progress</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{todoItems.filter(w => w.status === 'pending').length}</div>
                <div className="text-sm text-slate-600">Menunggu</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Progress Keseluruhan</span>
                <span>{todoItems.length > 0 ? Math.round(((5 - todoItems.length) / 5) * 100) : 100}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${todoItems.length > 0 ? ((5 - todoItems.length) / 5) * 100 : 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1 text-center">
                {5 - todoItems.length} dari 5 tugas selesai hari ini
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}