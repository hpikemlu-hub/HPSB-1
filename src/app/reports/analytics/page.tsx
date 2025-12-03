'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  ArrowLeft,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import Link from 'next/link';
import type { User } from '@/types';

interface AnalyticsData {
  workloadTrends: Array<{
    month: string;
    completed: number;
    pending: number;
    overdue: number;
  }>;
  employeePerformance: Array<{
    employee: string;
    completed: number;
    efficiency: number;
  }>;
  calendarEvents: Array<{
    type: string;
    count: number;
    color: string;
  }>;
  documentStats: Array<{
    category: string;
    count: number;
    growth: number;
  }>;
  departmentWorkload: Array<{
    department: string;
    workload: number;
    capacity: number;
  }>;
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('3months');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for user session in localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        loadAnalyticsData();
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      router.push('/auth/login');
      return;
    }
  }, [router, dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Demo analytics data
    const mockData: AnalyticsData = {
      workloadTrends: [
        { month: 'Sep', completed: 45, pending: 12, overdue: 3 },
        { month: 'Oct', completed: 52, pending: 15, overdue: 2 },
        { month: 'Nov', completed: 48, pending: 18, overdue: 5 },
        { month: 'Dec', completed: 38, pending: 22, overdue: 4 }
      ],
      employeePerformance: [
        { employee: 'Rifqi M.', completed: 28, efficiency: 94 },
        { employee: 'Amanda Y.', completed: 25, efficiency: 91 },
        { employee: 'M. Shalahuddin', completed: 22, efficiency: 88 },
        { employee: 'Nura S.', completed: 20, efficiency: 85 },
        { employee: 'Yustisia P.', completed: 18, efficiency: 82 }
      ],
      calendarEvents: [
        { type: 'Meetings', count: 45, color: '#0ea5e9' },
        { type: 'Travel', count: 28, color: '#22c55e' },
        { type: 'Workshops', count: 15, color: '#f59e0b' },
        { type: 'Conferences', count: 12, color: '#8b5cf6' }
      ],
      documentStats: [
        { category: 'Legal Documents', count: 18, growth: 12 },
        { category: 'Reports', count: 24, growth: 8 },
        { category: 'Proposals', count: 15, growth: -3 },
        { category: 'Official Letters', count: 32, growth: 15 }
      ],
      departmentWorkload: [
        { department: 'Bilateral Affairs', workload: 85, capacity: 100 },
        { department: 'Multilateral Affairs', workload: 92, capacity: 100 },
        { department: 'Cultural Exchange', workload: 78, capacity: 100 },
        { department: 'Documentation', workload: 65, capacity: 100 }
      ]
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAnalytics(mockData);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportAnalytics = async () => {
    // Demo: simulate export
    console.log('Exporting analytics data...');
    alert('Analytics report berhasil diexport!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !analytics) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="p-6 space-y-6 max-w-none bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600">Analisis mendalam performa sistem workload HPI Sosbud</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button onClick={exportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workload</p>
                  <p className="text-2xl font-bold text-gray-900">163</p>
                  <p className="text-xs text-green-600">↗ +8% dari bulan lalu</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-xs text-green-600">↗ +3% dari bulan lalu</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                  <p className="text-xs text-orange-600">↘ -2 dari bulan lalu</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                  <p className="text-xs text-green-600">↗ +15% dari bulan lalu</p>
                </div>
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workload Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Workload Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.workloadTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    name="Completed"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    name="Pending"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="overdue" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="Overdue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calendar Events Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.calendarEvents}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analytics.calendarEvents.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Employee Performance & Department Workload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Employee Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.employeePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#0ea5e9" name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Workload */}
          <Card>
            <CardHeader>
              <CardTitle>Department Capacity Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departmentWorkload} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="department" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                  <Bar dataKey="workload" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Document Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Document Category Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.documentStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{stat.category}</p>
                      <p className="text-sm text-gray-600">{stat.count} dokumen</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${stat.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.growth >= 0 ? '↗' : '↘'} {Math.abs(stat.growth)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}