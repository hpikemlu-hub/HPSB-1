'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { TeamMemberGrid } from '@/components/team-tasks/team-member-grid';
import { TeamMemberTasks } from '@/components/team-tasks/team-member-tasks';
import { TeamTasksHeader } from '@/components/team-tasks/team-tasks-header';
import type { User, TeamMember } from '@/types';

type ViewMode = 'grid' | 'tasks';

function TeamTasksPageContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const { user, loading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for member ID in URL params when user is authenticated
    if (user && !loading) {
      const memberId = searchParams.get('member');
      if (memberId) {
        // Would normally fetch member data here
        setViewMode('tasks');
      }
    }
  }, [user, loading, searchParams]);

  const handleMemberSelect = (member: TeamMember) => {
    setSelectedMember(member);
    setViewMode('tasks');
    // Update URL without page refresh
    const newUrl = `/team-tasks?member=${member.id}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setSelectedMember(null);
    // Reset URL
    window.history.pushState({}, '', '/team-tasks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Team Tasks</p>
            <p className="text-sm text-slate-600">Preparing team workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" data-animated="team-tasks">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30 bg-grid-pattern pointer-events-none"></div>
        
        <div className={`relative transition-opacity motion-reduce:transition-none motion-reduce:opacity-100 duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="relative">
          {/* Header */}
          <TeamTasksHeader 
            viewMode={viewMode}
            selectedMember={selectedMember}
            onBackToGrid={handleBackToGrid}
          />

          {/* Main Content */}
          <div className="px-6 pb-6">
            {viewMode === 'grid' ? (
              <TeamMemberGrid onMemberSelect={handleMemberSelect} />
            ) : (
              <TeamMemberTasks 
                member={selectedMember}
                onBackToGrid={handleBackToGrid}
              />
            )}
          </div>

          {/* Professional Footer */}
          <div className="mt-12 pt-8 mx-6 border-t border-slate-200/60">
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
                Team Tasks - Last updated: {new Date().toLocaleTimeString('id-ID')}
              </div>
            </div>
          </div>
          </div>
       </div>
     </div>
   </MainLayout>
  );
}

export default function TeamTasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-blue-400 animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading Team Tasks</p>
            <p className="text-sm text-slate-600">Preparing team workspace...</p>
          </div>
        </div>
      </div>
    }>
      <TeamTasksPageContent />
    </Suspense>
  );
}