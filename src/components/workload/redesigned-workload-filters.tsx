'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  CheckCircle, 
  Building, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { WorkloadFilters } from '@/types';

interface RedesignedWorkloadFiltersProps {
  filters: WorkloadFilters;
  onFiltersChange: (filters: WorkloadFilters) => void;
  onClearFilters: () => void;
  workloadStats?: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export function RedesignedWorkloadFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  workloadStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
}: RedesignedWorkloadFiltersProps) {
  const updateFilter = (key: keyof WorkloadFilters, value: string | undefined) => {
    // Convert "all" and "none" to undefined for filtering
    const filterValue = (value === 'all' || value === 'none') ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value && value !== '').length;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-slate-50 to-blue-50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Filter Data</span>
                <Sparkles className="h-5 w-5 text-blue-200" />
              </CardTitle>
              <p className="text-blue-100 mt-1">
                Saring dan cari data workload sesuai kebutuhan
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm font-medium">Filter aktif:</span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 shadow-lg">
                  <Target className="w-3 h-3 mr-1" />
                  {activeFilterCount}
                </Badge>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 border border-white/30 transition-all duration-300"
              aria-expanded={isExpanded}
              aria-controls="workload-filters-content"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Tutup Filter
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Buka Filter
                </>
              )}
            </Button>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearFilters}
                className="text-red-200 hover:bg-red-500/20 border border-red-300/30 transition-all duration-300"
              >
                <X className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4 text-blue-200" />
            <span className="text-blue-100">Total: </span>
            <span className="text-white font-semibold">{workloadStats.total}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4 text-amber-300" />
            <span className="text-blue-100">Pending: </span>
            <span className="text-white font-semibold">{workloadStats.pending}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-cyan-300" />
            <span className="text-blue-100">Progress: </span>
            <span className="text-white font-semibold">{workloadStats.inProgress}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-emerald-300" />
            <span className="text-blue-100">Selesai: </span>
            <span className="text-white font-semibold">{workloadStats.completed}</span>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent 
          id="workload-filters-content" 
          className="space-y-8 p-8 bg-gradient-to-br from-white to-slate-50"
        >
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Pencarian</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <span>Nama Kegiatan</span>
                </Label>
                <Input
                  id="nama-filter"
                  placeholder="Ketik nama kegiatan..."
                  value={filters.nama || ''}
                  onChange={(e) => updateFilter('nama', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <span>Deskripsi</span>
                </Label>
                <Input
                  id="deskripsi-filter"
                  placeholder="Cari dalam deskripsi..."
                  value={filters.deskripsi || ''}
                  onChange={(e) => updateFilter('deskripsi', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Kategori & Status</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Status</span>
                </Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="border-slate-300 focus:border-green-500 focus:ring-green-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white">
                    <SelectValue placeholder="Pilih status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {WORKLOAD_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            status.value === 'pending' ? 'bg-amber-500' :
                            status.value === 'on-progress' ? 'bg-blue-500' :
                            status.value === 'done' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`} />
                          <span>{status.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span>Jenis Workload</span>
                </Label>
                <Select value={filters.type || 'all'} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white">
                    <SelectValue placeholder="Pilih jenis..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {WORKLOAD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fungsi Filter */}
              <div className="space-y-2">
                <Label htmlFor="fungsi-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Building className="h-4 w-4 text-purple-500" />
                  <span>Fungsi</span>
                </Label>
                <Select value={filters.fungsi || 'all'} onValueChange={(value) => updateFilter('fungsi', value)}>
                  <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white">
                    <SelectValue placeholder="Pilih fungsi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Fungsi</SelectItem>
                    {FUNGSI_OPTIONS.map((fungsi) => (
                      <SelectItem key={fungsi} value={fungsi}>
                        {fungsi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Date Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Filter Tanggal</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Dari Tanggal</span>
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Sampai Tanggal</span>
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-blue-800 flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Filter Aktif ({activeFilterCount})</span>
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearFilters}
                  className="text-red-600 hover:bg-red-100 transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Hapus Semua
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && value !== '' && (
                    <Badge 
                      key={key} 
                      variant="secondary" 
                      className="bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 transition-all duration-300 group"
                    >
                      <span className="mr-1 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-blue-600 hover:text-red-600 opacity-70 group-hover:opacity-100 transition-all duration-300"
                        onClick={() => updateFilter(key as keyof WorkloadFilters, undefined)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-300"
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filter
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}