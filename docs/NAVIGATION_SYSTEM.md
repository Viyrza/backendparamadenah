# PARAMADENAH Navigation System Design

## Overview

Sistem navigasi PARAMADENAH dirancang untuk memandu user dari lokasi awal ke gedung tujuan di kampus. Sistem menggunakan koordinat geografis (latitude/longitude) dan algoritma pathfinding untuk menghitung rute terpendek.

---

## Core Principles

### 1. Manual Location Selection (NO GPS)
```
❌ TIDAK menggunakan GPS real-time sebagai sumber utama
✓ User MEMILIH lokasi awal dari daftar navigation_nodes
✓ User MEMILIH gedung tujuan dari daftar gedung
```

**Alasan**:
- Indoor positioning lebih akurat daripada GPS di area kampus
- Lebih sederhana secara teknis
- User lebih aware dengan rute mereka

### 2. Coordinates Stored at Building Level
```
Gedung (coordinate: lat, lng)
  └── Kelas 1
  └── Kelas 2
  └── Kelas 3
```

**Alasan**:
- Satu koordinat untuk satu gedung (simple)
- Tidak perlu koordinat untuk setiap kelas (overhead)
- User navigate ke gedung dulu, baru cari ruangan di dalam

### 3. Navigation Nodes as Starting Points
```
Navigation Nodes (reference points di kampus):
- Gerbang Utama
- Parkiran Utama
- Parkiran Gedung D
- Entrance Gedung A
```

**Gunanya**: User mulai dari node terdekat dengan lokasi fisik mereka.

---

## Data Model

### Navigation Nodes

```typescript
interface NavigationNode {
  id: string;
  name: string;               // "Gerbang Utama", "Parkiran Utama", "Gedung HM Jusuf Kalla"
  latitude: number;
  longitude: number;
  type: "entrance" | "parking" | "intersection" | "landmark" | "building";
  gedung_slug?: string;       // REQUIRED if type === "building" (reference to Gedung collection)
  description?: string;
  connections: Array<{ target: string, distance: number }>;
  created_at?: timestamp;
  updated_at?: timestamp;
}
```

**Example - Non-Building Node**:
```json
{
  "node_gerbang": {
    "id": "node_gerbang",
    "name": "Gerbang Utama",
    "latitude": -6.2400,
    "longitude": 106.7930,
    "type": "entrance",
    "description": "Gerbang pintu masuk kampus dari Jalan Panglima Polim",
    "connections": [
      { "target": "gedung_hm_jusuf_kalla", "distance": 150 }
    ],
    "created_at": "2025-06-15T10:00:00.000Z"
  }
}
```

**Example - Building Node**:
```json
{
  "gedung_hm_jusuf_kalla": {
    "id": 1,
    "name": "Gedung HM Jusuf Kalla",
    "latitude": -6.315900,
    "longitude": 106.907100,
    "type": "building",
    "gedung_slug": "gedung-hm-jusuf-kalla",
    "connections": [
      { "target": "kantin_gedung_d", "distance": 30 }
    ],
    "created_at": "2025-06-15T10:00:00.000Z",
    "updated_at": "2025-06-15T10:00:00.000Z"
  }
}
```

**Important Notes**:
1. Building nodes are **NOT duplicates** of gedung data - they're graph representations
2. `gedung_slug` is a reference to `gedung/[slug]` in the database
3. Coordinates in building nodes **must match** the corresponding gedung entry
4. Building nodes enable Dijkstra algorithm to calculate routes TO buildings

### Route Response

```typescript
interface RouteResponse {
  success: boolean;
  origin: {
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    latitude: number;
    longitude: number;
  };
  distance: number;            // dalam meter
  estimated_time: number;      // dalam detik
  waypoints: Array<{
    latitude: number;
    longitude: number;
    instruction?: string;
  }>;
  algorithm: "dijkstra" | "astar";
}
```

---

## User Flow

### Scenario: Mahasiswa Ingin Pergi ke Gedung A dari Parkiran

```
1. Flutter App - User membuka app
   ↓
2. Pilih Lokasi Awal
   User: "Saya di Parkiran Utama"
   → System load Navigation Nodes dari Firebase
   → User pilih: "Parkiran Utama"
   ↓
3. Pilih Gedung Tujuan
   User: "Saya mau ke Gedung A"
   → System load daftar Gedung dari Firebase
   → User pilih: "Gedung Nurcholis Madjid (A)"
   ↓
4. Request Rute
   Flutter → Backend: 
   {
     "origin_node_id": "node_parkir",
     "destination_building_id": "gedung_a",
     "algorithm": "dijkstra"
   }
   ↓
5. Backend Process
   - Ambil koordinat node dari DB
   - Ambil koordinat gedung dari DB
   - Hitung rute menggunakan Dijkstra
   - Return waypoints & instruksi
   ↓
6. Flutter Display
   - Plot origin, destination, dan waypoints di map
   - Tampilkan marker gedung
   - Show turn-by-turn navigation
   ↓
7. User Navigate
   - Follow garis rute
   - Lihat instruksi di setiap waypoint
```

