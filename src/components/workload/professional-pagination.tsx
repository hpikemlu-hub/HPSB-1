'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Database,
  Grid3x3 
} from 'lucide-react';

interface ProfessionalPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function ProfessionalPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 35, 50, 100]
}: ProfessionalPaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Top Section: Page Size Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <Grid3x3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium whitespace-nowrap">Tampilkan</span>
          </div>
          
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20 h-9 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem 
                  key={option} 
                  value={option.toString()}
                  className="hover:bg-blue-50 focus:bg-blue-50"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="text-sm whitespace-nowrap">data per halaman</span>
            <Database className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Page Info */}
        <div className="flex items-center space-x-2 text-slate-600 bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-sm font-medium">
            Halaman {currentPage} dari {totalPages} ({totalItems} total workload)
          </span>
        </div>
      </div>

      {/* Bottom Section: Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-9 px-3 border-slate-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">First</span>
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-9 px-3 border-slate-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1 mx-2">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-slate-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`h-9 w-9 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md'
                        : 'border-slate-300 hover:bg-blue-50 hover:border-blue-300'
                    } transition-all duration-200`}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-9 px-3 border-slate-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-9 px-3 border-slate-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="hidden sm:inline mr-1">Last</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile-optimized pagination for smaller screens */}
      <div className="sm:hidden mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex-1 mr-2 h-10 border-slate-300 hover:bg-blue-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700">
            {currentPage} / {totalPages}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex-1 ml-2 h-10 border-slate-300 hover:bg-blue-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}