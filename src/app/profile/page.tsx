'use client';

import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Shield,
  Edit3,
  Camera,
  Save,
  Lock,
  Bell,
  Globe,
  Wrench,
  Code,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Award,
  Target,
  Building2,
  UserCircle2,
  Heart,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [loadingPhase, setLoadingPhase] = useState(1);

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

    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(phaseTimer);
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
              <h3 className="text-2xl font-bold text-gray-900">Loading Profile Data</h3>
              <p className="text-gray-600 text-lg">Preparing your professional profile...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="floating-icon absolute top-20 left-10 text-blue-500/50">
            <Code className={`w-8 h-8 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0s' }} />
          </div>
          <div className="floating-icon absolute top-40 right-20 text-indigo-500/50">
            <Wrench className={`w-6 h-6 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1s' }} />
          </div>
          <div className="floating-icon absolute bottom-32 left-1/4 text-purple-500/50">
            <Settings className={`w-7 h-7 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="floating-icon absolute bottom-20 right-1/3 text-cyan-500/50">
            <Zap className={`w-5 h-5 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1.5s' }} />
          </div>
          <div className="floating-icon absolute top-1/2 left-16 text-emerald-500/50">
            <Target className={`w-6 h-6 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0.8s' }} />
          </div>
          <div className="floating-icon absolute top-60 right-1/2 text-rose-500/50">
            <Heart className={`w-5 h-5 ${isAnimating ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '1.2s' }} />
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
                  <UserCircle2 className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg animate-pulse">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-full shadow-lg animate-bounce">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight gradient-text">
              Profile Management
            </h1>
            <p className="text-xl text-gray-700 font-semibold max-w-3xl mx-auto leading-relaxed mb-8">
              Professional government profile system is currently under active development by our elite engineering team
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-xl border-0 dev-hover-lift">
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                Phase {loadingPhase}: Under Development
              </Badge>
              <Badge className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold shadow-xl border-0">
                <Building2 className="w-5 h-5 mr-2" />
                Government Grade Security
              </Badge>
            </div>
          </div>

          {/* Enhanced Development Progress Section */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="dev-card border-0 shadow-2xl bg-white/20 backdrop-blur-md">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-3">
                  Development Progress Dashboard
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 font-semibold">
                  Professional profile management system with enterprise-grade security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Overall System Progress</span>
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
                    <span>🎯 Initiated</span>
                    <span>⚡ In Active Development</span>
                    <span>🚀 Nearly Production Ready</span>
                  </div>
                </div>

                {/* Enhanced Feature Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200 dev-hover-lift">
                    <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4 animate-pulse" />
                    <h3 className="font-black text-green-800 mb-2 text-lg">UI/UX Design</h3>
                    <p className="text-green-700 font-semibold">✅ Completed</p>
                    <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-full"></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200 dev-hover-lift">
                    <Code className="w-10 h-10 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="font-black text-blue-800 mb-2 text-lg">Backend API</h3>
                    <p className="text-blue-700 font-semibold">🔄 In Progress</p>
                    <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl border-2 border-purple-200 dev-hover-lift">
                    <Shield className="w-10 h-10 text-purple-600 mx-auto mb-4 animate-pulse" />
                    <h3 className="font-black text-purple-800 mb-2 text-lg">Security Layer</h3>
                    <p className="text-purple-700 font-semibold">🔒 Testing</p>
                    <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border-2 border-gray-200 dev-hover-lift">
                    <Settings className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                    <h3 className="font-black text-gray-800 mb-2 text-lg">Integration</h3>
                    <p className="text-gray-700 font-semibold">⏳ Queued</p>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full w-1/4"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Profile Preview Section */}
          <div className="max-w-7xl mx-auto mb-12">
            <Card className="dev-card border-0 shadow-2xl bg-white/15 backdrop-blur-md">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-xl shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-gray-900">
                  Professional Profile Preview
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 font-semibold">
                  Advanced government employee profile management coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Enhanced User Avatar & Info */}
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="w-40 h-40 border-4 border-white shadow-2xl">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-4xl font-black">
                            {user.nama_lengkap ? user.nama_lengkap.split(' ').map(n => n[0]).join('') : user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg cursor-not-allowed opacity-70 hover:opacity-50 transition-opacity">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-2 -left-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full shadow-lg animate-bounce">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 mt-6">
                        {user.nama_lengkap || 'Professional Government Employee'}
                      </h2>
                      <p className="text-gray-600 font-semibold text-lg">{user.email}</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <Badge className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-200 font-bold">
                          <Shield className="w-4 h-4 mr-2" />
                          {user.role || 'Government Employee'}
                        </Badge>
                        <Badge className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 font-bold">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Verified Account
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { icon: Mail, label: "Official Email", value: user.email, color: "blue" },
                        { icon: Shield, label: "Access Level", value: user.role || 'Standard Government Access', color: "green" },
                        { icon: Calendar, label: "Account Created", value: 'Recently Registered', color: "purple" },
                        { icon: Building2, label: "Department", value: 'Direktorat HPI Sosbud', color: "indigo" }
                      ].map((field, index) => (
                        <div key={index} className={`flex items-center gap-4 p-5 bg-white/60 rounded-xl border-2 border-${field.color}-200 shadow-lg dev-hover-lift`}>
                          <div className={`bg-gradient-to-br from-${field.color}-500 to-${field.color}-600 p-3 rounded-lg shadow-md`}>
                            <field.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">{field.label}</p>
                            <p className="font-black text-gray-900 text-lg">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Profile Form Preview */}
                  <div className="space-y-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        Personal Information Editor
                      </h3>
                      <p className="text-gray-600 font-semibold">Professional form interface (Preview Mode)</p>
                    </div>
                    
                    <div className="space-y-6">
                      {[
                        { label: 'Full Name', icon: User, value: user.nama_lengkap || 'Will be fully editable', placeholder: 'Enter your complete name' },
                        { label: 'Phone Number', icon: Phone, value: '+62 xxx-xxxx-xxxx', placeholder: 'Government contact number' },
                        { label: 'Office Location', icon: MapPin, value: 'Kemlu Building, Jakarta Pusat', placeholder: 'Primary work location' },
                        { label: 'Department Position', icon: Briefcase, value: 'HPI Sosbud Specialist', placeholder: 'Your role and department' },
                        { label: 'Employee ID', icon: Badge, value: user.id || 'AUTO-GENERATED-ID', placeholder: 'System generated' }
                      ].map((field, index) => (
                        <div key={index} className="space-y-3">
                          <label className="flex items-center gap-3 text-sm font-black text-gray-800 uppercase tracking-wider">
                            <field.icon className="w-5 h-5 text-blue-600" />
                            {field.label}
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={field.value}
                              placeholder={field.placeholder}
                              disabled
                              className="w-full p-4 border-2 border-gray-300 rounded-xl bg-gray-50/70 text-gray-700 font-semibold cursor-not-allowed group-hover:border-blue-300 transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                              <Lock className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-8 space-y-4 border-t-2 border-gray-200">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black py-4 text-lg shadow-xl border-0 dev-hover-lift"
                        disabled
                      >
                        <Save className="w-5 h-5 mr-3" />
                        Save Profile Changes
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          className="border-2 border-gray-300 hover:bg-gray-50 font-bold py-3 dev-hover-lift"
                          disabled
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Avatar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-2 border-gray-300 hover:bg-gray-50 font-bold py-3 dev-hover-lift"
                          disabled
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Security
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Contact & Support Section */}
          <div className="text-center space-y-8">
            <Card className="max-w-xl mx-auto dev-card border-0 shadow-2xl bg-white/25 backdrop-blur-md">
              <CardContent className="p-10">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl w-fit mx-auto shadow-xl">
                    <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">
                    Need Profile Updates?
                  </h3>
                  <p className="text-gray-700 font-semibold leading-relaxed">
                    Contact our dedicated IT Support team for immediate profile modifications during the development phase.
                  </p>
                  <div className="space-y-3 text-sm font-semibold">
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span><strong>Email:</strong> support@kemlu.go.id</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span><strong>Phone:</strong> (021) 3441508</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span><strong>Expected Launch:</strong> Q2 2024</span>
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