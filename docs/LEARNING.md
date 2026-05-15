# Yomeru — Apa yang Kita Kerjain

Dokumen ini merangkum semua perubahan yang dilakukan untuk membawa Yomeru dari aplikasi lokal single-user menjadi aplikasi web yang siap di-deploy untuk multi-user.

---

## Checkpoint 1 — Fix Critical Bugs

Benerin hal-hal yang bakal langsung crash di server manapun.

### 1.1 Hapus Hardcoded Absolute Path di `tokenizer.ts`

**File:** `apps/api/src/services/tokenizer.ts`

**Masalah:**
Kuromoji (library NLP untuk tokenisasi bahasa Jepang) butuh path ke folder dictionary-nya. Sebelumnya path-nya hardcoded seperti ini:
```
/Users/rizky/Desktop/Code/Personal/yomeru-app/node_modules/kuromoji/dict
```
Path ini hanya ada di laptop kamu. Di server manapun, path ini tidak akan pernah ada dan app akan crash.

**Fix:**
Ganti semua path hardcoded dengan `path.resolve(__dirname, ...)` yang relative dari lokasi file itu sendiri — jadi bekerja di mana saja.

**Konsep yang dipelajari:** Jangan pernah hardcode path absolut di kode. Selalu gunakan path relative atau environment variable.

---

### 1.2 Fix `NEXT_PUBLIC_API_URL` di `docker-compose.yml`

**File:** `docker-compose.yml`

**Masalah:**
Variable `NEXT_PUBLIC_API_URL` di-set ke `http://localhost:3001`. Variable yang diawali `NEXT_PUBLIC_` di Next.js bersifat spesial — nilainya di-"bake in" (ditanam) ke dalam bundle JavaScript saat proses build, dan digunakan oleh browser pengguna.

Artinya kalau di-build dengan `localhost:3001`, browser pengguna akan mencoba memanggil `localhost:3001` di komputernya sendiri — bukan ke server kamu.

**Fix:**
Ganti ke `${NEXT_PUBLIC_API_URL:-http://localhost:3001}` sehingga nilainya bisa dikonfigurasi dari environment variable. Saat deploy ke production, tinggal set ke URL API yang sebenarnya.

**Konsep yang dipelajari:** `NEXT_PUBLIC_*` variables di Next.js bukan environment variable biasa — mereka di-embed ke JavaScript bundle saat build time, bukan runtime.

---

### 1.3 Tambah `prisma migrate deploy` ke API Startup

**File:** `apps/api/Dockerfile`, `apps/api/entrypoint.sh` (file baru)

**Masalah:**
API container langsung menjalankan `node dist/index.js`. Kalau di-deploy ke server baru dengan database kosong, Prisma akan throw error karena tabel-tabel belum ada.

**Fix:**
Buat `entrypoint.sh` yang menjalankan `prisma migrate deploy` sebelum server start:
```sh
#!/bin/sh
npx prisma migrate deploy
exec node dist/index.js
```

**Konsep yang dipelajari:** Perbedaan `prisma migrate dev` (untuk development, interaktif) vs `prisma migrate deploy` (untuk production, otomatis apply semua pending migrations).

---

### 1.4 Fix Delete Endpoints Return 500 untuk Data yang Tidak Ada

**Files:** `apps/api/src/controllers/vocabs.controller.ts`, `apps/api/src/controllers/text.controller.ts`

**Masalah:**
Kalau client mencoba menghapus vocab/text dengan ID yang tidak ada di database, Prisma melempar error dengan kode `P2025`. Error ini ditangkap oleh generic error handler dan mengembalikan HTTP `500` (Internal Server Error).

`500` berarti "server rusak". Padahal situasi ini bukan server rusak — datanya memang tidak ada. Response yang benar adalah `404` (Not Found).

**Fix:**
Cek kode error Prisma sebelum return generic 500:
```typescript
} catch (error: any) {
  if (error?.code === "P2025") {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(500).json({ error: "Failed to delete" });
}
```

**Konsep yang dipelajari:** HTTP status codes punya makna spesifik. `400` = request salah, `401` = belum login, `403` = tidak punya izin, `404` = tidak ditemukan, `500` = server error. Gunakan yang tepat.

---

## Checkpoint 2 — Database Hardening

Perkuat integritas data di level database, bukan hanya di level aplikasi.

### 2.1 & 2.2 Tambah Unique Constraints

**File:** `apps/api/prisma/schema.prisma`

