'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Users, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  participants: string[];
  color: string;
  dipa: string;
}

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

export default function EditCalendarEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    participants: [],
    color: '#0ea5e9',
    dipa: ''
  });

  // Demo participants data
  const availableParticipants = [
    'Rifqi Maulana',
    'Yustisia Pratiwi Pramesti', 
    'Muhammad Shalahuddin Yusuf',
    'Amanda Yola Elvarina',
    'Rama Pramu Wicaksono',
    'Nura Soraya',
    'Farisa Oktaviani'
  ];

  const eventColors = [
    { value: '#0ea5e9', label: 'Biru (Meeting)' },
    { value: '#22c55e', label: 'Hijau (Perjalanan)' },
    { value: '#f59e0b', label: 'Kuning (Workshop)' },
    { value: '#ef4444', label: 'Merah (Urgent)' },
    { value: '#8b5cf6', label: 'Ungu (Conference)' },
    { value: '#06b6d4', label: 'Cyan (Koordinasi)' }
  ];

  useEffect(() => {
    // Demo data - in real app, fetch from API/Supabase
    const demoEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Rapat Koordinasi ASEAN',
        description: 'Koordinasi agenda meeting ASEAN Summit 2025 dengan fokus pembahasan isu-isu sosial budaya regional.',
        start_date: '2024-12-15',
        end_date: '2024-12-15',
        location: 'Ruang Rapat Utama, Kemlu Gedung C Lt. 3',
        participants: ['Rifqi Maulana', 'Yustisia Pratiwi Pramesti', 'Muhammad Shalahuddin Yusuf'],
        color: '#0ea5e9',
        creator_id: 'user1',
        dipa: 'DIPA-001'
      },
      {
        id: '2',
        title: 'Perjalanan Dinas Jakarta - Bali',
        description: 'Kunjungan kerja koordinasi dengan Konsulat Jenderal untuk evaluasi program pertukaran budaya.',
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
        description: 'Pelatihan intensive untuk draft perjanjian bilateral dan multilateral.',
        start_date: '2024-12-22',
        end_date: '2024-12-23',
        location: 'Kemlu Gedung C, Ruang Workshop',
        participants: ['Nura Soraya', 'Muhammad Shalahuddin Yusuf'],
        color: '#f59e0b',
        creator_id: 'user3',
        dipa: 'DIPA-003'
      }
    ];

    const foundEvent = demoEvents.find(e => e.id === eventId);
    if (foundEvent) {
      setFormData({
        title: foundEvent.title,
        description: foundEvent.description || '',
        start_date: foundEvent.start_date,
        end_date: foundEvent.end_date,
        location: foundEvent.location || '',
        participants: foundEvent.participants,
        color: foundEvent.color,
        dipa: foundEvent.dipa || ''
      });
    }
    setPageLoading(false);
  }, [eventId]);

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantToggle = (participant: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(participant)
        ? prev.participants.filter(p => p !== participant)
        : [...prev.participants, participant]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi form
      if (!formData.title || !formData.start_date || !formData.end_date) {
        alert('Mohon isi semua field yang wajib');
        return;
      }

      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
        return;
      }

      // Demo: simulate API call
      console.log('Updating event:', { id: eventId, ...formData });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Event berhasil diperbarui!');
      router.push(`/calendar/${eventId}`);
      
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Gagal memperbarui event. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/calendar/${eventId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600">Perbarui informasi kegiatan atau perjalanan dinas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Event *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Contoh: Rapat Koordinasi ASEAN"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Jelaskan detail kegiatan..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Tanggal Mulai *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Tanggal Selesai *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="color">Kategori & Warna</Label>
              <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori event" />
                </SelectTrigger>
                <SelectContent>
                  {eventColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location & Logistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Lokasi & Logistik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Lokasi</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Contoh: Ruang Rapat Utama / Jakarta - Bali"
              />
            </div>

            <div>
              <Label htmlFor="dipa">DIPA / Budget Code</Label>
              <Input
                id="dipa"
                value={formData.dipa}
                onChange={(e) => handleInputChange('dipa', e.target.value)}
                placeholder="Contoh: DIPA-001"
              />
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Peserta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Pilih Peserta</Label>
              <div className="grid grid-cols-1 gap-2">
                {availableParticipants.map((participant) => (
                  <label 
                    key={participant} 
                    className="flex items-center space-x-3 py-2 px-3 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.participants.includes(participant)}
                      onChange={() => handleParticipantToggle(participant)}
                      className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="text-sm font-normal text-gray-700">
                      {participant}
                    </span>
                  </label>
                ))}
              </div>
              {formData.participants.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Dipilih: {formData.participants.length} orang
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Link href={`/calendar/${eventId}`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Menyimpan...
              </div>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}