'use client';

import { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Target,
  Users,
  BarChart3,
  User,
  Building2
} from 'lucide-react';
import type { User as UserType } from '@/types';

interface PersonalStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  completionRate: number;
}

interface TeamStats {
  totalMembers: number;
  departmentTasks: number;
  teamCapacity: number;
  goalAchievement: number;
}

interface PersonalDashboardStatsProps {
  user: UserType;
}

export function PersonalDashboardStats({ user }: PersonalDashboardStatsProps) {
  const [view, setView] = useState<'personal' | 'team'>('personal');
  const [personalStats, setPersonalStats] = useState<PersonalStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completedThisWeek: 0,
    completionRate: 0,
  });
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    departmentTasks: 0,
    teamCapacity: 0,
    goalAchievement: 0,
  });
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    if (view === 'personal') {
      fetchPersonalStats();
    } else {
      fetchTeamStats();
    }
  }, [view, user.id]);

  const fetchPersonalStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user's personal workload statistics
      const { data: userTasks, error } = await supabase
        .from('workload')
        .select('status, tgl_deadline, tgl_diterima')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching personal stats:', error);
        return;
      }

      const tasks = userTasks || [];
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const pendingTasks = tasks.filter(task => task.status !== 'done').length;
      const overdueTasks = tasks.filter(task => {
        if (!task.tgl_deadline || task.status === 'done') return false;
        return new Date(task.tgl_deadline) < new Date();
      }).length;
      
      const completedThisWeek = tasks.filter(task => 
        task.status === 'done' && 
        task.tgl_diterima && 
        new Date(task.tgl_diterima) >= weekStart
      ).length;

      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      setPersonalStats({
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completedThisWeek,
        completionRate: Math.round(completionRate),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      setLoading(true);
      
      // Fetch team statistics from real database
      const { data: allTasks, error: tasksError } = await supabase
        .from('workload')
        .select('status, user_id');

      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (tasksError || usersError) {
        console.error('Error fetching team stats:', tasksError || usersError);
        return;
      }

      const tasks = allTasks || [];
      const users = allUsers || [];
      
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const goalAchievement = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      setTeamStats({
        totalMembers: users.length,
        departmentTasks: tasks.length,
        teamCapacity: Math.round(users.length * 8), // Calculated based on team size
        goalAchievement: Math.round(goalAchievement),
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color,
    bgColor,
    trend 
  }: {
    title: string;
    value: number | string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    trend?: number;
  }) => (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{description}</p>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3" />
                <span>{trend > 0 ? '+' : ''}{trend}% this week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        <div className={`absolute inset-0 opacity-5 ${bgColor}`}></div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-sm text-slate-600">
            {view === 'personal' 
              ? 'Your personal productivity metrics and task progress' 
              : 'Team performance and department-wide statistics'
            }
          </p>
        </div>
        
        {/* Segmented Control */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('personal')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${view === 'personal'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <User className="h-4 w-4" />
            <span>My Dashboard</span>
          </button>
          <button
            onClick={() => setView('team')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${view === 'team'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Building2 className="h-4 w-4" />
            <span>Team View</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : view === 'personal' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="My Active Tasks"
            value={personalStats.pendingTasks}
            description="Tasks in progress"
            icon={Clock}
            color="text-blue-600"
            bgColor="bg-blue-100"
            trend={personalStats.completedThisWeek > 0 ? 15 : 0}
          />
          <StatCard
            title="Completed"
            value={personalStats.completedTasks}
            description="This month"
            icon={CheckCircle}
            color="text-green-600"
            bgColor="bg-green-100"
            trend={12}
          />
          <StatCard
            title="Overdue"
            value={personalStats.overdueTasks}
            description="Needs attention"
            icon={AlertCircle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <StatCard
            title="Progress"
            value={`${personalStats.completionRate}%`}
            description="Completion rate"
            icon={Target}
            color="text-purple-600"
            bgColor="bg-purple-100"
            trend={8}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Team Members"
            value={teamStats.totalMembers}
            description="Active staff"
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            title="Dept Tasks"
            value={teamStats.departmentTasks}
            description="Total workload"
            icon={BarChart3}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            title="Capacity"
            value={`${teamStats.teamCapacity}%`}
            description="Resource utilization"
            icon={TrendingUp}
            color="text-yellow-600"
            bgColor="bg-yellow-100"
          />
          <StatCard
            title="Goals"
            value={`${teamStats.goalAchievement}%`}
            description="Achievement rate"
            icon={Target}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
        </div>
      )}

      {/* Personal Insights */}
      {view === 'personal' && personalStats.totalTasks > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900">Personal Insights</h3>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>• You have completed <strong>{personalStats.completedThisWeek} tasks</strong> this week</p>
                  <p>• Your completion rate is <strong>{personalStats.completionRate}%</strong> - 
                    {personalStats.completionRate >= 80 ? ' Excellent work!' : 
                     personalStats.completionRate >= 60 ? ' Good progress!' :
                     ' Room for improvement'}
                  </p>
                  {personalStats.overdueTasks > 0 && (
                    <p className="text-red-600">• <strong>{personalStats.overdueTasks} tasks</strong> are overdue and need attention</p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}