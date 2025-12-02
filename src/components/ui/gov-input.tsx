'use client';

import { forwardRef, useState } from 'react';
import { LucideIcon, Eye, EyeOff, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface GovInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validation?: {
    state: 'success' | 'error' | 'warning';
    message: string;
  };
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

interface GovSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string; disabled?: boolean }[];
  validation?: {
    state: 'success' | 'error' | 'warning';
    message: string;
  };
  placeholder?: string;
}

interface GovTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  validation?: {
    state: 'success' | 'error' | 'warning';
    message: string;
  };
  characterCount?: boolean;
  maxLength?: number;
}

export const GovInput = forwardRef<HTMLInputElement, GovInputProps>(
  ({ className = '', validation, icon: Icon, showPasswordToggle = false, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password') 
      : type;

    const validationClass = validation 
      ? `gov-input ${validation.state}` 
      : 'gov-input';

    const ValidationIcon = validation?.state === 'success' ? CheckCircle :
                          validation?.state === 'error' ? AlertCircle :
                          validation?.state === 'warning' ? AlertTriangle : null;

    return (
      <div className="relative">
        {/* Input Container */}
        <div className="relative">
          {/* Leading Icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-5 h-5" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={`
              ${validationClass}
              ${Icon ? 'pl-11' : ''}
              ${showPasswordToggle ? 'pr-11' : ''}
              ${ValidationIcon ? 'pr-11' : ''}
              transition-all duration-200
              ${isFocused ? 'ring-2 ring-blue-100' : ''}
              ${className}
            `}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}

          {/* Validation Icon */}
          {ValidationIcon && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ValidationIcon className={`w-5 h-5 ${
                validation?.state === 'success' ? 'text-green-500' :
                validation?.state === 'error' ? 'text-red-500' :
                'text-amber-500'
              }`} />
            </div>
          )}
        </div>

        {/* Validation Message */}
        {validation && (
          <div className={`
            flex items-center mt-2 text-sm font-medium
            ${validation.state === 'success' ? 'text-green-600' :
              validation.state === 'error' ? 'text-red-600' :
              'text-amber-600'}
          `}>
            {ValidationIcon && (
              <ValidationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            <span>{validation.message}</span>
          </div>
        )}
      </div>
    );
  }
);

GovInput.displayName = 'GovInput';

export const GovSelect = forwardRef<HTMLSelectElement, GovSelectProps>(
  ({ className = '', validation, options, placeholder, ...props }, ref) => {
    const validationClass = validation 
      ? `gov-input ${validation.state}` 
      : 'gov-input';

    const ValidationIcon = validation?.state === 'success' ? CheckCircle :
                          validation?.state === 'error' ? AlertCircle :
                          validation?.state === 'warning' ? AlertTriangle : null;

    return (
      <div className="relative">
        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            className={`
              ${validationClass}
              ${ValidationIcon ? 'pr-11' : 'pr-8'}
              cursor-pointer
              appearance-none
              bg-white
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Validation Icon */}
          {ValidationIcon && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ValidationIcon className={`w-5 h-5 ${
                validation?.state === 'success' ? 'text-green-500' :
                validation?.state === 'error' ? 'text-red-500' :
                'text-amber-500'
              }`} />
            </div>
          )}
        </div>

        {/* Validation Message */}
        {validation && (
          <div className={`
            flex items-center mt-2 text-sm font-medium
            ${validation.state === 'success' ? 'text-green-600' :
              validation.state === 'error' ? 'text-red-600' :
              'text-amber-600'}
          `}>
            {ValidationIcon && (
              <ValidationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            <span>{validation.message}</span>
          </div>
        )}
      </div>
    );
  }
);

GovSelect.displayName = 'GovSelect';

export const GovTextarea = forwardRef<HTMLTextAreaElement, GovTextareaProps>(
  ({ className = '', validation, characterCount = false, maxLength, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0);

    const validationClass = validation 
      ? `gov-input ${validation.state}` 
      : 'gov-input';

    const ValidationIcon = validation?.state === 'success' ? CheckCircle :
                          validation?.state === 'error' ? AlertCircle :
                          validation?.state === 'warning' ? AlertTriangle : null;

    return (
      <div className="relative">
        {/* Textarea */}
        <textarea
          ref={ref}
          className={`
            ${validationClass}
            resize-none
            min-h-[100px]
            ${className}
          `}
          onChange={(e) => {
            if (characterCount) {
              setCharCount(e.target.value.length);
            }
            props.onChange?.(e);
          }}
          maxLength={maxLength}
          {...props}
        />

        {/* Character Count */}
        {characterCount && maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-slate-400 bg-white px-2 py-1 rounded">
            {charCount}/{maxLength}
          </div>
        )}

        {/* Validation Message */}
        {validation && (
          <div className={`
            flex items-center mt-2 text-sm font-medium
            ${validation.state === 'success' ? 'text-green-600' :
              validation.state === 'error' ? 'text-red-600' :
              'text-amber-600'}
          `}>
            {ValidationIcon && (
              <ValidationIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            <span>{validation.message}</span>
          </div>
        )}
      </div>
    );
  }
);

GovTextarea.displayName = 'GovTextarea';