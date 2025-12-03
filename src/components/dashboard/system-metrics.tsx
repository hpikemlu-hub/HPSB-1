'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Database, 
  Shield, 
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Monitor,
  Clock,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
  icon: React.ElementType;
}

interface PerformanceData {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export function SystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Generate realistic system metrics
  const generateMetrics = (): SystemMetric[] => {
    return [
      {
        id: 'cpu',
        name: 'CPU Usage',
        value: 45 + Math.random() * 20,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        description: 'Intel Xeon E5-2680v3',
        icon: Cpu
      },
      {
        id: 'memory',
        name: 'Memory',
        value: 62 + Math.random() * 15,
        unit: '%',
        status: 'healthy',
        trend: 'up',
        description: '32GB DDR4 RAM',
        icon: MemoryStick
      },
      {
        id: 'disk',
        name: 'Storage',
        value: 78 + Math.random() * 10,
        unit: '%',
        status: 'warning',
        trend: 'up',
        description: '2TB SSD RAID',
        icon: HardDrive
      },
      {
        id: 'network',
        name: 'Network',
        value: 25 + Math.random() * 30,
        unit: 'Mbps',
        status: 'healthy',
        trend: 'stable',
        description: '1Gbps Connection',
        icon: Network
      },
      {
        id: 'database',
        name: 'Database',
        value: 95 + Math.random() * 4,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        description: 'PostgreSQL Uptime',
        icon: Database
      },
      {
        id: 'security',
        name: 'Security',
        value: 98 + Math.random() * 2,
        unit: '%',
        status: 'healthy',
        trend: 'stable',
        description: 'Threat Protection',
        icon: Shield
      }
    ];
  };

  // Generate performance data for charts
  const generatePerformanceData = (): PerformanceData[] => {
    const now = new Date();
    const data: PerformanceData[] = [];
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        cpu: 40 + Math.random() * 30,
        memory: 60 + Math.random() * 20,
        disk: 75 + Math.random() * 15,
        network: 20 + Math.random() * 40
      });
    }
    
    return data;
  };

  useEffect(() => {
    // Initial load
    setMetrics(generateMetrics());
    setPerformanceData(generatePerformanceData());

    // Real-time updates
    const interval = setInterval(() => {
      if (isMonitoring) {
        setMetrics(generateMetrics());
        setPerformanceData(prev => {
          const newData = [...prev.slice(1)];
          const lastTime = new Date();
          newData.push({
            time: lastTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            cpu: 40 + Math.random() * 30,
            memory: 60 + Math.random() * 20,
            disk: 75 + Math.random() * 15,
            network: 20 + Math.random() * 40
          });
          return newData;
        });
        setLastUpdate(new Date());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getStatusIcon = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      case 'stable':
        return <div className="h-3 w-3 bg-blue-500 rounded-full" />;
      default:
        return null;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value.toFixed(1)}%</span>
            </p>
          ))}
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
            <Monitor className="h-5 w-5 text-blue-600" />
            <span>Metrik Sistem</span>
          </h3>
          <p className="text-sm text-slate-600">
            Monitoring real-time infrastruktur dan performa server
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className={`${isMonitoring ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
            {isMonitoring ? 'Monitoring Aktif' : 'Monitoring Paused'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="hover:bg-blue-50 hover:text-blue-700"
          >
            <Activity className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-pulse' : ''}`} />
            {isMonitoring ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card 
              key={metric.id} 
              className={`
                border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300
                transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-blue-100`}>
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{metric.name}</h4>
                      <p className="text-xs text-slate-500">{metric.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold text-slate-900">
                      {metric.value.toFixed(1)}
                      <span className="text-sm text-slate-600 ml-1">{metric.unit}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`
                        h-2 rounded-full transition-all duration-1000 ease-out
                        ${metric.status === 'healthy' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          metric.status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          'bg-gradient-to-r from-red-400 to-red-500'
                        }
                      `}
                      style={{ 
                        width: `${Math.min(metric.value, 100)}%`,
                        transitionDelay: `${index * 150}ms`
                      }}
                    />
                  </div>

                  <Badge variant="outline" className={`${getStatusColor(metric.status)} text-xs`}>
                    {metric.status === 'healthy' ? 'Normal' :
                     metric.status === 'warning' ? 'Perhatian' :
                     'Kritis'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* CPU & Memory Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span>CPU & Memory Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="time" 
                    fontSize={11} 
                    stroke="#64748b"
                    interval="preserveStartEnd"
                  />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="CPU"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Memory"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network & Storage Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
              <Network className="h-5 w-5 text-green-600" />
              <span>Network & Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="time" 
                    fontSize={11} 
                    stroke="#64748b"
                    interval="preserveStartEnd"
                  />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="network" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                    name="Network"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disk" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                    name="Storage"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-blue-200">Uptime</div>
              <div className="text-xs text-blue-300 mt-1">30 hari terakhir</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">156ms</div>
              <div className="text-sm text-blue-200">Response Time</div>
              <div className="text-xs text-blue-300 mt-1">Rata-rata harian</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">2.3TB</div>
              <div className="text-sm text-blue-200">Data Processed</div>
              <div className="text-xs text-blue-300 mt-1">Bulan ini</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-blue-200">
                  Last Update: {lastUpdate.toLocaleTimeString('id-ID')}
                </span>
              </div>
              <div className="text-xs text-blue-300 mt-1">Auto-refresh setiap 5 detik</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}