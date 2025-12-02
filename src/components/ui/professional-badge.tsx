'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  Crown, 
  Star, 
  Shield, 
  CheckCircle, 
  XCircle, 
  UserCog,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';

// Enhanced badge variants with professional government styling
const professionalBadgeVariants = cva(
  "inline-flex items-center justify-center font-semibold text-xs tracking-wide transition-all duration-300 ease-in-out transform relative overflow-hidden whitespace-nowrap shrink-0 border backdrop-blur-sm",
  {
    variants: {
      variant: {
        // Hierarchy badges with premium gradients and animations
        director: [
          "bg-gradient-to-r from-red-600 via-red-700 to-red-800",
          "text-white border-red-400 shadow-lg shadow-red-500/25",
          "hover:shadow-xl hover:shadow-red-500/40 hover:scale-105",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
          "animate-pulse-gentle"
        ],
        coordinator: [
          "bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800",
          "text-white border-purple-400 shadow-lg shadow-purple-500/25",
          "hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        staff: [
          "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
          "text-white border-blue-400 shadow-lg shadow-blue-500/25",
          "hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        ],
        
        // Golongan (Civil Service Rank) badges
        'golongan-iv': [
          "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
          "text-white border-red-300 shadow-lg shadow-red-400/30",
          "hover:shadow-xl hover:shadow-red-400/50 hover:scale-105",
          "ring-2 ring-red-200/50 hover:ring-red-300/60"
        ],
        'golongan-iii': [
          "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700",
          "text-white border-blue-300 shadow-lg shadow-blue-400/30",
          "hover:shadow-xl hover:shadow-blue-400/50 hover:scale-105",
          "ring-2 ring-blue-200/50 hover:ring-blue-300/60"
        ],
        'golongan-ii': [
          "bg-gradient-to-r from-green-500 via-green-600 to-green-700",
          "text-white border-green-300 shadow-lg shadow-green-400/30",
          "hover:shadow-xl hover:shadow-green-400/50 hover:scale-105",
          "ring-2 ring-green-200/50 hover:ring-green-300/60"
        ],
        'golongan-i': [
          "bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600",
          "text-white border-orange-300 shadow-lg shadow-orange-400/30",
          "hover:shadow-xl hover:shadow-orange-400/50 hover:scale-105",
          "ring-2 ring-orange-200/50 hover:ring-orange-300/60"
        ],
        
        // Role & Status indicators
        admin: [
          "bg-gradient-to-r from-red-700 via-red-800 to-red-900",
          "text-white border-red-500 shadow-xl shadow-red-600/40",
          "hover:shadow-2xl hover:shadow-red-600/60 hover:scale-105",
          "ring-2 ring-red-300/60 hover:ring-red-400/80",
          "animate-subtle-glow"
        ],
        'status-active': [
          "bg-gradient-to-r from-green-500 via-green-600 to-emerald-600",
          "text-white border-green-400 shadow-lg shadow-green-500/30",
          "hover:shadow-xl hover:shadow-green-500/50 hover:scale-105",
          "animate-pulse-gentle"
        ],
        'status-inactive': [
          "bg-gradient-to-r from-red-500 via-red-600 to-red-700",
          "text-white border-red-400 shadow-lg shadow-red-500/30",
          "hover:shadow-xl hover:shadow-red-500/50 hover:scale-105"
        ],
        
        // Special government variants
        'gov-primary': [
          "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900",
          "text-white border-slate-600 shadow-lg shadow-slate-700/30",
          "hover:shadow-xl hover:shadow-slate-700/50 hover:scale-105"
        ],
        'gov-secondary': [
          "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300",
          "text-slate-800 border-slate-400 shadow-lg shadow-slate-400/20",
          "hover:shadow-xl hover:shadow-slate-400/40 hover:scale-105"
        ]
      },
      size: {
        sm: "px-2 py-1 text-xs rounded-md",
        md: "px-3 py-1.5 text-sm rounded-lg",
        lg: "px-4 py-2 text-base rounded-xl",
        xl: "px-5 py-2.5 text-lg rounded-2xl"
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md", 
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "staff",
      size: "md",
      rounded: "lg"
    }
  }
);

// Icon mapping for different badge types
const badgeIcons = {
  director: Crown,
  coordinator: Star,
  staff: Shield,
  admin: UserCog,
  'status-active': CheckCircle,
  'status-inactive': XCircle,
  'golongan-iv': Award,
  'golongan-iii': Award,
  'golongan-ii': Award,
  'golongan-i': Award,
  'gov-primary': Sparkles,
  'gov-secondary': Sparkles
} as const;

export interface ProfessionalBadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof professionalBadgeVariants> {
  children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  showIcon?: boolean;
  pulse?: boolean;
  glow?: boolean;
  animated?: boolean;
}

const ProfessionalBadge = React.forwardRef<HTMLSpanElement, ProfessionalBadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    children, 
    icon,
    showIcon = true,
    pulse = false,
    glow = false,
    animated = true,
    ...props 
  }, ref) => {
    // Get the appropriate icon
    const IconComponent = icon || (variant && badgeIcons[variant as keyof typeof badgeIcons]);
    
    // Additional classes based on props
    const additionalClasses = cn(
      pulse && "animate-pulse",
      glow && "animate-subtle-glow",
      animated && "hover:animate-none" // Stop animation on hover for better UX
    );

    return (
      <span
        ref={ref}
        className={cn(
          professionalBadgeVariants({ variant, size, rounded }),
          additionalClasses,
          className
        )}
        {...props}
      >
        {showIcon && IconComponent && (
          <IconComponent className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
        )}
        <span className="relative z-10 font-medium tracking-wide">
          {children}
        </span>
      </span>
    );
  }
);

ProfessionalBadge.displayName = "ProfessionalBadge";

// Utility functions for badge generation
export const getHierarchyBadgeProps = (jabatan?: string) => {
  if (!jabatan) return { variant: 'staff' as const, children: 'Staff' };
  
  const jabatanLower = jabatan.toLowerCase();
  
  if (jabatanLower.includes('direktur')) {
    return { 
      variant: 'director' as const, 
      children: jabatan,
      pulse: true,
      glow: true
    };
  }
  if (jabatanLower.includes('koordinator')) {
    return { 
      variant: 'coordinator' as const, 
      children: jabatan 
    };
  }
  
  return { 
    variant: 'staff' as const, 
    children: jabatan 
  };
};

export const getGolonganBadgeProps = (golongan?: string) => {
  if (!golongan) return null;
  
  if (golongan.startsWith('IV')) {
    return { 
      variant: 'golongan-iv' as const, 
      children: golongan,
      glow: true 
    };
  }
  if (golongan.startsWith('III')) {
    return { 
      variant: 'golongan-iii' as const, 
      children: golongan 
    };
  }
  if (golongan.startsWith('II')) {
    return { 
      variant: 'golongan-ii' as const, 
      children: golongan 
    };
  }
  
  return { 
    variant: 'golongan-i' as const, 
    children: golongan 
  };
};

export const getStatusBadgeProps = (isActive: boolean) => {
  return {
    variant: isActive ? 'status-active' as const : 'status-inactive' as const,
    children: isActive ? 'Aktif' : 'Tidak Aktif',
    pulse: isActive
  };
};

export const getRoleBadgeProps = (role: string) => {
  if (role === 'admin') {
    return {
      variant: 'admin' as const,
      children: 'Administrator',
      glow: true,
      size: 'sm' as const
    };
  }
  
  return {
    variant: 'gov-secondary' as const,
    children: 'Pegawai',
    size: 'sm' as const
  };
};

export { ProfessionalBadge, professionalBadgeVariants };