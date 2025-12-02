'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function NewDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    category: '',
    status: 'draft',
    priority: 'medium',
    tags: [],
    file: null
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

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
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

    setFormData(prev => ({ ...prev, file }));
    
    // Auto-fill title if empty
    if (!formData.title && file.name) {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({ ...prev, title: nameWithoutExt }));
    }
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

      if (!formData.file) {
        alert('File dokumen wajib diupload');
        return;
      }

      // Demo: simulate file upload and API call
      console.log('Uploading document:', {
        ...formData,
        fileName: formData.file?.name,
        fileSize: formData.file?.size,
        fileType: formData.file?.type
      });
      
      // Simulate delay for file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Dokumen berhasil diupload!');
      router.push('/e-kinerja');
      
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Gagal mengupload dokumen. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/e-kinerja">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Dokumen Baru</h1>
          <p className="text-gray-600">Tambahkan dokumen resmi ke sistem E-Kinerja</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!formData.file ? (
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
                  <p>Format yang didukung: PDF, Word, Excel, PowerPoint, gambar</p>
                  <p>Maksimal ukuran file: 10MB</p>
                </div>
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
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
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
                  onValueChange={(value) => handleInputChange('status', value as any)}
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
                  onValueChange={(value) => handleInputChange('priority', value as any)}
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Tips untuk Tags:</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside">
                    <li>Gunakan kata kunci yang relevan untuk memudahkan pencarian</li>
                    <li>Contoh: "ASEAN", "Bilateral", "MOU", "Travel Report"</li>
                    <li>Maksimal 10 tags per dokumen</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Link href="/e-kinerja" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={loading || !formData.file}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengupload...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Dokumen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}