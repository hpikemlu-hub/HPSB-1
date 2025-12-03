/**
 * Event Detail Modal - View event details
 */

'use client';

import { Calendar, Clock, MapPin, Users, FileText, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CalendarEvent, User } from '@/types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEdit?: () => void;
  onDelete?: () => void;
  currentUserId?: string;
  users?: User[];
}

export function EventDetailModal({
  open,
  onClose,
  event,
  onEdit,
  onDelete,
  currentUserId,
  users = [],
}: EventDetailModalProps) {
  if (!event) return null;

  const isCreator = currentUserId === event.creator_id;
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const now = new Date();
  const isOngoing = startDate <= now && endDate >= now;
  const isPast = endDate < now;
  const isUpcoming = startDate > now;

  // Get participant names
  const participantNames = users
    .filter((user) => event.participants?.includes(user.id))
    .map((user) => user.nama_lengkap);

  const getEventTypeLabel = (eventType?: string, color?: string) => {
    // If event has explicit event_type/category, display it
    if (eventType) {
      return eventType;
    }
    
    // Fallback to color-based label for legacy events
    const colorLabels: Record<string, string> = {
      '#0ea5e9': 'Perjalanan Dinas',
      '#22c55e': 'Meeting',
      '#f59e0b': 'Workshop',
      '#8b5cf6': 'Seminar',
      '#ef4444': 'Deadline',
      '#06b6d4': 'Training',
    };
    return colorLabels[color || ''] || 'Event';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: event.color || '#0ea5e9',
                    color: 'white',
                  }}
                >
                  {getEventTypeLabel(event.event_type, event.color)}
                </Badge>
                {isOngoing && (
                  <Badge variant="default" className="bg-green-600">
                    Sedang Berlangsung
                  </Badge>
                )}
                {isPast && (
                  <Badge variant="outline" className="text-gray-500">
                    Selesai
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Akan Datang
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Waktu</p>
              <p className="text-gray-600">
                {format(startDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
                {' - '}
                {format(endDate, 'EEEE, dd MMMM yyyy', { locale: idLocale })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1)} hari
              </p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Lokasi</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Deskripsi</p>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}

          {/* DIPA Code */}
          {event.dipa && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Kode DIPA</p>
                <p className="text-gray-600">{event.dipa}</p>
              </div>
            </div>
          )}

          {/* Creator */}
          {event.creator && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Dibuat oleh</p>
                <p className="text-gray-600">{event.creator.nama_lengkap}</p>
              </div>
            </div>
          )}

          {/* Participants */}
          {participantNames.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  Peserta ({participantNames.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {participantNames.map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isCreator && onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          )}
          {isCreator && onEdit && (
            <Button type="button" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
