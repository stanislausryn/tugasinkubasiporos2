Todo App

Aplikasi Todo List sederhana dengan 3 service yang di-containerize menggunakan Docker dan Docker Compose.

Arsitektur

- Frontend : React 18 (Vite) + Nginx sebagai reverse proxy  (port 8080)
- Backend  : Python Flask REST API                           (port 5000)
- Database : MySQL 8.0                                       (port 3306)


Struktur Project

```
tugasinkubasiporos1/
  backend/
    app.py
    requirements.txt
    Dockerfile
  frontend/
    src/
      App.jsx
      App.css
      main.jsx
    index.html
    vite.config.js
    package.json
    nginx.conf
    Dockerfile
  database/
    init.sql
  docker-compose.yml
  .env
  .gitignore
```

Cara Menjalankan

1. Clone repository
   git clone <repository-url>
   cd tugasinkubasiporos1

2. Buat file .env (sudah tersedia template)
   DB_ROOT_PASSWORD=rootpassword
   DB_NAME=tododb

3. Build dan jalankan semua service
   docker-compose up --build -d

4. Akses aplikasi
   Frontend   : http://localhost:8080
   API Health : http://localhost:8080/api/health

5. Cek status container
   docker-compose ps

6. Lihat log
   docker-compose logs -f

7. Stop semua service
   docker-compose down


API Endpoints

GET    /api/health      -> Health check
GET    /api/todos       -> Ambil semua todo
POST   /api/todos       -> Tambah todo baru
PUT    /api/todos/:id   -> Update todo
DELETE /api/todos/:id   -> Hapus todo


Contoh Request

Tambah todo baru:
curl -X POST http://localhost:8080/api/todos -H "Content-Type: application/json" -d '{"title": "Belajar Docker"}'

Ambil semua todo:
curl http://localhost:8080/api/todos

Update todo:
curl -X PUT http://localhost:8080/api/todos/1 -H "Content-Type: application/json" -d '{"completed": true}'

Hapus todo:
curl -X DELETE http://localhost:8080/api/todos/1


Fitur Docker

- Custom network (app-network) agar semua service bisa berkomunikasi
- Persistent volume (db-data) agar data MySQL tidak hilang saat restart
- Health check pada MySQL, backend menunggu DB siap sebelum start
- Reverse proxy Nginx mem-forward /api ke Flask backend

---

### CI/CD Pipeline (GitHub Actions)

Repositori ini telah dikonfigurasi dengan otomatisasi CI/CD menggunakan **GitHub Actions** (`.github/workflows/CICD.yml`). Pipeline ini memfasilitasi proses otomatis dari pengembangan hingga *deployment*.

#### Alur Pipeline
1. **Push ke branch `dev`**: Menjalankan proses **Build** dan **Test** sebagai validasi awal kode.
2. **Pull Request dari `dev` ke `main`**: Menjalankan kembali proses **Build** dan **Test**. 
   - Jika berhasil, GitHub Actions akan **otomatis menggabungkan (automerge)** PR tersebut berkat *GitHub CLI*.
3. **Push/Merge ke branch `main`**: Menjalankan secara penuh: **Build**, **Test**, **Release** (Pembuatan dan Push Docker Image), dan **Deploy** (ke server via SSH).

> **PENTING: Syarat Automerge PR**
> Agar automerge bekerja, pastikan Anda telah mencentang opsi **"Allow auto-merge"** di *Settings > Pull Requests* pada repositori Anda. Anda juga harus memberikan izin baca dan tulis ke GitHub Actions di *Settings > Actions > General > Workflow permissions*.

#### Repository Secrets yang Dibutuhkan
Untuk menjalankan *stage* **Release** dan **Deploy**, Anda wajib menambahkan variabel rahasia berikut di repositori GitHub Anda (Buka **Settings** > **Secrets and variables** > **Actions** > **New repository secret**):

| Secret Name | Deskripsi |
| --- | --- |
| `DOCKER_USERNAME` | Username akun Docker Hub Anda. |
| `DOCKER_PASSWORD` | Password / Access Token akun Docker Hub Anda. |
| `SSH_HOST` | IP Address public dari server VPS target deployment Anda. |
| `SSH_USERNAME` | Username spesifik untuk akses SSH ke VPS Anda (misal: `root`, `ubuntu`, `nimus`). |
| `SSH_PRIVATE_KEY` | Kredensial Private Key SSH (`id_rsa` / `id_ed25519`) milik VPS. Salin seluruh isi filenya termasuk `-----BEGIN ... KEY-----` dan `-----END ... KEY-----`. |
