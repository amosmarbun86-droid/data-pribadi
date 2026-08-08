# data-pribadi

Sistem manajemen perangkat penyewa HP berbasis web + Firebase:

- `index.html` — halaman yang dibuka di HP penyewa. Perangkat terkunci sampai
  admin menyetujui, lalu penyewa memasukkan PIN untuk membuka akses. Setelah
  itu penyewa bisa menyimpan kontak, mengunggah media, dan melihat daftar APK.
- `admin.html` — panel admin untuk menyetujui/memblokir perangkat, mengatur
  PIN, dan mengelola daftar tautan APK.
- `firestore.rules` — aturan keamanan Firestore. **Ini adalah lapisan
  keamanan sesungguhnya**, bukan kode di HTML.

## Perubahan pada revisi ini (keamanan & kerapian)

1. **Login admin tidak lagi PIN hardcoded di source.** Sebelumnya PIN admin
   (`"8686"`) tertulis polos di `admin.html` dan bisa dilihat siapa saja lewat
   "View Source". Sekarang admin login memakai **Firebase Authentication**
   (email + password), dan akun tersebut baru dianggap admin jika punya
   dokumen di koleksi `admins/{uid}`.
2. **Ditambahkan `firestore.rules`.** Sebelumnya tidak ada rules sama sekali,
   artinya siapa pun yang tahu `firebaseConfig` (yang memang publik di
   source) bisa baca/tulis seluruh data langsung dari console browser.
   Sekarang akses diatur lewat Firebase Auth: setiap device hanya bisa
   membaca/menulis dokumennya sendiri, kontak hanya bisa dibaca pemiliknya,
   dan hanya admin yang bisa approve/ban/hapus device atau mengelola APK.
3. **Device ID sekarang berasal dari Firebase Anonymous Auth**, bukan
   `crypto.randomUUID()` yang disimpan di `localStorage`. Ini membuat ID
   device benar-benar terverifikasi oleh Firebase (dan cocok dengan
   `request.auth.uid` di rules), bukan sekadar string acak yang bisa
   dipalsukan/diubah manual di `localStorage`.
4. **Escaping HTML ditambahkan di semua tempat yang menampilkan input
   pengguna** (nama penyewa, kontak, nama APK, dsb.) untuk mencegah XSS —
   sebelumnya nilai-nilai ini langsung disisipkan ke `innerHTML` tanpa
   di-escape.
5. **Validasi input ditambahkan**: format nomor HP Indonesia, format email,
   PIN harus 4-8 digit angka, versi APK harus angka positif, link APK/MediaFire
   harus URL `http(s)` yang valid, batas ukuran upload file (25 MB).
6. **`app.js` dihapus.** File ini tidak pernah dipanggil dari `index.html`
   maupun `admin.html` (tidak ada `<script src="app.js">`), dan isinya
   memanggil fungsi `getDatabase()` / `updateDatabase()` yang tidak
   didefinisikan di mana pun — file ini adalah sisa versi lama yang sudah
   digantikan oleh integrasi Firebase langsung di kedua file HTML.
7. **Kerapian kode**: tombol upload/login dinonaktifkan sementara proses
   berjalan agar tidak diklik dobel, ditambahkan `rel="noopener noreferrer"`
   pada semua link `target="_blank"`, `meta description`, dan
   `meta robots: noindex` di halaman admin.

## Setup

### 1. Firebase project

Project Firebase yang dipakai: `data-pribadi-9cfe6` (lihat `firebaseConfig`
di dalam `index.html` / `admin.html`). Nilai di situ **bukan rahasia** —
Firebase memang mendesain client config untuk terlihat publik; yang menjaga
keamanan adalah Authentication + Security Rules di bawah ini.

### 2. Aktifkan metode Authentication

Di Firebase Console → **Authentication → Sign-in method**, aktifkan:

- **Anonymous** — dipakai oleh `index.html` untuk mengidentifikasi tiap HP
  penyewa.
- **Email/Password** — dipakai oleh `admin.html` untuk login admin.

### 3. Buat akun admin

Di Firebase Console → **Authentication → Users → Add user**, buat satu
akun (email + password) untuk tiap admin. Salin **UID** akun tersebut.

### 4. Tandai akun sebagai admin

Di Firebase Console → **Firestore Database**, buat koleksi `admins` dengan
dokumen ber-ID = UID admin dari langkah sebelumnya, isi bebas misalnya:

```
admins/{uid}
  role: "admin"
```

Tanpa dokumen ini, akun tetap bisa login tapi `admin.html` akan menolak dan
sign-out otomatis ("Akun ini tidak memiliki akses admin").

### 5. Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

atau tempel isi `firestore.rules` langsung ke Firebase Console → Firestore
Database → **Rules** → Publish.

### 6. Cloudinary (upload media)

Upload media di `index.html` memakai *unsigned upload preset* Cloudinary
(`CLOUD_NAME` + `UPLOAD_PRESET` di bagian bawah file). Preset unsigned
memang didesain untuk dipanggil dari client, tapi sebaiknya batasi ukuran
file dan tipe file yang diizinkan dari sisi **Cloudinary Console** juga
(Settings → Upload → preset terkait), bukan hanya dari validasi JS di
browser.

### 7. Jalankan

Karena ini situs statis, cukup buka `index.html` / `admin.html` lewat web
server lokal apa pun (mis. `npx serve .`) atau deploy ke Firebase Hosting /
Netlify / Vercel.

## Struktur data Firestore

- `devices/{uid}` — `status` (`pending` | `approved` | `banned`),
  `nama_penyewa`, `pin`, `createdAt`, `ua`.
- `kontak/{autoId}` — `nama`, `hp`, `email`, `device_id`.
- `apk/{autoId}` — `versi`, `nama`, `url`, `createdAt`.
- `admins/{uid}` — penanda akun admin (dibuat manual, lihat langkah 4).

## Struktur folder

```
data-pribadi-main/
├── README.md
├── index.html        # halaman penyewa
├── admin.html         # panel admin
├── firestore.rules    # aturan keamanan Firestore
└── .gitignore
```
