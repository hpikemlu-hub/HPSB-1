'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import type { User } from '@/types';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  participants: string[];
  color: string;
  creator_id: string;
  dipa?: string;
}

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for user session in localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      router.push('/auth/login');
      return;
    }

    // Demo data untuk testing
    const demoEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Rapat Koordinasi ASEAN',
        description: 'Koordinasi agenda meeting ASEAN Summit 2025',
        start_date: '2024-12-15',
        end_date: '2024-12-15',
        location: 'Ruang Rapat Utama',
        participants: ['Rifqi Maulana', 'Yustisia Pratiwi', 'Muhammad Shalahuddin'],
        color: '#0ea5e9',
        creator_id: 'user1',
        dipa: 'DIPA-001'
      },
      {
        id: '2',
        title: 'Perjalanan Dinas Jakarta - Bali',
        description: 'Kunjungan kerja koordinasi dengan Konsulat Jenderal',
        start_date: '2024-12-18',
        end_date: '2024-12-20',
        location: 'Denpasar, Bali',
        participants: ['Amanda Yola Elvarina', 'Rama Pramu Wicaksono'],
        color: '#22c55e',
        creator_id: 'user2',
        dipa: 'DIPA-002'
      },
      {
        id: '3',
        title: 'Workshop Hukum Internasional',
        description: 'Pelatihan draft perjanjian bilateral',
        start_date: '2024-12-22',
        end_date: '2024-12-23',
        location: 'Kemlu Gedung C',
        participants: ['Nura Soraya', 'Muhammad Shalahuddin'],
        color: '#f59e0b',
        creator_id: 'user3',
        dipa: 'DIPA-003'
      }
    ];

    setEvents(demoEvents);
    setLoading(false);
  }, [router]);

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = new Date(year, month, day).toISOString().split('T')[0];
    
    return events.filter(event => {
      const startDate = new Date(event.start_date).toISOString().split('T')[0];
      const endDate = new Date(event.end_date).toISOString().split('T')[0];
      return dateString >= startDate && dateString <= endDate;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout user={user}>
      <div className="p-6 space-y-6 max-w-none bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Travel</h1>
          <p className="text-gray-600">Kelola jadwal kegiatan dan perjalanan dinas</p>
        </div>
        <Link href="/calendar/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Event
          </Button>
        </Link>
      </div>

      {/* View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigateMonth('prev')}
                className="px-3"
              >
                ←
              </Button>
              <h2 className="text-lg font-semibold">{getMonthName(currentDate)}</h2>
              <Button
                variant="outline"
                onClick={() => navigateMonth('next')}
                className="px-3"
              >
                →
              </Button>
            </div>
            
            <div className="flex gap-2">
              {['month', 'week', 'day'].map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'outline'}
                  onClick={() => setView(viewType as 'month' | 'week' | 'day')}
                  className="capitalize"
                >
                  {viewType}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {view === 'month' && (
        <Card>
          <CardContent className="p-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b">
              {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getEventsForDate(day);
                return (
                  <div
                    key={index}
                    className="min-h-[100px] p-2 border-r border-b last:border-r-0 relative"
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) 
                            ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                            : 'text-gray-700'
                        }`}>
                          {day}
                        </div>
                        
                        {dayEvents.map((event, eventIndex) => (
                          <Link
                            key={event.id}
                            href={`/calendar/${event.id}`}
                            className="block mb-1"
                          >
                            <div
                              className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: event.color }}
                            >
                              {event.title}
                            </div>
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <Link key={event.id} href={`/calendar/${event.id}`}>
                <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.start_date).toLocaleDateString('id-ID')}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.participants.length}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" style={{ borderColor: event.color, color: event.color }}>
                    {event.dipa}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  );
}