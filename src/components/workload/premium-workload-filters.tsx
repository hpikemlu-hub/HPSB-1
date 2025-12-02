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
  BarChart3,
  Settings,
  Zap,
  RefreshCcw,
  FilterX
} from 'lucide-react';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { WorkloadFilters } from '@/types';

interface PremiumWorkloadFiltersProps {
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

export function PremiumWorkloadFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  workloadStats = { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 }
}: PremiumWorkloadFiltersProps) {
  const updateFilter = (key: keyof WorkloadFilters, value: string | undefined) => {
    const filterValue = (value === 'all' || value === 'none') ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value && value !== '').length;

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Quick filter presets
  const quickFilters = [
    {
      label: 'Pending',
      icon: Clock,
      color: 'amber',
      action: () => updateFilter('status', 'pending'),
      count: workloadStats.pending
    },
    {
      label: 'Progress',
      icon: TrendingUp,
      color: 'cyan',
      action: () => updateFilter('status', 'on-progress'),
      count: workloadStats.inProgress
    },
    {
      label: 'Completed',
      icon: CheckCircle,
      color: 'emerald',
      action: () => updateFilter('status', 'completed'),
      count: workloadStats.completed
    }
  ];

  return (
    <div className="premium-filter-container">
      {/* PREMIUM FILTER HEADER */}
      <div className="premium-filter-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Advanced Filter System</span>
                <Sparkles className="h-5 w-5 text-blue-200" />
              </CardTitle>
              <p className="text-blue-100 mt-1 font-medium">
                Powerful search and filtering capabilities for enhanced data discovery
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick Stats Display */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-blue-200">
                <span className="font-semibold">{workloadStats.total}</span>
                <span className="ml-1 opacity-75">Total</span>
              </div>
              <div className="text-blue-200">
                <span className="font-semibold">{workloadStats.pending + workloadStats.inProgress}</span>
                <span className="ml-1 opacity-75">Active</span>
              </div>
            </div>

            {/* Active Filters Badge */}
            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm font-medium">Filters:</span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 shadow-lg">
                  <Target className="w-3 h-3 mr-1" />
                  {activeFilterCount}
                </Badge>
              </div>
            )}

            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-white/20 border border-white/30 transition-all duration-300 px-4 py-2"
              aria-expanded={isExpanded}
              aria-controls="workload-filters-content"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* QUICK FILTERS BAR */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Quick Filters:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.label}
                  variant="outline"
                  size="sm"
                  onClick={filter.action}
                  className={`
                    border-${filter.color}-200 text-${filter.color}-700 
                    hover:bg-${filter.color}-50 hover:border-${filter.color}-300
                    transition-all duration-300 group
                  `}
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  {filter.label}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 px-1.5 py-0.5 text-xs bg-white/80"
                  >
                    {filter.count}
                  </Badge>
                </Button>
              );
            })}
            
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
              >
                <FilterX className="h-3 w-3 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ADVANCED FILTERS CONTENT */}
      <div 
        id="workload-filters-content"
        className={`premium-filter-content transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isExpanded && (
          <div className="space-y-8 py-2">
            
            {/* SEARCH SECTION */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Search & Discovery</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search-nama" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span>Cari berdasarkan nama</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="search-nama"
                      type="text"
                      placeholder="Masukkan nama untuk pencarian..."
                      value={filters.nama || ''}
                      onChange={(e) => updateFilter('nama', e.target.value || undefined)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className={`
                        border-slate-300 focus:border-blue-500 focus:ring-blue-200 
                        bg-white/70 backdrop-blur-sm transition-all duration-300 
                        hover:bg-white pl-10
                        ${searchFocused ? 'shadow-lg ring-2 ring-blue-100' : ''}
                      `}
                    />
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search-desc" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    <span>Cari berdasarkan deskripsi</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="search-desc"
                      type="text"
                      placeholder="Cari dalam deskripsi workload..."
                      value={filters.deskripsi || ''}
                      onChange={(e) => updateFilter('deskripsi', e.target.value || undefined)}
                      className="border-slate-300 focus:border-purple-500 focus:ring-purple-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white pl-10"
                    />
                    <Tag className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Category & Status Filters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div className="space-y-3">
                  <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Status Workload</span>
                  </Label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-green-500 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white shadow-sm">
                      <SelectValue placeholder="Pilih status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
                      <SelectItem value="all" className="hover:bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-slate-500" />
                          <span>Semua Status</span>
                        </div>
                      </SelectItem>
                      {WORKLOAD_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value} className="hover:bg-slate-50">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${ 
                              status.value === 'pending' ? 'bg-amber-500' :
                              status.value === 'on-progress' ? 'bg-blue-500' :
                              status.value === 'completed' ? 'bg-green-500' :
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
                <div className="space-y-3">
                  <Label htmlFor="type-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span>Jenis Workload</span>
                  </Label>
                  <Select value={filters.type || 'all'} onValueChange={(value) => updateFilter('type', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white shadow-sm">
                      <SelectValue placeholder="Pilih jenis..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
                      <SelectItem value="all" className="hover:bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-slate-500" />
                          <span>Semua Jenis</span>
                        </div>
                      </SelectItem>
                      {WORKLOAD_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="hover:bg-slate-50">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>{type}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fungsi Filter */}
                <div className="space-y-3">
                  <Label htmlFor="fungsi-filter" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span>Unit Fungsi</span>
                  </Label>
                  <Select value={filters.fungsi || 'all'} onValueChange={(value) => updateFilter('fungsi', value)}>
                    <SelectTrigger className="border-slate-300 focus:border-purple-500 focus:ring-purple-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white shadow-sm">
                      <SelectValue placeholder="Pilih fungsi..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
                      <SelectItem value="all" className="hover:bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-slate-500" />
                          <span>Semua Fungsi</span>
                        </div>
                      </SelectItem>
                      {FUNGSI_OPTIONS.map((fungsi) => (
                        <SelectItem key={fungsi} value={fungsi} className="hover:bg-slate-50">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            <span>{fungsi}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* DATE RANGE FILTERS */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-800">Date Range Filtering</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="date-from" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Tanggal Mulai</span>
                  </Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="date-to" className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Tanggal Akhir</span>
                  </Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                    className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-200 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white shadow-sm"
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <strong>Tips:</strong> Gunakan filter tanggal untuk mencari workload dalam periode tertentu. 
                Kosongkan untuk menampilkan semua data.
              </div>
            </div>

            {/* FILTER ACTIONS */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {hasActiveFilters ? (
                  <span className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span><strong>{activeFilterCount}</strong> filter aktif</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span>Tidak ada filter aktif</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}