'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  Menu,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  FileText
} from 'lucide-react';
import { APP_NAME } from '@/constants';
import type { User as UserType } from '@/types';

interface Notification {
  id: string;
  type: 'task_assigned' | 'deadline_reminder' | 'status_update' | 'meeting_reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  urgency: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

interface RedesignedHeaderProps {
  user: UserType;
  onMenuToggle?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export function RedesignedHeader({ user, onMenuToggle, onSidebarToggle, sidebarCollapsed }: RedesignedHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    fetchNotifications();
  }, [user.id]);

  const fetchNotifications = async () => {
    try {
      // Fetch real notification data based on user's tasks and deadlines
      const { data: userTasks, error } = await supabase
        .from('workload')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'on-progress']);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const generatedNotifications: Notification[] = [];

      // Generate deadline reminders
      userTasks?.forEach((task) => {
        if (task.tgl_deadline) {
          const deadline = new Date(task.tgl_deadline);
          
          if (deadline < now && task.status !== 'done') {
            // Overdue task
            generatedNotifications.push({
              id: `overdue-${task.id}`,
              type: 'deadline_reminder',
              title: 'Task Overdue',
              message: `"${task.deskripsi}" is overdue`,
              timestamp: deadline.toISOString(),
              isRead: false,
              urgency: 'high',
              actionUrl: `/workload/${task.id}`
            });
          } else if (deadline <= tomorrow) {
            // Due tomorrow
            generatedNotifications.push({
              id: `due-tomorrow-${task.id}`,
              type: 'deadline_reminder',
              title: 'Due Tomorrow',
              message: `"${task.deskripsi}" is due tomorrow`,
              timestamp: deadline.toISOString(),
              isRead: false,
              urgency: 'high',
              actionUrl: `/workload/${task.id}`
            });
          } else if (deadline <= threeDays) {
            // Due this week
            generatedNotifications.push({
              id: `due-soon-${task.id}`,
              type: 'deadline_reminder',
              title: 'Due This Week',
              message: `"${task.deskripsi}" is due in ${Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`,
              timestamp: deadline.toISOString(),
              isRead: false,
              urgency: 'medium',
              actionUrl: `/workload/${task.id}`
            });
          }
        }
      });

      // Sort by urgency and timestamp
      generatedNotifications.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setNotifications(generatedNotifications.slice(0, 5)); // Show max 5 notifications
      setNotificationCount(generatedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <FileText className="h-4 w-4" />;
      case 'deadline_reminder':
        return <Clock className="h-4 w-4" />;
      case 'status_update':
        return <CheckCircle className="h-4 w-4" />;
      case 'meeting_reminder':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (urgency: Notification['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setNotificationCount(prev => Math.max(0, prev - 1));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and menu toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WL</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-gray-900">{APP_NAME}</h1>
              <p className="text-xs text-gray-500">Kementerian Luar Negeri</p>
            </div>
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-3">
          {/* Smart Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center p-0 min-w-[20px]"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {notificationCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {notificationCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs">You're all caught up!</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          router.push(notification.actionUrl);
                        }
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className={`p-1 rounded-full ${getNotificationColor(notification.urgency)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center p-3" asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
                      <a href="/notifications">View all notifications</a>
                    </Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {getInitials(user.nama_lengkap || user.username || user.email || 'Unknown User')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.nama_lengkap || user.username || user.email || 'Unknown User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.jabatan || 'Staff'} • {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
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
    </header>
  );
}