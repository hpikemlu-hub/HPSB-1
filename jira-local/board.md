# Development Board (Simulasi Jira Lokal)

Sprint aktif: Sprint 1 (2 minggu)

Kolom Scrum:
- To Do
- In Progress
- In Review
- Done

Cara pakai (simulasi lokal):
- Pindahkan issue dengan memindahkan baris CSV dari status lamanya ke status barunya, atau tambahkan tabel markdown per kolom.
- Di Jira asli, Anda akan drag & drop kartu di board.

Ringkasan isi backlog (berasal dari Final-Summarry.md):

## To Do
- [Epic] Productionize RLS & Security (HPI-1)
- [Task] Terapkan improved RLS policies (prod) (HPI-2)
- [Task] Audit penggunaan Service Role; pastikan tidak terekspos (HPI-3)
- [Task] Middleware validasi request + sanitasi input (HPI-4)
- [Task] Rate limiting untuk API publik (HPI-5)
- [Task] Review indexing & caching untuk query berat (HPI-6)
- [Epic] Monitoring, Backup & Reliability (HPI-7)
- [Task] Setup APM, error tracking, uptime monitoring (HPI-8)
- [Task] Jadwal backup otomatis + uji restore (HPI-9)
- [Task] Latihan rollback (drill) rilis produksi (HPI-10)
- [Epic] Accessibility & Performance (HPI-11)
- [Task] Audit aksesibilitas (WCAG 2.1 AA) (HPI-12)
- [Task] Penuhi performance budget (<300ms interaksi) (HPI-13)
- [Task] Kompatibilitas browser wajib (pemerintahan) (HPI-14)
- [Epic] Calendar & Realtime Hardening (HPI-15)
- [Task] Verifikasi cron auto-complete perjalanan dinas (HPI-16)
- [Task] Uji edge case realtime (sinkron multi-klien) (HPI-17)
- [Task] Tes integrasi Calendar ↔ Workload ↔ Dashboard (HPI-18)
- [Epic] Dokumentasi & Runbook (HPI-19)
- [Task] Tambahkan OpenAPI spec untuk API (HPI-20)
- [Task] Buat Ops Playbook (alerting, on-call, SOP incident) (HPI-21)
- [Task] Materi pelatihan pengguna (panduan singkat) (HPI-22)
- [Epic] Deployment & CI/CD (HPI-23)
- [Task] Siapkan pipeline CI (lint, typecheck, tests, smoke) (HPI-24)
- [Task] E2E smoke sebelum rilis (skrip + checklist) (HPI-25)
- [Task] Release checklist & approval gate (HPI-26)

## In Progress
- [Task] Terapkan improved RLS policies (prod) (HPI-2)
- [Task] Setup APM, error tracking, uptime monitoring (HPI-8)

## In Review
- [Task] Verifikasi cron auto-complete perjalanan dinas (HPI-16)
- [Sub-task] Review semua RLS tabel prioritas (HPI-2)

## Done
- [Sub-task] Cek schedule cron & env (HPI-16)

---

## Sprint Goal
"Mengamankan akses data (RLS), menyalakan observabilitas dasar, dan menstabilkan alur realtime Calendar."

## Definition of Done (DoD)
- Kode: lulus lint + typecheck; ada test minimal/smoke; error states tertangani
- Keamanan: service role tidak terekspos; RLS diverifikasi pada tabel prioritas
- Observabilitas: error tracking aktif; healthcheck dan alert dasar tersedia
- Dokumentasi: catatan perubahan dan langkah verifikasi ringkas
- QA: smoke test rute terkait lulus; e2e minimal untuk alur terkait
