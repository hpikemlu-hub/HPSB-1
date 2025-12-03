/**
 * Calendar Main Page - Integrated with Supabase
 * Features: Interactive calendar, real-time updates, event management
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';
import { CalendarView } from '@/components/calendar/calendar-view';
import { CalendarEventModal } from '@/components/calendar/calendar-event-modal';
import { EventDetailModal } from '@/components/calendar/event-detail-modal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useUsers } from '@/hooks/useUsers';
import { 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent,
  fetchUniqueLocations,
  fetchUniqueDipaCodes,
  fetchUniqueCategories,
} from '@/lib/api/calendar';
import type { User, CalendarEvent, CalendarEventForm } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/toast';

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  // Data fetching with real-time updates
  const { events, loading: eventsLoading, error: eventsError, refresh: refreshEvents } = useCalendarEvents({
    autoRefresh: true, // Enable real-time subscriptions
  });
  const { users } = useUsers();
  const [locations, setLocations] = useState<string[]>([]);
  const [dipaCodes, setDipaCodes] = useState<string[]>([]);

  // Set page loading based on auth state
  useEffect(() => {
    if (user && !authLoading) {
      setPageLoading(false);
    }
  }, [user, authLoading]);

  // Load locations and DIPA codes for auto-suggest
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const [locs, codes, cats] = await Promise.all([
          fetchUniqueLocations(),
          fetchUniqueDipaCodes(),
          fetchUniqueCategories(),
        ]);
        setLocations(locs);
        setDipaCodes(codes);
        setCategories(cats);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    }
    loadSuggestions();
  }, [events]);

  // Handle event selection from calendar
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  // Handle slot selection (create new event)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setCreateModalOpen(true);
  };

  // Handle create event
  const handleCreateEvent = async (data: CalendarEventForm) => {
    if (!user) {
      toast.error('User tidak ditemukan');
      return;
    }

    try {
      // If slot was selected, use those dates
      if (selectedSlot) {
        data.start_date = selectedSlot.start.toISOString().split('T')[0];
        data.end_date = selectedSlot.end.toISOString().split('T')[0];
      }

      await createCalendarEvent(data, user.id);
      await refreshEvents();
      setCreateModalOpen(false);
      setSelectedSlot(null);
      toast.success('Event berhasil dibuat');
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  // Handle edit event
  const handleEditEvent = async (data: CalendarEventForm) => {
    if (!selectedEvent) return;

    try {
      await updateCalendarEvent(selectedEvent.id, data);
      await refreshEvents();
      setEditModalOpen(false);
      setDetailModalOpen(false);
      setSelectedEvent(null);
      toast.success('Event berhasil diperbarui');
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus event ini?');
    if (!confirmed) return;

    try {
      await deleteCalendarEvent(selectedEvent.id);
      await refreshEvents();
      setDetailModalOpen(false);
      setSelectedEvent(null);
      toast.success('Event berhasil dihapus');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Gagal menghapus event');
    }
  };

  // Open edit modal from detail modal
  const handleOpenEditModal = () => {
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  if (pageLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout user={user as any}>
      <Toaster />
      
      <div className={`p-6 space-y-6 max-w-none bg-gray-50 min-h-full anim-fade-in motion-reduce:transition-none motion-reduce:opacity-100 ${mounted ? '' : 'opacity-0'}`} data-animated="calendar">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 anim-slide-up motion-reduce:transition-none motion-reduce:transform-none">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar & Travel</h1>
            <p className="text-gray-600">Kelola jadwal kegiatan dan perjalanan dinas</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tambah Event
          </Button>
        </div>

        {/* Error Message */}
        {eventsError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">Error: {eventsError}</p>
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        <Card className="anim-slide-up motion-reduce:transition-none motion-reduce:transform-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
              </div>
            ) : (
              <CalendarView
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Event Modal */}
      <CalendarEventModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleCreateEvent}
        mode="create"
        availableLocations={locations}
        availableDipaCodes={dipaCodes}
        availableCategories={categories}
      />

      {/* Edit Event Modal */}
      <CalendarEventModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleEditEvent}
        event={selectedEvent}
        mode="edit"
        availableLocations={locations}
        availableDipaCodes={dipaCodes}
        availableCategories={categories}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteEvent}
        currentUserId={user?.id}
        users={users}
      />
    </MainLayout>
  );
}
