'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { PersonalTodoList } from '@/components/dashboard/personal-todo-list';
import { WorkloadChart } from '@/components/dashboard/workload-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Dashboard</p>
            <p className="text-sm text-slate-600">Preparing HPI Sosbud workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout user={user as any}>
      {/* Professional Government Dashboard Background */}
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30 bg-grid-pattern pointer-events-none"></div>
        
        <div className={`relative p-6 space-y-8 max-w-none anim-fade-in motion-reduce:transition-none motion-reduce:opacity-100 ${mounted ? '' : 'opacity-0'}`}>
          {/* Welcome Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Selamat Datang, {user.nama_lengkap}
                </h1>
                <p className="text-slate-600 mt-2">
                  {user.jabatan} • {user.nip}
                </p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>{new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p className="text-blue-600 font-semibold">{new Date().toLocaleTimeString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* Dashboard Stats - Ringkasan Unit */}
          <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-top-4">
            <DashboardStats />
          </div>

          {/* CORRECTED LAYOUT: 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Todo List Pribadi + Analytics Workload (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Todo List Pribadi */}
              <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-top-6">
                <PersonalTodoList user={user as any} />
              </div>

              {/* Analytics Workload Personal */}
              <div className="transform transition-all duration-700 ease-out animate-in slide-in-from-left-6">
                <WorkloadChart user={user} />
              </div>
            </div>

            {/* RIGHT COLUMN: Quick Actions Personal Sidebar (1/3 width) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 transform transition-all duration-700 ease-out animate-in slide-in-from-right-6">
                <QuickActions user={user} />
              </div>
            </div>
          </div>

          {/* Professional Footer with Kemlu Branding */}
          <div className="mt-12 pt-8 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center space-x-4">
                <span>© 2025 Penata Layanan Oprasional - Direktorat Hukum dan Perjanjian Sosial Budaya</span>
                <span className="text-slate-400">|</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </span>
              </div>
              <div className="text-slate-500">
                Last updated: {new Date().toLocaleTimeString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}