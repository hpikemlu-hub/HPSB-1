'use client';

import { LucideIcon, Clock, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface GovStatusIndicatorProps {
  status: 'pending' | 'on-progress' | 'done';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
}

interface GovProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface GovTimelineProps {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
    icon?: LucideIcon;
  }>;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: Clock,
    description: 'Awaiting initiation'
  },
  'on-progress': {
    label: 'In Progress',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    icon: Play,
    description: 'Currently active',
    animated: true
  },
  done: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: CheckCircle,
    description: 'Successfully finished'
  }
};

export function GovStatusIndicator({
  status,
  size = 'md',
  animated = false,
  showLabel = true,
  className = ''
}: GovStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-lg border font-medium
      ${sizeClasses[size]}
      ${config.color}
      ${config.bgColor}
      ${config.borderColor}
      ${animated && config.animated ? 'animate-pulse' : ''}
      ${className}
    `}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

export function GovProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#3b82f6',
  animated = true,
  className = '',
  children
}: GovProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className={animated ? 'transition-all duration-500 ease-out' : ''}
        />
      </svg>
      
      {/* Center Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export function GovTimeline({ items, className = '' }: GovTimelineProps) {
  return (
    <div className={`gov-timeline ${className}`}>
      <div className="space-y-6">
        {items.map((item, index) => {
          const Icon = item.icon || 
            (item.status === 'completed' ? CheckCircle :
             item.status === 'current' ? Play :
             Clock);

          return (
            <div key={item.id} className="gov-timeline-item">
              {/* Timeline Dot */}
              <div className="flex-shrink-0 relative">
                <div className={`
                  gov-timeline-dot
                  ${item.status === 'completed' ? 'completed' :
                    item.status === 'current' ? 'current' :
                    'pending'}
                `}>
                  <Icon className="absolute inset-0 w-full h-full p-0.5 text-white" />
                </div>
                
                {/* Timeline Line */}
                {index < items.length - 1 && (
                  <div className={`
                    absolute left-1/2 top-full w-0.5 h-6 -translate-x-1/2
                    ${item.status === 'completed' ? 'bg-green-300' : 'bg-slate-300'}
                  `} />
                )}
              </div>

              {/* Timeline Content */}
              <div className="flex-grow min-w-0 ml-4">
                <div className="flex items-center justify-between">
                  <h4 className={`
                    font-medium text-sm
                    ${item.status === 'completed' ? 'text-green-800' :
                      item.status === 'current' ? 'text-amber-800' :
                      'text-slate-600'}
                  `}>
                    {item.title}
                  </h4>
                  
                  {item.date && (
                    <span className="text-xs text-slate-500 ml-2">
                      {item.date}
                    </span>
                  )}
                </div>
                
                {item.description && (
                  <p className="text-xs text-slate-600 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GovStatusCards({
  options,
  value,
  onChange,
  className = ''
}: {
  options: Array<{
    value: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color: string;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all duration-200
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isSelected 
                ? `border-blue-500 bg-blue-50 shadow-md` 
                : 'border-slate-200 bg-white hover:border-slate-300'
              }
            `}
          >
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            )}
            
            {/* Status Icon */}
            <div className={`
              inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3
              ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}
            `}>
              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
            </div>
            
            {/* Status Info */}
            <h3 className={`font-medium text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
              {option.label}
            </h3>
            
            <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}