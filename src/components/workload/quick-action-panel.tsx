'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  FileText,
  Calendar,
  Settings,
  Users,
  BarChart3,
  Share,
  Printer,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface QuickActionPanelProps {
  onRefresh: () => void;
}

export function QuickActionPanel({ onRefresh }: QuickActionPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true);
    try {
      // Export logic would go here
      console.log(`Exporting as ${format}...`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    setIsImporting(true);
    // Import logic would go here
    setTimeout(() => setIsImporting(false), 2000);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Primary Action - New Workload */}
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => window.location.href = '/workload/new'}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Workload
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500 rounded">
          Ctrl+N
        </kbd>
      </Button>

      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={isExporting}
            className="hover:bg-green-50 hover:border-green-300"
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
            Export
            {isExporting && <Badge className="ml-2 bg-green-100 text-green-700">Processing...</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print Current View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Button */}
      <Button 
        variant="outline" 
        onClick={handleImport}
        disabled={isImporting}
        className="hover:bg-blue-50 hover:border-blue-300"
      >
        <Upload className={`h-4 w-4 mr-2 ${isImporting ? 'animate-pulse' : ''}`} />
        Import
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = '/calendar'}>
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = '/reports'}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = '/employees'}>
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Share className="h-4 w-4 mr-2" />
            Share View
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            Email Summary
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Refresh Button - separate for visibility */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onRefresh}
        className="hover:bg-slate-100"
        title="Refresh data"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}