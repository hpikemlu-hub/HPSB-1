'use client';

import { useState } from 'react';
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
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  count?: number;
  isPopular?: boolean;
}

export function RedesignedQuickActions() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      title: 'Tambah Workload',
      description: 'Buat tugas atau penugasan baru',
      href: '/workload/new',
      icon: Plus,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      isPopular: true
    },
    {
      title: 'Buat Laporan',
      description: 'Export analitik workload',
      href: '/reports',
      icon: FileText,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    },
    {
      title: 'Jadwalkan Acara',
      description: 'Rencanakan perjalanan dinas',
      href: '/calendar/new',
      icon: Calendar,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    },
    {
      title: 'Kelola Pegawai',
      description: 'Administrasi data pegawai',
      href: '/employees',
      icon: Users,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    },
    {
      title: 'E-Kinerja',
      description: 'Input data kinerja pegawai',
      href: '/e-kinerja/new',
      icon: Target,
      color: 'text-white',
      bgColor: 'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      count: 3
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Quick Actions</span>
        </h3>
        <p className="text-sm text-slate-600">
          Akses cepat ke fungsi utama sistem workload
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === action.title;
          
          return (
            <Link 
              key={action.title} 
              href={action.href}
              onMouseEnter={() => setHoveredAction(action.title)}
              onMouseLeave={() => setHoveredAction(null)}
              className="group block"
            >
              <Card className={`
                border-0 shadow-lg transition-all duration-300 cursor-pointer
                transform group-hover:scale-105 group-hover:shadow-xl
                ${action.bgColor}
                relative overflow-hidden h-32
                animate-in slide-in-from-bottom-4 duration-500
              `}
              style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"></div>
                  <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
                </div>
                
                <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      {/* Action Title */}
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-lg font-bold ${action.color} group-hover:scale-105 transition-transform duration-300`}>
                          {action.title}
                        </h4>
                        {action.isPopular && (
                          <Badge variant="secondary" className="bg-white/20 text-white text-xs border-white/30">
                            Popular
                          </Badge>
                        )}
                        {action.count && (
                          <Badge variant="secondary" className="bg-white/20 text-white text-xs border-white/30">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action Description */}
                      <p className={`text-sm ${action.color} opacity-90`}>
                        {action.description}
                      </p>
                    </div>
                    
                    {/* Icon */}
                    <div className="flex-shrink-0 ml-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <Icon className={`h-6 w-6 ${action.color}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Indicator */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-white opacity-60 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}></div>
                      <div className={`w-2 h-2 rounded-full bg-white transition-opacity duration-300 ${isHovered ? 'opacity-60' : 'opacity-30'}`}></div>
                      <div className={`w-2 h-2 rounded-full bg-white transition-opacity duration-300 ${isHovered ? 'opacity-30' : 'opacity-20'}`}></div>
                    </div>
                    
                    <ArrowRight className={`h-4 w-4 ${action.color} transition-transform duration-300 group-hover:translate-x-1`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-slate-900">2.3</span>
              </div>
              <div className="text-sm text-slate-600">Avg. completion time (days)</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-slate-900">94%</span>
              </div>
              <div className="text-sm text-slate-600">Task completion rate</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-slate-900">12</span>
              </div>
              <div className="text-sm text-slate-600">Active projects</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions Log */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Recent Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="text-slate-600">Created new workload:</span>
              <span className="font-medium text-slate-900">Review diplomatic protocol</span>
              <span className="text-slate-500 ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span className="text-slate-600">Updated report:</span>
              <span className="font-medium text-slate-900">Monthly performance analysis</span>
              <span className="text-slate-500 ml-auto">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span className="text-slate-600">Scheduled meeting:</span>
              <span className="font-medium text-slate-900">Team coordination call</span>
              <span className="text-slate-500 ml-auto">2 days ago</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
            asChild
          >
            <Link href="/history">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}