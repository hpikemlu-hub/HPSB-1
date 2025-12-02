'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, Crown, Star, Building, ChevronDown, ChevronUp } from 'lucide-react';
import { GOLONGAN_OPTIONS, JABATAN_OPTIONS } from '@/constants';

interface EmployeeFiltersType {
  nama?: string;
  jabatan?: string;
  golongan?: string;
  status?: string;
}

interface EmployeeFiltersProps {
  filters: EmployeeFiltersType;
  onFiltersChange: (filters: EmployeeFiltersType) => void;
  onClearFilters: () => void;
}

export function EmployeeFilters({ filters, onFiltersChange, onClearFilters }: EmployeeFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateFilter = (key: keyof EmployeeFiltersType, value: string | undefined) => {
    // Convert "all" to undefined for filtering
    const filterValue = (value === 'all') ? undefined : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  // Get jabatan icon
  const getJabatanIcon = (jabatan: string) => {
    const jabatanLower = jabatan.toLowerCase();
    if (jabatanLower.includes('direktur')) return Crown;
    if (jabatanLower.includes('koordinator')) return Star;
    return Building;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/60">
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-3">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filter Pegawai
            </CardTitle>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Expand
                </>
              ) : (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Collapse
                </>
              )}
            </Button>
          </div>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              Hapus Semua Filter
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jabatan Filter */}
          <div className="space-y-2">
            <Label htmlFor="jabatan-filter" className="text-sm font-semibold text-slate-700 flex items-center">
              <Building className="w-4 h-4 mr-2 text-blue-500" />
              Jabatan
            </Label>
            <Select 
              value={filters.jabatan || 'all'} 
              onValueChange={(value) => updateFilter('jabatan', value)}
            >
              <SelectTrigger 
                id="jabatan-filter"
                className="bg-white/80 border-slate-200 hover:bg-white hover:border-blue-300 transition-all duration-200"
              >
                <SelectValue placeholder="Semua jabatan" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/20">
                <SelectItem value="all" className="hover:bg-blue-50">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-slate-500" />
                    Semua Jabatan
                  </div>
                </SelectItem>
                {JABATAN_OPTIONS.map(jabatan => {
                  const IconComponent = getJabatanIcon(jabatan);
                  return (
                    <SelectItem key={jabatan} value={jabatan} className="hover:bg-blue-50">
                      <div className="flex items-center">
                        <IconComponent className="w-4 h-4 mr-2 text-blue-600" />
                        {jabatan}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Golongan Filter */}
          <div className="space-y-2">
            <Label htmlFor="golongan-filter" className="text-sm font-semibold text-slate-700 flex items-center">
              <Star className="w-4 h-4 mr-2 text-purple-500" />
              Golongan PNS
            </Label>
            <Select 
              value={filters.golongan || 'all'} 
              onValueChange={(value) => updateFilter('golongan', value)}
            >
              <SelectTrigger 
                id="golongan-filter"
                className="bg-white/80 border-slate-200 hover:bg-white hover:border-purple-300 transition-all duration-200"
              >
                <SelectValue placeholder="Semua golongan" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/20">
                <SelectItem value="all" className="hover:bg-purple-50">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-slate-500" />
                    Semua Golongan
                  </div>
                </SelectItem>
                
                {/* Group by Roman numerals for better organization */}
                <div className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">Golongan IV</div>
                {GOLONGAN_OPTIONS.filter(g => g.startsWith('IV/')).map(golongan => (
                  <SelectItem key={golongan} value={golongan} className="hover:bg-green-50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                      {golongan}
                    </div>
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">Golongan III</div>
                {GOLONGAN_OPTIONS.filter(g => g.startsWith('III/')).map(golongan => (
                  <SelectItem key={golongan} value={golongan} className="hover:bg-blue-50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                      {golongan}
                    </div>
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">Golongan II</div>
                {GOLONGAN_OPTIONS.filter(g => g.startsWith('II/')).map(golongan => (
                  <SelectItem key={golongan} value={golongan} className="hover:bg-orange-50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                      {golongan}
                    </div>
                  </SelectItem>
                ))}
                
                <div className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-50">Golongan I</div>
                {GOLONGAN_OPTIONS.filter(g => g.startsWith('I/')).map(golongan => (
                  <SelectItem key={golongan} value={golongan} className="hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                      {golongan}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-sm font-semibold text-slate-700 flex items-center">
              <div className="w-4 h-4 mr-2 bg-green-500 rounded-full"></div>
              Status Akun
            </Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger 
                id="status-filter"
                className="bg-white/80 border-slate-200 hover:bg-white hover:border-green-300 transition-all duration-200"
              >
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border border-white/20">
                <SelectItem value="all" className="hover:bg-slate-50">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-slate-400"></div>
                    Semua Status
                  </div>
                </SelectItem>
                <SelectItem value="active" className="hover:bg-green-50">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-green-500 animate-pulse"></div>
                    Aktif
                  </div>
                </SelectItem>
                <SelectItem value="inactive" className="hover:bg-red-50">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                    Tidak Aktif
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-slate-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-blue-500" />
                Filter Aktif:
              </span>
              
              {filters.jabatan && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Building className="w-3 h-3" />
                  <span>Jabatan: {filters.jabatan}</span>
                  <button 
                    onClick={() => updateFilter('jabatan', undefined)}
                    className="ml-2 hover:text-blue-900 hover:bg-blue-200 rounded-full p-0.5 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.golongan && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <Star className="w-3 h-3" />
                  <span>Golongan: {filters.golongan}</span>
                  <button 
                    onClick={() => updateFilter('golongan', undefined)}
                    className="ml-2 hover:text-purple-900 hover:bg-purple-200 rounded-full p-0.5 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {filters.status && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Status: {filters.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</span>
                  <button 
                    onClick={() => updateFilter('status', undefined)}
                    className="ml-2 hover:text-green-900 hover:bg-green-200 rounded-full p-0.5 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Information */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-100">
          <p className="text-sm text-slate-600 flex items-center">
            <Crown className="w-4 h-4 mr-2 text-blue-500" />
            <span className="font-medium">Hierarki Struktural:</span>
            <span className="ml-2">Direktur → Koordinator Fungsi → Pangkat Golongan PNS</span>
          </p>
        </div>
      </CardContent>
      )}
    </Card>
  );
}