**Masalah:**
Duplikat dicegah hanya di level kode aplikasi:
```typescript
const isExist = await prisma.vocab.findFirst({ where: { word } });
if (isExist) return res.status(400)...
```
Kalau ada dua request datang bersamaan (race condition), keduanya bisa lolos pengecekan ini sebelum salah satunya sempat insert — menghasilkan data duplikat.

**Fix:**
Tambah constraint langsung di database schema:
```prisma
@@unique([userId, word])                          // di model Vocab
@@unique([vocabId, textId, sentence])             // di model TextVocab
```
Database akan otomatis reject insert yang duplikat, tidak peduli berapa banyak request bersamaan.

**Konsep yang dipelajari:** "Defense in depth" — validasi di aplikasi itu bagus, tapi database constraint adalah last line of defense yang tidak bisa di-bypass.

---

### 2.3 Tambah `updatedAt` ke Semua Model

**File:** `apps/api/prisma/schema.prisma`

**Masalah:**
Tidak ada cara untuk mengetahui kapan sebuah record terakhir diubah.

**Fix:**
Tambah `updatedAt DateTime @updatedAt` ke semua model. Prisma otomatis update field ini setiap kali record di-update.

**Catatan migrasi:** Karena database sudah ada data, kita tidak bisa langsung tambah kolom `NOT NULL` tanpa default value. Solusinya: tambah kolom dengan `DEFAULT NOW()` dulu untuk backfill data lama, lalu drop default-nya.

**Konsep yang dipelajari:** Prisma migrations tidak bisa selalu di-generate otomatis kalau ada existing data. Kadang perlu tulis SQL migration manual dengan strategi backfill.

---

## Checkpoint 3 — Security Hardening

Keamanan minimum sebelum app diekspos ke internet.

### 3.1 Tambah `helmet`

**File:** `apps/api/src/index.ts`

**Masalah:**
HTTP responses dari Express tidak punya security headers sama sekali.

**Fix:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

`helmet` otomatis menambahkan header-header seperti:
- `X-Frame-Options: DENY` — mencegah app di-embed di iframe (clickjacking)
- `X-Content-Type-Options: nosniff` — mencegah browser menebak content type
- `Strict-Transport-Security` — memaksa HTTPS
- Dan beberapa lagi

**Konsep yang dipelajari:** Security headers adalah lapisan pertahanan yang mudah dipasang tapi sering dilupakan.

---

### 3.2 Restrict CORS

**File:** `apps/api/src/index.ts`

**Masalah:**
`app.use(cors())` tanpa konfigurasi = semua website di dunia bisa kirim request ke API kamu. Website jahat bisa membuat pengguna yang sudah login (punya cookie/token) melakukan aksi yang tidak mereka inginkan.

**Fix:**
```typescript
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));
```

**Konsep yang dipelajari:** CORS (Cross-Origin Resource Sharing) adalah mekanisme browser untuk membatasi website mana yang boleh memanggil API kamu. Selalu whitelist origin yang spesifik di production.

---

### 3.3 Rate Limiting di `/api/tokenize`

**File:** `apps/api/src/index.ts`

**Masalah:**
Endpoint `/api/tokenize` menjalankan Kuromoji — library NLP yang CPU-intensive. Tanpa pembatasan, satu orang bisa kirim ribuan request per detik dan membuat server tidak bisa dipakai orang lain.

**Fix:**
```typescript
const tokenizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 30,             // max 30 request per menit per IP
});
app.use('/api/tokenize', tokenizeLimiter, tokenizeRouter);
```

**Konsep yang dipelajari:** Rate limiting melindungi dari abuse dan DoS (Denial of Service) attack.

---

### 3.4 Input Validation dengan Zod

**Files:** Semua files di `apps/api/src/controllers/`

**Masalah:**
Validasi input hanya berupa `if (!word || !furigana || !meaning)` — tidak ada type checking, format validation, atau protection dari unexpected input.

**Fix:**
Definisikan schema dengan Zod:
```typescript
const vocabSchema = z.object({
  word: z.string().min(1, "Word is required"),
  furigana: z.string().min(1, "Furigana is required"),
  meaning: z.string().min(1, "Meaning is required"),
  notes: z.string().optional(),
});

const result = vocabSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error.issues[0].message });
}
```

**Konsep yang dipelajari:** Never trust user input. Zod memastikan data yang masuk ke aplikasi punya bentuk dan tipe yang benar sebelum diproses.

---

### 3.5 & 3.6 Credentials dan Logging

- **Hardcoded credentials** di `docker-compose.yml` diganti dengan `${VAR:-default}` syntax
- **Prisma query logging** dimatikan di production — sebelumnya semua SQL query di-log, yang bisa expose data sensitif

