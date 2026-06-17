# PARAMADENAH Admin API Reference

## Base URL

```
Development: http://localhost:3000/api
Production: https://paramadenah.vercel.app/api
```

---

## Authentication

All endpoints require valid session. Use Next.js built-in auth middleware.

```typescript
// Middleware check
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## Response Format

All responses follow standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Success Example**:
```json
{
  "success": true,
  "data": {
    "id": "gedung_a",
    "name": "Gedung Nurcholis Madjid"
  }
}
```

**Error Example**:
```json
{
  "success": false,
  "error": "Gedung dengan ID tersebut tidak ditemukan"
}
```

---

## Authentication Endpoints

### POST /auth/login

Login dengan email dan password.

**Request**:
```json
{
  "email": "admin@university.ac.id",
  "password": "secure_password_123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Login berhasil",
  "redirectUrl": "/menu-utama"
}
```

**Errors**:
- 400: Email atau password salah
- 429: Terlalu banyak percobaan login

---

## Gedung (Building) Endpoints

### GET /gedung

Retrieve semua gedung.

**Query Parameters**:
```
- search?: string         // Search by name atau kode_gedung
- limit?: number          // Default: 50
- offset?: number         // Default: 0
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "gedung_a",
      "name": "Gedung Nurcholis Madjid",
      "kode_gedung": "A",
      "latitude": -6.2406,
      "longitude": 106.7942,
      "slug": "gedung-nurcholis-madjid",
      "image": "https://res.cloudinary.com/.../image.jpg",
      "total_kelas": 5
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 50,
    "offset": 0
  }
}
```

---

### GET /gedung/[id]

Retrieve detail single gedung dengan semua kelasnya.

**Path Parameters**:
```
- id: string (gedung ID atau slug)
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "gedung_a",
    "name": "Gedung Nurcholis Madjid",
    "kode_gedung": "A",
    "latitude": -6.2406,
    "longitude": 106.7942,
    "image": "https://...",
    "kelas": [
      {
        "id": "kelas_a101",
        "nama_kelas": "A101",
        "kapasitas": 40,
        "tipe": "classroom"
      }
    ]
  }
}
```

---

### POST /gedung

Create gedung baru.

**Request Body**:
```json
{
  "name": "Gedung Baru",
  "kode_gedung": "E",
  "latitude": -6.2406,
  "longitude": 106.7942,
  "image": "https://res.cloudinary.com/.../image.jpg"
}
```

**Validation Rules**:
- `name`: Required, min 3 chars
- `kode_gedung`: Required, single character, must be unique
- `latitude`: Required, -90 to 90, 4 decimal min
- `longitude`: Required, -180 to 180, 4 decimal min

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "gedung_new",
    "name": "Gedung Baru",
    "slug": "gedung-baru"
  }
}
```

**Errors**:
- 400: Validation error (lihat error message untuk detail)
- 409: Kode gedung sudah ada

---

### PUT /gedung/[id]

Update gedung.

**Path Parameters**:
```
- id: string (gedung ID)
```

**Request Body** (semua opsional):
```json
{
  "name": "Gedung Nurcholis Madjid Updated",
  "latitude": -6.2410,
  "longitude": 106.7950,
  "image": "https://..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "gedung_a",
    "updated_fields": ["name", "latitude"]
  }
}
```

---

### DELETE /gedung/[id]

Delete gedung dan semua kelasnya.

**Path Parameters**:
```
- id: string (gedung ID)
```

**Response** (200):
```json
{
  "success": true,
  "message": "Gedung berhasil dihapus"
}
```

**Errors**:
- 404: Gedung tidak ditemukan
- 409: Tidak bisa hapus gedung dengan kelas yang ada

---

## Kelas (Classroom) Endpoints

### POST /gedung/[id]/kelas

Tambah kelas ke gedung.

**Path Parameters**:
```
- id: string (gedung ID)
```

**Request Body**:
```json
{
  "nama_kelas": "A101",
  "kapasitas": 40,
  "tipe": "classroom"
}
```

