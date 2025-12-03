'use client';

import { ProfessionalBadge, getHierarchyBadgeProps, getGolonganBadgeProps, getStatusBadgeProps, getRoleBadgeProps } from './professional-badge';

// Test component to showcase all badge variations
export function BadgeShowcase() {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Professional Badge System
          </h1>
          <p className="text-lg text-slate-600">
            Government-grade badges for Ministry of Foreign Affairs
          </p>
        </div>

        {/* Hierarchy Badges */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            🏛️ Position Hierarchy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Director Level</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getHierarchyBadgeProps("Direktur HPI Sosbud")} size="lg" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Direktur HPI Sosbud")} size="md" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Direktur HPI Sosbud")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Crown icon, red gradient, shimmer effect</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Coordinator Level</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getHierarchyBadgeProps("Koordinator Bidang A")} size="lg" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Koordinator Bidang A")} size="md" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Koordinator Bidang A")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Star icon, purple gradient</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Staff Level</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getHierarchyBadgeProps("Analis Kebijakan")} size="lg" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Analis Kebijakan")} size="md" />
                <ProfessionalBadge {...getHierarchyBadgeProps("Analis Kebijakan")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Shield icon, blue gradient</p>
            </div>
          </div>
        </section>

        {/* Golongan Badges */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            🏅 Civil Service Ranks (Golongan)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Golongan IV</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getGolonganBadgeProps("IV/e")} size="lg" />
                <ProfessionalBadge {...getGolonganBadgeProps("IV/d")} size="md" />
                <ProfessionalBadge {...getGolonganBadgeProps("IV/c")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Highest rank, red gradient, star decoration</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Golongan III</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getGolonganBadgeProps("III/d")} size="lg" />
                <ProfessionalBadge {...getGolonganBadgeProps("III/c")} size="md" />
                <ProfessionalBadge {...getGolonganBadgeProps("III/b")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Senior level, blue gradient</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Golongan II</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getGolonganBadgeProps("II/d")} size="lg" />
                <ProfessionalBadge {...getGolonganBadgeProps("II/c")} size="md" />
                <ProfessionalBadge {...getGolonganBadgeProps("II/b")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Mid-level, green gradient</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Golongan I</h3>
              <div className="space-y-3">
                <ProfessionalBadge {...getGolonganBadgeProps("I/d")} size="lg" />
                <ProfessionalBadge {...getGolonganBadgeProps("I/c")} size="md" />
                <ProfessionalBadge {...getGolonganBadgeProps("I/b")} size="sm" />
              </div>
              <p className="text-sm text-slate-600">Entry level, orange gradient</p>
            </div>
          </div>
        </section>

        {/* Status & Role Badges */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            🔄 Status & Role Indicators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Status Badges */}
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Activity Status</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <ProfessionalBadge {...getStatusBadgeProps(true)} size="lg" />
                  <p className="text-xs text-slate-500">Active - with pulse animation</p>
                </div>
                <div className="space-y-2">
                  <ProfessionalBadge {...getStatusBadgeProps(false)} size="lg" />
                  <p className="text-xs text-slate-500">Inactive - clear indication</p>
                </div>
              </div>
            </div>
            
            {/* Role Badges */}
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">System Roles</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <ProfessionalBadge {...getRoleBadgeProps('admin')} size="lg" />
                  <p className="text-xs text-slate-500">Administrator - with lock decoration</p>
                </div>
                <div className="space-y-2">
                  <ProfessionalBadge {...getRoleBadgeProps('user')} size="lg" />
                  <p className="text-xs text-slate-500">Regular employee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animation Demonstrations */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            ✨ Animation Showcase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Pulse Animation</h3>
              <ProfessionalBadge variant="director" size="xl" pulse>
                Director with Pulse
              </ProfessionalBadge>
              <p className="text-sm text-slate-600">Gentle pulsing for active elements</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Glow Effect</h3>
              <ProfessionalBadge variant="admin" size="xl" glow>
                Admin with Glow
              </ProfessionalBadge>
              <p className="text-sm text-slate-600">Subtle glow for premium badges</p>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-slate-700">Hover Effects</h3>
              <ProfessionalBadge variant="coordinator" size="xl">
                Hover Over Me
              </ProfessionalBadge>
              <p className="text-sm text-slate-600">Scale and shimmer on hover</p>
            </div>
          </div>
        </section>

        {/* Responsive Preview */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            📱 Responsive Design
          </h2>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-slate-700 mb-4">Badge Scaling Across Devices</h3>
              <div className="flex flex-wrap justify-center gap-4 items-center">
                <div className="flex flex-col items-center space-y-2">
                  <ProfessionalBadge {...getHierarchyBadgeProps("Direktur")} size="xl" />
                  <span className="text-xs text-slate-500">Desktop XL</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <ProfessionalBadge {...getHierarchyBadgeProps("Direktur")} size="lg" />
                  <span className="text-xs text-slate-500">Desktop LG</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <ProfessionalBadge {...getHierarchyBadgeProps("Direktur")} size="md" />
                  <span className="text-xs text-slate-500">Tablet MD</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <ProfessionalBadge {...getHierarchyBadgeProps("Direktur")} size="sm" />
                  <span className="text-xs text-slate-500">Mobile SM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Code Examples */}
        <section className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            💻 Code Examples
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Hierarchy Badge
<ProfessionalBadge {...getHierarchyBadgeProps(employee.jabatan)} size="md" />

// Golongan Badge
<ProfessionalBadge {...getGolonganBadgeProps(employee.golongan)} size="md" />

// Status Badge
<ProfessionalBadge {...getStatusBadgeProps(employee.is_active)} size="md" />

// Custom Badge
<ProfessionalBadge variant="director" size="lg" pulse glow>
  Custom Content
</ProfessionalBadge>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-slate-600">
          <p className="text-sm">
            Professional Badge System v1.0 - Ministry of Foreign Affairs
            <br />
            Government-grade UI components with modern interactions
          </p>
        </div>
      </div>
    </div>
  );
}