'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Filter, 
  Save, 
  RotateCcw,
  Calendar,
  Search,
  Tag,
  Users,
  Clock,
  Bookmark,
  Settings,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { WORKLOAD_TYPES, WORKLOAD_STATUS, FUNGSI_OPTIONS } from '@/constants';
import type { WorkloadFilters } from '@/types';

interface EnhancedWorkloadFiltersProps {
  filters: WorkloadFilters;
  onFiltersChange: (filters: WorkloadFilters) => void;
  onClearFilters: () => void;
  totalRecords: number;
  filteredRecords: number;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: WorkloadFilters;
  isDefault?: boolean;
}

export function EnhancedWorkloadFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  totalRecords,
  filteredRecords 
}: EnhancedWorkloadFiltersProps) {
  // State untuk minimize/expand panel - DEFAULT MINIMIZED
  const [isMinimized, setIsMinimized] = useState(true);
  
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'Overdue Items',
      filters: { status: 'pending', end_date: new Date().toISOString().split('T')[0] },
      isDefault: true
    },
    {
      id: '2',
      name: 'This Week',
      filters: { 
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: '3',
      name: 'SOSTERASI Tasks',
      filters: { fungsi: 'SOSTERASI' }
    }
  ]);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  const updateFilter = (key: keyof WorkloadFilters, value: string | undefined) => {
    const filterValue = (value === 'all' || value === 'none') ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  const hasActiveFilters = Object.values(filters || {}).some(value => value && value !== '');
  const activeFilterCount = Object.values(filters || {}).filter(value => value && value !== '').length;

  const handleSaveFilter = () => {
    if (newFilterName.trim()) {
      const newFilter: SavedFilter = {
        id: Date.now().toString(),
        name: newFilterName.trim(),
        filters: { ...filters }
      };
      setSavedFilters(prev => [...prev, newFilter]);
      setNewFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    onFiltersChange(savedFilter.filters);
  };

  const handleDeleteSavedFilter = (id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  };

  const getFilterReduction = () => {
    const reduction = totalRecords - filteredRecords;
    const percentage = totalRecords > 0 ? Math.round((reduction / totalRecords) * 100) : 0;
    return { reduction, percentage };
  };

  const { reduction, percentage } = getFilterReduction();

  return (
    <Card className="enhanced-filter-panel bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-800">Advanced Filters</CardTitle>
              <p className="text-sm text-slate-600">
                {filteredRecords} of {totalRecords} records shown
                {reduction > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    -{reduction} ({percentage}%)
                  </Badge>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Badge className="bg-blue-600 hover:bg-blue-700">
                {activeFilterCount} Active
              </Badge>
            )}
            
            {/* Minimize/Expand Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-slate-100"
              title={isMinimized ? "Expand Filters" : "Minimize Filters"}
            >
              {isMinimized ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Expand</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Minimize</span>
                </>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                className="text-slate-600 border-slate-300 hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Filter preset name..."
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
              />
              <Button size="sm" onClick={handleSaveFilter}>
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Conditional CardContent - Show only when NOT minimized */}
      {!isMinimized && (
        <CardContent className="space-y-6 p-6">
        {/* Saved Filter Presets */}
        {savedFilters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4 text-slate-500" />
              <Label className="text-sm font-medium text-slate-700">Quick Filters</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <div key={savedFilter.id} className="flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadFilter(savedFilter)}
                    className="text-xs hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {savedFilter.name}
                    {savedFilter.isDefault && (
                      <Badge className="ml-1 text-xs bg-blue-100 text-blue-700">
                        default
                      </Badge>
                    )}
                  </Button>
                  {!savedFilter.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSavedFilter(savedFilter.id)}
                      className="ml-1 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Main Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="nama-filter" className="flex items-center space-x-2 text-sm font-medium">
              <Search className="h-4 w-4 text-slate-500" />
              <span>Nama</span>
            </Label>
            <Input
              id="nama-filter"
              placeholder="Search nama..."
              value={filters.nama || ''}
              onChange={(e) => updateFilter('nama', e.target.value)}
              className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {filters.nama && (
              <Badge variant="secondary" className="text-xs">
                Contains: "{filters.nama}"
              </Badge>
            )}
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter" className="flex items-center space-x-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-slate-500" />
              <span>Type</span>
            </Label>
            <Select 
              value={filters.type || ''} 
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger 
                id="type-filter"
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              >
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
            <Label htmlFor="status-filter" className="flex items-center space-x-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>Status</span>
            </Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger 
                id="status-filter"
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {WORKLOAD_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fungsi Filter */}
          <div className="space-y-2">
            <Label htmlFor="fungsi-filter" className="flex items-center space-x-2 text-sm font-medium">
              <Users className="h-4 w-4 text-slate-500" />
              <span>Fungsi</span>
            </Label>
            <Select 
              value={filters.fungsi || ''} 
              onValueChange={(value) => updateFilter('fungsi', value)}
            >
              <SelectTrigger 
                id="fungsi-filter"
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              >
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

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Date Range</span>
            </Label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="Start date"
                value={filters.start_date || ''}
                onChange={(e) => updateFilter('start_date', e.target.value)}
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                type="date"
                placeholder="End date"
                value={filters.end_date || ''}
                onChange={(e) => updateFilter('end_date', e.target.value)}
                className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Active filters:</span>
              </span>
              
              {filters.nama && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                  <Search className="h-3 w-3 mr-1" />
                  Nama: {filters.nama}
                  <button 
                    onClick={() => updateFilter('nama', undefined)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.type && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200">
                  <Tag className="h-3 w-3 mr-1" />
                  Type: {filters.type}
                  <button 
                    onClick={() => updateFilter('type', undefined)}
                    className="ml-2 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.status && (
                <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Status: {WORKLOAD_STATUS.find(s => s.value === filters.status)?.label}
                  <button 
                    onClick={() => updateFilter('status', undefined)}
                    className="ml-2 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.fungsi && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200">
                  <Users className="h-3 w-3 mr-1" />
                  Fungsi: {filters.fungsi}
                  <button 
                    onClick={() => updateFilter('fungsi', undefined)}
                    className="ml-2 hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {(filters.start_date || filters.end_date) && (
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200">
                  <Calendar className="h-3 w-3 mr-1" />
                  Date: {filters.start_date || '...'} to {filters.end_date || '...'}
                  <button 
                    onClick={() => {
                      updateFilter('start_date', undefined);
                      updateFilter('end_date', undefined);
                    }}
                    className="ml-2 hover:text-indigo-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Filter Summary */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">
              Showing {filteredRecords} of {totalRecords} records
            </span>
            {reduction > 0 && (
              <span className="text-blue-600 font-medium">
                {percentage}% filtered out
              </span>
            )}
          </div>
        </div>
        </CardContent>
      )}
    </Card>
  );
}