**Validation Rules**:
- `nama_kelas`: Required, unique dalam gedung
- `kapasitas`: Required, 1-500
- `tipe`: "classroom" | "lab" | "office"

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "kelas_a101",
    "nama_kelas": "A101"
  }
}
```

---

### PUT /gedung/[id]/kelas/[kelasId]

Update kelas.

**Path Parameters**:
```
- id: string (gedung ID)
- kelasId: string (kelas ID)
```

**Request Body** (opsional):
```json
{
  "nama_kelas": "A101 Updated",
  "kapasitas": 45
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "kelas_a101",
    "updated_fields": ["kapasitas"]
  }
}
```

---

### DELETE /gedung/[id]/kelas/[kelasId]

Delete kelas dari gedung.

**Response** (200):
```json
{
  "success": true,
  "message": "Kelas berhasil dihapus"
}
```

---

## Fasilitas (Facility) Endpoints

### GET /fasilitas

Retrieve semua fasilitas.

**Query Parameters**:
```
- kategori?: string       // Filter by category
- search?: string         // Search by name
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "fac_cafe_a",
      "nama_fasilitas": "Cafeteria Gedung A",
      "kategori": "canteen",
      "lokasi": "Lantai 1 Gedung A",
      "image": "https://..."
    }
  ]
}
```

---

### POST /fasilitas

Create fasilitas baru.

**Request Body**:
```json
{
  "nama_fasilitas": "Cafeteria Baru",
  "deskripsi": "Cafeteria dengan menu nusantara",
  "kategori": "canteen",
  "lokasi": "Lantai 1 Gedung B",
  "image": "https://res.cloudinary.com/.../image.jpg",
  "jam_operasional": "06:30 - 21:00"
}
```

**Validation Rules**:
- `nama_fasilitas`: Required, min 3 chars, unique
- `kategori`: Required, dari standard list
- `image`: Required, valid Cloudinary URL

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "fac_new",
    "nama_fasilitas": "Cafeteria Baru"
  }
}
```

---

### PUT /fasilitas/[id]

Update fasilitas.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "fac_cafe_a",
    "updated_fields": ["jam_operasional"]
  }
}
```

---

### DELETE /fasilitas/[id]

Delete fasilitas.

**Response** (200):
```json
{
  "success": true,
  "message": "Fasilitas berhasil dihapus"
}
```

---

## Image Upload Endpoints

### POST /upload

Upload image ke Cloudinary.

**Request** (multipart/form-data):
```
- file: File (image file)
- folder: string (e.g., "gedung", "fasilitas")
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "public_id": "paramadenah/gedung/image_123",
    "width": 1200,
    "height": 800
  }
}
```

**Errors**:
- 400: No file provided
- 413: File too large (max 5MB)
- 415: Invalid file type (only images)

---

### DELETE /upload/[id]

Delete image dari Cloudinary.

**Path Parameters**:
```
- id: string (Cloudinary public_id)
```

**Response** (200):
```json
{
  "success": true,
  "message": "Image berhasil dihapus"
}
```

---

## Navigation Endpoints (Future)

### GET /navigation/route

Calculate route dari origin ke destination.

**Query Parameters**:
```
- origin_id: string        // Navigation node ID
- destination_id: string   // Gedung ID
- algorithm?: string       // "dijkstra" (default) | "astar"
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "origin": {
      "name": "Parkiran Utama",
      "latitude": -6.2415,
      "longitude": 106.7945
    },
    "destination": {
      "name": "Gedung A",
      "latitude": -6.2406,
      "longitude": 106.7942
    },
    "distance": 450,
    "estimated_time": 360,
    "waypoints": [
      { "latitude": -6.2410, "longitude": 106.7943 },
      { "latitude": -6.2408, "longitude": 106.7942 }
    ]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource dibuat |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Tidak authenticated |
| 403 | Forbidden - Tidak ada permission |
| 404 | Not Found - Resource tidak ada |
| 409 | Conflict - Data sudah ada |
| 413 | Payload Too Large - File terlalu besar |
| 415 | Unsupported Media Type - File type tidak valid |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "success": false,
  "error": "Deskripsi error singkat",
  "details": {
    "field": ["error message detil"]
  }
}
```

---

## Rate Limiting

- Public endpoints: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- Upload endpoints: 50 requests per hour

---

## CORS Policy

```
Allowed Origins:
- http://localhost:3000 (dev)
- https://paramadenah.vercel.app (production)
- https://paramadenah-flutter.netlify.app (Flutter app)
```

---

## Testing Endpoints

### Development Tools

```bash
# Using curl
curl -X GET http://localhost:3000/api/gedung \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..."

# Using Postman/Thunder Client
# Import dari: docs/postman-collection.json
```

---

## Changelog

### v1.0 (Current)
- [x] Auth endpoints
- [x] Gedung CRUD
- [x] Kelas CRUD
- [x] Fasilitas CRUD
- [x] Image upload/delete

### v1.1 (Planned)
- [ ] Navigation API
- [ ] Notification endpoints
- [ ] Advanced filtering
- [ ] Export data endpoints

---

**Last Updated**: 2026-06-15
**API Version**: 1.0
**Status**: Stable
