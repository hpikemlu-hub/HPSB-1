'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Save,
  Play,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Filter,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import type { User } from '@/types';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  table: string;
  required: boolean;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: string;
  value2?: string; // for between operator
}

interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  fields: string[];
  filters: ReportFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  format: 'pdf' | 'excel' | 'csv';
  groupBy?: string;
}

export default function ReportBuilderPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    dataSource: '',
    fields: [],
    filters: [],
    sortBy: '',
    sortOrder: 'asc',
    format: 'pdf'
  });
  const router = useRouter();

  // Available data sources
  const dataSources = [
    { value: 'workload', label: 'Workload Data', icon: '📋' },
    { value: 'employees', label: 'Employee Data', icon: '👥' },
    { value: 'calendar', label: 'Calendar Events', icon: '📅' },
    { value: 'documents', label: 'Document Data', icon: '📄' }
  ];

  // Available fields per data source
  const availableFields: Record<string, ReportField[]> = {
    workload: [
      { id: 'title', name: 'Task Title', type: 'text', table: 'workload', required: true },
      { id: 'description', name: 'Description', type: 'text', table: 'workload', required: false },
      { id: 'status', name: 'Status', type: 'select', table: 'workload', required: false },
      { id: 'priority', name: 'Priority', type: 'select', table: 'workload', required: false },
      { id: 'assigned_to', name: 'Assigned To', type: 'text', table: 'workload', required: false },
      { id: 'due_date', name: 'Due Date', type: 'date', table: 'workload', required: false },
      { id: 'created_at', name: 'Created Date', type: 'date', table: 'workload', required: false }
    ],
    employees: [
      { id: 'nama_lengkap', name: 'Full Name', type: 'text', table: 'employees', required: true },
      { id: 'nip', name: 'NIP', type: 'text', table: 'employees', required: false },
      { id: 'jabatan', name: 'Position', type: 'text', table: 'employees', required: false },
      { id: 'email', name: 'Email', type: 'text', table: 'employees', required: false },
      { id: 'phone', name: 'Phone', type: 'text', table: 'employees', required: false },
      { id: 'hire_date', name: 'Hire Date', type: 'date', table: 'employees', required: false }
    ],
    calendar: [
      { id: 'title', name: 'Event Title', type: 'text', table: 'calendar_events', required: true },
      { id: 'description', name: 'Description', type: 'text', table: 'calendar_events', required: false },
      { id: 'start_date', name: 'Start Date', type: 'date', table: 'calendar_events', required: false },
      { id: 'end_date', name: 'End Date', type: 'date', table: 'calendar_events', required: false },
      { id: 'location', name: 'Location', type: 'text', table: 'calendar_events', required: false },
      { id: 'creator_id', name: 'Creator', type: 'text', table: 'calendar_events', required: false }
    ],
    documents: [
      { id: 'title', name: 'Document Title', type: 'text', table: 'documents', required: true },
      { id: 'category', name: 'Category', type: 'select', table: 'documents', required: false },
      { id: 'status', name: 'Status', type: 'select', table: 'documents', required: false },
      { id: 'file_size', name: 'File Size', type: 'number', table: 'documents', required: false },
      { id: 'created_by', name: 'Created By', type: 'text', table: 'documents', required: false },
      { id: 'created_at', name: 'Created Date', type: 'date', table: 'documents', required: false }
    ]
  };

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

  const updateConfig = (field: keyof ReportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addField = (fieldId: string) => {
    if (!config.fields.includes(fieldId)) {
      updateConfig('fields', [...config.fields, fieldId]);
    }
  };

  const removeField = (fieldId: string) => {
    updateConfig('fields', config.fields.filter(id => id !== fieldId));
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    };
    updateConfig('filters', [...config.filters, newFilter]);
  };

  const updateFilter = (filterId: string, field: keyof ReportFilter, value: any) => {
    updateConfig('filters', config.filters.map(filter =>
      filter.id === filterId ? { ...filter, [field]: value } : filter
    ));
  };

  const removeFilter = (filterId: string) => {
    updateConfig('filters', config.filters.filter(f => f.id !== filterId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validation
      if (!config.name.trim()) {
        alert('Nama report wajib diisi');
        return;
      }
      
      if (!config.dataSource) {
        alert('Data source wajib dipilih');
        return;
      }

      if (config.fields.length === 0) {
        alert('Minimal pilih satu field');
        return;
      }

      // Demo: simulate save
      console.log('Saving report config:', config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Report berhasil disimpan!');
      router.push('/reports');
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Gagal menyimpan report. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!config.dataSource || config.fields.length === 0) {
      alert('Pilih data source dan minimal satu field untuk preview');
      return;
    }
    
    setPreview(true);
    console.log('Preview config:', config);
    // Simulate preview data
    setTimeout(() => setPreview(false), 2000);
  };

  const handleGenerate = async () => {
    if (!config.name.trim() || !config.dataSource || config.fields.length === 0) {
      alert('Lengkapi konfigurasi report sebelum generate');
      return;
    }

    try {
      // Demo: simulate report generation
      console.log('Generating report with config:', config);
      alert('Report berhasil di-generate dan akan didownload!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Gagal generate report. Silakan coba lagi.');
    }
  };

  const getFieldsByDataSource = () => {
    return availableFields[config.dataSource] || [];
  };

  const getFieldName = (fieldId: string) => {
    const fields = getFieldsByDataSource();
    return fields.find(f => f.id === fieldId)?.name || fieldId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Report Builder...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Custom Report Builder</h1>
              <p className="text-gray-600">Buat laporan custom sesuai kebutuhan analisis</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={preview}>
              {preview ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
            <Button onClick={handleGenerate}>
              <Download className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Report Name *</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="Contoh: Monthly Workload Summary"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.description}
                    onChange={(e) => updateConfig('description', e.target.value)}
                    placeholder="Jelaskan tujuan dan isi report..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Source *</Label>
                    <Select value={config.dataSource} onValueChange={(value) => {
                      updateConfig('dataSource', value);
                      updateConfig('fields', []); // Reset fields when data source changes
                      updateConfig('filters', []); // Reset filters
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map(source => (
                          <SelectItem key={source.value} value={source.value}>
                            <div className="flex items-center gap-2">
                              <span>{source.icon}</span>
                              {source.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Output Format</Label>
                    <Select value={config.format} onValueChange={(value) => updateConfig('format', value as any)}>
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
              </CardContent>
            </Card>

            {/* Fields Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {config.dataSource ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Available Fields</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {getFieldsByDataSource().map(field => (
                          <Button
                            key={field.id}
                            variant={config.fields.includes(field.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => config.fields.includes(field.id) ? removeField(field.id) : addField(field.id)}
                          >
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                            {field.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {config.fields.length > 0 && (
                      <div>
                        <Label>Selected Fields ({config.fields.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {config.fields.map(fieldId => (
                            <Badge key={fieldId} variant="secondary" className="flex items-center gap-1">
                              {getFieldName(fieldId)}
                              <button
                                onClick={() => removeField(fieldId)}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Pilih data source terlebih dahulu</p>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters & Conditions
                  </span>
                  <Button variant="outline" size="sm" onClick={addFilter} disabled={!config.dataSource}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {config.filters.length > 0 ? (
                  <div className="space-y-3">
                    {config.filters.map(filter => (
                      <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Select 
                          value={filter.field} 
                          onValueChange={(value) => updateFilter(filter.id, 'field', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFieldsByDataSource().map(field => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select 
                          value={filter.operator} 
                          onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="greater_than">Greater than</SelectItem>
                            <SelectItem value="less_than">Less than</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Value"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                          className="flex-1"
                        />

                        {filter.operator === 'between' && (
                          <Input
                            placeholder="Value 2"
                            value={filter.value2 || ''}
                            onChange={(e) => updateFilter(filter.id, 'value2', e.target.value)}
                            className="flex-1"
                          />
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No filters added</p>
                )}
              </CardContent>
            </Card>

            {/* Sorting */}
            <Card>
              <CardHeader>
                <CardTitle>Sorting & Grouping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sort By</Label>
                    <Select value={config.sortBy} onValueChange={(value) => updateConfig('sortBy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getFieldsByDataSource().map(field => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sort Order</Label>
                    <Select value={config.sortOrder} onValueChange={(value) => updateConfig('sortOrder', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Report Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Report Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">{config.name || 'Untitled Report'}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Data Source</Label>
                  <p className="font-medium">
                    {dataSources.find(s => s.value === config.dataSource)?.label || 'Not selected'}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Fields</Label>
                  <p className="font-medium">{config.fields.length} selected</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Filters</Label>
                  <p className="font-medium">{config.filters.length} active</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Format</Label>
                  <p className="font-medium">{config.format.toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Add Charts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}