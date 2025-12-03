'use client';

import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import type { User } from '@/types';
import type { SessionData } from '@/lib/auth-helpers';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User | SessionData;
}

export function MainLayout({ children, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default collapsed/hidden

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />
      
      {/* Main Content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Header restored */}
        <Header 
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onSidebarToggle={handleToggleCollapse}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
          <div className="h-full p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}