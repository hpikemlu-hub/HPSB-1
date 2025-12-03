'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User, 
  ChevronLeft, 
  Calendar,
  Target,
  Clock
} from 'lucide-react';
import type { TeamMember } from '@/types';

interface TeamTasksHeaderProps {
  viewMode: 'grid' | 'tasks';
  selectedMember?: TeamMember | null;
  onBackToGrid: () => void;
}

export function TeamTasksHeader({ viewMode, selectedMember, onBackToGrid }: TeamTasksHeaderProps) {
  const [teamCount, setTeamCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamCount();
  }, []);

  const fetchTeamCount = async () => {
    try {
      const { createClientSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseClient();
      
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
        
      if (error) {
        console.error('Error fetching team count:', error);
        setTeamCount(0);
      } else {
        setTeamCount(count || 0);
        console.log(`✅ Active team members: ${count || 0}`);
      }
    } catch (error) {
      console.error('Error in fetchTeamCount:', error);
      setTeamCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 shadow-lg sticky top-0 z-10">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Back Button - Only show in tasks view */}
            {viewMode === 'tasks' && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onBackToGrid}
                className="hover:bg-blue-100 hover:text-blue-700 px-6 py-3"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Kembali ke Tim
              </Button>
            )}
            
            {/* Title and Description */}
            <div>
              {viewMode === 'grid' ? (
                <>
                  <h1 className="text-4xl font-bold text-slate-800 flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <span>Tim HPI Sosbud</span>
                  </h1>
                  <p className="text-lg text-slate-600 mt-2">
                    Lihat dan kelola tugas anggota tim • {loading ? 'Loading...' : `${teamCount} anggota aktif`}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-slate-800 flex items-center space-x-3">
                    <User className="h-8 w-8 text-blue-600" />
                    <span>{selectedMember?.nama_lengkap}</span>
                  </h1>
                  <p className="text-lg text-slate-600 mt-2">
                    {selectedMember?.jabatan} • Kelola tugas dan workload
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Side Info */}
          <div className="text-right">
            <div className="flex items-center space-x-4 mb-2">
              <Badge 
                variant="outline" 
                className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border-blue-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {getCurrentDate()}
              </Badge>
              <Badge 
                variant="outline" 
                className="px-4 py-2 text-sm bg-green-50 text-green-700 border-green-200"
              >
                <Clock className="h-4 w-4 mr-2" />
                {new Date().toLocaleTimeString('id-ID')}
              </Badge>
            </div>
            
            {viewMode === 'tasks' && selectedMember && (
              <div className="flex items-center space-x-3">
                <Badge 
                  variant="outline" 
                  className="px-3 py-1 text-sm bg-slate-50 text-slate-700"
                >
                  <Target className="h-4 w-4 mr-1" />
                  {selectedMember.todos?.length || 0} total tugas
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb for tasks view */}
        {viewMode === 'tasks' && (
          <div className="mt-6 pt-4 border-t border-slate-200/50">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <button 
                onClick={onBackToGrid}
                className="hover:text-blue-600 transition-colors"
              >
                Tim HPI Sosbud
              </button>
              <span>•</span>
              <span className="text-slate-800 font-semibold">
                {selectedMember?.nama_lengkap}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}