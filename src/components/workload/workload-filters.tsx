'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { WorkloadFilters } from '@/types';

interface WorkloadFiltersProps {
  filters: WorkloadFilters;
  onFiltersChange: (filters: WorkloadFilters) => void;
  onClearFilters: () => void;
}

export function WorkloadFilters({ filters, onFiltersChange, onClearFilters }: WorkloadFiltersProps) {
  const updateFilter = (key: keyof WorkloadFilters, value: string | undefined) => {
    // Convert "all" and "none" to undefined for filtering
    const filterValue = (value === 'all' || value === 'none') ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filters</CardTitle>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="nama-filter">Nama</Label>
            <Input
              id="nama-filter"
              placeholder="Filter by nama..."
              value={filters.nama || ''}
              onChange={(e) => updateFilter('nama', e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter">Type</Label>
            <Select 
              value={filters.type || ''} 
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {WORKLOAD_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {WORKLOAD_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${status.color.replace('bg-', 'bg-')}`}></div>
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fungsi Filter */}
          <div className="space-y-2">
            <Label htmlFor="fungsi-filter">Fungsi</Label>
            <Select 
              value={filters.fungsi || ''} 
              onValueChange={(value) => updateFilter('fungsi', value)}
            >
              <SelectTrigger id="fungsi-filter">
                <SelectValue placeholder="All fungsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fungsi</SelectItem>
                {FUNGSI_OPTIONS.map(fungsi => (
                  <SelectItem key={fungsi} value={fungsi}>
                    {fungsi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label htmlFor="date-filter">Date Range</Label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="Start date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value)}
              />
              <Input
                type="date"
                placeholder="End date"
                value={filters.end_date || ''}
                onChange={(e) => updateFilter('end_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {filters.nama && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                  <span>Nama: {filters.nama}</span>
                  <button 
                    onClick={() => updateFilter('nama', undefined)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.type && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                  <span>Type: {filters.type}</span>
                  <button 
                    onClick={() => updateFilter('type', undefined)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.status && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs">
                  <span>Status: {WORKLOAD_STATUS.find(s => s.value === filters.status)?.label}</span>
                  <button 
                    onClick={() => updateFilter('status', undefined)}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.fungsi && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs">
                  <span>Fungsi: {filters.fungsi}</span>
                  <button 
                    onClick={() => updateFilter('fungsi', undefined)}
                    className="ml-1 hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}