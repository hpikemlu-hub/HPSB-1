'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import type { User } from '@/types';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'workload' | 'employee' | 'calendar' | 'document';
  format: 'pdf' | 'excel' | 'csv';
  created_by: string;
  created_at: string;
  file_size?: number;
  download_count: number;
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    // Load demo data when user is authenticated
    if (user && !authLoading) {
      // Demo data untuk testing
    const demoReports: Report[] = [
      {
        id: '1',
        title: 'Laporan Workload Bulanan - November 2024',
        description: 'Analisis lengkap workload semua staff HPI Sosbud untuk bulan November 2024',
        type: 'workload',
        format: 'pdf',
        created_by: 'Rifqi Maulana',
        created_at: '2024-12-01T09:00:00Z',
        file_size: 1234567,
        download_count: 15
      },
      {
        id: '2',
        title: 'Data Pegawai & Performance Metrics',
        description: 'Laporan komprehensif mengenai data pegawai dan metrik performa Q4 2024',
        type: 'employee',
        format: 'excel',
        created_by: 'Amanda Yola Elvarina',
        created_at: '2024-11-28T14:30:00Z',
        file_size: 987654,
        download_count: 8
      },
      {
        id: '3',
        title: 'Calendar Events & Travel Report',
        description: 'Ringkasan kegiatan diplomatik dan perjalanan dinas periode November 2024',
        type: 'calendar',
        format: 'pdf',
        created_by: 'Muhammad Shalahuddin Yusuf',
        created_at: '2024-11-25T11:15:00Z',
        file_size: 2345678,
        download_count: 12
      },
      {
        id: '4',
        title: 'Document Management Statistics',
        description: 'Analisis penggunaan sistem E-Kinerja dan statistik dokumen resmi',
        type: 'document',
        format: 'excel',
        created_by: 'Nura Soraya',
        created_at: '2024-11-20T16:45:00Z',
        file_size: 567890,
        download_count: 6
      }
    ];

    setReports(demoReports);
    setLoading(false);
    }
  }, [user, authLoading]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'workload': '📋',
      'employee': '👥',
      'calendar': '📅',
      'document': '📄'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'workload': 'Workload Report',
      'employee': 'Employee Report',
      'calendar': 'Calendar Report',
      'document': 'Document Report'
    };
    return labels[type as keyof typeof labels] || 'Report';
  };

  const getFormatColor = (format: string) => {
    const colors = {
      'pdf': 'bg-red-100 text-red-600',
      'excel': 'bg-green-100 text-green-600',
      'csv': 'bg-blue-100 text-blue-600'
    };
    return colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesFormat = formatFilter === 'all' || report.format === formatFilter;
    
    return matchesSearch && matchesType && matchesFormat;
  });

  const handleDownload = async (reportId: string) => {
    // Demo: simulate download
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Downloading report: ${reportId}`);
    alert('Download dimulai!');
    
    // Update download count
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, download_count: report.download_count + 1 }
        : report
    ));
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Reports...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout user={user}>
      <div className={`p-6 space-y-6 max-w-none bg-gray-50 min-h-full anim-fade-in motion-reduce:transition-none motion-reduce:opacity-100 ${mounted ? '' : 'opacity-0'}`} data-animated="reports">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate dan kelola laporan sistem workload HPI Sosbud</p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports/analytics">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/reports/builder">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Custom Builder
              </Button>
            </Link>
            <Link href="/reports/new">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Generate Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reports.reduce((sum, r) => sum + r.download_count, 0)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">PDF Reports</p>
                  <p className="text-2xl font-bold text-red-600">
                    {reports.filter(r => r.format === 'pdf').length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari laporan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="workload">Workload Report</SelectItem>
                  <SelectItem value="employee">Employee Report</SelectItem>
                  <SelectItem value="calendar">Calendar Report</SelectItem>
                  <SelectItem value="document">Document Report</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Format</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(report.type)}</span>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">{getTypeLabel(report.type)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getFormatColor(report.format)}`}>
                        {report.format.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    className="shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(report.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {report.download_count}x
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    {report.file_size && formatFileSize(report.file_size)}
                  </div>
                  <div className="text-xs text-gray-500">
                    by {report.created_by.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada laporan ditemukan</h3>
            <p className="text-gray-600 mb-4">Coba ubah filter atau buat laporan baru</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report Baru
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}