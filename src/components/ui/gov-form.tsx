'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface GovFormProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

interface GovFormSectionProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  delay?: number;
  className?: string;
}

interface GovFormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  success?: string;
  warning?: string;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function GovForm({ title, subtitle, icon: Icon, children, className = '' }: GovFormProps) {
  return (
    <div className={`gov-page-enter ${className}`}>
      {/* Professional Form Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <Icon className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="gov-heading-lg text-white mb-2">{title}</h1>
            {subtitle && (
              <p className="gov-body-md text-blue-100">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="gov-form-container">
        {children}
      </div>
    </div>
  );
}

export function GovFormSection({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  delay = 0,
  className = '' 
}: GovFormSectionProps) {
  const sectionStyle = {
    animationDelay: `${delay * 0.1}s`
  };

  return (
    <div 
      className={`gov-form-section gov-section-enter ${className}`}
      style={sectionStyle}
    >
      {/* Section Header */}
      <div className="gov-form-section-header">
        <div className="gov-form-section-icon">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="gov-form-section-title">{title}</h3>
          {description && (
            <p className="gov-form-section-description">{description}</p>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

export function GovFormField({
  label,
  required = false,
  helpText,
  error,
  success,
  warning,
  children,
  icon: Icon,
  className = ''
}: GovFormFieldProps) {
  const validationState = error ? 'error' : success ? 'success' : warning ? 'warning' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Field Label */}
      <label className={`gov-label ${required ? 'required' : ''}`}>
        {Icon && <Icon className="gov-label-icon w-4 h-4" />}
        {label}
      </label>

      {/* Field Input */}
      <div className="relative">
        {children}
      </div>

      {/* Help Text */}
      {helpText && !error && !success && !warning && (
        <p className="gov-body-sm text-slate-500">{helpText}</p>
      )}

      {/* Validation Messages */}
      {(error || success || warning) && (
        <div className={`gov-validation ${validationState}`}>
          <span className="gov-validation-icon">
            {error && '⚠️'}
            {success && '✅'}
            {warning && '⚠️'}
          </span>
          <span>{error || success || warning}</span>
        </div>
      )}
    </div>
  );
}

export function GovFormGrid({ 
  children, 
  cols = 2,
  className = '' 
}: { 
  children: ReactNode; 
  cols?: number;
  className?: string;
}) {
  const gridClass = cols === 1 ? 'grid-cols-1' : 
                   cols === 2 ? 'grid-cols-1 md:grid-cols-2' :
                   'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function GovFormActions({ 
  children,
  className = ''
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`gov-form-section bg-slate-50/80 border-t border-slate-200 ${className}`}>
      <div className="flex items-center justify-end space-x-4 pt-6">
        {children}
      </div>
    </div>
  );
}