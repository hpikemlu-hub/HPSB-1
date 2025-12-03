/**
 * Interactive Calendar View Component
 * Using react-big-calendar with month/week/day views
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { CalendarEvent } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';

const locales = {
  'id-ID': idLocale,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  className?: string;
}

export function CalendarView({
  events,
  onSelectEvent,
  onSelectSlot,
  className,
}: CalendarViewProps) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Transform CalendarEvent to react-big-calendar event format
  const calendarEvents = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      resource: event,
      allDay: true,
    }));
  }, [events]);

  const handleSelectEvent = useCallback(
    (event: any) => {
      if (onSelectEvent && event.resource) {
        onSelectEvent(event.resource as CalendarEvent);
      }
    },
    [onSelectEvent]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: any) => {
      if (onSelectSlot) {
        onSelectSlot({
          start: slotInfo.start,
          end: slotInfo.end,
        });
      }
    },
    [onSelectSlot]
  );

  // Custom event styling
  const eventStyleGetter = useCallback((event: any) => {
    const calendarEvent = event.resource as CalendarEvent;
    const backgroundColor = calendarEvent?.color || '#0ea5e9';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 5px',
      },
    };
  }, []);

  // Custom day styling
  const dayPropGetter = useCallback((date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return {
        className: 'rbc-today-highlight',
        style: {
          backgroundColor: '#eff6ff',
        },
      };
    }

    return {};
  }, []);

  const messages = {
    date: 'Tanggal',
    time: 'Waktu',
    event: 'Event',
    allDay: 'Sepanjang Hari',
    week: 'Minggu',
    work_week: 'Minggu Kerja',
    day: 'Hari',
    month: 'Bulan',
    previous: 'Sebelumnya',
    next: 'Selanjutnya',
    yesterday: 'Kemarin',
    tomorrow: 'Besok',
    today: 'Hari Ini',
    agenda: 'Agenda',
    noEventsInRange: 'Tidak ada event dalam periode ini.',
    showMore: (total: number) => `+${total} lainnya`,
  };

  return (
    <div className={cn('calendar-container', className)}>
      <style jsx global>{`
        .calendar-container {
          height: 600px;
          background: white;
          border-radius: 8px;
          padding: 1rem;
        }

        .rbc-calendar {
          font-family: inherit;
        }

        .rbc-header {
          padding: 12px 0;
          font-weight: 600;
          color: #374151;
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .rbc-today {
          background-color: #eff6ff;
        }

        .rbc-off-range-bg {
          background: #f9fafb;
        }

        .rbc-event {
          padding: 2px 5px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .rbc-event:hover {
          opacity: 0.8;
        }

        .rbc-event-label {
          font-size: 0.75rem;
        }

        .rbc-toolbar {
          padding: 1rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .rbc-toolbar button {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rbc-toolbar button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .rbc-toolbar button.rbc-active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .rbc-toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .rbc-date-cell {
          padding: 8px;
          text-align: right;
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700;
        }

        .rbc-date-cell > a {
          color: #374151;
        }

        .rbc-date-cell.rbc-now > a {
          color: #2563eb;
        }

        .rbc-show-more {
          color: #2563eb;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          background: none;
          border: none;
          padding: 2px 5px;
          margin-top: 2px;
        }

        .rbc-show-more:hover {
          text-decoration: underline;
        }

        .rbc-overlay {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          padding: 1rem;
        }

        .rbc-overlay-header {
          font-weight: 600;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .calendar-container {
            height: 500px;
            padding: 0.5rem;
          }

          .rbc-toolbar {
            flex-direction: column;
          }

          .rbc-toolbar button {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }

          .rbc-header {
            padding: 8px 0;
            font-size: 0.875rem;
          }
        }
      `}</style>

      <BigCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        popup
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        messages={messages}
        culture="id-ID"
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
      />
    </div>
  );
}
