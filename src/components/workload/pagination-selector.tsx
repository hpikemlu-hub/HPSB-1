'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Database, Grid3x3 } from 'lucide-react';

interface PaginationSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options: readonly number[];
}

export function PaginationSelector({ pageSize, onPageSizeChange, options }: PaginationSelectorProps) {
  return (
    <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
      <div className="flex items-center space-x-2 text-slate-600">
        <Grid3x3 className="h-4 w-4 text-slate-500" />
        <Label htmlFor="page-size" className="text-sm font-medium whitespace-nowrap">
          Tampilkan
        </Label>
      </div>
      
      <Select 
        value={pageSize.toString()} 
        onValueChange={(value) => onPageSizeChange(parseInt(value))}
      >
        <SelectTrigger 
          id="page-size" 
          className="w-20 h-8 border-slate-300 focus:border-blue-500 focus:ring-blue-200"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option.toString()}
              className="hover:bg-blue-50"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center space-x-1 text-slate-600">
        <span className="text-sm whitespace-nowrap">data per halaman</span>
        <Database className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}