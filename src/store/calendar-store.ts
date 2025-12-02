/**
 * Zustand Store for Calendar UI State
 * Manages client-side state like filters, selections, and view modes
 */

import { create } from 'zustand';
import type { CalendarEvent, EventType } from '@/types';

interface CalendarFilters {
  eventType?: EventType;
  isBusinessTrip?: boolean;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface CalendarStore {
  // UI State
  selectedDate: Date;
  viewMode: 'month' | 'week' | 'day' | 'agenda';
  selectedEvent: CalendarEvent | null;
  isModalOpen: boolean;
  
  // Filters
  filters: CalendarFilters;
  
  // Search
  searchQuery: string;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day' | 'agenda') => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Computed helpers
  hasActiveFilters: () => boolean;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  // Initial State
  selectedDate: new Date(),
  viewMode: 'month',
  selectedEvent: null,
  isModalOpen: false,
  filters: {},
  searchQuery: '',
  
  // Actions
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  clearFilters: () => set({ filters: {} }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Computed
  hasActiveFilters: () => {
    const { filters } = get();
    return Object.keys(filters).length > 0;
  },
}));
