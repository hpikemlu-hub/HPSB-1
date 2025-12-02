# Draft Dokumentasi: Reset/Ubah Password (Employees)

Tujuan
- Menjamin admin dan user dapat mengganti password dari halaman Employees secara real (bukan demo), terintegrasi Supabase.

Lingkup
- Folder: workload-app
- Endpoint yang digunakan:
  - Admin reset password pengguna lain: PUT /api/employees/[id]/password
  - User ganti password sendiri: POST /api/employees/password/self

Konfigurasi Wajib
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (dibutuhkan untuk operasi Admin Auth)
- Disarankan: kolom users.auth_uid (untuk mapping Auth UID). Jika belum ada, backend fallback resolve via email menggunakan Supabase Admin listUsers.

Validasi Password
- Minimal 8 karakter
- Mengandung 1 huruf besar (A-Z)
- Mengandung 1 angka (0-9)

Alur Backend (Ringkas)
- Admin reset password:
  1) Verifikasi sesi + role admin
  2) Ambil user target dari tabel users (id, nama_lengkap, email, auth_uid)
  3) Cegah self-reset via endpoint admin (pengguna gunakan self endpoint)
  4) Resolve Auth UID: gunakan users.auth_uid; jika tidak ada, resolve via email (listUsers)
  5) Panggil admin.auth.admin.updateUserById(authUserId, { password })
  6) Catat audit_log (non-blocking saat failure)

- User ganti password sendiri:
  1) Verifikasi sesi
  2) Validasi password baru
  3) Re-auth dengan currentPassword
  4) Update password user saat ini (server.auth.updateUser)
  5) Catat audit_log (non-blocking)

Langkah Uji Manual (Real, Tanpa Demo)
Persiapan:
- Siapkan 1 akun admin (Auth) dan 1 akun user biasa (Auth)
- Pastikan aplikasi berjalan dan .env.local sudah terisi kunci Supabase valid

A. Admin reset password user lain
1) Login sebagai admin di aplikasi
2) Buka halaman Employees -> pilih user non-admin -> tombol "Reset/Ubah Password Pengguna" -> isi password kuat -> Simpan
3) Verifikasi:
   - Respons success (toast)
   - Tabel audit_log mencatat aksi password_changed
   - User target dapat login memakai password baru

B. User ganti password sendiri
1) Login sebagai user biasa
2) Buka halaman Employees -> profil sendiri -> tombol "Ubah Password Saya" -> isi current password + password baru -> Simpan
3) Verifikasi:
   - Respons success (toast)
   - Reauth current password berhasil (jika salah, dapat error "Invalid current credentials")
   - User tetap login, password baru berlaku
   - audit_log mencatat password_self_changed

C. Negatif/Edge Cases
- Password tidak memenuhi syarat -> error 400 + pesan validasi
- Admin mencoba reset password sendiri via endpoint admin -> error 400, diarahkan ke self-change
- Supabase Auth update gagal -> error 500 + audit_log failure (non-blocking)

Contoh Curl
- Admin reset password (ganti {EMPLOYEE_ID} dan {NEW_PASSWORD}):
```
curl -X PUT "http://localhost:3000/api/employees/{EMPLOYEE_ID}/password" \
  -H "Content-Type: application/json" \
  -b "<cookie_sesi_admin>" \
  -d '{"newPassword":"NewPassw0rd!"}'
```

- User ganti password sendiri:
```
curl -X POST "http://localhost:3000/api/employees/password/self" \
  -H "Content-Type: application/json" \
  -b "<cookie_sesi_user>" \
  -d '{"currentPassword":"OldPassw0rd","newPassword":"NewPassw0rd!"}'
```

Catatan Implementasi Penting
- Jangan pernah menyimpan password (lama/baru) di log/audit
- Gunakan Auth UID yang benar untuk operasi Admin (jangan asumsi users.id == auth uid)
- Fallback email resolver dipakai jika kolom auth_uid belum tersedia

Checklist Verifikasi
- [ ] Admin berhasil reset password user lain (login baru berhasil)
- [ ] User berhasil ganti password sendiri
- [ ] Validasi password konsisten UI + API
- [ ] Audit_log mencatat aksi sukses/gagal
- [ ] Tidak ada error di console server/client saat alur di atas

Riwayat Perubahan
- 2025-12-03: Draf awal (Rovo Dev)
