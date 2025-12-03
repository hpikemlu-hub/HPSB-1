'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Calendar,
  Users,
  Target,
  Activity
} from 'lucide-react';
import { WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { Workload } from '@/types';

interface WorkloadOverviewDashboardProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  data: Workload[];
  filteredData: Workload[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  progress?: number;
}

const StatCard = ({ title, value, subtitle, trend, icon, color, progress }: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      accent: 'text-blue-700'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      accent: 'text-yellow-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      accent: 'text-green-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      accent: 'text-red-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      accent: 'text-purple-700'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`${classes.bg} ${classes.border} border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${classes.accent}`}>{title}</p>
            <div className="space-y-1">
              <p className={`text-3xl font-bold ${classes.text}`}>{value}</p>
              {subtitle && (
                <p className={`text-xs ${classes.accent}`}>{subtitle}</p>
              )}
            </div>
            
            {trend && (
              <div className="flex items-center space-x-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend.value)}% from last period
                </span>
              </div>
            )}
            
            {progress !== undefined && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className={`text-xs ${classes.accent}`}>{progress}% completion</p>
              </div>
            )}
          </div>
          
          <div className={`p-3 rounded-xl ${classes.bg} ${classes.icon}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function WorkloadOverviewDashboard({ stats, data, filteredData }: WorkloadOverviewDashboardProps) {
  // Calculate additional metrics
  const metrics = useMemo(() => {
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const overdueRate = stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0;
    
    // Calculate average days to completion (simplified)
    const completedItems = data.filter(item => item.status === 'done');
    const avgCompletionTime = completedItems.length > 0 ? 
      Math.round(completedItems.reduce((acc, item) => {
        if (item.tgl_deadline) {
          const days = Math.abs(new Date(item.tgl_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          return acc + days;
        }
        return acc;
      }, 0) / completedItems.length) : 0;

    // Distribution by type
    const typeDistribution = data.reduce((acc, item) => {
      const type = item.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Distribution by fungsi
    const fungsiDistribution = data.reduce((acc, item) => {
      const fungsi = item.fungsi || 'Unknown';
      acc[fungsi] = (acc[fungsi] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      completionRate,
      overdueRate,
      avgCompletionTime,
      typeDistribution,
      fungsiDistribution
    };
  }, [stats, data]);

  return (
    <div className="space-y-6">
      {/* Main Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Workload"
          value={stats.total}
          subtitle={`${filteredData.length} shown`}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle={`${Math.round((stats.inProgress / stats.total) * 100)}% of total`}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          progress={Math.round((stats.inProgress / stats.total) * 100)}
        />
        
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle={`${metrics.completionRate}% completion rate`}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          trend={{ value: 8, isPositive: true }}
          progress={metrics.completionRate}
        />
        
        <StatCard
          title="Overdue"
          value={stats.overdue}
          subtitle={`${metrics.overdueRate}% of total`}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
          trend={{ value: 15, isPositive: false }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Completion Rate</span>
                  <span className="font-medium">{metrics.completionRate}%</span>
                </div>
                <Progress value={metrics.completionRate} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Overdue Rate</span>
                  <span className="font-medium">{metrics.overdueRate}%</span>
                </div>
                <Progress 
                  value={metrics.overdueRate} 
                  className="mt-1"
                  // Custom red progress bar for overdue
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Avg. Completion</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {metrics.avgCompletionTime} days
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Active Items</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {stats.pending + stats.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Today's Focus</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {stats.overdue + Math.min(stats.pending, 5)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600 mb-2">By Fungsi</div>
                <div className="space-y-1">
                  {Object.entries(metrics.fungsiDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([fungsi, count]) => (
                      <div key={fungsi} className="flex justify-between text-xs">
                        <span className="text-slate-600 truncate">{fungsi}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-slate-600 mb-2">Top Types</div>
                <div className="space-y-1">
                  {Object.entries(metrics.typeDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 2)
                    .map(([type, count]) => (
                      <div key={type} className="flex justify-between text-xs">
                        <span className="text-slate-600 truncate">{type}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Bar */}
      <Card className="bg-gradient-to-r from-white to-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-slate-600" />
            <span>Status Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-1 h-4 rounded-full overflow-hidden bg-slate-100">
              <div 
                className="bg-yellow-400 transition-all duration-500"
                style={{ width: `${(stats.pending / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(stats.overdue / stats.total) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span className="text-slate-600">Pending ({stats.pending})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">In Progress ({stats.inProgress})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Completed ({stats.completed})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-600">Overdue ({stats.overdue})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}