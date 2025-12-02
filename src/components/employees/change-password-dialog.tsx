"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, KeyRound } from "lucide-react";

const selfSchema = z
  .object({
    currentPassword: z.string().min(1, "Wajib diisi"),
    newPassword: z.string().min(8, "Minimal 8 karakter").regex(/[A-Z]/, "Wajib ada huruf besar").regex(/[0-9]/, "Wajib ada angka"),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

const adminSchema = z
  .object({
    newPassword: z.string().min(8, "Minimal 8 karakter").regex(/[A-Z]/, "Wajib ada huruf besar").regex(/[0-9]/, "Wajib ada angka"),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama",
  });

export type ChangePasswordMode = "self" | "admin";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  mode: ChangePasswordMode;
  targetUserId?: string; // wajib saat mode admin
  targetUserEmail?: string; // disarankan saat mode admin untuk resolve Auth UID
}

export function ChangePasswordDialog({ open, onOpenChange, mode, targetUserId, targetUserEmail }: ChangePasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      setIsSubmitting(true);

      if (mode === "self") {
        const parsed = selfSchema.safeParse(form);
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          parsed.error.issues.forEach((i) => {
            const key = i.path[0]?.toString() || "_";
            if (!fieldErrors[key]) fieldErrors[key] = i.message;
          });
          setErrors(fieldErrors);
          return;
        }

        const res = await fetch("/api/employees/password/self", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Gagal mengubah password");
          return;
        }
        toast.success("Password berhasil diubah");
        onOpenChange(false);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        if (!targetUserId) {
          toast.error("Target user tidak valid");
          return;
        }
        const parsed = adminSchema.safeParse(form);
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          parsed.error.issues.forEach((i) => {
            const key = i.path[0]?.toString() || "_";
            if (!fieldErrors[key]) fieldErrors[key] = i.message;
          });
          setErrors(fieldErrors);
          return;
        }
        const res = await fetch(`/api/employees/${targetUserId}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: form.newPassword, targetEmail: targetUserEmail }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Gagal mengubah password pengguna");
          return;
        }
        toast.success("Password pengguna berhasil diubah");
        onOpenChange(false);
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (e) {
      toast.error("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md motion-reduce:animate-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            {mode === "self" ? "Ubah Password" : "Reset/Ubah Password Pengguna"}
          </DialogTitle>
          <DialogDescription>
            {mode === "self"
              ? "Silakan masukkan password saat ini dan password baru Anda."
              : "Anda akan mengubah password pengguna lain. Pastikan ini tindakan yang benar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "self" && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={!!errors.currentPassword}
              />
              {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.newPassword}
            />
            <p className="text-xs text-slate-500">Minimal 8 karakter, wajib ada huruf besar dan angka.</p>
            {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {mode === "admin" && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5" />
              <div>
                Tindakan sensitif. Perubahan akan dicatat pada audit log.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
