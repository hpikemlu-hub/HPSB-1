'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Plus,
  Calendar,
  User as UserIcon,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import type { User } from '@/types';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function EKinerjaPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    // Check for user session in localStorage
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    try {
      const sessionData = JSON.parse(currentUser);
      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        
        // Check if user is admin (E-Kinerja is admin-only)
        if (sessionData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
      } else {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      router.push('/auth/login');
      return;
    }

    // Demo data untuk testing
    const demoDocuments: Document[] = [
      {
        id: '1',
        title: 'MOU Bilateral Indonesia-Thailand',
        description: 'Draft perjanjian kerjasama bilateral dalam bidang sosial budaya',
        file_name: 'MOU_Indonesia_Thailand_2024.pdf',
        file_size: 2547832,
        file_type: 'application/pdf',
        category: 'Legal Document',
        status: 'review',
        created_by: 'Muhammad Shalahuddin Yusuf',
        created_at: '2024-12-10T09:15:00Z',
        updated_at: '2024-12-12T14:30:00Z',
        tags: ['MOU', 'Thailand', 'Bilateral', 'Social Culture'],
        priority: 'high'
      },
      {
        id: '2',
        title: 'Laporan Perjalanan Dinas ASEAN',
        description: 'Laporan lengkap hasil kunjungan kerja ke sekretariat ASEAN Jakarta',
        file_name: 'Laporan_Dinas_ASEAN_Nov2024.docx',
        file_size: 1834567,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'Report',
        status: 'approved',
        created_by: 'Amanda Yola Elvarina',
        created_at: '2024-12-08T11:20:00Z',
        updated_at: '2024-12-11T16:45:00Z',
        tags: ['ASEAN', 'Travel Report', 'Official Visit'],
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Proposal Program Pertukaran Budaya',
        description: 'Proposal program pertukaran seniman dan budayawan dengan negara ASEAN+3',
        file_name: 'Proposal_Pertukaran_Budaya_2025.pdf',
        file_size: 3245789,
        file_type: 'application/pdf',
        category: 'Proposal',
        status: 'draft',
        created_by: 'Nura Soraya',
        created_at: '2024-12-05T08:30:00Z',
        updated_at: '2024-12-09T10:15:00Z',
        tags: ['Cultural Exchange', 'ASEAN+3', 'Arts', 'Proposal'],
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Nota Diplomatik - Konsultasi Bilateral',
        description: 'Nota resmi untuk konsultasi bilateral dengan Malaysia tentang isu kebudayaan',
        file_name: 'Nota_Diplomatik_Malaysia_Dec2024.pdf',
        file_size: 987654,
        file_type: 'application/pdf',
        category: 'Official Letter',
        status: 'published',
        created_by: 'Rifqi Maulana',
        created_at: '2024-12-01T07:45:00Z',
        updated_at: '2024-12-03T09:20:00Z',
        tags: ['Diplomatic Note', 'Malaysia', 'Bilateral', 'Culture'],
        priority: 'high'
      },
      {
        id: '5',
        title: 'Evaluasi Workshop Hukum Internasional',
        description: 'Dokumen evaluasi pelaksanaan workshop training hukum internasional Q4 2024',
        file_name: 'Evaluasi_Workshop_Q4_2024.xlsx',
        file_size: 756432,
        file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        category: 'Evaluation',
        status: 'review',
        created_by: 'Yustisia Pratiwi Pramesti',
        created_at: '2024-11-28T13:10:00Z',
        updated_at: '2024-12-07T11:30:00Z',
        tags: ['Workshop', 'Evaluation', 'International Law', 'Training'],
        priority: 'low'
      }
    ];

    setDocuments(demoDocuments);
    setLoading(false);
  }, [router]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'published': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const categories = [...new Set(documents.map(doc => doc.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading E-Kinerja...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout user={user}>
      <div className={`p-6 space-y-6 max-w-none bg-gray-50 min-h-full anim-fade-in motion-reduce:transition-none motion-reduce:opacity-100 ${mounted ? '' : 'opacity-0'}`} data-animated="e-kinerja">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Kinerja</h1>
          <p className="text-gray-600">Kelola dokumen dan surat resmi HPI Sosbud</p>
        </div>
        <Link href="/e-kinerja/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Dokumen
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents.filter(d => d.status === 'draft').length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'review').length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'published').length}
                </p>
              </div>
              <Upload className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari dokumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokumen</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <Link href={`/e-kinerja/${doc.id}`}>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                            {doc.title}
                          </h4>
                        </Link>
                        {doc.description && (
                          <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                        )}
                        <p className="text-xs text-gray-400">{doc.file_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(doc.priority)}>
                      {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.created_at)}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <UserIcon className="w-3 h-3" />
                        {doc.created_by.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatFileSize(doc.file_size)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/e-kinerja/${doc.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Link href={`/e-kinerja/${doc.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDocuments.length)} dari {filteredDocuments.length} dokumen
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  );
}