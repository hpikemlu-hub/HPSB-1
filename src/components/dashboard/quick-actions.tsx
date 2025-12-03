'use client';

import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase/client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  Zap, 
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
}

interface QuickActionsProps {
  user?: any; // User data untuk filtering personal actions
}

export function QuickActions({ user }: QuickActionsProps) {
  const router = useRouter();
  const supabase = createClientSupabaseClient();
  const [nearDeadlineCount, setNearDeadlineCount] = useState<number>(0);
  const [personalStats, setPersonalStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedToday: 0
  });

  useEffect(() => {
    (async () => {
      if (!user || !user.id) return;
      
      try {
        // Load personal stats
        const { data: workloads, error } = await supabase
          .from('workload')
          .select('*')
          .eq('user_id', user.id);

        if (!error && workloads) {
          const today = new Date().toISOString().split('T')[0];
          const stats = {
            totalTasks: workloads.length,
            pendingTasks: workloads.filter(w => w.status === 'pending').length,
            completedToday: workloads.filter(w => 
              w.status === 'done' && 
              w.updated_at && 
              w.updated_at.split('T')[0] === today
            ).length
          };
          setPersonalStats(stats);

          // Calculate personal near deadline count
          const now = new Date();
          const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const nearDeadline = workloads.filter(w => {
            if (!w.tgl_deadline || w.status === 'done') return false;
            const deadline = new Date(w.tgl_deadline);
            return deadline >= now && deadline <= in24h;
          }).length;
          setNearDeadlineCount(nearDeadline);
        }
      } catch (e) {
        console.error('Personal QuickActions error:', e);
      }
    })();
  }, [user]);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      title: 'Tambah Workload',
      description: 'Buat tugas atau penugasan baru',
      href: '/workload/new',
      icon: Plus,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      priority: 'high'
    },
    {
      title: 'Buat Laporan',
      description: 'Export analitik workload',
      href: '/reports',
      icon: FileText,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      priority: 'high'
    },
    {
      title: 'Jadwalkan Acara',
      description: 'Rencanakan perjalanan dinas',
      href: '/calendar/new',
      icon: Calendar,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      priority: 'medium'
    },
    {
      title: 'Lihat Tim',
      description: 'Monitor tugas anggota tim',
      href: '/team-tasks',
      icon: Users,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      priority: 'high'
    },
    {
      title: 'E-Kinerja',
      description: 'Input data kinerja pegawai',
      href: '/e-kinerja/new',
      icon: Target,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      priority: 'high',
      count: 3
    }
  ];

  // Priority badge function removed - no longer displaying priority levels

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Aksi Cepat</span>
        </h3>
        <p className="text-sm text-slate-600">
          Shortcut untuk tugas-tugas penting
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  asChild
                  variant="ghost"
                  className={`
                    w-full justify-start h-auto p-0 hover:bg-transparent group
                    transform transition-all duration-300
                    ${hoveredAction === action.title ? 'scale-102' : ''}
                  `}
                  onMouseEnter={() => setHoveredAction(action.title)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <Link href={action.href}>
                    <div className={`
                      w-full p-4 rounded-xl transition-all duration-300 group-hover:shadow-xl
                      ${action.bgColor}
                      relative overflow-hidden
                    `}>
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                      </div>
                      
                      <div className="relative flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                            <Icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform duration-300`} />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${action.color} group-hover:text-white transition-colors duration-300`}>
                              {action.title}
                            </h4>
                            {action.count && (
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                                {action.count}
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm ${action.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}>
                            {action.description}
                          </p>
                          
                          <div className="flex items-center justify-end mt-3">
                            <ArrowRight className={`h-4 w-4 ${action.color} opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Produktivitas Hari Ini</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{personalStats.completedToday}</div>
                <div className="text-sm text-green-600">Selesai Hari Ini</div>
                <div className="text-xs text-green-500 mt-1">personal task</div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{personalStats.pendingTasks}</div>
                <div className="text-sm text-amber-600">Pending</div>
                <div className="text-xs text-amber-500 mt-1">perlu action</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Aktivitas Terkini</span>
            </h4>
            
            <div className="space-y-4">
              {[
                {
                  title: 'Workload "Review MoU RI-PNG" selesai',
                  time: '2 jam lalu',
                  type: 'success',
                  user: 'Yustisia Pratiwi'
                },
                {
                  title: 'Rapat koordinasi SOSTERASI dijadwalkan',
                  time: '4 jam lalu',
                  type: 'info',
                  user: 'Admin'
                },
                {
                  title: 'Laporan workload November exported',
                  time: '1 hari lalu',
                  type: 'warning',
                  user: 'Muhammad Shalahuddin'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`
                    w-2 h-2 rounded-full mt-2 flex-shrink-0
                    ${activity.type === 'success' ? 'bg-green-500' : 
                      activity.type === 'info' ? 'bg-blue-500' : 
                      activity.type === 'warning' ? 'bg-yellow-500' : 
                      'bg-gray-400'
                    }
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium leading-tight">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-slate-500">{activity.time}</p>
                      <span className="text-slate-400">•</span>
                      <p className="text-xs text-slate-500">{activity.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Notifications - removed per request */}
          {/* <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h4 className="text-sm font-semibold text-red-900">Perhatian</h4>
              </div>
              <p className="text-sm text-red-700">
                {nearDeadlineCount} tugas mendekati deadline dalam 24 jam ke depan
              </p>
              <Button variant="outline" size="sm" className="mt-3 text-red-700 border-red-300 hover:bg-red-100">
                Lihat Detail
              </Button>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}