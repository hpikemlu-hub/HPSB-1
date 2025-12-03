'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProfessionalBadge } from '@/components/ui/professional-badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Target, 
  Users, 
  Calendar,
  Activity,
  Zap,
  Award
} from 'lucide-react';
import type { Workload } from '@/types';

interface ModernStatisticsProps {
  workloads: Workload[];
  filteredWorkloads: Workload[];
}

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<any>;
  trend?: number;
  progress?: number;
  color: string;
  bgColor: string;
  textColor: string;
}

export function ModernStatisticsDashboard({ workloads, filteredWorkloads }: ModernStatisticsProps) {
  // Calculate statistics
  const calculateStats = () => {
    const total = filteredWorkloads.length;
    const completed = filteredWorkloads.filter(w => w.status === 'done').length;
    const inProgress = filteredWorkloads.filter(w => w.status === 'on-progress').length;
    const pending = filteredWorkloads.filter(w => w.status === 'pending').length;

    // Calculate overdue items
    const now = new Date();
    const overdue = filteredWorkloads.filter(w => {
      if (w.status === 'done') return false;
      if (!w.tgl_deadline) return false;
      return new Date(w.tgl_deadline) < now;
    }).length;

    // Calculate completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate weekly trend (mock calculation)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentWorkloads = filteredWorkloads.filter(w => 
      w.tgl_diterima && new Date(w.tgl_diterima) >= lastWeek
    ).length;
    
    const weeklyTrend = total > 0 ? ((recentWorkloads / total) * 100) - 50 : 0;

    // Calculate efficiency score
    const efficiencyScore = total > 0 ? Math.round(((completed + (inProgress * 0.5)) / total) * 100) : 0;

    // Calculate average time to completion (mock)
    const avgCompletion = 4.2; // days

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate,
      weeklyTrend,
      efficiencyScore,
      avgCompletion,
      recentWorkloads
    };
  };

  const stats = calculateStats();

  // Define stat cards
  const statCards: StatCard[] = [
    {
      title: 'Total Workloads',
      value: stats.total,
      subtitle: `${stats.recentWorkloads} added this week`,
      icon: BarChart3,
      trend: stats.weeklyTrend,
      progress: 100,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      subtitle: `${stats.completed} of ${stats.total} completed`,
      icon: CheckCircle2,
      progress: stats.completionRate,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'Active Tasks',
      value: stats.inProgress,
      subtitle: `${stats.pending} pending`,
      icon: Clock,
      progress: stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900'
    },
    {
      title: 'Overdue Items',
      value: stats.overdue,
      subtitle: stats.overdue > 0 ? 'Requires attention' : 'All on track',
      icon: AlertCircle,
      progress: stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900'
    }
  ];

  const performanceCards = [
    {
      title: 'Efficiency Score',
      value: `${stats.efficiencyScore}%`,
      subtitle: 'Overall performance',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      progress: stats.efficiencyScore
    },
    {
      title: 'Avg. Completion',
      value: `${stats.avgCompletion}d`,
      subtitle: 'Days per task',
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      progress: Math.max(0, 100 - (stats.avgCompletion * 10))
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced CSS */}
      <style jsx>{`
        .modern-stats-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
          opacity: 0.8;
        }
        
        .stat-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card:hover::before {
          height: 6px;
          opacity: 1;
        }
        
        .trend-indicator {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .trend-up {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        
        .trend-down {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        
        .trend-neutral {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }
        
        .progress-container {
          position: relative;
          height: 4px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          border-radius: 2px;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          background: linear-gradient(90deg, var(--progress-start), var(--progress-end));
        }
        
        .stagger-in > * {
          animation: staggerIn 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        
        .stagger-in > *:nth-child(1) { animation-delay: 0.1s; }
        .stagger-in > *:nth-child(2) { animation-delay: 0.2s; }
        .stagger-in > *:nth-child(3) { animation-delay: 0.3s; }
        .stagger-in > *:nth-child(4) { animation-delay: 0.4s; }
        .stagger-in > *:nth-child(5) { animation-delay: 0.5s; }
        .stagger-in > *:nth-child(6) { animation-delay: 0.6s; }
        
        @keyframes staggerIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .number-counter {
          font-variant-numeric: tabular-nums;
          font-feature-settings: 'tnum';
        }
        
        .glass-header {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
          backdrop-filter: blur(10px);
        }
        
        @media (max-width: 768px) {
          .stat-card {
            margin-bottom: 1rem;
          }
        }
      `}</style>

      <div className="modern-stats-container">
        {/* Header */}
        <div className="glass-header p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Performance Overview</h2>
              <p className="text-slate-600">Real-time workload analytics and insights</p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <ProfessionalBadge variant="status-active" size="sm">
                Live Data
              </ProfessionalBadge>
              <ProfessionalBadge variant="gov-primary" size="sm">
                {filteredWorkloads.length} Items
              </ProfessionalBadge>
            </div>
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="stagger-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const trendDirection = card.trend 
              ? card.trend > 0 ? 'up' : card.trend < 0 ? 'down' : 'neutral'
              : 'neutral';
            
            return (
              <Card 
                key={index} 
                className="stat-card"
                style={{
                  '--gradient-start': card.color.replace('text-', '').replace('-600', ''),
                  '--gradient-end': card.color.replace('text-', '').replace('-600', '-400'),
                  '--progress-start': card.color.replace('text-', '').replace('-600', ''),
                  '--progress-end': card.color.replace('text-', '').replace('-600', '-400')
                } as React.CSSProperties}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-3xl font-bold number-counter ${card.textColor}`}>
                        {card.value}
                      </div>
                      {card.trend !== undefined && (
                        <div className={`trend-indicator trend-${trendDirection}`}>
                          {trendDirection === 'up' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : trendDirection === 'down' ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : null}
                          {Math.abs(card.trend).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 font-medium">{card.subtitle}</p>
                    
                    {card.progress !== undefined && (
                      <div className="space-y-2">
                        <div className="progress-container">
                          <div 
                            className="progress-bar"
                            style={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {performanceCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="stat-card" style={{
                '--gradient-start': card.color.replace('text-', '').replace('-600', ''),
                '--gradient-end': card.color.replace('text-', '').replace('-600', '-400'),
                '--progress-start': card.color.replace('text-', '').replace('-600', ''),
                '--progress-end': card.color.replace('text-', '').replace('-600', '-400')
              } as React.CSSProperties}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold number-counter text-slate-900">
                      {card.value}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{card.subtitle}</p>
                    {card.progress && (
                      <div className="progress-container">
                        <div 
                          className="progress-bar"
                          style={{ width: `${card.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Distribution */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                <div className="text-sm text-green-600 font-medium">Completed</div>
                <div className="mt-2 text-xs text-green-500">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of total
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{stats.inProgress}</div>
                <div className="text-sm text-orange-600 font-medium">In Progress</div>
                <div className="mt-2 text-xs text-orange-500">
                  {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% of total
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
                <div className="text-sm text-blue-600 font-medium">Pending</div>
                <div className="mt-2 text-xs text-blue-500">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}