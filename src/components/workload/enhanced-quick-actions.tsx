'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfessionalBadge } from '@/components/ui/professional-badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Plus, 
  CheckCircle2, 
  Users, 
  Calendar, 
  Target, 
  Download, 
  Upload, 
  Filter,
  Search,
  BarChart3,
  Settings,
  RefreshCw,
  Clock,
  AlertTriangle,
  FileText,
  Share2,
  Archive,
  Copy,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface QuickActionsProps {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onRefresh?: () => void;
  totalItems: number;
  filterActive: boolean;
  onToggleFilters: () => void;
}

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  requiresSelection?: boolean;
  shortcut?: string;
  color?: string;
  bgColor?: string;
}

export function EnhancedQuickActions({ 
  selectedItems, 
  onSelectionChange, 
  onRefresh,
  totalItems,
  filterActive,
  onToggleFilters
}: QuickActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (actionType: string) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (actionType) {
        case 'complete':
          toast.success(`Marked ${selectedItems.length} item(s) as complete`);
          break;
        case 'assign':
          toast.success(`Assigned ${selectedItems.length} item(s) to team`);
          break;
        case 'deadline':
          toast.success(`Set deadline for ${selectedItems.length} item(s)`);
          break;
        case 'archive':
          toast.success(`Archived ${selectedItems.length} item(s)`);
          break;
        case 'delete':
          toast.success(`Deleted ${selectedItems.length} item(s)`);
          break;
        default:
          toast.success(`Action applied to ${selectedItems.length} item(s)`);
      }
      
      // Clear selection after action
      onSelectionChange([]);
    } catch (error) {
      toast.error('Action failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedItems, onSelectionChange]);

  // Handle export
  const handleExport = useCallback(() => {
    toast.info('Export functionality coming soon!');
  }, []);

  // Handle import
  const handleImport = useCallback(() => {
    toast.info('Import functionality coming soon!');
  }, []);

  // Define action buttons
  const primaryActions: ActionButton[] = [
    {
      id: 'new',
      label: 'New Workload',
      icon: Plus,
      action: () => window.location.href = '/workload/new',
      variant: 'default',
      shortcut: 'Ctrl+N',
      color: 'text-white',
      bgColor: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      id: 'filters',
      label: filterActive ? 'Hide Filters' : 'Show Filters',
      icon: Filter,
      action: onToggleFilters,
      variant: 'outline',
      shortcut: 'Ctrl+F'
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: RefreshCw,
      action: onRefresh || (() => window.location.reload()),
      variant: 'outline',
      shortcut: 'F5'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: handleExport,
      variant: 'outline',
      shortcut: 'Ctrl+E'
    }
  ];

  const bulkActions: ActionButton[] = [
    {
      id: 'bulk-complete',
      label: 'Mark Complete',
      icon: CheckCircle2,
      action: () => handleBulkAction('complete'),
      variant: 'outline',
      requiresSelection: true,
      color: 'text-green-700',
      bgColor: 'hover:bg-green-50'
    },
    {
      id: 'bulk-assign',
      label: 'Assign Team',
      icon: Users,
      action: () => handleBulkAction('assign'),
      variant: 'outline',
      requiresSelection: true,
      color: 'text-blue-700',
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'bulk-deadline',
      label: 'Set Deadline',
      icon: Calendar,
      action: () => handleBulkAction('deadline'),
      variant: 'outline',
      requiresSelection: true,
      color: 'text-orange-700',
      bgColor: 'hover:bg-orange-50'
    },
    {
      id: 'bulk-archive',
      label: 'Archive',
      icon: Archive,
      action: () => handleBulkAction('archive'),
      variant: 'outline',
      requiresSelection: true,
      color: 'text-purple-700',
      bgColor: 'hover:bg-purple-50'
    }
  ];

  const utilityActions: ActionButton[] = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      action: () => toast.info('Analytics dashboard coming soon!'),
      variant: 'outline'
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      action: handleImport,
      variant: 'outline'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: () => toast.info('Settings panel coming soon!'),
      variant: 'outline'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced CSS */}
      <style jsx>{`
        .quick-actions-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .action-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        
        .action-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
        }
        
        .action-button.primary {
          background: linear-gradient(135deg, #1e40af, #1d4ed8);
          border: none;
          color: white;
        }
        
        .action-button.primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          box-shadow: 0 8px 24px rgba(29, 78, 216, 0.3);
        }
        
        .search-container {
          position: relative;
        }
        
        .search-container::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
        }
        
        .selection-indicator {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .shortcut-hint {
          font-size: 0.75rem;
          color: #64748b;
          background: #f8fafc;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        }
        
        .action-section {
          border-left: 3px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0.5rem;
        }
        
        .action-section.active {
          border-left-color: #3b82f6;
        }
        
        @media (max-width: 768px) {
          .action-button {
            font-size: 0.875rem;
            padding: 8px 12px;
          }
          
          .shortcut-hint {
            display: none;
          }
        }
      `}</style>

      <div className="quick-actions-container">
        {/* Search Bar */}
        <Card className="action-card">
          <CardContent className="p-4">
            <div className="search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search workloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base border-0 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <Card className="action-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Actions
              <ProfessionalBadge variant="gov-secondary" size="sm">
                {totalItems} items
              </ProfessionalBadge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Actions */}
            <div>
              <h4 className="text-sm font-medium text-slate-600 mb-3">Primary Actions</h4>
              <div className="flex flex-wrap gap-3">
                {primaryActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      onClick={action.action}
                      variant={action.variant}
                      disabled={isLoading}
                      className={`action-button ${action.id === 'new' ? 'primary' : ''} ${action.bgColor || ''}`}
                      style={action.color ? { color: action.color } : undefined}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                      {action.shortcut && (
                        <span className="shortcut-hint ml-2">
                          {action.shortcut}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Selection Status */}
            {selectedItems.length > 0 && (
              <div className="selection-indicator">
                <div className="flex items-center justify-between">
                  <span>
                    {selectedItems.length} item(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectionChange([])}
                    className="text-white hover:text-slate-200 p-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            <div className={`action-section ${selectedItems.length > 0 ? 'active' : ''}`}>
              <h4 className="text-sm font-medium text-slate-600 mb-3">Bulk Actions</h4>
              <div className="flex flex-wrap gap-2">
                {bulkActions.map((action) => {
                  const Icon = action.icon;
                  const disabled = action.requiresSelection && selectedItems.length === 0;
                  
                  return (
                    <Button
                      key={action.id}
                      onClick={action.action}
                      variant={action.variant}
                      size="sm"
                      disabled={disabled || isLoading}
                      className={`action-button ${action.bgColor || ''} ${disabled ? 'opacity-50' : ''}`}
                      style={!disabled && action.color ? { color: action.color } : undefined}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                      {action.requiresSelection && selectedItems.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {selectedItems.length}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Utility Actions */}
            <div className="action-section">
              <h4 className="text-sm font-medium text-slate-600 mb-3">Utilities</h4>
              <div className="flex flex-wrap gap-2">
                {utilityActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      onClick={action.action}
                      variant={action.variant}
                      size="sm"
                      disabled={isLoading}
                      className="action-button"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="action-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Target className="h-5 w-5 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-700">{totalItems}</div>
                <div className="text-xs text-blue-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">{selectedItems.length}</div>
                <div className="text-xs text-green-600">Selected</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-700">
                  {filterActive ? '✓' : '—'}
                </div>
                <div className="text-xs text-orange-600">Filtered</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">
                  {Math.round((selectedItems.length / Math.max(1, totalItems)) * 100)}%
                </div>
                <div className="text-xs text-purple-600">Selected</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts Help */}
        <Card className="action-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>New Workload</span>
                <span className="shortcut-hint">Ctrl+N</span>
              </div>
              <div className="flex justify-between">
                <span>Toggle Filters</span>
                <span className="shortcut-hint">Ctrl+F</span>
              </div>
              <div className="flex justify-between">
                <span>Export Data</span>
                <span className="shortcut-hint">Ctrl+E</span>
              </div>
              <div className="flex justify-between">
                <span>Refresh</span>
                <span className="shortcut-hint">F5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}