Todo App - Full Stack Docker Project

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
