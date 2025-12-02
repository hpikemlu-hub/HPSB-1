'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Upload, 
  ArrowLeft, 
  FileText, 
  Tag, 
  AlertCircle,
  X,
  File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DocumentFormData {
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  file?: File | null;
  keepExistingFile: boolean;
}

interface Document {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  version: number;
}

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [existingDocument, setExistingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    priority: 'medium',
    tags: [],
    file: null,
    keepExistingFile: true
  });

  const categories = [
    'Legal Document',
    'Report',
    'Proposal',
    'Official Letter',
    'Evaluation',
    'Presentation',
    'Policy Document',
    'Meeting Minutes',
    'Correspondence',
    'Other'
  ];

  useEffect(() => {
    // Demo data - in real app, fetch from API/Supabase
    const demoDocuments: Document[] = [
      {
        id: '1',
        title: 'MOU Bilateral Indonesia-Thailand',
        description: 'Draft perjanjian kerjasama bilateral dalam bidang sosial budaya antara Indonesia dan Thailand. Dokumen ini mencakup framework kerjasama dalam pertukaran budaya, pendidikan, dan program sosial.',
        file_name: 'MOU_Indonesia_Thailand_2024.pdf',
        file_size: 2547832,
        file_type: 'application/pdf',
        category: 'Legal Document',
        status: 'review',
        priority: 'high',
        created_by: 'Muhammad Shalahuddin Yusuf',
        created_at: '2024-12-10T09:15:00Z',
        updated_at: '2024-12-12T14:30:00Z',
        tags: ['MOU', 'Thailand', 'Bilateral', 'Social Culture', 'Legal'],
        version: 2
      },
      {
        id: '2',
        title: 'Laporan Perjalanan Dinas ASEAN',
        description: 'Laporan lengkap hasil kunjungan kerja ke sekretariat ASEAN Jakarta untuk evaluasi program pertukaran budaya dan penguatan jaringan diaspora Indonesia.',
        file_name: 'Laporan_Dinas_ASEAN_Nov2024.docx',
        file_size: 1834567,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'Report',
        status: 'approved',
        priority: 'medium',
        created_by: 'Amanda Yola Elvarina',
        created_at: '2024-12-08T11:20:00Z',
        updated_at: '2024-12-11T16:45:00Z',
        tags: ['ASEAN', 'Travel Report', 'Official Visit', 'Cultural Exchange'],
        version: 1
      }
    ];

    const foundDocument = demoDocuments.find(d => d.id === documentId);
    if (foundDocument) {
      setExistingDocument(foundDocument);
      setFormData({
        title: foundDocument.title,
        description: foundDocument.description || '',
        category: foundDocument.category,
        status: foundDocument.status,
        priority: foundDocument.priority,
        tags: foundDocument.tags,
        file: null,
        keepExistingFile: true
      });
    }
    setPageLoading(false);
  }, [documentId]);

  const handleInputChange = (field: keyof DocumentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File terlalu besar. Maksimal 10MB.');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipe file tidak didukung. Gunakan PDF, Word, Excel, PowerPoint, atau gambar.');
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      file,
      keepExistingFile: false
    }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi form
      if (!formData.title.trim()) {
        alert('Judul dokumen wajib diisi');
        return;
      }

      if (!formData.category) {
        alert('Kategori dokumen wajib dipilih');
        return;
      }

      // Demo: simulate API call
      console.log('Updating document:', {
        id: documentId,
        ...formData,
        fileName: formData.file?.name || (formData.keepExistingFile ? existingDocument?.file_name : null),
        fileSize: formData.file?.size || (formData.keepExistingFile ? existingDocument?.file_size : null),
        fileType: formData.file?.type || (formData.keepExistingFile ? existingDocument?.file_type : null),
        newVersion: !formData.keepExistingFile
      });
      
      // Simulate delay for file upload if new file
      const delay = formData.file ? 2000 : 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      alert('Dokumen berhasil diperbarui!');
      router.push(`/e-kinerja/${documentId}`);
      
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Gagal memperbarui dokumen. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!existingDocument) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-4">Dokumen yang ingin diedit tidak ditemukan.</p>
        <Link href="/e-kinerja">
          <Button>Kembali ke E-Kinerja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/e-kinerja/${documentId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Dokumen</h1>
          <p className="text-gray-600">Perbarui informasi dan file dokumen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current File Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              File Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getFileIcon(existingDocument.file_type)}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{existingDocument.file_name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(existingDocument.file_size)} • Version {existingDocument.version}
                  </p>
                </div>
                <Badge variant="outline">Current</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Replacement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Ganti File (Opsional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.keepExistingFile && !formData.file ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">File saat ini akan tetap digunakan</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData(prev => ({ ...prev, keepExistingFile: false }))}
                >
                  Upload File Baru
                </Button>
              </div>
            ) : !formData.file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Drag & drop file di sini
                  </p>
                  <p className="text-gray-600">atau klik untuk pilih file</p>
                  <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" className="mt-2" asChild>
                      <span className="cursor-pointer">Pilih File</span>
                    </Button>
                  </label>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>Upload file baru akan membuat versi baru dokumen</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setFormData(prev => ({ ...prev, keepExistingFile: true }))}
                >
                  Batal, gunakan file lama
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(formData.file.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{formData.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(formData.file.size)} • {formData.file.type.split('/')[1].toUpperCase()}
                      </p>
                      <Badge variant="secondary" className="mt-1">File Baru</Badge>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      file: null, 
                      keepExistingFile: true 
                    }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informasi Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Dokumen *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Contoh: MOU Bilateral Indonesia-Thailand"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Jelaskan isi dan tujuan dokumen..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioritas</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tambahkan tag (tekan Enter)"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Tambah
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version Info */}
        {!formData.keepExistingFile && formData.file && (
          <Card>
            <CardContent className="p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Versi Baru Akan Dibuat</p>
                    <p>File yang diupload akan membuat versi {existingDocument.version + 1} dari dokumen ini.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Link href={`/e-kinerja/${documentId}`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {formData.file ? 'Mengupload...' : 'Menyimpan...'}
              </div>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}