'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  History as HistoryIcon,
  Search,
  Filter,
  Calendar,
  User as UserIcon,
  Activity,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MainLayout } from '@/components/layout/main-layout';
import type { User } from '@/types';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_title?: string;
  details: string;
  ip_address: string;
  user_agent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'warning';
  changes?: {
    field: string;
    old_value: string;
    new_value: string;
  }[];
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7days');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
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
        
        // Check if user is admin (History is admin-only)
        if (sessionData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      router.push('/auth/login');
      return;
    }

    loadAuditLogs();
  }, [router, dateFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    
    try {
      const res = await fetch(`/api/audit-logs?range=${encodeURIComponent(dateFilter)}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json?.success) {
        console.error('Audit log fetch error:', json?.error || 'unknown');
        setLogs([]);
        setLoading(false);
        return;
      }
      let logsData: AuditLog[] = (json.data || []) as unknown as AuditLog[];

      // Apply date filter client-side
      const now = new Date();
      let cutoff: Date | null = null;
      switch (dateFilter) {
        case '24h':
          cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
        default:
          cutoff = null;
      }

      if (cutoff) {
        logsData = logsData.filter(l => {
          const t = new Date(l.timestamp).getTime();
          return !isNaN(t) && t >= cutoff!.getTime();
        });
      }

      setLogs(logsData);
      setLoading(false);
      return;
    } catch (e) {
      console.error('Audit log load failed:', e);
      setLogs([]);
      setLoading(false);
      return;
    }

    // Demo audit logs data (fallback removed) 
    const demoLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: '2024-12-15T10:30:00Z',
        user_id: 'user1',
        user_name: 'Rifqi Maulana',
        action: 'CREATE',
        resource_type: 'workload',
        resource_id: 'wl_001',
        resource_title: 'Draft Proposal ASEAN Summit',
        details: 'Created new workload task with high priority',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'medium',
        status: 'success'
      },
      {
        id: '2',
        timestamp: '2024-12-15T09:45:00Z',
        user_id: 'user2',
        user_name: 'Amanda Yola Elvarina',
        action: 'UPDATE',
        resource_type: 'calendar_event',
        resource_id: 'ce_001',
        resource_title: 'Perjalanan Dinas Jakarta - Bali',
        details: 'Updated event participants and location details',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'low',
        status: 'success',
        changes: [
          { field: 'participants', old_value: '2 people', new_value: '3 people' },
          { field: 'location', old_value: 'Denpasar', new_value: 'Denpasar, Bali' }
        ]
      },
      {
        id: '3',
        timestamp: '2024-12-15T09:15:00Z',
        user_id: 'user3',
        user_name: 'Muhammad Shalahuddin Yusuf',
        action: 'DELETE',
        resource_type: 'document',
        resource_id: 'doc_001',
        resource_title: 'Old MOU Draft',
        details: 'Permanently deleted outdated document',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'high',
        status: 'success'
      },
      {
        id: '4',
        timestamp: '2024-12-15T08:30:00Z',
        user_id: 'user4',
        user_name: 'Nura Soraya',
        action: 'LOGIN',
        resource_type: 'session',
        resource_id: 'session_001',
        details: 'User logged into the system',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        severity: 'low',
        status: 'success'
      },
      {
        id: '5',
        timestamp: '2024-12-15T08:00:00Z',
        user_id: 'unknown',
        user_name: 'Unknown User',
        action: 'LOGIN_FAILED',
        resource_type: 'session',
        resource_id: 'failed_001',
        details: 'Failed login attempt with invalid credentials',
        ip_address: '203.142.15.75',
        user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        severity: 'critical',
        status: 'failed'
      },
      {
        id: '6',
        timestamp: '2024-12-14T16:45:00Z',
        user_id: 'user1',
        user_name: 'Rifqi Maulana',
        action: 'EXPORT',
        resource_type: 'report',
        resource_id: 'rpt_001',
        resource_title: 'Monthly Workload Report',
        details: 'Generated and downloaded monthly report in PDF format',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'medium',
        status: 'success'
      },
      {
        id: '7',
        timestamp: '2024-12-14T15:20:00Z',
        user_id: 'user5',
        user_name: 'Yustisia Pratiwi Pramesti',
        action: 'VIEW',
        resource_type: 'employee',
        resource_id: 'emp_001',
        resource_title: 'Employee Profile - Rama Pramu Wicaksono',
        details: 'Accessed employee profile and details',
        ip_address: '192.168.1.104',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'low',
        status: 'success'
      },
      {
        id: '8',
        timestamp: '2024-12-14T14:30:00Z',
        user_id: 'user2',
        user_name: 'Amanda Yola Elvarina',
        action: 'UPLOAD',
        resource_type: 'document',
        resource_id: 'doc_002',
        resource_title: 'Laporan Perjalanan Dinas ASEAN',
        details: 'Uploaded new document to E-Kinerja system',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'medium',
        status: 'success'
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLogs(demoLogs);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuditLogs();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    const icons = {
      'CREATE': <Plus className="w-4 h-4" />,
      'UPDATE': <Edit className="w-4 h-4" />,
      'DELETE': <Trash2 className="w-4 h-4" />,
      'VIEW': <Eye className="w-4 h-4" />,
      'LOGIN': <UserIcon className="w-4 h-4" />,
      'LOGIN_FAILED': <AlertCircle className="w-4 h-4" />,
      'EXPORT': <Download className="w-4 h-4" />,
      'UPLOAD': <Plus className="w-4 h-4" />
    };
    return icons[action as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    const colors = {
      'CREATE': 'text-green-600',
      'UPDATE': 'text-blue-600',
      'DELETE': 'text-red-600',
      'VIEW': 'text-gray-600',
      'LOGIN': 'text-purple-600',
      'LOGIN_FAILED': 'text-red-600',
      'EXPORT': 'text-orange-600',
      'UPLOAD': 'text-green-600'
    };
    return colors[action as keyof typeof colors] || 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'critical': 'bg-red-100 text-red-600'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'success': 'bg-green-100 text-green-600',
      'failed': 'bg-red-100 text-red-600',
      'warning': 'bg-yellow-100 text-yellow-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getResourceIcon = (resourceType: string) => {
    const icons = {
      'workload': '📋',
      'employee': '👥',
      'calendar_event': '📅',
      'document': '📄',
      'session': '🔐',
      'report': '📊'
    };
    return icons[resourceType as keyof typeof icons] || '📄';
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesAction && matchesResource && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const exportLogs = async () => {
    // Demo: simulate export
    console.log('Exporting audit logs...');
    alert('Audit logs berhasil diexport!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading History...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout user={user}>
      <div className="p-6 space-y-6 max-w-none bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit History</h1>
            <p className="text-gray-600">Track semua aktivitas dan perubahan dalam sistem</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
                <HistoryIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Events</p>
                  <p className="text-2xl font-bold text-red-600">
                    {logs.filter(l => l.severity === 'critical').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Actions</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {logs.filter(l => l.status === 'failed').length}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(logs.filter(l => l.action === 'LOGIN' && l.status === 'success').map(l => l.user_id)).size}
                  </p>
                </div>
                <UserIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="VIEW">View</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                  <SelectItem value="UPLOAD">Upload</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="workload">Workload</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="calendar_event">Calendar</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{formatTimestamp(log.timestamp)}</div>
                        <div className="text-gray-500">{log.ip_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {log.user_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{log.user_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getResourceIcon(log.resource_type)}</span>
                        <div>
                          <div className="font-medium capitalize">{log.resource_type.replace('_', ' ')}</div>
                          {log.resource_title && (
                            <div className="text-sm text-gray-500 truncate max-w-32">
                              {log.resource_title}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-64">
                        <p className="text-sm text-gray-900 truncate">{log.details}</p>
                        {log.changes && log.changes.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.changes.length} field(s) changed
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.severity)}>
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}