---

## Checkpoint 4 — Authentication & Multi-tenancy

Perubahan terbesar — tambah user accounts dan isolasi data per user.

### Konsep Dasar: Authentication vs Authorization

- **Authentication** = siapa kamu? (login/signup)
- **Authorization** = kamu boleh akses apa? (kepemilikan data)

Kita butuh keduanya.

---

### 4.1 Tambah Model `User` dan `userId` ke Database

**File:** `apps/api/prisma/schema.prisma`

Tambah model `User` baru:
```prisma
model User {
  id        String   @id  // Clerk user ID (format: user_xxx)
  email     String   @unique
  createdAt DateTime @default(now())
}
```

Tambah `userId` ke `Vocab` dan `Text`:
```prisma
model Vocab {
  userId String @map("user_id")
  user   User   @relation(...)
  // ...
}
```

**Kenapa Clerk userId sebagai primary key?**
Daripada buat ID sendiri lalu sync dengan Clerk, lebih simpel pakai Clerk userId langsung sebagai ID di database kita. Satu sumber kebenaran.

---

### 4.2 Implementasi Auth dengan Clerk

**Kenapa Clerk?**
Clerk adalah third-party authentication service. Alternatifnya adalah bikin auth sendiri (JWT + bcrypt + session management) yang butuh waktu berminggu-minggu dan rawan bug keamanan. Clerk handle semua itu.

**Di frontend (`apps/web`):**

1. Install `@clerk/nextjs`
2. Wrap app dengan `ClerkProvider` di `layout.tsx`
3. Tambah `middleware.ts` — semua route kecuali `/sign-in` dan `/sign-up` di-protect otomatis
4. Buat halaman sign-in dan sign-up menggunakan Clerk components
5. Tambah `UserButton` di navbar untuk profile dan logout
6. Update SWR fetcher untuk kirim Bearer token di setiap request ke API

**Di backend (`apps/api`):**

1. Install `@clerk/express`
2. Tambah `clerkMiddleware()` — memverifikasi JWT token dari setiap request
3. Tambah `requireAuth()` di semua protected routes
4. Gunakan `getAuth(req)` di controllers untuk dapat `userId`

---

### 4.3 Scope Semua Queries by `userId`

**Files:** Semua files di `apps/api/src/controllers/`

Sebelum:
```typescript
const vocabs = await prisma.vocab.findMany();
```

Sesudah:
```typescript
const { userId } = getAuth(req);
const vocabs = await prisma.vocab.findMany({
  where: { userId }
});
```

Setiap create, read, update, delete sekarang di-filter by `userId` — user A tidak bisa lihat atau ubah data user B.

**Auto-upsert User record:**
Kita tidak punya webhook untuk detect user baru dari Clerk. Solusinya: setiap kali user pertama kali buat vocab atau text, kita otomatis buat record User di database kalau belum ada:
```typescript
await prisma.user.upsert({
  where: { id: userId },
  update: {},
  create: { id: userId, email: `${userId}@clerk.local` },
});
```

**Konsep yang dipelajari:** Multi-tenancy — arsitektur di mana satu aplikasi melayani banyak user dengan data yang ter-isolasi satu sama lain.

---

## Checkpoint 5 — Frontend Polish

### 5.1 Self-host Fonts via `next/font`

**Masalah:**
Font diload dari `fonts.googleapis.com`:
```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans...");
```

Ini punya beberapa masalah:
- Lambat di first load — harus request ke server Google dulu
- GDPR concern — IP address pengguna dikirim ke Google
- Butuh koneksi internet untuk load font (CDN dependency)

**Fix:**
Gunakan `next/font/google` yang otomatis men-download font saat build time dan meng-host-nya sendiri:
```typescript
import { Plus_Jakarta_Sans, Noto_Sans_JP } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});
```

**Konsep yang dipelajari:** `next/font` adalah fitur Next.js untuk self-hosting fonts — lebih cepat, tidak ada external request, GDPR-friendly.

---

### 5.2 Tambah Error Boundary

**Files:** `apps/web/src/app/error.tsx`, `apps/web/src/app/global-error.tsx`

**Masalah:**
Kalau ada error rendering di React, hasilnya adalah blank white screen tanpa penjelasan apapun.

