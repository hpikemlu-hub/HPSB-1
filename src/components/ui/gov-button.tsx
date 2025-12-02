'use client';

import { forwardRef } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

interface GovButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-600 shadow-lg hover:shadow-xl',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md',
  success: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-green-600 shadow-lg hover:shadow-xl',
  warning: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-500 shadow-lg hover:shadow-xl',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600 shadow-lg hover:shadow-xl',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800 border-transparent hover:border-slate-200'
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
};

export const GovButton = forwardRef<HTMLButtonElement, GovButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    loadingText,
    fullWidth = false,
    disabled,
    children,
    className = '',
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          gov-button
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${!isDisabled ? 'hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0' : ''}
          ${className}
        `}
        {...props}
      >
        {/* Loading State */}
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}

        {/* Left Icon */}
        {Icon && iconPosition === 'left' && !loading && (
          <Icon className="w-4 h-4" />
        )}

        {/* Button Text */}
        <span>
          {loading && loadingText ? loadingText : children}
        </span>

        {/* Right Icon */}
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className="w-4 h-4" />
        )}
      </button>
    );
  }
);

GovButton.displayName = 'GovButton';