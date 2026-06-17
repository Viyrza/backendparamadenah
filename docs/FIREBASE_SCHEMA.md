# Firebase Realtime Database Schema

## Database Root Structure

```
database/
├── gedung/           # Daftar semua gedung di kampus
├── fasilitas/        # Daftar fasilitas kampus (canteen, library, etc)
├── notifications/    # Notifikasi untuk users
└── users/            # Data user (admin, mahasiswa)
```

---

## Collection: GEDUNG

### Purpose
Menyimpan informasi semua gedung di kampus beserta kelas-kelasnya.

### Schema

```typescript
// Type definition
interface Gedung {
  id: string;                    // Auto-generated unique ID
  name: string;                  // Nama lengkap gedung
  kode_gedung: string;          // Single character (A, B, C, D, dll)
  image: string;                // URL Cloudinary (thumbnail/banner)
  slug: string;                 // URL-friendly (gedung-nurcholis-madjid)
  latitude: number;             // Koordinat geografis (4 decimal min)
  longitude: number;            // Koordinat geografis (4 decimal min)
  created_at: timestamp;        // Kapan data dibuat
  updated_at?: timestamp;       // Kapan data terakhir update
  kelas?: {                     // Nested collection untuk kelas
    [klasId: string]: Kelas;
  };
}

interface Kelas {
  id: string;                   // Auto-generated unique ID
  nama_kelas: string;          // Contoh: "A101", "Lab Komputer"
  kapasitas: number;           // Jumlah tempat duduk
  tipe: string;                // "classroom" | "lab" | "office" | etc
  dosen_koordinator?: string;  // Nama dosen
  created_at: timestamp;
  updated_at?: timestamp;
}
```

### Example Data

```json
{
  "gedung_a": {
    "id": "gedung_a",
    "name": "Gedung Nurcholis Madjid",
    "kode_gedung": "A",
    "image": "https://res.cloudinary.com/.../gedung-a.jpg",
    "slug": "gedung-nurcholis-madjid",
    "latitude": -6.2406,
    "longitude": 106.7942,
    "created_at": 1708012345000,
    "updated_at": 1708012345000,
    "kelas": {
      "kelas_a101": {
        "id": "kelas_a101",
        "nama_kelas": "A101",
        "kapasitas": 40,
        "tipe": "classroom",
        "dosen_koordinator": "Dr. Ahmad",
        "created_at": 1708012345000
      },
      "kelas_a102": {
        "id": "kelas_a102",
        "nama_kelas": "A102",
        "kapasitas": 35,
        "tipe": "classroom",
        "created_at": 1708012345000
      }
    }
  },
  "gedung_b": {
    "id": "gedung_b",
    "name": "Gedung Terintegrasi",
    "kode_gedung": "B",
    "latitude": -6.2410,
    "longitude": 106.7950,
    "kelas": {}
  }
}
```

### Constraints

- ✓ `kode_gedung` harus **single character** (A, B, C, D, dst)
- ✓ `slug` harus **unique** dan lowercase dengan dash separator
- ✓ `latitude` range: `-90 to 90`
- ✓ `longitude` range: `-180 to 180`
- ✓ Koordinat minimal **4 desimal** untuk akurasi ~11 meter
- ❌ **JANGAN** simpan koordinat di level kelas (hanya di level gedung)

---

## Collection: FASILITAS

### Purpose
Menyimpan informasi fasilitas kampus seperti kafeteria, perpustakaan, minimarket, dll.

### Schema

```typescript
interface Fasilitas {
  id: string;                    // Auto-generated unique ID
  nama_fasilitas: string;       // Nama fasilitas
  deskripsi: string;            // Deskripsi detail
  kategori: string;             // "canteen" | "library" | "clinic" | "ATM" | etc
  lokasi: string;               // Lokasi deskriptif (contoh: "Lantai 1 Gedung A")
  image: string;                // URL Cloudinary
  jam_operasional?: string;     // Contoh: "08:00 - 16:00"
  kontak?: string;              // Nomor telepon/kontak
  created_at: timestamp;
  updated_at?: timestamp;
}
```

### Example Data

