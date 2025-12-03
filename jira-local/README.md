# Proyek Jira Lokal (Simulasi)

Tujuan: Memberi gambaran cara kerja Jira secara praktis tanpa akses ke server Jira. Berkas di folder ini menyimulasikan konfigurasi proyek, backlog (issue), dan papan (board).

Isi folder:
- project-config.json → Konfigurasi proyek, workflow, kolom board, issue types.
- issues.csv → Daftar isu (Epic/Task) yang diambil dari ringkasan Final-Summarry.md.
- board.md → Papan Kanban/Scrum simulasi (cara memindahkan status di Jira asli adalah drag & drop).

Cara menggunakan (simulasi lokal):
1) Baca board.md untuk melihat “papan” dan status awal.
2) Kelola backlog di issues.csv: ganti kolom Status (To Do/In Progress/In Review/Done) untuk memindahkan pekerjaan.
3) Gunakan kolom Sprint untuk menandai item sprint aktif (contoh: Sprint 1) dan Parent untuk Sub-task.
4) Simulasi Scrum: pindahkan item dari To Do → In Progress → In Review → Done selama Sprint 1.

Jika ingin diimpor ke Jira asli (opsional):
- Login ke Jira Anda → Projects → Create project.
- Buat project type “Software” (Scrum atau Kanban), project key “HPI” (atau sesuai kebijakan organisasi).
- Projects → Import issues → CSV import.
- Pilih file issues.csv → Mapping kolom:
  - Summary → Summary
  - Issue Type → Issue Type
  - Description → Description
  - Priority → Priority
  - Status → Status
  - Epic Link → Epic Link (untuk isu selain Epic)
  - Labels → Labels
  - Assignee → Assignee (opsional, bisa default Unassigned)
  - Component → Component/s
- Jalankan import → Setelah selesai, buka Board dan lihat kartu berpindah antar kolom.

Rekomendasi praktik baik Jira:
- Gunakan Epic untuk inisiatif besar, pecah jadi Story/Task, tambahkan Sub-task bila perlu.
- Pertahankan deskripsi yang jelas (expected outcome, acceptance criteria).
- Gunakan label dan component untuk pemfilteran.
- Atur prioritas dan due date untuk visibilitas.
- Hubungkan commit/PR ke issue (sebut key: HPI-123) agar mudah dilacak.

Catatan keselamatan Jira:
- Kami tidak akan membuat/mengubah issue di Jira asli tanpa izin eksplisit Anda.
- Folder ini aman untuk eksplorasi lokal dan dapat dihapus kapan saja.