**Fix:**
Next.js App Router punya konvensi file `error.tsx` — file ini otomatis jadi "catch" untuk error di tree di bawahnya:
```tsx
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Konsep yang dipelajari:** Error boundaries mencegah satu error merusak seluruh halaman. User mendapat pesan yang jelas dan bisa retry.

---

### 5.3 Fix SWR Retry Behavior

**Masalah:**
```typescript
shouldRetryOnError: false
```
Artinya kalau satu request gagal (misalnya karena koneksi sesaat putus), SWR langsung menyerah dan terus menampilkan error sampai user refresh halaman.

**Fix:**
```typescript
shouldRetryOnError: true,
errorRetryCount: 3,
errorRetryInterval: 5000,
```
SWR akan otomatis retry 3 kali dengan interval 5 detik sebelum menyerah.

---

## Checkpoint 6 — Docker & Build Optimization

### 6.1 & 6.2 Next.js Standalone Output

**Masalah:**
Web Docker image men-copy seluruh folder `node_modules` yang bisa mencapai 1GB+.

**Fix:**
Tambah `output: 'standalone'` di `next.config.js`. Next.js akan menganalisis dependencies yang benar-benar dipakai dan menghasilkan output minimal di `.next/standalone` — biasanya 10-20x lebih kecil.

Update Dockerfile untuk pakai output ini:
```dockerfile
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
CMD ["node", "server.js"]
```

**Konsep yang dipelajari:** Docker image yang kecil = deploy lebih cepat, biaya storage lebih murah, attack surface lebih kecil.

---

### 6.3 Tambah HEALTHCHECK ke Dockerfiles

**Masalah:**
Tanpa health check, Docker dan platform deployment (Railway, dll) tidak bisa membedakan container yang berjalan normal dengan container yang crash.

**Fix:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1
```

Platform akan otomatis restart container yang tidak healthy, dan tidak route traffic ke container yang belum siap.

**Konsep yang dipelajari:** Health checks adalah mekanisme untuk monitoring dan auto-recovery di containerized deployments.

---

## Bug Fix Post-Deploy: Tokenize Endpoint Butuh Auth Token

**Masalah:**
Setelah auth diimplementasi, semua endpoint protected butuh Bearer token. `TextEditor.tsx` dan `VocabModal.tsx` memanggil `/api/tokenize` langsung via `postJson` tanpa token — jadi request ditolak dan view mode tidak bisa tampil.

**Fix:**
Tambah `useAuth().getToken()` di kedua component dan pass token ke `postJson`:
```typescript
const { getToken } = useAuth();
const token = await getToken();
const response = await postJson("/api/tokenize", { text }, token ?? undefined);
```

**Konsep yang dipelajari:** Waktu menambahkan auth ke existing app, jangan lupa cek semua tempat yang memanggil API — bukan hanya hooks tapi juga direct fetch di components.

---

## Data Migration: Pindah Data Lama ke Akun Clerk

Saat migrasi Checkpoint 4, data lama di-assign ke user placeholder `system_migration_user`. Setelah login dengan Clerk, data tidak muncul karena Clerk userId berbeda.

**Solusi:**
Jalankan script satu kali untuk reassign data:
```typescript
await prisma.vocab.updateMany({
  where: { userId: 'system_migration_user' },
  data: { userId: 'user_3DkWq6XVpaPtNsUUU7hztbH4QxW' },
});
```

Hasilnya: 88 vocabs dan 12 texts berhasil dipindahkan.

**Konsep yang dipelajari:** Saat menambah auth ke app yang sudah ada data, selalu rencanakan strategi migrasi data yang sudah ada.

---

## Ringkasan Teknologi Baru yang Dipelajari

| Teknologi | Digunakan untuk |
|---|---|
| **Clerk** | Authentication & user management |
| **Zod** | Runtime type validation & input sanitization |
| **Helmet** | HTTP security headers |
| **express-rate-limit** | Melindungi endpoint dari abuse |
| **Prisma migrations** | Schema evolution dengan backward compatibility |
| **next/font** | Self-hosting Google Fonts |
| **Docker HEALTHCHECK** | Container health monitoring |
| **Next.js standalone output** | Optimasi ukuran Docker image |
| **Next.js error boundary** | Graceful error handling di App Router |

---

## Status Checklist

- [x] Checkpoint 1 — Fix Critical Bugs
- [x] Checkpoint 2 — Database Hardening
- [x] Checkpoint 3 — Security Hardening
- [x] Checkpoint 4 — Authentication & Multi-tenancy
- [x] Checkpoint 5 — Frontend Polish
- [x] Checkpoint 6 — Docker & Build Optimization
- [ ] Checkpoint 7 — Deploy (Vercel + Railway) — *siap dikerjain kapanpun*
- [ ] Checkpoint 8 — Post-Deploy: CI/CD, Sentry, Logging, Tests — *opsional*
