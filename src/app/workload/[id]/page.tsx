'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Clock, CheckCircle, AlertCircle, Calendar, User as UserIcon, Folder, FileText } from 'lucide-react';
import type { User, Workload } from '@/types';

interface WorkloadDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkloadDetailPage({ params }: WorkloadDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const resolvedParams = use(params);

  useEffect(() => {
    // Load workload when user is authenticated and not loading
    if (user && !authLoading) {
      loadWorkload(resolvedParams.id);
    }
  }, [user, authLoading, resolvedParams.id]);

  const loadWorkload = async (id: string) => {
    try {
      // PRIORITIZE REAL DATABASE DATA (same logic as main workload page)
      let workloadData: Workload | null = null;
      let usingDemoData = false;
      
      try {
        // Import supabase client
        const { createClientSupabaseClient } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseClient();
        
        // Fetch specific workload from database
        const { data, error } = await supabase
          .from('workload')
          .select(`
            id,
            user_id,
            nama,
            type,
            deskripsi,
            status,
            tgl_diterima,
            fungsi,
            created_at,
            updated_at
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Database error:', error.message);
          console.warn('Falling back to demo data due to database error');
          usingDemoData = true;
        } else if (data) {
          workloadData = data;
          console.log(`✅ Successfully loaded workload ${id} from DATABASE`);
        } else {
          console.warn('No data returned from database for workload:', id);
          usingDemoData = true;
        }
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        usingDemoData = true;
      }

      // Only use demo data if database completely fails
      if (usingDemoData || !workloadData) {
        const demoWorkloads: Workload[] = [
          {
            id: '1',
            user_id: '1',
            nama: 'Rifqi Maulana',
            type: 'Administrasi',
            deskripsi: 'Pengembangan aplikasi workload sistem modern untuk digitalisasi proses kerja di Direktorat HPI Sosbud.',
            status: 'done',
            tgl_diterima: '2025-11-29',
            fungsi: 'NON FUNGSI',
            created_at: '2025-11-29T08:00:00Z',
            updated_at: '2025-11-29T16:30:00Z'
          },
          {
            id: '2',
            user_id: '2',
            nama: 'Yustisia Pratiwi Pramesti',
            type: 'Tanggapan',
            deskripsi: 'Review komprehensif draft perjanjian kerjasama RI-PNG bidang sosial budaya dan pendidikan.',
            status: 'on-progress',
            tgl_diterima: '2025-11-28',
            fungsi: 'SOSTERASI',
            created_at: '2025-11-28T09:15:00Z',
            updated_at: '2025-11-29T14:20:00Z'
          }
        ];

        const foundDemoWorkload = demoWorkloads.find(w => w.id === id);
        if (foundDemoWorkload) {
          workloadData = foundDemoWorkload;
          console.log(`⚠️ Using DEMO workload for ID: ${id}`);
        }
      }

      // Set the workload data
      if (workloadData) {
        setWorkload(workloadData);
      } else {
        console.error(`❌ Workload not found: ${id}`);
        // Workload not found, redirect to list
        router.push('/workload');
        return;
      }
      
    } catch (error) {
      console.error('Error loading workload:', error);
      // On error, redirect to list
      router.push('/workload');
      return;
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </Badge>
        );
      case 'on-progress':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-2" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-4 h-4 mr-2" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Administrasi': 'bg-purple-100 text-purple-800',
      'Tanggapan': 'bg-orange-100 text-orange-800',
      'Rapat': 'bg-blue-100 text-blue-800',
      'Side Job': 'bg-gray-100 text-gray-800',
      'Persiapan Kegiatan': 'bg-pink-100 text-pink-800'
    };
    
    return (
      <Badge variant="outline" className={`${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-sm`}>
        {type}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workload details...</p>
        </div>
      </div>
    );
  }

  if (!workload) {
    return (
      <MainLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Workload Not Found</h2>
          <p className="mt-2 text-gray-600">The workload you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/workload')} className="mt-4">
            Back to Workload List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-6xl space-y-6">{/* Professional detail view - balanced content distribution */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/workload')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workload Details</h1>
              <p className="text-sm text-gray-500">View and manage workload information</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/workload/${workload.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{workload.deskripsi}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(workload.type)}
                      {getStatusBadge(workload.status)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Task Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {workload.deskripsi}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Assigned To
                    </label>
                    <p className="text-gray-900">{workload.nama}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Folder className="w-4 h-4 mr-2" />
                      Category
                    </label>
                    <p className="text-gray-900">{workload.type}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">
                      Status
                    </label>
                    {getStatusBadge(workload.status)}
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">
                      Fungsi
                    </label>
                    <p className="text-gray-900">{workload.fungsi || 'Not assigned'}</p>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date Received
                    </label>
                    <p className="text-gray-900">{formatDate(workload.tgl_diterima)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Task Created</p>
                      <p className="text-xs text-gray-500">{formatDateTime(workload.created_at)}</p>
                    </div>
                  </div>
                  
                  {workload.created_at !== workload.updated_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">{formatDateTime(workload.updated_at)}</p>
                      </div>
                    </div>
                  )}

                  {workload.status === 'done' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Task Completed</p>
                        <p className="text-xs text-gray-500">{formatDateTime(workload.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}