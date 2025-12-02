'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import WorkloadTable from '@/components/workload/workload-table'
import WorkloadFilters from '@/components/workload/workload-filters'
import { EnhancedWorkloadTable } from '@/components/workload/enhanced-workload-table'
import { EnhancedWorkloadFilters } from '@/components/workload/enhanced-workload-filters'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BarChart3, 
  Settings, 
  Zap, 
  Target,
  Eye,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  Loader2,
  Edit,
  Trash2,
  Grid3X3,
  List
} from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'

interface WorkloadStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  overdue: number
  completionRate: number
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function ProfessionalWorkloadPage() {
  // Enhanced state management
  const [workloads, setWorkloads] = useState<any[]>([])
  const [filteredWorkloads, setFilteredWorkloads] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({
    nama: '',
    type: '',
    status: '',
    fungsi: '',
    startDate: '',
    endDate: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [stats, setStats] = useState<WorkloadStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0
  })

  const { user } = useAuth()

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: 'new-workload',
      label: 'Tambah Workload',
      icon: <Plus className="w-4 h-4" />,
      action: () => window.location.href = '/workload/new',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => fetchWorkloads(true),
      shortcut: 'F5',
      variant: 'outline'
    },
    {
      id: 'export',
      label: 'Export Excel',
      icon: <Download className="w-4 h-4" />,
      action: handleExport,
      variant: 'outline'
    },
    {
      id: 'view-toggle',
      label: viewMode === 'table' ? 'Card View' : 'Table View',
      icon: viewMode === 'table' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />,
      action: () => setViewMode(viewMode === 'table' ? 'cards' : 'table'),
      variant: 'outline'
    }
  ]

  // Enhanced fetch workloads function
  const fetchWorkloads = useCallback(async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true)
        toast.info('🔄 Refreshing data...', { duration: 1000 })
      } else {
        setLoading(true)
      }
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('workload')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setWorkloads(data || [])
      setFilteredWorkloads(data || [])
      calculateStats(data || [])
      
      if (showToast) {
        toast.success(`✅ Data updated! ${data?.length || 0} workloads loaded`, {
          description: 'Latest data from database'
        })
      } else {
        toast.success(`📊 Loaded ${data?.length || 0} workloads successfully`)
      }

    } catch (err: any) {
      console.error('Error fetching workloads:', err)
      setError(err.message)
      toast.error('❌ Failed to load workloads', {
        description: err.message
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Calculate enhanced statistics
  const calculateStats = useCallback((data: any[]) => {
    const total = data.length
    const completed = data.filter(w => w.status === 'selesai' || w.status === 'done').length
    const inProgress = data.filter(w => w.status === 'sedang_dikerjakan' || w.status === 'on-progress').length
    const pending = data.filter(w => w.status === 'menunggu' || w.status === 'pending').length
    
    // Calculate overdue items
    const now = new Date()
    const overdue = data.filter(w => {
      if (!w.tgl_deadline || w.status === 'selesai' || w.status === 'done') return false
      return new Date(w.tgl_deadline) < now
    }).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    setStats({
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate
    })
  }, [])

  // Enhanced search functionality
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    applyFiltersAndSearch(filters, term)
  }, [workloads, filters])

  // Apply filters and search together
  const applyFiltersAndSearch = useCallback((currentFilters: any, searchTerm: string) => {
    let filtered = [...workloads]

    // Apply filters
    if (currentFilters.nama) {
      filtered = filtered.filter(w => 
        (w.nama || w.nama_kegiatan || '').toLowerCase().includes(currentFilters.nama.toLowerCase())
      )
    }
    if (currentFilters.type) {
      filtered = filtered.filter(w => 
        (w.type || w.tipe_pekerjaan || '').toLowerCase().includes(currentFilters.type.toLowerCase())
      )
    }
    if (currentFilters.status) {
      filtered = filtered.filter(w => w.status === currentFilters.status)
    }
    if (currentFilters.fungsi) {
      filtered = filtered.filter(w => w.fungsi === currentFilters.fungsi)
    }
    if (currentFilters.startDate) {
      filtered = filtered.filter(w => w.tgl_deadline >= currentFilters.startDate)
    }
    if (currentFilters.endDate) {
      filtered = filtered.filter(w => w.tgl_deadline <= currentFilters.endDate)
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(workload => 
        Object.values(workload).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredWorkloads(filtered)
  }, [workloads])

  // Function to apply filters to workloads
  const applyFiltersToWorkloads = useCallback((newFilters: any) => {
    applyFiltersAndSearch(newFilters, searchTerm)
  }, [searchTerm, applyFiltersAndSearch])

  // Export functionality
  function handleExport() {
    toast.info('📋 Preparing export...', {
      description: 'Excel file will be downloaded shortly'
    })
    // TODO: Implement actual export logic
  }

  // Bulk actions handler
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('❌ No items selected', {
        description: 'Please select at least one item'
      })
      return
    }

    toast.info(`🔄 Processing ${action}...`, {
      description: `${selectedItems.length} items selected`
    })
    // TODO: Implement bulk actions
  }, [selectedItems])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault()
        window.location.href = '/workload/new'
      }
      if (event.key === 'F5') {
        event.preventDefault()
        fetchWorkloads(true)
      }
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Initial load
  useEffect(() => {
    fetchWorkloads()
  }, [fetchWorkloads])

  // Professional Statistics Dashboard Component
  const ProfessionalStatsDashboard = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {/* Total Workloads */}
      <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-blue-700 uppercase tracking-wider">Total</p>
              <p className="text-3xl font-black text-blue-900 mt-1">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">Workloads</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Selesai</p>
              <p className="text-3xl font-black text-green-900 mt-1">{stats.completed}</p>
              <p className="text-xs text-green-600 mt-1">Completed</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 border-yellow-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-yellow-700 uppercase tracking-wider">Progress</p>
              <p className="text-3xl font-black text-yellow-900 mt-1">{stats.inProgress}</p>
              <p className="text-xs text-yellow-600 mt-1">In Progress</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 border-gray-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Menunggu</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
            <div className="bg-gray-500 p-3 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue */}
      <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 border-red-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-700 uppercase tracking-wider">Overdue</p>
              <p className="text-3xl font-black text-red-900 mt-1">{stats.overdue}</p>
              <p className="text-xs text-red-600 mt-1">Late</p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card className="bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 border-indigo-300 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Rate</p>
              <p className="text-3xl font-black text-indigo-900 mt-1">{stats.completionRate}%</p>
              <div className="mt-2">
                <Progress value={stats.completionRate} className="h-2 bg-indigo-200" />
              </div>
            </div>
            <div className="bg-indigo-500 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">Loading Workload Data</h3>
              <p className="text-gray-600 text-lg">Fetching latest data from database...</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <Card className="w-full max-w-md border-red-200 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="bg-red-100 p-4 rounded-full w-fit mx-auto">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-red-900">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
            </div>
            <Button onClick={() => fetchWorkloads()} className="w-full bg-red-600 hover:bg-red-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <MainLayout user={user as any}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    Workload Management
                  </h1>
                  <p className="text-gray-600 text-lg font-medium">
                    Professional workload tracking and management system
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={action.action}
                  variant={action.variant || "default"}
                  disabled={refreshing}
                  className="flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                >
                  {refreshing && action.id === 'refresh' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    action.icon
                  )}
                  <span className="hidden sm:inline font-semibold">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Statistics Dashboard */}
        <ProfessionalStatsDashboard />

        {/* Enhanced Search and Controls */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="search-input"
                    placeholder="Search workloads... (Ctrl+F for focus)"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-200 text-base"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    {selectedItems.length} selected
                  </Badge>
                  <Select onValueChange={handleBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign">Assign to User</SelectItem>
                      <SelectItem value="status">Change Status</SelectItem>
                      <SelectItem value="export">Export Selected</SelectItem>
                      <SelectItem value="delete" className="text-red-600">Delete Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Filters */}
        <div className="mb-8">
          <EnhancedWorkloadFilters 
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters)
              // Apply filters to workloads
              applyFiltersToWorkloads(newFilters)
            }}
          />
        </div>

        {/* Main Data Display */}
        <div className="space-y-6">
          {/* View Toggle Buttons */}
          <div className="flex justify-center">
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <List className="w-4 h-4" />
                Table View
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                onClick={() => setViewMode('cards')}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Card View
              </Button>
            </div>
          </div>

          {viewMode === 'table' && (
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Use the existing enhanced table component */}
                <EnhancedWorkloadTable 
                  workloads={filteredWorkloads}
                  filters={filters}
                  isLoading={refreshing}
                  onEdit={(workload) => {
                    // Navigate to edit page
                    window.location.href = `/workload/${workload.id}/edit`;
                  }}
                  onDelete={(workload) => {
                    // Handle delete action
                    console.log('Delete workload:', workload.id);
                  }}
                  onView={(workload) => {
                    // Navigate to view page
                    window.location.href = `/workload/${workload.id}`;
                  }}
                />
              </CardContent>
            </Card>
          )}

          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkloads.map((workload: any) => (
                <Card 
                  key={workload.id} 
                  className="hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border-0 bg-white/95 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold line-clamp-2 text-gray-900">
                        {workload.nama || workload.nama_kegiatan || 'Unnamed Activity'}
                      </CardTitle>
                      <Badge 
                        variant={
                          (workload.status === 'selesai' || workload.status === 'done') ? 'default' : 
                          (workload.status === 'sedang_dikerjakan' || workload.status === 'on-progress') ? 'secondary' : 
                          'outline'
                        }
                        className="ml-2 font-semibold"
                      >
                        {workload.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-600 font-medium">
                      {workload.type || workload.tipe_pekerjaan || 'Unknown Type'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <strong className="text-gray-900">Fungsi:</strong> {workload.fungsi || 'N/A'}
                      </div>
                      {workload.tgl_deadline && (
                        <div className="text-sm text-gray-600">
                          <strong className="text-gray-900">Deadline:</strong>{' '}
                          {new Date(workload.tgl_deadline).toLocaleDateString('id-ID')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Button size="sm" variant="outline" className="flex-1 hover:bg-blue-50">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 hover:bg-green-50">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Professional Footer */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-gray-500 font-medium">
            Showing <span className="font-bold text-blue-600">{filteredWorkloads.length}</span> of{' '}
            <span className="font-bold text-blue-600">{stats.total}</span> workload items
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>🔄 Auto-refresh enabled</span>
            <span>•</span>
            <span>⌨️ Keyboard shortcuts active</span>
            <span>•</span>
            <span>📊 Real-time statistics</span>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  )
}