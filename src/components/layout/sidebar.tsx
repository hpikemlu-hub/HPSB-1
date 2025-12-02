'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Calendar, 
  FileText, 
  History, 
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Statistics'
  },
  {
    name: 'Workload',
    href: '/workload',
    icon: ClipboardList,
    description: 'Manage Tasks'
  },
  {
    name: 'Team Tasks',
    href: '/team-tasks',
    icon: Users,
    description: 'Team Workload View'
  },
  {
    name: 'Employees',
    href: '/employees',
    icon: Users,
    description: 'Staff Directory',
    adminOnly: false
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Travel & Events'
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Analytics & Export'
  },
  {
    name: 'E-Kinerja',
    href: '/e-kinerja',
    icon: BookOpen,
    description: 'Document Support',
    adminOnly: true
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    description: 'Audit Logs',
    adminOnly: true
  },
];

interface SidebarProps {
  user: User;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export function Sidebar({ user, isOpen = true, isCollapsed = false, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientSupabaseClient();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      localStorage.removeItem('currentUser');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user.role === 'admin'
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* WhatsApp-style Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isCollapsed ? "lg:w-16" : "lg:w-64",
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
      )}>
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-4">
          <div className={cn("flex items-center gap-2", isCollapsed && "lg:justify-center")}>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center overflow-hidden bg-white shadow-sm border">
              <img 
                src="/logo.png" 
                alt="Kemlu Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            {(!isCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
              <span className="font-semibold text-gray-900">Workload</span>
            )}
          </div>
          <div className="flex gap-1">
            {/* Desktop collapse toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleCollapse}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
            {/* Mobile close button */}
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation - WhatsApp style */}
        <nav className="mt-4 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            // Dynamic description based on user role for Employees
            const getDescription = (item: any) => {
              if (item.name === 'Employees') {
                return user.role === 'admin' ? 'Staff Management' : 'View & Edit Profile';
              }
              return item.description;
            };
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose} // Close mobile menu on navigation
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  isCollapsed && "lg:justify-center lg:px-2"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-400 group-hover:text-gray-600",
                  isCollapsed ? "lg:mr-0" : "mr-3"
                )} />
                
                {/* Text and description - hidden when collapsed */}
                <div className={cn(
                  "flex-1 min-w-0",
                  isCollapsed && "lg:hidden"
                )}>
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{getDescription(item)}</div>
                </div>
                
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full lg:block hidden" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User menu at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-auto p-0 justify-start">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                      {getInitials(user.nama_lengkap)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("flex-1 min-w-0", isCollapsed && "lg:hidden")}>
                    <p className="text-sm font-medium text-gray-900 truncate text-left">
                      {user.nama_lengkap}
                    </p>
                    <p className="text-xs text-gray-500 truncate text-left">
                      {user.jabatan} • {user.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="start" side="top">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.nama_lengkap}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.jabatan} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                disabled={isLoading}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoading ? 'Signing out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}