'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, Shield, Globe } from 'lucide-react';
import type { User } from '@/types';

interface DashboardWelcomeProps {
  user: User;
}

export function DashboardWelcome({ user }: DashboardWelcomeProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'admin' ? 'Administrator' : 'Pegawai';
  };

  const currentDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTimeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <>
    <div className="relative">
      {/* Government Header with Kemlu Branding */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-800 text-white overflow-hidden">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10"></div>
        </div>

        <div className="relative p-8">
          <div className="flex items-start justify-between">
            {/* Left Section - Welcome & User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8 text-blue-300" />
                <div>
                  <h1 className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                    Direktorat Hukum dan Perjanjian Sosial Budaya
                  </h1>
                  <p className="text-xl font-bold text-white">
                    Dashboard HPI Sosbud
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white">
                    {getGreeting()}, {user.nama_lengkap}
                  </h2>
                  <Badge variant="secondary" className="bg-blue-700/50 text-blue-100 border-blue-600">
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>

                <div className="flex items-center space-x-6 text-blue-200">
                  {user.jabatan && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">{user.jabatan}</span>
                    </div>
                  )}
                  {user.nip && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">NIP: {user.nip}</span>
                    </div>
                  )}
                </div>

                <p className="text-blue-100 text-sm max-w-2xl">
                  Selamat datang di sistem manajemen workload Direktorat Hubungan Politik Internasional dan Sosial Budaya. 
                  Kelola tugas diplomatik dan administratif Anda dengan efisien.
                </p>
              </div>
            </div>

            {/* Right Section - Live Time & Date */}
            <div className="flex-shrink-0 text-right space-y-4">
              {/* Live Clock */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-2 text-blue-200 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Waktu Aktif</span>
                </div>
                <div className="font-mono text-2xl font-bold text-white">
                  {currentTimeStr}
                </div>
                <div className="text-sm text-blue-200 mt-1">WIB</div>
              </div>

              {/* Date */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-2 text-blue-200 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Tanggal</span>
                </div>
                <div className="text-sm font-medium text-white">
                  {currentDate}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center space-x-2 text-blue-200 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Lokasi</span>
                </div>
                <div className="text-sm font-medium text-white">
                  Jakarta, Indonesia
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200">Sistem Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200">Database Aktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-200">Mode Operasional</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
}