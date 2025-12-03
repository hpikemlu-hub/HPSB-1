'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Workload } from '@/types';

interface WorkloadTableProps {
  workloads: Workload[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'pending' | 'on-progress' | 'done') => void;
}

export function WorkloadTable({ workloads, onEdit, onView, onDelete, onStatusChange }: WorkloadTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'done':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Done
          </Badge>
        );
      case 'on-progress':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
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
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="w-[350px]">Nama Kegiatan</TableHead>
              <TableHead className="text-center">Jenis</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Tanggal Diterima</TableHead>
              <TableHead className="text-center">Fungsi</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workloads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Clock className="h-8 w-8 mb-2" />
                    <p>No workload found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              workloads.map((workload, index) => (
                <TableRow key={workload.id}>
                  <TableCell className="font-medium text-center">{index + 1}</TableCell>
                  <TableCell className="w-[350px]">
                    <div className="text-sm text-gray-900 break-words whitespace-normal leading-relaxed">
                      {workload.deskripsi || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getTypeBadge(workload.type)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(workload.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 text-center">
                    {formatDate(workload.tgl_diterima)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {workload.fungsi || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(workload.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(workload.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        {workload.status !== 'pending' && (
                          <DropdownMenuItem onClick={() => onStatusChange(workload.id, 'pending')}>
                            <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                            Mark as Pending
                          </DropdownMenuItem>
                        )}
                        {workload.status !== 'on-progress' && (
                          <DropdownMenuItem onClick={() => onStatusChange(workload.id, 'on-progress')}>
                            <Clock className="mr-2 h-4 w-4 text-blue-600" />
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {workload.status !== 'done' && (
                          <DropdownMenuItem onClick={() => onStatusChange(workload.id, 'done')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Mark as Done
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(workload.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workload task
              and remove the data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}