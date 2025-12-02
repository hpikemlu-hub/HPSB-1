'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Eye,
  Share2,
  Tag,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url?: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  version: number;
  download_count: number;
  comments?: Comment[];
}

interface Comment {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    // Demo data - in real app, fetch from API/Supabase
    const demoDocuments: Document[] = [
      {
        id: '1',
        title: 'MOU Bilateral Indonesia-Thailand',
        description: 'Draft perjanjian kerjasama bilateral dalam bidang sosial budaya antara Indonesia dan Thailand. Dokumen ini mencakup framework kerjasama dalam pertukaran budaya, pendidikan, dan program sosial yang akan berlangsung selama 5 tahun ke depan.',
        file_name: 'MOU_Indonesia_Thailand_2024.pdf',
        file_size: 2547832,
        file_type: 'application/pdf',
        file_url: '/documents/MOU_Indonesia_Thailand_2024.pdf',
        category: 'Legal Document',
        status: 'review',
        priority: 'high',
        created_by: 'Muhammad Shalahuddin Yusuf',
        created_at: '2024-12-10T09:15:00Z',
        updated_at: '2024-12-12T14:30:00Z',
        tags: ['MOU', 'Thailand', 'Bilateral', 'Social Culture', 'Legal'],
        version: 2,
        download_count: 15,
        comments: [
          {
            id: '1',
            user_name: 'Rifqi Maulana',
            message: 'Dokumen sudah bagus, perlu revisi minor pada pasal 5 tentang mekanisme evaluasi program.',
            created_at: '2024-12-11T10:30:00Z'
          },
          {
            id: '2',
            user_name: 'Amanda Yola Elvarina',
            message: 'Setuju dengan komentar di atas. Selain itu, perlu ditambahkan klausul tentang penyelesaian sengketa.',
            created_at: '2024-12-12T08:45:00Z'
          }
        ]
      },
      {
        id: '2',
        title: 'Laporan Perjalanan Dinas ASEAN',
        description: 'Laporan lengkap hasil kunjungan kerja ke sekretariat ASEAN Jakarta untuk evaluasi program pertukaran budaya dan penguatan jaringan diaspora Indonesia di kawasan ASEAN.',
        file_name: 'Laporan_Dinas_ASEAN_Nov2024.docx',
        file_size: 1834567,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_url: '/documents/Laporan_Dinas_ASEAN_Nov2024.docx',
        category: 'Report',
        status: 'approved',
        priority: 'medium',
        created_by: 'Amanda Yola Elvarina',
        created_at: '2024-12-08T11:20:00Z',
        updated_at: '2024-12-11T16:45:00Z',
        tags: ['ASEAN', 'Travel Report', 'Official Visit', 'Cultural Exchange'],
        version: 1,
        download_count: 8,
        comments: []
      }
    ];

    const foundDocument = demoDocuments.find(d => d.id === documentId);
    setDocument(foundDocument || null);
    setLoading(false);
  }, [documentId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  const getFileTypeName = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF Document';
    if (fileType.includes('word')) return 'Word Document';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'Excel Spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint Presentation';
    if (fileType.includes('image')) return 'Image File';
    return 'Document';
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      // Demo: simulate download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, trigger actual download
      console.log(`Downloading document: ${document?.file_name}`);
      alert('Download dimulai!');
      
      // Update download count
      if (document) {
        setDocument(prev => prev ? { ...prev, download_count: prev.download_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Gagal download dokumen. Silakan coba lagi.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      // Demo: simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Dokumen berhasil dihapus!');
      router.push('/e-kinerja');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Gagal menghapus dokumen. Silakan coba lagi.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      // Demo: simulate API call
      const comment = {
        id: Date.now().toString(),
        user_name: 'Current User',
        message: newComment.trim(),
        created_at: new Date().toISOString()
      };

      setDocument(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), comment]
      } : null);

      setNewComment('');
      alert('Komentar berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Gagal menambahkan komentar. Silakan coba lagi.');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-4">Dokumen yang Anda cari tidak ada atau telah dihapus.</p>
        <Link href="/e-kinerja">
          <Button>Kembali ke E-Kinerja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/e-kinerja">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">{getFileIcon(document.file_type)}</div>
              <Badge variant="outline">{document.category}</Badge>
              <Badge className={getStatusColor(document.status)}>
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(document.priority)}>
                {document.priority.charAt(0).toUpperCase() + document.priority.slice(1)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDownload}
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
          <Link href={`/e-kinerja/${document.id}/edit`}>
            <Button variant="outline" size="icon">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detail Dokumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
                  <p className="text-gray-900 mt-1 leading-relaxed">{document.description}</p>
                </div>
              )}

              <Separator />

              {/* File Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Informasi File</h4>
                  <Button
                    onClick={handleDownload}
                    disabled={downloadLoading}
                    className="flex items-center gap-2"
                  >
                    {downloadLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nama File:</span>
                    <p className="font-medium">{document.file_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ukuran:</span>
                    <p className="font-medium">{formatFileSize(document.file_size)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipe File:</span>
                    <p className="font-medium">{getFileTypeName(document.file_type)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Versi:</span>
                    <p className="font-medium">v{document.version}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {document.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Komentar ({document.comments?.length || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Tambahkan komentar atau catatan..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || commentLoading}
                    size="sm"
                  >
                    {commentLoading ? 'Mengirim...' : 'Kirim Komentar'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Comments List */}
              {document.comments && document.comments.length > 0 ? (
                <div className="space-y-4">
                  {document.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {comment.user_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.user_name}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateShort(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Belum ada komentar</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Singkat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Badge className={`mt-1 ${getStatusColor(document.status)}`}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Prioritas</Label>
                <Badge variant="outline" className={`mt-1 ${getPriorityColor(document.priority)}`}>
                  {document.priority.charAt(0).toUpperCase() + document.priority.slice(1)}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Dibuat Oleh</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{document.created_by}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Tanggal Dibuat</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{formatDateShort(document.created_at)}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Terakhir Diubah</Label>
                <p className="text-gray-900 mt-1">{formatDateShort(document.updated_at)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Jumlah Download</Label>
                <p className="text-gray-900 mt-1">{document.download_count}x</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleDownload}
                disabled={downloadLoading}
                variant="outline" 
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
              
              <Link href={`/e-kinerja/${document.id}/edit`} className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Dokumen
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Dokumen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium text-gray-500 ${className}`}>{children}</label>;
}