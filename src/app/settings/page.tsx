'use client';

import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  Key,
  Database,
  Monitor,
  Smartphone,
  Mail,
  Clock,
  Calendar,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Code,
  Zap,
  Server,
  Users,
  FileText,
  Palette,
  Eye,
  EyeOff,
  HardDrive,
  Wifi,
  Loader2,
  Cog,
  UserCog,
  ShieldCheck,
  Activity,
  BarChart3
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'queued';
  progress: number;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeSection, setActiveSection] = useState('account');
  const [systemStatus, setSystemStatus] = useState('operational');
  const [loadingPhase, setLoadingPhase] = useState(1);

  const settingSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Personal account preferences and security',
      icon: <UserCog className="w-6 h-6" />,
      status: 'in-progress',
      progress: 65
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Advanced security configuration',
      icon: <ShieldCheck className="w-6 h-6" />,
      status: 'in-progress',
      progress: 80
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Communication and alert preferences',
      icon: <Bell className="w-6 h-6" />,
      status: 'completed',
      progress: 100
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Application behavior and performance',
      icon: <Cog className="w-6 h-6" />,
      status: 'queued',
      progress: 30
    },
    {
      id: 'admin',
      title: 'Admin Controls',
      description: 'Administrative system management',
      icon: <Shield className="w-6 h-6" />,
      status: 'queued',
      progress: 20
    }
  ];

  // Animated progress for development status
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 75) {
          return 75; // Stop at 75% to show in development
        }
        return prev + 1;
      });
    }, 50);

    const phaseTimer = setInterval(() => {
      setLoadingPhase((prev) => (prev % 3) + 1);
    }, 2000);

    const statusTimer = setInterval(() => {
      const statuses = ['operational', 'maintenance', 'updating'];
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 5000);

    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
      clearInterval(statusTimer);
      clearTimeout(animationTimer);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full mx-auto animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">Loading Settings</h3>
              <p className="text-gray-600 text-lg">Preparing system configuration...</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="floating-icon absolute top-20 left-10 text-blue-500/50">
            <SettingsIcon className={`w-8 h-8 ${isAnimating ? 'animate-spin' : 'animate-pulse'}`} style={{ animationDelay: '0s' }} />
          </div>
          <div className="floating-icon absolute top-40 right-20 text-indigo-500/50">
            <Shield className={`w-6 h-6 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1s' }} />
          </div>
          <div className="floating-icon absolute bottom-32 left-1/4 text-purple-500/50">
            <Server className={`w-7 h-7 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="floating-icon absolute bottom-20 right-1/3 text-cyan-500/50">
            <Database className={`w-5 h-5 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="floating-icon absolute top-1/2 left-16 text-emerald-500/50">
            <Monitor className={`w-6 h-6 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0.8s' }} />
          </div>
          <div className="floating-icon absolute top-60 right-1/2 text-rose-500/50">
            <Lock className={`w-5 h-5 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1.2s' }} />
          </div>
          
          {/* Enhanced Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Professional Header with Enhanced Animation */}
          <div className="text-center mb-12 dev-slide-in-top">
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl dev-pulse-glow">
                  <SettingsIcon className="w-16 h-16 text-white animate-spin" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg animate-pulse">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-full shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight gradient-text">
              System Settings
            </h1>
            <p className="text-xl text-gray-700 font-semibold max-w-3xl mx-auto leading-relaxed mb-8">
              Professional government-grade configuration management system under active development
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-xl border-0 dev-hover-lift">
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Phase {loadingPhase}: Development Mode
              </Badge>
              <Badge className={`px-6 py-3 text-white text-lg font-bold shadow-xl border-0 ${
                systemStatus === 'operational' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                systemStatus === 'maintenance' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                <Activity className="w-5 h-5 mr-2" />
                System: {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Development Progress Dashboard */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="dev-card border-0 shadow-2xl bg-white/20 backdrop-blur-md">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-3">
                  Configuration Development Status
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 font-semibold">
                  Enterprise-grade settings management with advanced security protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Overall Settings Progress</span>
                    <span className="text-3xl font-black text-blue-600">{progress}%</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={progress} 
                      className="h-6 bg-gray-200/60 shadow-inner"
                    />
                    <div className="absolute top-1 left-1 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 animate-pulse"
                         style={{ width: `${Math.max(0, progress - 2)}%` }}>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-semibold">
                    <span>🎯 Configuration Design</span>
                    <span>⚡ Security Implementation</span>
                    <span>🚀 Production Testing</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Categories Navigation */}
          <div className="max-w-7xl mx-auto mb-12">
            <Card className="dev-card border-0 shadow-2xl bg-white/15 backdrop-blur-md">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-black text-gray-900">
                  Settings Categories
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 font-semibold">
                  Professional configuration management modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {settingSections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 dev-hover-lift ${
                        activeSection === section.id 
                          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400 shadow-xl' 
                          : 'bg-white/60 border-gray-200 hover:border-blue-300'
                      } ${section.status === 'completed' ? 'bg-green-50' : section.status === 'queued' ? 'bg-gray-50' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${
                            section.status === 'completed' ? 'bg-green-500' :
                            section.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            <div className="text-white">
                              {section.icon}
                            </div>
                          </div>
                          <Badge className={`text-xs font-bold ${
                            section.status === 'completed' ? 'bg-green-100 text-green-800' :
                            section.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {section.status === 'completed' ? '✅' :
                             section.status === 'in-progress' ? '🔄' : '⏳'}
                          </Badge>
                        </div>
                        
                        <div>
                          <h3 className="font-black text-gray-900 text-lg mb-2">{section.title}</h3>
                          <p className="text-gray-600 text-sm font-medium">{section.description}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-600">Progress</span>
                            <span className={`${
                              section.status === 'completed' ? 'text-green-600' :
                              section.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
                            }`}>{section.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                section.status === 'completed' ? 'bg-green-500' :
                                section.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                              } ${section.status === 'in-progress' ? 'animate-pulse' : ''}`}
                              style={{ width: `${section.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Preview Content */}
          <div className="max-w-7xl mx-auto mb-12">
            <Card className="dev-card border-0 shadow-2xl bg-white/15 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-gray-900">
                  {settingSections.find(s => s.id === activeSection)?.title} Preview
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 font-semibold">
                  Professional configuration interface (Development Mode)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === 'account' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Account Preferences</h4>
                      {[
                        { label: 'Language', value: 'Bahasa Indonesia', icon: Globe },
                        { label: 'Time Zone', value: 'WIB (UTC+7)', icon: Clock },
                        { label: 'Date Format', value: 'DD/MM/YYYY', icon: Calendar },
                        { label: 'Theme', value: 'Government Professional', icon: Palette }
                      ].map((setting, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <setting.icon className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">{setting.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600 font-medium">{setting.value}</span>
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Display Settings</h4>
                      {[
                        { label: 'Dark Mode', enabled: false, description: 'Switch to dark theme' },
                        { label: 'Compact View', enabled: true, description: 'Reduce spacing and padding' },
                        { label: 'Animations', enabled: true, description: 'Enable interface animations' },
                        { label: 'High Contrast', enabled: false, description: 'Accessibility enhancement' }
                      ].map((toggle, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-gray-200">
                          <div>
                            <div className="font-semibold text-gray-900">{toggle.label}</div>
                            <div className="text-sm text-gray-600">{toggle.description}</div>
                          </div>
                          <Switch checked={toggle.enabled} disabled className="opacity-50" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Security Controls</h4>
                      {[
                        { label: 'Two-Factor Authentication', enabled: true, level: 'Required', color: 'green' },
                        { label: 'Session Timeout', enabled: true, level: '30 minutes', color: 'blue' },
                        { label: 'Login Alerts', enabled: true, level: 'Email + SMS', color: 'purple' },
                        { label: 'API Access', enabled: false, level: 'Restricted', color: 'red' }
                      ].map((security, index) => (
                        <div key={index} className="p-4 bg-white/60 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{security.label}</span>
                            <Badge className={`bg-${security.color}-100 text-${security.color}-800 font-bold`}>
                              {security.level}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Government security protocol</span>
                            <Switch checked={security.enabled} disabled className="opacity-50" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Access Management</h4>
                      <div className="p-6 bg-white/60 rounded-lg border border-gray-200 text-center">
                        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h5 className="font-bold text-gray-900 mb-2">Advanced Security Features</h5>
                        <p className="text-gray-600 text-sm mb-4">Enhanced protection protocols for government systems</p>
                        <Button disabled className="w-full bg-gray-300 text-gray-600 font-bold">
                          <Lock className="w-4 h-4 mr-2" />
                          Configure Security (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h4>
                      {[
                        { type: 'Email Notifications', enabled: true, frequency: 'Immediate' },
                        { type: 'SMS Alerts', enabled: false, frequency: 'Critical Only' },
                        { type: 'Push Notifications', enabled: true, frequency: 'Workdays' },
                        { type: 'System Updates', enabled: true, frequency: 'Weekly' }
                      ].map((notif, index) => (
                        <div key={index} className="p-4 bg-white/60 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{notif.type}</span>
                            <Switch checked={notif.enabled} disabled className="opacity-50" />
                          </div>
                          <div className="text-sm text-gray-600">Frequency: {notif.frequency}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Communication Channels</h4>
                      <div className="p-6 bg-white/60 rounded-lg border border-gray-200 text-center">
                        <Bell className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                        <h5 className="font-bold text-gray-900 mb-2">Smart Notification System</h5>
                        <p className="text-gray-600 text-sm mb-4">AI-powered notification management</p>
                        <Button disabled className="w-full bg-gray-300 text-gray-600 font-bold">
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Advanced Settings (In Development)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'system' && (
                  <div className="text-center p-12">
                    <Server className="w-16 h-16 text-blue-600 mx-auto mb-6 animate-pulse" />
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">System Configuration</h4>
                    <p className="text-gray-600 font-medium mb-6">Advanced system settings module under development</p>
                    <Badge className="px-6 py-2 bg-blue-100 text-blue-800 font-bold">
                      <Clock className="w-4 h-4 mr-2" />
                      Coming in Q2 2024
                    </Badge>
                  </div>
                )}

                {activeSection === 'admin' && (
                  <div className="text-center p-12">
                    <div className="relative inline-block mb-6">
                      <Shield className="w-16 h-16 text-red-600 mx-auto animate-pulse" />
                      <Lock className="w-6 h-6 text-gray-600 absolute -bottom-1 -right-1" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-4">Administrative Controls</h4>
                    <p className="text-gray-600 font-medium mb-6">
                      {user.role === 'admin' ? 'Advanced admin features under development' : 'Admin access required for this section'}
                    </p>
                    <Badge className={`px-6 py-2 font-bold ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {user.role === 'admin' ? 'Development Phase' : 'Access Restricted'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Support & Contact Section */}
          <div className="text-center space-y-8">
            <Card className="max-w-xl mx-auto dev-card border-0 shadow-2xl bg-white/25 backdrop-blur-md">
              <CardContent className="p-10">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl w-fit mx-auto shadow-xl">
                    <SettingsIcon className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    Settings Configuration Support
                  </h3>
                  <p className="text-gray-700 font-semibold leading-relaxed">
                    Need immediate access to specific settings? Our technical support team provides priority assistance during development.
                  </p>
                  <div className="space-y-3 text-sm font-semibold">
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span><strong>Technical Support:</strong> tech-support@kemlu.go.id</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <span><strong>Emergency Hotline:</strong> (021) 3441508 ext. 555</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span><strong>Full Launch:</strong> Q2 2024 (Settings v2.0)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}