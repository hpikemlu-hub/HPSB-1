'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

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
  created_at: string;
  updated_at: string;
}

export default function CalendarEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Demo data - in real app, fetch from API/Supabase
    const demoEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Rapat Koordinasi ASEAN',
        description: 'Koordinasi agenda meeting ASEAN Summit 2025 dengan fokus pembahasan isu-isu sosial budaya regional. Meeting akan membahas draft MOU bilateral dan strategi diplomasi budaya.',
        start_date: '2024-12-15',
        end_date: '2024-12-15',
        location: 'Ruang Rapat Utama, Kemlu Gedung C Lt. 3',
        participants: ['Rifqi Maulana', 'Yustisia Pratiwi Pramesti', 'Muhammad Shalahuddin Yusuf'],
        color: '#0ea5e9',
        creator_id: 'user1',
        dipa: 'DIPA-001',
        created_at: '2024-12-01T10:00:00Z',
        updated_at: '2024-12-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Perjalanan Dinas Jakarta - Bali',
        description: 'Kunjungan kerja koordinasi dengan Konsulat Jenderal untuk evaluasi program pertukaran budaya dan penguatan jaringan diaspora Indonesia.',
        start_date: '2024-12-18',
        end_date: '2024-12-20',
        location: 'Denpasar, Bali',
        participants: ['Amanda Yola Elvarina', 'Rama Pramu Wicaksono'],
        color: '#22c55e',
        creator_id: 'user2',
        dipa: 'DIPA-002',
        created_at: '2024-12-02T14:30:00Z',
        updated_at: '2024-12-02T14:30:00Z'
      },
      {
        id: '3',
        title: 'Workshop Hukum Internasional',
        description: 'Pelatihan intensive untuk draft perjanjian bilateral dan multilateral dengan fokus pada aspek sosial budaya dan hak asasi manusia.',
        start_date: '2024-12-22',
        end_date: '2024-12-23',
        location: 'Kemlu Gedung C, Ruang Workshop',
        participants: ['Nura Soraya', 'Muhammad Shalahuddin Yusuf'],
        color: '#f59e0b',
        creator_id: 'user3',
        dipa: 'DIPA-003',
        created_at: '2024-12-03T09:15:00Z',
        updated_at: '2024-12-03T09:15:00Z'
      }
    ];

    const foundEvent = demoEvents.find(e => e.id === eventId);
    setEvent(foundEvent || null);
    setLoading(false);
  }, [eventId]);

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      // Demo: simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Event berhasil dihapus!');
      router.push('/calendar');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Gagal menghapus event. Silakan coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    if (!event) return '';
    
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 hari';
    } else {
      return `${diffDays} hari`;
    }
  };

  const getCategoryName = (color: string) => {
    const categories = {
      '#0ea5e9': 'Meeting',
      '#22c55e': 'Perjalanan Dinas',
      '#f59e0b': 'Workshop/Training',
      '#ef4444': 'Urgent',
      '#8b5cf6': 'Conference',
      '#06b6d4': 'Koordinasi'
    };
    return categories[color as keyof typeof categories] || 'Event';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-4">Event yang Anda cari tidak ada atau telah dihapus.</p>
        <Link href="/calendar">
          <Button>Kembali ke Calendar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/calendar">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: event.color }}
              />
              <Badge variant="outline" style={{ borderColor: event.color, color: event.color }}>
                {getCategoryName(event.color)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
          <Link href={`/calendar/${event.id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detail Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
                  <p className="text-gray-900 mt-1 leading-relaxed">{event.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tanggal Mulai</Label>
                    <p className="text-gray-900">{formatDate(event.start_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tanggal Selesai</Label>
                    <p className="text-gray-900">{formatDate(event.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Durasi</Label>
                    <p className="text-gray-900">{getDuration()}</p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Lokasi</Label>
                      <p className="text-gray-900">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Peserta ({event.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {event.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {participant.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{participant}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Singkat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.dipa && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">DIPA</Label>
                  <p className="text-gray-900 font-medium">{event.dipa}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Kategori</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: event.color }}
                  />
                  <span className="text-gray-900">{getCategoryName(event.color)}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Dibuat</Label>
                <p className="text-gray-900">{formatDateTime(event.created_at)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Terakhir Diubah</Label>
                <p className="text-gray-900">{formatDateTime(event.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/calendar/${event.id}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium text-gray-500 ${className}`}>{children}</label>;
}