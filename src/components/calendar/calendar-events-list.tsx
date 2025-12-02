/**
 * Calendar Events List Component
 * For showing calendar events in PersonalTodoList and TeamMemberTasks
 */

'use client';

import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CalendarEvent } from '@/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface CalendarEventsListProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  title?: string;
  emptyMessage?: string;
  showStatus?: boolean;
}

export function CalendarEventsList({
  events,
  onEventClick,
  title = 'Perjalanan Dinas',
  emptyMessage = 'Tidak ada perjalanan dinas',
  showStatus = true,
}: CalendarEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const getEventStatus = (event: CalendarEvent) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    if (start <= now && end >= now) {
      return { label: 'Sedang Berlangsung', color: 'bg-green-600', textColor: 'text-white' };
    } else if (end < now) {
      return { label: 'Selesai', color: 'bg-gray-400', textColor: 'text-white' };
    } else {
      return { label: 'Akan Datang', color: 'bg-blue-600', textColor: 'text-white' };
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {title}
        </h3>
      )}

      <div className="space-y-2">
        {events.map((event) => {
          const status = getEventStatus(event);
          const startDate = new Date(event.start_date);
          const endDate = new Date(event.end_date);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1);

          return (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color || '#0ea5e9' }}
                    />
                    <h4 className="font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {format(startDate, 'dd MMM', { locale: idLocale })}
                        {' - '}
                        {format(endDate, 'dd MMM yyyy', { locale: idLocale })}
                        {' '}({duration} hari)
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}

                    {event.participants && event.participants.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>{event.participants.length} peserta</span>
                      </div>
                    )}
                  </div>
                </div>

                {showStatus && (
                  <Badge className={`${status.color} ${status.textColor} flex-shrink-0`}>
                    {status.label}
                  </Badge>
                )}
              </div>

              {event.dipa && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">DIPA: {event.dipa}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