```json
{
  "fasilitas_cafeteria_a": {
    "id": "fasilitas_cafeteria_a",
    "nama_fasilitas": "Cafeteria Gedung A",
    "deskripsi": "Tempat makan dengan berbagai pilihan menu nusantara dan internasional",
    "kategori": "canteen",
    "lokasi": "Lantai 1 Gedung A, samping lobby utama",
    "image": "https://res.cloudinary.com/.../cafeteria.jpg",
    "jam_operasional": "06:30 - 21:00",
    "kontak": "021-1234567",
    "created_at": 1708012345000
  },
  "fasilitas_library": {
    "id": "fasilitas_library",
    "nama_fasilitas": "Perpustakaan Pusat",
    "deskripsi": "Perpustakaan dengan koleksi buku lebih dari 50.000 judul",
    "kategori": "library",
    "lokasi": "Gedung C Lantai 2-4",
    "jam_operasional": "08:00 - 17:30",
    "kontak": "021-9876543",
    "created_at": 1708012345000
  }
}
```

### Kategori Fasilitas Standard

- `canteen` - Kafeteria/Restoran
- `library` - Perpustakaan
- `clinic` - Klinik/Medical Center
- `atm` - ATM/Bank
- `parking` - Area Parkir
- `minimarket` - Minimarket/Toko
- `auditorium` - Auditorium/Aula
- `sports` - Fasilitas Olahraga
- `lab` - Laboratorium
- `office` - Kantor Administrasi

---

## Collection: NOTIFICATIONS

### Purpose
Menyimpan notifikasi sistem untuk users (maintenance alerts, schedule changes, announcements).

### Schema

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "announcement";
  target_users?: string[];     // Kosongkan untuk broadcast
  is_active: boolean;
  created_at: timestamp;
  expires_at?: timestamp;
}
```

### Example Data

```json
{
  "notif_001": {
    "id": "notif_001",
    "title": "Penutupan Gedung A",
    "message": "Gedung A ditutup untuk renovasi 1-10 Januari 2025",
    "type": "alert",
    "is_active": true,
    "created_at": 1708012345000,
    "expires_at": 1736553600000
  }
}
```

---

## Collection: USERS

### Purpose
Menyimpan data user admin dan informasi login.

### Schema

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  password_hash: string;        // Hashed password (jangan simpan plaintext!)
  is_active: boolean;
  last_login?: timestamp;
  created_at: timestamp;
  updated_at?: timestamp;
}
```

---

## Indexing Strategy

### Recommended Indexes

```
// Untuk query cepat
- gedung: /kode_gedung (karena sering filter by kode)
- fasilitas: /kategori (untuk filter fasilitas)
- notifications: /is_active, /expires_at (untuk query notifikasi aktif)
```

---

## Data Integrity Rules

1. **GEDUNG**
   - Setiap `kode_gedung` harus unik
   - Setiap `slug` harus unik
   - Koordinat tidak boleh 0,0 (invalid)
   - `image` harus URL valid Cloudinary

2. **KELAS**
   - Nama kelas tidak boleh duplikat dalam satu gedung
   - Kapasitas minimum 1, maksimum 500
   - Hanya referensi di level gedung (tidak independent)

3. **FASILITAS**
   - Nama fasilitas harus unik
   - Kategori harus dari daftar standard

4. **USERS**
   - Email harus unik
   - Password selalu di-hash sebelum simpan
   - Minimal 1 super_admin harus ada

---

## Migration Notes

### Jika Perlu Menambah Field

1. Update schema di file ini
2. Update TypeScript types di `src/lib/types/`
3. Update validation schema di `src/lib/validation/`
4. Update form components
5. Update server actions
6. Test dengan data existing di Firebase

**Contoh**: Jika menambah `deskripsi` ke Gedung:
```markdown
1. Firebase: Tambah field `deskripsi` secara manual (jika sedikit) atau script
2. TypeScript: Update interface Gedung
3. Validation: Update Zod schema
4. UI: Tambah textarea field di form
5. Test: Verify data di Firebase Console
```

---

## Backup & Recovery

- Selalu backup Firebase sebelum migrasi besar
- Gunakan Firebase Console untuk manual backup
- Test restore di environment development dulu

---

**Last Updated**: 2026-06-15
**Status**: Active
