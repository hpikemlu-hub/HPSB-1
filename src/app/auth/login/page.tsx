'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, Shield, Calendar, Users, BarChart3, FileCheck } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { APP_NAME, APP_DESCRIPTION } from '@/constants';
import { authenticateUser, setUserSession, createSessionData, type AuthResult } from '@/lib/auth-helpers';

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Attempting login with:', data.username);

      // Use new authentication system that supports both email and username
      const authResult = await authenticateUser(data.username, data.password);

      if (!authResult.success) {
        setError(authResult.error || 'Login gagal');
        return;
      }

      if (!authResult.user) {
        setError('Data user tidak ditemukan');
        return;
      }

      // Create and set session with complete user data
      const sessionData = createSessionData(authResult.user);
      setUserSession(sessionData);

      console.log('✅ Login successful, redirecting to:', redirectTo);
      router.push(redirectTo);

    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      title: "Workload Management",
      description: "Kelola beban kerja tim secara efisien"
    },
    {
      icon: <Calendar className="w-5 h-5 text-green-600" />,
      title: "Koordinasi Kalender",
      description: "Sinkronisasi jadwal diplomatik"
    },
    {
      icon: <Users className="w-5 h-5 text-purple-600" />,
      title: "Direktori Staff",
      description: "Manajemen data pegawai terintegrasi"
    },
    {
      icon: <FileCheck className="w-5 h-5 text-orange-600" />,
      title: "Reports & Analytics",
      description: "Laporan komprehensif dan analitik"
    },
    {
      icon: <Shield className="w-5 h-5 text-red-600" />,
      title: "Security & Audit",
      description: "Keamanan tingkat tinggi dengan audit trail"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" data-animated="login">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className={`relative flex min-h-screen transition-opacity motion-reduce:transition-none motion-reduce:opacity-100 duration-700 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Left Panel - Features Showcase */}
        <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'}`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex flex-col justify-center p-12 z-10">
            {/* Logo and Branding */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Kementerian Luar Negeri RI"
                    width={80}
                    height={80}
                    className="object-contain bg-white/10 rounded-full p-2"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{APP_NAME}</h1>
                  <p className="text-blue-200 text-sm">{APP_DESCRIPTION}</p>
                </div>
              </div>
              
              <div className="text-sm text-blue-100 mb-8">
                <div className="font-semibold">Direktorat Hukum dan Perjanjian Sosial Budaya</div>
                <div>Direktorat Hukum dan Perjanjian Sosial Budaya</div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Fitur Utama Sistem</h2>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{feature.title}</h3>
                      <p className="text-sm text-blue-100">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className={`flex-1 flex items-center justify-center p-8 lg:p-12 transform-gpu transition-all motion-reduce:transition-none motion-reduce:transform-none duration-700 ease-out delay-150 ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src="/logo.png"
                  alt="Kementerian Luar Negeri RI"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
              <p className="text-gray-600 text-sm mt-1">{APP_DESCRIPTION}</p>
            </div>

            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 motion-reduce:animate-none duration-700">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Masuk ke Sistem
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Masukkan kredensial Anda untuk mengakses sistem manajemen workload
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700 font-medium">
                      Email atau Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="email@kemlu.go.id atau username"
                      className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      {...register('username')}
                      disabled={isLoading}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        className="h-12 pr-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        {...register('password')}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-5 h-5" />
                        <span>Masuk</span>
                      </div>
                    )}
                  </Button>
                </form>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium">Keamanan Sistem</div>
                      <div className="text-blue-700">
                        Sistem ini dilindungi dengan enkripsi tingkat tinggi dan audit trail lengkap.
                        Semua aktivitas akan dicatat untuk keamanan.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500 border-t pt-4">
                  © 2025 Direktorat Hukum dan Perjanjian Sosial Budaya
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}