---

## Pathfinding Algorithm

### Dijkstra's Algorithm

**Dipilih karena**:
- ✓ Guarantee shortest path
- ✓ Simple to implement
- ✓ Suitable untuk area terbatas (kampus)
- ✓ Efficient untuk 20-50 nodes

**Process**:
```
1. Convert kampus ke graph dengan nodes & edges
   - Nodes: Navigation Nodes + Gedung centers
   - Edges: koneksi antar nodes (distance based)

2. Run Dijkstra
   start = origin node
   end = destination building
   → calculate shortest path

3. Return waypoints dari path
```

**Example Graph**:
```
Gerbang Utama ----200m---- Gedung A
       |                        |
     100m                     50m
       |                        |
  Parkiran -----250m----- Gedung B
```

### Future: A* Algorithm

Untuk optimisasi, bisa upgrade ke A* dengan heuristic (straight-line distance):
```typescript
// A* dengan heuristic
h_score = euclidean_distance(current, goal)
f_score = g_score + h_score

// Lebih cepat untuk area besar
```

---

## Backend Implementation

### API Endpoint

```
GET /api/navigation/route

Query Parameters:
- origin_id: string        // Navigation node ID
- destination_id: string   // Gedung ID
- algorithm: "dijkstra" | "astar" (optional, default: "dijkstra")

Response:
{
  "success": true,
  "data": {
    "origin": {...},
    "destination": {...},
    "distance": 450,
    "estimated_time": 360,
    "waypoints": [...]
  }
}
```

### Server Action

```typescript
// src/actions/admin/navigation/index.ts

export async function calculateRoute(
  originNodeId: string,
  destinationBuildingId: string,
  algorithm: "dijkstra" | "astar" = "dijkstra"
) {
  // 1. Validate inputs
  // 2. Fetch origin node from Firebase
  // 3. Fetch destination building from Firebase
  // 4. Calculate route using Dijkstra
  // 5. Return waypoints
}
```

---

## Future: Navigation Nodes Collection

```
database/
├── gedung/
├── fasilitas/
├── notifications/
├── users/
└── navigation_nodes/        ← NEW
```

### Navigation Nodes Details

