'use client';

import { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle, Clock, AlertCircle, Users, TrendingUp, Target, BarChart3 } from 'lucide-react';
import type { DashboardStats as DashboardStatsType } from '@/types';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  delay: number;
}

function StatCard({ title, value, change, description, icon: Icon, color, bgColor, delay }: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const duration = 1500;
      const steps = 60;
      const increment = value / steps;
      let currentValue = 0;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(currentValue));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, value]);

  return (
    <Card className={`
      transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-xl
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      border-0 shadow-lg bg-white/80 backdrop-blur-sm
      hover:bg-white/90 group cursor-pointer
    `}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
          {title}
        </CardTitle>
        <div className={`
          p-3 rounded-xl transition-all duration-300 group-hover:scale-110
          ${bgColor} group-hover:shadow-lg
        `}>
          <Icon className={`h-5 w-5 ${color} transition-all duration-300`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value with Animation */}
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">
              {animatedValue.toLocaleString()}
            </div>
            {change !== undefined && (
              <Badge 
                variant="secondary" 
                className={`
                  text-xs font-medium transition-all duration-300
                  ${change >= 0 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }
                `}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {change >= 0 ? '+' : ''}{change}%
              </Badge>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
            {description}
          </p>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`
                h-full rounded-full transition-all duration-1000 ease-out
                bg-gradient-to-r ${color.includes('blue') ? 'from-blue-400 to-blue-600' : 
                  color.includes('green') ? 'from-green-400 to-green-600' :
                  color.includes('yellow') ? 'from-yellow-400 to-yellow-600' :
                  color.includes('red') ? 'from-red-400 to-red-600' :
                  'from-purple-400 to-purple-600'
                }
              `}
              style={{ 
                width: isVisible ? '100%' : '0%',
                transitionDelay: `${delay + 500}ms`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyProductivityPercent, setWeeklyProductivityPercent] = useState<number>(0);
  const [efficiencyScore, setEfficiencyScore] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || 'Failed to load dashboard stats');
        if (!mounted) return;
        const d = json.data;
        setStats({
          total_workload: d.totals.total,
          completed_workload: d.totals.doneTotal,
          in_progress_workload: d.totals.onProgressTotal,
          pending_workload: d.totals.pendingTotal,
          total_users: d.users.activeUsers,
          recent_activities: [],
          workload_by_type: [],
          workload_by_status: [
            { status: 'done', count: d.totals.doneTotal },
            { status: 'on-progress', count: d.totals.onProgressTotal },
            { status: 'pending', count: d.totals.pendingTotal }
          ]
        });
        setWeeklyProductivityPercent(d.weekly.weeklyProductivityPercent || 0);
        setEfficiencyScore(d.rates.efficiencyScore || 0);
      } catch (e) {
        console.error('Dashboard stats load failed:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-lg bg-white/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-slate-300 rounded w-20"></div>
              <div className="h-10 w-10 bg-slate-300 rounded-xl"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-300 rounded w-16 mb-3"></div>
              <div className="h-3 bg-slate-300 rounded w-24 mb-2"></div>
              <div className="h-1.5 bg-slate-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const completionRate = Math.round((stats.completed_workload / stats.total_workload) * 100);
  const progressRate = Math.round((stats.in_progress_workload / stats.total_workload) * 100);

  const cards = [
    {
      title: 'Total Workload',
      value: stats.total_workload,
      change: 8.2,
      description: 'Total tugas dalam sistem',
      icon: ClipboardList,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Selesai',
      value: stats.completed_workload,
      change: 12.5,
      description: `${completionRate}% tingkat penyelesaian`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Dalam Progress',
      value: stats.in_progress_workload,
      change: -2.1,
      description: `${progressRate}% sedang dikerjakan`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Tertunda',
      value: stats.pending_workload,
      change: -15.3,
      description: 'Memerlukan tindak lanjut',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Pegawai Aktif',
      value: stats.total_users,
      change: 5.7,
      description: 'Staff HPI Sosbud',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Ringkasan Kinerja</span>
          </h3>
          <p className="text-sm text-slate-600">
            Statistik global tim Direktorat HPI Sosbud
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
          Live Data
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <StatCard
            key={index}
            {...card}
            delay={index * 150}
          />
        ))}
      </div>

      {/* Quick Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{completionRate}%</div>
                <div className="text-sm text-blue-700">Target Pencapaian</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{weeklyProductivityPercent >= 0 ? `+${weeklyProductivityPercent}%` : `${weeklyProductivityPercent}%`}</div>
                <div className="text-sm text-green-700">Produktivitas Minggu Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{efficiencyScore}</div>
                <div className="text-sm text-purple-700">Skor Efisiensi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}