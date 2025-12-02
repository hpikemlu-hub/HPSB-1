/**
 * Calendar Event Modal - Create/Edit Events
 * Modal-based form with real-time participant fetching
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, FileText, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { useUsers } from '@/hooks/useUsers';
import type { CalendarEvent, CalendarEventForm } from '@/types';
import { toast } from 'sonner';

interface CalendarEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarEventForm) => Promise<void>;
  event?: CalendarEvent | null;
  mode: 'create' | 'edit';
  availableLocations?: string[];
  availableDipaCodes?: string[];
  availableCategories?: string[];
}

// Color options (10)
const COLOR_OPTIONS = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
];

export function CalendarEventModal({
  open,
  onClose,
  onSubmit,
  event,
  mode,
  availableLocations = [],
  availableDipaCodes = [],
  availableCategories = [],
}: CalendarEventModalProps) {
  const { users, loading: usersLoading } = useUsers();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CalendarEventForm>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    participants: [],
    category: '',
    event_type: '',
    color: '#0ea5e9',
    dipa: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when event changes
  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start_date ? event.start_date.split('T')[0] : '',
        end_date: event.end_date ? event.end_date.split('T')[0] : '',
        location: event.location || '',
        participants: event.participants || [],
        category: event.event_type || '',
        event_type: event.event_type || '',
        color: event.color || '#0ea5e9',
        dipa: event.dipa || '',
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        participants: [],
        category: '',
        event_type: '',
        color: '#0ea5e9',
        dipa: '',
      });
    }
    setErrors({});
  }, [event, mode, open]);

  const handleInputChange = (field: keyof CalendarEventForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul event wajib diisi';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai wajib diisi';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal selesai wajib diisi';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        newErrors.end_date = 'Tanggal selesai harus setelah atau sama dengan tanggal mulai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon periksa kembali form Anda');
      return;
    }

    setSubmitting(true);
    try {
      // Map UI category to backend event_type
      const payload = {
        ...formData,
        event_type: formData.category || formData.event_type || undefined,
      };
      await onSubmit(payload);
      toast.success(mode === 'create' ? 'Event berhasil dibuat' : 'Event berhasil diperbarui');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const userOptions: MultiSelectOption[] = users.map((user) => ({
    value: user.id,
    label: user.nama_lengkap,
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
            {mode === 'create' ? 'Tambah Event Baru' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Judul Event <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Contoh: Perjalanan Dinas ke Jakarta"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Deskripsi detail kegiatan..."
                rows={3}
              />
            </div>
          </div>

          {/* Category (Dropdown with free input) */}
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              list="category-list"
              placeholder="Pilih atau ketik kategori..."
              value={formData.category || ''}
              onChange={(e) => {
                handleInputChange('category', e.target.value);
              }}
            />
            {availableCategories && availableCategories.length > 0 && (
              <datalist id="category-list">
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tanggal Mulai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tanggal Selesai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Removed obsolete Event Type block that used EVENT_TYPES */}

          {/* Location */}
          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lokasi
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Contoh: Jakarta, Indonesia"
              list="location-suggestions"
            />
            {availableLocations.length > 0 && (
              <datalist id="location-suggestions">
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            )}
          </div>

          {/* DIPA Code */}
          <div>
            <Label htmlFor="dipa">Kode DIPA</Label>
            <Input
              id="dipa"
              value={formData.dipa}
              onChange={(e) => handleInputChange('dipa', e.target.value)}
              placeholder="Contoh: DIPA-2024-001"
              list="dipa-suggestions"
            />
            {availableDipaCodes.length > 0 && (
              <datalist id="dipa-suggestions">
                {availableDipaCodes.map((code) => (
                  <option key={code} value={code} />
                ))}
              </datalist>
            )}
          </div>

          {/* Color (10 options) */}
          <div>
            <Label>Warna</Label>
            <Select
              value={formData.color}
              onValueChange={(val) => handleInputChange('color', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih warna" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((hex) => (
                  <SelectItem key={hex} value={hex}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-sm border"
                        style={{ backgroundColor: hex }}
                      />
                      {hex}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Peserta
            </Label>
            {usersLoading ? (
              <div className="text-sm text-gray-500">Memuat data peserta...</div>
            ) : (
              <>
                <MultiSelect
                  options={userOptions}
                  selected={formData.participants || []}
                  onChange={(selected) => handleInputChange('participants', selected)}
                  placeholder="Pilih peserta..."
                />
                {formData.participants && formData.participants.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.participants.length} peserta dipilih
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Menyimpan...
                </div>
              ) : mode === 'create' ? (
                'Buat Event'
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
