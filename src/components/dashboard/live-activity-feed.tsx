'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  User, 
  Clock, 
  CheckCircle, 
  FileText, 
  Calendar,
  MessageSquare,
  Bell,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'workload' | 'calendar' | 'user' | 'report' | 'system';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info' | 'error';
  priority?: 'high' | 'medium' | 'low';
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time activity updates
  useEffect(() => {
    const generateActivity = (): ActivityItem => {
      const types: ActivityItem['type'][] = ['workload', 'calendar', 'user', 'report', 'system'];
      const users = ['Rifqi Maulana', 'Yustisia Pratiwi', 'Muhammad Shalahuddin', 'Amanda Yola', 'Admin System'];
      const statuses: ActivityItem['status'][] = ['success', 'warning', 'info'];
      
      const activities_templates = [
        {
          type: 'workload',
          titles: ['Task selesai', 'Task baru dibuat', 'Task diperbarui', 'Deadline diperpanjang'],
          descriptions: [
            'Menyelesaikan review perjanjian bilateral',
            'Membuat laporan koordinasi SOSTERASI',
            'Update progress administrasi kegiatan',
            'Perpanjangan deadline untuk rapat persiapan'
          ]
        },
        {
          type: 'calendar',
          titles: ['Acara dijadwalkan', 'Meeting dimulai', 'Event selesai', 'Reminder dikirim'],
          descriptions: [
            'Rapat koordinasi HPI Sosbud',
            'Pertemuan dengan delegasi PNG',
            'Workshop pelatihan diplomat',
            'Briefing mingguan direktur'
          ]
        },
        {
          type: 'report',
          titles: ['Laporan dibuat', 'Data exported', 'Analisis selesai', 'Report dikirim'],
          descriptions: [
            'Laporan workload bulanan November',
            'Export data kinerja pegawai',
            'Analisis produktivitas tim',
            'Pengiriman laporan ke atasan'
          ]
        },
        {
          type: 'user',
          titles: ['User login', 'Profil diperbarui', 'Password diganti', 'Akses diberikan'],
          descriptions: [
            'Login ke sistem HPI Sosbud',
            'Update informasi jabatan',
            'Pergantian password keamanan',
            'Akses modul baru diberikan'
          ]
        },
        {
          type: 'system',
          titles: ['Backup selesai', 'Update sistem', 'Maintenance', 'Monitoring'],
          descriptions: [
            'Backup database harian berhasil',
            'Update keamanan sistem',
            'Maintenance server terjadwal',
            'Monitoring kinerja aplikasi'
          ]
        }
      ];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const template = activities_templates.find(t => t.type === randomType)!;
      const randomTitleIndex = Math.floor(Math.random() * template.titles.length);
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: randomType,
        title: template.titles[randomTitleIndex],
        description: template.descriptions[randomTitleIndex],
        user: users[Math.floor(Math.random() * users.length)],
        timestamp: new Date(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };
    };

    // Initial activities
    const initialActivities = Array.from({ length: 8 }, generateActivity)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setActivities(initialActivities);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        setActivities(prev => {
          const newActivity = generateActivity();
          const updated = [newActivity, ...prev].slice(0, 12); // Keep only 12 most recent
          return updated;
        });
        setLastUpdate(new Date());
      }
    }, 8000 + Math.random() * 7000); // Random interval between 8-15 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'workload':
        return <CheckCircle className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'system':
        return <Activity className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityIndicator = (priority?: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-400';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return timestamp.toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Radio className={`h-5 w-5 ${isLive ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
          <span>Live Activity Feed</span>
        </h3>
        <p className="text-sm text-slate-600">
          Aktivitas real-time sistem HPI Sosbud
        </p>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-sm font-medium text-slate-700">
                {isLive ? 'Live' : 'Paused'}
              </span>
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                {activities.length} aktivitas
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                Update: {lastUpdate.toLocaleTimeString('id-ID')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLive ? 'animate-spin' : ''}`} />
                {isLive ? 'Pause' : 'Resume'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`
                    group p-4 hover:bg-slate-50 transition-all duration-200 border-b border-slate-100 last:border-b-0
                    animate-in slide-in-from-top-2 duration-300
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Activity Icon & Priority */}
                    <div className="flex-shrink-0 relative">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className={`
                        absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                        ${getPriorityIndicator(activity.priority)}
                      `} />
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 leading-relaxed mb-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <User className="h-3 w-3" />
                          <span>{activity.user}</span>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize bg-white/50"
                        >
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {activities.filter(a => a.status === 'success').length}
                </div>
                <div className="text-xs text-slate-600">Berhasil</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {activities.filter(a => a.priority === 'high').length}
                </div>
                <div className="text-xs text-slate-600">Prioritas Tinggi</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(activities.length / 2)}
                </div>
                <div className="text-xs text-slate-600">Per Menit</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}