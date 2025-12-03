'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Clock,
  Filter,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import type { User } from '@/types';

interface QuickReport {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  estimatedTime: string;
  popular: boolean;
}

interface ReportParams {
  name: string;
  description: string;
  type: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  filters: {
    department?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  };
}

export default function NewReportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [params, setParams] = useState<ReportParams>({
    name: '',
    description: '',
    type: '',
    dateRange: '1month',
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    filters: {}
  });
  const router = useRouter();

  const quickReports: QuickReport[] = [
    {
      id: 'workload_summary',
      name: 'Workload Summary Report',
      description: 'Laporan ringkasan workload semua pegawai dengan status dan progress',
      type: 'workload',
      icon: '📋',
      estimatedTime: '2-3 minutes',
      popular: true
    },
    {
      id: 'employee_performance',
      name: 'Employee Performance Report',
      description: 'Analisis performa individual pegawai berdasarkan completed tasks',
      type: 'employee',
      icon: '👥',
      estimatedTime: '3-4 minutes',
      popular: true
    },
    {
      id: 'calendar_events',
      name: 'Calendar Events Report',
      description: 'Laporan kegiatan dan perjalanan dinas dalam periode tertentu',
      type: 'calendar',
      icon: '📅',
      estimatedTime: '1-2 minutes',
      popular: false
    },
    {
      id: 'document_stats',
      name: 'Document Statistics Report',
      description: 'Statistik penggunaan sistem E-Kinerja dan analisis dokumen',
      type: 'document',
      icon: '📄',
      estimatedTime: '2-3 minutes',
      popular: false
    },
    {
      id: 'departmental_workload',
      name: 'Departmental Workload Analysis',
      description: 'Analisis distribusi workload per departemen dan utilitas kapasitas',
      type: 'workload',
      icon: '🏢',
      estimatedTime: '4-5 minutes',
      popular: true
    },
    {
      id: 'monthly_executive',
      name: 'Monthly Executive Summary',
      description: 'Ringkasan eksekutif bulanan untuk manajemen dengan key metrics',
      type: 'executive',
      icon: '📊',
      estimatedTime: '5-6 minutes',
      popular: true
    }
  ];

  const departments = [
    'Bilateral Affairs',
    'Multilateral Affairs', 
    'Cultural Exchange',
    'Documentation',
    'Administration'
  ];

  const employees = [
    'Rifqi Maulana',
    'Amanda Yola Elvarina',
    'Muhammad Shalahuddin Yusuf',
    'Nura Soraya',
    'Yustisia Pratiwi Pramesti',
    'Rama Pramu Wicaksono'
  ];

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
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      router.push('/auth/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const selectTemplate = (reportId: string) => {
    const report = quickReports.find(r => r.id === reportId);
    if (report) {
      setSelectedTemplate(reportId);
      setParams(prev => ({
        ...prev,
        name: report.name,
        description: report.description,
        type: report.type
      }));
    }
  };

  const updateParams = (field: keyof ReportParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const updateFilter = (field: string, value: string) => {
    setParams(prev => ({
      ...prev,
      filters: { ...prev.filters, [field]: value }
    }));
  };

  const generateReport = async () => {
    if (!selectedTemplate || !params.name.trim()) {
      alert('Pilih template report dan isi nama report');
      return;
    }

    setGenerating(true);
    try {
      // Demo: simulate report generation
      console.log('Generating report with params:', params);
      
      const estimatedTime = quickReports.find(r => r.id === selectedTemplate)?.estimatedTime || '2-3 minutes';
      
      // Simulate generation time based on report complexity
      const delay = selectedTemplate.includes('executive') ? 3000 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      alert(`Report "${params.name}" berhasil di-generate! Download akan dimulai.`);
      
      // Redirect to reports list
      router.push('/reports');
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal generate report. Silakan coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  const getDateRangeLabel = (range: string) => {
    const labels = {
      '1week': '1 Minggu Terakhir',
      '1month': '1 Bulan Terakhir', 
      '3months': '3 Bulan Terakhir',
      '6months': '6 Bulan Terakhir',
      '1year': '1 Tahun Terakhir',
      'custom': 'Custom Range'
    };
    return labels[range as keyof typeof labels] || range;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="p-6 space-y-6 max-w-6xl mx-auto bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate New Report</h1>
              <p className="text-gray-600">Pilih template dan generate report dengan cepat</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/reports/builder">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Custom Builder
              </Button>
            </Link>
            <Button 
              onClick={generateReport} 
              disabled={!selectedTemplate || generating}
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pilih Template Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickReports.map(report => (
                    <div
                      key={report.id}
                      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === report.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectTemplate(report.id)}
                    >
                      {report.popular && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{report.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{report.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {report.estimatedTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Report Name *</Label>
                    <Input
                      id="name"
                      value={params.name}
                      onChange={(e) => updateParams('name', e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={params.description}
                      onChange={(e) => updateParams('description', e.target.value)}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date Range</Label>
                      <Select value={params.dateRange} onValueChange={(value) => updateParams('dateRange', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1week">1 Minggu Terakhir</SelectItem>
                          <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                          <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                          <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                          <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Output Format</Label>
                      <Select value={params.format} onValueChange={(value) => updateParams('format', value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {params.dateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={params.startDate}
                          onChange={(e) => updateParams('startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={params.endDate}
                          onChange={(e) => updateParams('endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters (Optional)
                    </Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Department</Label>
                        <Select value={params.filters.department || ''} onValueChange={(value) => updateFilter('department', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="All departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Assigned To</Label>
                        <Select value={params.filters.assignedTo || ''} onValueChange={(value) => updateFilter('assignedTo', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="All employees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {employees.map(emp => (
                              <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {params.type === 'workload' && (
                        <>
                          <div>
                            <Label className="text-sm">Status</Label>
                            <Select value={params.filters.status || ''} onValueChange={(value) => updateFilter('status', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="All status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm">Priority</Label>
                            <Select value={params.filters.priority || ''} onValueChange={(value) => updateFilter('priority', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="All priorities" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Include Charts Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeCharts"
                      checked={params.includeCharts}
                      onChange={(e) => updateParams('includeCharts', e.target.checked)}
                    />
                    <Label htmlFor="includeCharts" className="text-sm font-normal cursor-pointer">
                      Include charts and visualizations
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview & Summary */}
          <div className="space-y-6">
            {selectedTemplate ? (
              <>
                {/* Report Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Template</Label>
                      <p className="font-medium">{quickReports.find(r => r.id === selectedTemplate)?.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Data Range</Label>
                      <p className="font-medium">{getDateRangeLabel(params.dateRange)}</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Format</Label>
                      <p className="font-medium">{params.format.toUpperCase()}</p>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Estimated Time</Label>
                      <p className="font-medium">{quickReports.find(r => r.id === selectedTemplate)?.estimatedTime}</p>
                    </div>

                    {Object.values(params.filters).some(v => v) && (
                      <div>
                        <Label className="text-sm text-gray-600">Active Filters</Label>
                        <div className="space-y-1">
                          {Object.entries(params.filters).map(([key, value]) => 
                            value && (
                              <div key={key} className="text-sm">
                                <span className="capitalize font-medium">{key}:</span> {value}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Generation Progress */}
                {generating && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Generating Report...</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          Processing data and generating report...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Select a Report Template</h3>
                  <p className="text-sm text-gray-600">
                    Choose from our predefined templates to get started quickly
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}