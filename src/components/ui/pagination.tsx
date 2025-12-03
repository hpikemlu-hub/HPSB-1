'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationContext = React.createContext<PaginationContextValue | undefined>(undefined);

const usePagination = () => {
  const context = React.useContext(PaginationContext);
  if (!context) {
    throw new Error('usePagination must be used within a Pagination component');
  }
  return context;
};

// Main Pagination Component
export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  onPageChange, 
  className,
  showFirstLast = true,
  maxVisiblePages = 5,
  ...props 
}: PaginationProps & React.ComponentProps<"nav">) {
  const contextValue = React.useMemo(() => ({
    currentPage,
    totalPages,
    onPageChange,
  }), [currentPage, totalPages, onPageChange]);

  return (
    <PaginationContext.Provider value={contextValue}>
      <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
      >
        <PaginationContent>
          {/* First Page */}
          {showFirstLast && totalPages > maxVisiblePages && (
            <PaginationItem>
              <PaginationFirst />
            </PaginationItem>
          )}
          
          {/* Previous Page */}
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>

          {/* Page Numbers */}
          <PaginationNumbers maxVisiblePages={maxVisiblePages} />

          {/* Next Page */}
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>

          {/* Last Page */}
          {showFirstLast && totalPages > maxVisiblePages && (
            <PaginationItem>
              <PaginationLast />
            </PaginationItem>
          )}
        </PaginationContent>
      </nav>
    </PaginationContext.Provider>
  );
}

// Sub-components
export function PaginationContent({ 
  className, 
  ...props 
}: React.ComponentProps<"ul">) {
  return (
    <ul 
      className={cn("flex flex-row items-center gap-1", className)} 
      {...props} 
    />
  );
}

export function PaginationItem({ 
  className, 
  ...props 
}: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

export function PaginationLink({
  className,
  isActive,
  size = "sm",
  ...props
}: {
  isActive?: boolean;
  size?: "sm" | "default" | "lg";
} & React.ComponentProps<typeof Button>) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      variant={isActive ? "default" : "outline"}
      size={size}
      className={cn(
        "h-9 w-9 border-slate-300",
        isActive && "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
        !isActive && "hover:bg-blue-50",
        className
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { currentPage, onPageChange } = usePagination();
  const isDisabled = currentPage === 1;

  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 pl-2.5", className)}
      onClick={() => !isDisabled && onPageChange(currentPage - 1)}
      disabled={isDisabled}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Prev</span>
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { currentPage, totalPages, onPageChange } = usePagination();
  const isDisabled = currentPage === totalPages;

  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 pr-2.5", className)}
      onClick={() => !isDisabled && onPageChange(currentPage + 1)}
      disabled={isDisabled}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationFirst({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { currentPage, onPageChange } = usePagination();
  const isDisabled = currentPage === 1;

  return (
    <PaginationLink
      aria-label="Go to first page"
      className={cn("gap-1 pl-2.5 hidden sm:flex", className)}
      onClick={() => !isDisabled && onPageChange(1)}
      disabled={isDisabled}
      {...props}
    >
      <ChevronsLeft className="h-4 w-4" />
      <span>First</span>
    </PaginationLink>
  );
}

export function PaginationLast({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { currentPage, totalPages, onPageChange } = usePagination();
  const isDisabled = currentPage === totalPages;

  return (
    <PaginationLink
      aria-label="Go to last page"
      className={cn("gap-1 pr-2.5 hidden sm:flex", className)}
      onClick={() => !isDisabled && onPageChange(totalPages)}
      disabled={isDisabled}
      {...props}
    >
      <span>Last</span>
      <ChevronsRight className="h-4 w-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

// Page Numbers with Ellipsis Logic
function PaginationNumbers({ maxVisiblePages }: { maxVisiblePages: number }) {
  const { currentPage, totalPages, onPageChange } = usePagination();
  
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('ellipsis-start');
        }
      }
      
      // Show middle pages
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }
      
      // If start is 1 or end is totalPages, make sure they're included
      if (start === 1 && !pages.includes(1)) {
        pages.unshift(1);
      }
      if (end === totalPages && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="hidden sm:flex items-center space-x-1">
      {getPageNumbers().map((page, index) => {
        if (typeof page === 'string' && page.startsWith('ellipsis')) {
          return (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          );
        }
        
        return (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => onPageChange(page as number)}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        );
      })}
    </div>
  );
}

// Pagination utilities
export const usePaginationHelpers = (
  currentPage: number, 
  itemsPerPage: number
) => {
  const goToPage = React.useCallback((pageNumber: number) => {
    return Math.max(1, Math.min(pageNumber, Math.ceil(currentPage)));
  }, [currentPage]);

  const goToFirstPage = React.useCallback(() => 1, []);
  
  const goToLastPage = React.useCallback((totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [itemsPerPage]);
  
  const goToNextPage = React.useCallback((totalPages: number) => {
    return Math.min(totalPages, currentPage + 1);
  }, [currentPage]);
  
  const goToPreviousPage = React.useCallback(() => {
    return Math.max(1, currentPage - 1);
  }, [currentPage]);

  const getStartIndex = React.useCallback(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const getEndIndex = React.useCallback((totalItems: number) => {
    return Math.min(getStartIndex() + itemsPerPage, totalItems);
  }, [getStartIndex, itemsPerPage]);

  return {
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    getStartIndex,
    getEndIndex
  };
};