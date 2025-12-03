'use client';

import { useEffect, useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Activity
} from 'lucide-react';

const COLORS = {
  primary: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#7c3aed',
  gradient: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
};

const PIE_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

interface WorkloadChartProps {
  user?: any; // User data untuk filtering personal workload
}

export function WorkloadChart({ user }: WorkloadChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'bar' | 'trend'>('bar');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = createClientSupabaseClient();

  const loadChartData = async () => {
    setIsRefreshing(true);
    
    try {
      // Load personal workload data for the logged-in user
      let query = supabase
        .from('workload')
        .select('*');
      
      // Filter by user if user data is available (correct column name: user_id)
      if (user && user.id) {
        query = query.eq('user_id', user.id);
      }
      
      const { data: workloads, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Personal workload fetch error:', error);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Process personal workload data
      const personalWorkloads = workloads || [];
      
      // Group by type/category (correct column name: type)
      const typeGroups = personalWorkloads.reduce((acc: any, workload: any) => {
        const type = workload.type || 'Lainnya';
        if (!acc[type]) acc[type] = 0;
        acc[type]++;
        return acc;
      }, {});

      // Convert to chart format
      const totalPersonal = personalWorkloads.length;
      const chartData = Object.entries(typeGroups).map(([name, value]: [string, any]) => ({
        name,
        value,
        percentage: totalPersonal > 0 ? ((value / totalPersonal) * 100) : 0,
        trend: 0 // Could calculate trend if needed
      })).slice(0, 5); // Top 5

      // Group by status for pie chart
      const statusGroups = personalWorkloads.reduce((acc: any, workload: any) => {
        const status = workload.status || 'pending';
        if (!acc[status]) acc[status] = 0;
        acc[status]++;
        return acc;
      }, {});

      const pieData = [
        { name: 'Selesai', value: statusGroups.done || 0, color: COLORS.success },
        { name: 'Dalam Progress', value: statusGroups['on-progress'] || 0, color: COLORS.warning },
        { name: 'Tertunda', value: statusGroups.pending || 0, color: COLORS.danger }
      ];

      // Generate weekly trend (simplified)
      const trendData = [
        { week: 'Ming 1', completed: Math.floor(statusGroups.done * 0.2) || 0, inProgress: Math.floor(statusGroups['on-progress'] * 0.3) || 0, pending: Math.floor(statusGroups.pending * 0.1) || 0 },
        { week: 'Ming 2', completed: Math.floor(statusGroups.done * 0.3) || 0, inProgress: Math.floor(statusGroups['on-progress'] * 0.2) || 0, pending: Math.floor(statusGroups.pending * 0.2) || 0 },
        { week: 'Ming 3', completed: Math.floor(statusGroups.done * 0.25) || 0, inProgress: Math.floor(statusGroups['on-progress'] * 0.4) || 0, pending: Math.floor(statusGroups.pending * 0.3) || 0 },
        { week: 'Ming 4', completed: Math.floor(statusGroups.done * 0.25) || 0, inProgress: Math.floor(statusGroups['on-progress'] * 0.1) || 0, pending: Math.floor(statusGroups.pending * 0.4) || 0 }
      ];
      
      setChartData(chartData);
      setPieData(pieData);
      setTrendData(trendData);
      
    } catch (error) {
      console.error('Error loading personal workload chart:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  const handleRefresh = () => {
    loadChartData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-6 bg-slate-300 rounded w-64 mb-2"></div>
          <div className="h-4 bg-slate-300 rounded w-96"></div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardHeader>
                <div className="h-5 bg-slate-300 rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-300 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-200">
          <p className="font-semibold text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
              {entry.payload.percentage && (
                <span className="text-slate-600 ml-1">
                  ({entry.payload.percentage}%)
                </span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-200">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-sm text-slate-600">
            Jumlah: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-slate-600">
            Persentase: <span className="font-semibold">
              {((data.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Analitik Workload</span>
          </h3>
          <p className="text-sm text-slate-600">
            Visualisasi data kinerja dan distribusi tugas HPI Sosbud
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            November 2025
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memuat...' : 'Refresh'}
          </Button>
          
          <Button variant="outline" size="sm" className="hover:bg-green-50 hover:text-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Workload by Type - Enhanced Bar Chart */}
        <Card className="xl:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Distribusi Workload per Jenis</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeChart === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('bar')}
                  className="text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Bar
                </Button>
                <Button
                  variant={activeChart === 'trend' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChart('trend')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trend
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="#64748b"
                    />
                    <YAxis fontSize={11} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="url(#blueGradient)" 
                      radius={[6, 6, 0, 0]}
                      className="hover:opacity-80 transition-all duration-200"
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                ) : (
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" fontSize={11} stroke="#64748b" />
                    <YAxis fontSize={11} stroke="#64748b" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1"
                      stroke={COLORS.success}
                      fill={COLORS.success}
                      fillOpacity={0.8}
                      name="Selesai"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inProgress" 
                      stackId="1"
                      stroke={COLORS.warning}
                      fill={COLORS.warning}
                      fillOpacity={0.8}
                      name="Dalam Progress"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stackId="1"
                      stroke={COLORS.danger}
                      fill={COLORS.danger}
                      fillOpacity={0.8}
                      name="Tertunda"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Chart Insights */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">36</div>
                  <div className="text-sm text-slate-600">Administrasi</div>
                  <div className="text-xs text-green-600">+5.2%</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">32</div>
                  <div className="text-sm text-slate-600">Side Job</div>
                  <div className="text-xs text-red-600">-2.1%</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">31</div>
                  <div className="text-sm text-slate-600">Tanggapan</div>
                  <div className="text-xs text-green-600">+8.7%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution - Enhanced Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-green-600" />
              <span>Status Workload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    className="hover:opacity-80 transition-all duration-200"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        className="hover:opacity-80 transition-all duration-200"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{entry.value}</div>
                    <div className="text-xs text-slate-500">
                      {((entry.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}