```json
{
  "navigation_nodes": {
    "node_gerbang": {
      "id": "node_gerbang",
      "name": "Gerbang Utama",
      "latitude": -6.2400,
      "longitude": 106.7930,
      "type": "entrance",
      "description": "Pintu masuk utama dari Jalan Panglima Polim"
    },
    "node_parkir_utama": {
      "id": "node_parkir_utama",
      "name": "Parkiran Utama",
      "latitude": -6.2415,
      "longitude": 106.7945,
      "type": "parking"
    },
    "node_gedung_d": {
      "id": "node_gedung_d",
      "name": "Entrance Gedung D",
      "latitude": -6.2450,
      "longitude": 106.8000,
      "type": "entrance"
    },
    "gedung_nurcholis_madjid_node": {
      "id": "gedung_nurcholis_madjid_node",
      "name": "Gedung Nurcholis Madjid",
      "latitude": -6.2455,
      "longitude": 106.8005,
      "type": "building",
      "gedung_slug": "gedung-nurcholis-madjid",
      "connections": []
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Coordinate Infrastructure ✓
- [x] Setup Firebase structure untuk Gedung dengan lat/lng
- [x] Admin dashboard untuk input koordinat
- [ ] Validate koordinat (bukan 0,0)

### Phase 2: Navigation Nodes (COMPLETED)
- [x] Create Firebase collection `navigation_nodes`
- [x] Admin interface untuk manage nodes
- [x] Add nodes untuk Gerbang, Parkiran, Gedung major
- [x] Support type `building` dengan reference ke gedung collection
- [x] Auto-fill coordinates dari gedung saat tipe building
- [x] Validation untuk ensure coordinates match gedung data

### Phase 3: Dijkstra Algorithm
- [ ] Implement Dijkstra di backend
- [ ] Create `/api/navigation/route` endpoint
- [ ] Test dengan berbagai start-end combinations

### Phase 4: Flutter Integration
- [ ] Flutter connect ke `/api/navigation/route`
- [ ] Display route di Google Maps / custom map
- [ ] Show turn-by-turn navigation

### Phase 5: Optimization
- [ ] A* algorithm untuk rute yang lebih cepat
- [ ] Caching untuk rute populer
- [ ] Offline mode support

---

## Distance Calculation

### Haversine Formula

Untuk menghitung jarak antara dua koordinat (dalam meter):

```typescript
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
```

---

## Edge Cases & Considerations

1. **User di luar kampus**
   - Validasi: user harus pilih dari node yang ada
   - Error handling: "Silakan pilih lokasi yang valid"

2. **Building tidak terjangkau**
   - Ensure semua gedung terhubung di graph
   - Document connection structure

3. **Coordinate accuracy**
   - Kampus area ~1-2 km²
   - 4 decimal places = ~11 meter accuracy
   - Sufficient untuk navigasi kampus

4. **Real-time updates**
   - Jika maintenance tutup akses, update graph
   - Add "restricted_areas" field ke building

---

## Testing Checklist

- [x] Test create navigation node dengan semua tipe
- [x] Test create building node dengan gedung_slug yang valid
- [x] Test create building node dengan koordinat yang tidak match
- [x] Test edit navigation node dan perubahan gedung
- [x] Test delete navigation node dengan reverse connections
- [x] Test validasi duplicate names
- [x] Test auto-fill coordinates saat pilih gedung
- [ ] Test rute dari setiap node ke setiap gedung
- [ ] Test coordinate accuracy dengan physical walk
- [ ] Test algorithm performance dengan 50+ nodes
- [ ] Test offline capability
- [ ] Test dengan kondisi kampus real (obstacles)

---

## Documentation References

- [Firebase Schema](./FIREBASE_SCHEMA.md) - Database structure
- [Navigation Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Implementation details

---

## Implementation Summary (2026-06-17)

### ✅ Completed Integration

**1. Validation Updates**
- `src/lib/validation/navigation-node.ts`
- Added discriminated unions for building vs non-building validation
- `gedung_slug` required (not optional) when type is "building"

**2. Server Actions**
- `src/actions/admin/navigation-node/index.ts`
- `createNavigationNode()`: Validate gedung exists, verify coordinates match
- `updateNavigationNode()`: Same validations for updates
- Automatic reverse connection sync for bidirectional graph

**3. Admin UI Components**
- `src/components/container/modal/navigation-node/add-navigation-node.tsx`
- Dropdown untuk pilih gedung (hanya muncul saat type = "building")
- Auto-fill name, latitude, longitude from selected gedung
- Read-only fields untuk building nodes
- Hidden inputs untuk latitude/longitude to ensure correct values sent to server

- `src/components/container/modal/navigation-node/edit-navigation-node.tsx`
- Same auto-fill logic
- Handle gedung change with DOM element updates
- Proper state management for building vs non-building types

**4. Data Structure (No Duplication)**

```json
{
  "gedung": {
    "gedung-hm-jusuf-kalla": {
      "id": 1,
      "name": "Gedung HM Jusuf Kalla",
      "kode_gedung": "D",
      "latitude": -6.315900,
      "longitude": 106.907100,
      "slug": "gedung-hm-jusuf-kalla",
      "kelas": {}
    }
  },
  "navigation_nodes": {
    "gedung_hm_jusuf_kalla": {
      "id": 1,
      "name": "Gedung HM Jusuf Kalla",
      "latitude": -6.315900,
      "longitude": 106.907100,
      "type": "building",
      "gedung_slug": "gedung-hm-jusuf-kalla",
      "connections": [
        { "target": "kantin_gedung_d", "distance": 30 }
      ]
    }
  }
}
```

**Key Points:**
- `gedung_slug` references the gedung collection
- Coordinates **must match** the gedung entry (enforced by validation)
- No data duplication - building nodes are graph representations only

**5. Table Display**
- `src/app/menu-utama/(management)/navigation-node/page.tsx`
- Added "Gedung Slug" column
- Shows gedung_slug only for building nodes
- Shows "-" for other node types

**6. Documentation**
- `docs/NAVIGATION_SYSTEM.md`
- Updated schema definitions
- Added example for building nodes
- Marked Phase 2 as COMPLETED

---

## Next Steps

**Phase 3: Dijkstra Algorithm Implementation**
1. Create `/api/navigation/route` endpoint
2. Build graph from `navigation_nodes` collection
3. Handle both regular nodes AND building nodes
4. Implement Dijkstra to calculate shortest path
5. Return waypoints for Flutter app

**Flutter Integration**
- Use `gedung_slug` to fetch building details
- Display route on map with building markers
- [API Reference](./API_REFERENCE.md) - API endpoints
- [Dijkstra Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

**Last Updated**: 2026-06-15
**Algorithm Selected**: Dijkstra (with A* planned for Phase 5)
**Coordinate Precision**: 4 decimal places minimum
**Node-Based Navigation**: YES
**GPS Integration**: NO (by design)
