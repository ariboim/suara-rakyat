import { NewsArticle, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Budi Santoso (Admin Redaksi)',
    email: 'admin@suararakyat.id',
    role: 'admin',
    phone: '081234567890',
    city: 'Jakarta Pusat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    registeredAt: '2026-01-01T08:00:00Z',
    bio: 'Editor Pelaksana & Tim Verifikasi Fakta Redaksi Suara Rakyat',
  },
  {
    id: 'usr-citizen-1',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@gmail.com',
    role: 'citizen',
    phone: '085712349988',
    city: 'Bandung Barat',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    registeredAt: '2026-02-15T10:30:00Z',
    bio: 'Kontributor warta warga aktif Jawa Barat.',
  },
];

export const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: 'art-001',
    title: 'Gotong Royong Warga Perbaiki Jembatan Gantung Penghubung Dua Desa yang Nyaris Roboh',
    content: `Warga Desa Sukamaju dan Desa Karanganyar berinisiatif melakukan swadaya perbaikan jembatan gantung yang menjadi satu-satunya akses anak sekolah dan petani menuju pasar kecamatan. 

Setelah lebih dari tiga bulan menunggu kepastian realisasi anggaran bantuan daerah yang belum kunjung turun, puluhan warga dari kedua desa memutuskan untuk mengumpulkan material kayu kelapa, sling kawat cadangan, dan tenaga sukarela setiap akhir pekan.

"Anak-anak kami setiap pagi bertaruh nyawa menyeberangi sungai beralaskan papan lapuk. Karena debit air sungai mulai naik jelang musim hujan, kami sepakat urunan dana dan kerja bakti," ungkap Bapak Herman (52), salah seorang tokoh pemuda setempat.

Melalui laporan ini, warga berharap instansi dinas pekerjaan umum segera meninjau jembatan permanen agar mobilitas hasil bumi tidak tersendat dan keselamatan anak-anak terjamin.`,
    category: 'Infrastruktur & Layanan',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Kondisi jembatan gantung kayu yang diperbaiki secara mandiri oleh puluhan warga desa.',
    reporterName: 'Herman Kusuma (Warga Sukamaju)',
    whatsappNumber: '081298765432', // RAHASIA: Admin only
    location: 'Kabupaten Lebak, Banten',
    incidentDate: '2026-10-12',
    createdAt: '2026-10-12T09:15:00Z',
    status: 'approved',
    reviewedBy: 'Admin Redaksi',
    reviewedAt: '2026-10-12T11:00:00Z',
    authorId: 'usr-citizen-1',
    views: 1420,
    reactions: { setuju: 312, penting: 489, prihatin: 215, bagikan: 94 },
    comments: [
      {
        id: 'c-1',
        articleId: 'art-001',
        authorName: 'Rahmat Hidayat',
        authorEmail: 'rahmat@gmail.com',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahmat+Hidayat&backgroundColor=0284c7',
        authorRole: 'citizen',
        content: 'Luar biasa kekompakan warganya! Semoga segera direspons pemda setempat agar anak-anak tidak was-was saat berangkat sekolah.',
        createdAt: '2026-10-12T14:20:00Z',
        likes: 18,
        reportsCount: 0,
        isReported: false,
        isPinned: true,
      },
      {
        id: 'c-2',
        articleId: 'art-001',
        authorName: 'Dewi Lestari',
        authorEmail: 'dewi@outlook.com',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Dewi+Lestari&backgroundColor=ec4899',
        authorRole: 'citizen',
        content: 'Sangat menyentuh, keselamatan anak sekolah harus diutamakan di atas birokrasi.',
        createdAt: '2026-10-13T08:11:00Z',
        likes: 9,
        reportsCount: 0,
        isReported: false,
      },
      {
        id: 'c-3',
        articleId: 'art-001',
        authorName: 'Akun Anonim 99',
        authorEmail: 'anon99@spammail.com',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Anonim&backgroundColor=64748b',
        authorRole: 'citizen',
        content: 'Ini pasti cuma cari sensasi aja warga desanya, mending diam aja ga usah ribut.',
        createdAt: '2026-10-13T10:30:00Z',
        likes: 0,
        reportsCount: 2,
        reportReasons: ['Komentar provokatif dan tidak konstruktif', 'Spam/Troll'],
        isReported: true,
      },
    ],
    isHeadline: true,
  },
  {
    id: 'art-002',
    title: 'Petani Cabai Rawit Sukabumi Bentuk Koperasi Digital untuk Potong Rantai Tengkulak',
    content: `Komunitas petani cabai di lereng Gunung Gede Pangrango meresmikan pos komando distribusi mandiri berbasis pencatatan harga harian digital. Inovasi ini digagas guna memutus rantai pasok panjang tengkulak yang kerap mempermainkan harga beli saat musim panen raya tiba.

Kini para petani dapat memantau pergerakan harga komoditas di pasar induk Kramat Jati secara langsung melalui papan informasi digital desa. Hasil panen kemudian disortir bersama dan dikirim langsung ke jaringan pedagang sayur ritel di kota besar.

Langkah ini berhasil mendongkrak pendapatan rata-rata petani hingga 28 persen dibandingkan periode panen tahun lalu. Pendampingan literasi digital digawangi oleh mahasiswa relawan jurnalisme warga.`,
    category: 'Ekonomi & Pasar',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Petani sedang memilah hasil panen cabai berkualitas prima untuk distribusi langsung.',
    reporterName: 'Siti Rahmawati (Kontributor Komunitas)',
    whatsappNumber: '085712349988',
    location: 'Sukabumi, Jawa Barat',
    incidentDate: '2026-10-13',
    createdAt: '2026-10-13T07:45:00Z',
    status: 'approved',
    reviewedBy: 'Admin Redaksi',
    reviewedAt: '2026-10-13T08:30:00Z',
    authorId: 'usr-citizen-1',
    views: 980,
    reactions: { setuju: 420, penting: 310, prihatin: 12, bagikan: 76 },
    comments: [],
    isBreaking: true,
  },
  {
    id: 'art-003',
    title: 'Warga Keluhkan Antrean Panjang Obat di RSUD, Pasien Lansia Berharap Sistem Antrean Online Diperbaiki',
    content: `Sejumlah keluarga pasien mengeluhkan lambatnya loket pelayanan farmasi rawat jalan di RSUD rujukan kota. Pasien lansia dan penyandang disabilitas terpaksa menunggu hingga 4 sampai 5 jam hanya untuk menebus obat kronis.

Meski pihak rumah sakit telah meluncurkan aplikasi pendaftaran berbasis ponsel pintar, mesin cetak nomor antrean di lokasi sering kali mengalami gangguan teknis (server offline).

Warga mendesak manajemen rumah sakit menambah jumlah apoteker piket di loket racikan serta menyediakan fasilitas kursi roda cadangan yang memadai bagi warga senior.`,
    category: 'Kesehatan',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Keluarga pasien menunggu giliran di ruang tunggu farmasi rawat jalan.',
    reporterName: 'Bayu Prasetyo (Warga Pasien)',
    whatsappNumber: '081377889900',
    location: 'Semarang, Jawa Tengah',
    incidentDate: '2026-10-11',
    createdAt: '2026-10-11T13:20:00Z',
    status: 'approved',
    reviewedBy: 'Admin Redaksi',
    reviewedAt: '2026-10-11T15:00:00Z',
    authorId: 'usr-citizen-1',
    views: 1850,
    reactions: { setuju: 610, penting: 530, prihatin: 412, bagikan: 110 },
    comments: [],
  },
  {
    id: 'art-004',
    title: 'Aksi Bersih Pantai & Pembibitan 5.000 Pohon Mangrove oleh Relawan Pesisir Rembang',
    content: `Pesisir utara Jawa Tengah terus terancam abrasi pantai akibat terjangan ombak pasang. Menjawab ancaman tersebut, kelompok nelayan muda dan ratusan pelajar menggelar aksi penanaman serentak 5.000 bibit mangrove jenis Rhizophora.

Selain menanam, relawan juga mengangkut lebih dari 2,4 ton sampah plastik anorganik yang tersangkut di bibir pantai. Gerakan ini merupakan bagian dari kampanye 'Laut Kita Masa Depan Kita' yang diinisiasi oleh komunitas lokal tanpa menggunakan dana sponsor asing.

Masyarakat sekitar berkomitmen merawat tanaman bibit secara bergilir setiap dua pekan sekali hingga mangrove tumbuh kokoh.`,
    category: 'Lingkungan & Bencana',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Penanaman bibit mangrove di kawasan pesisir untuk mencegah abrasi pantai.',
    reporterName: 'Anwar Sadat (Pegiat Pesisir)',
    whatsappNumber: '082155667788',
    location: 'Rembang, Jawa Tengah',
    incidentDate: '2026-10-10',
    createdAt: '2026-10-10T11:00:00Z',
    status: 'approved',
    reviewedBy: 'Admin Redaksi',
    reviewedAt: '2026-10-10T12:15:00Z',
    authorId: 'usr-citizen-1',
    views: 740,
    reactions: { setuju: 390, penting: 240, prihatin: 8, bagikan: 45 },
    comments: [],
  },
  {
    id: 'art-005',
    title: 'Jalan Provinsi Penghubung Sentra Sayur Rusak Parah Berlubang, Truk Angkutan Sering Terguling',
    content: `Ruas jalan provinsi sepanjang 7 kilometer di jalur lingkar timur mengalami kerusakan parah dengan kubangan lumpur sedalam 30 centimeter. Kondisi ini telah berlangsung hampir 6 bulan tanpa adanya perbaikan tambal sulam yang berarti.

Menurut warga setempat, dalam kurun waktu satu bulan terakhir tercatat sudah ada 4 truk muatan hasil bumi yang terperosok dan as rodanya patah. Hal ini mengakibatkan kerugian puluhan juta rupiah bagi sopir dan pedagang sayur.

Warga telah memasang rambu peringatan darurat dari ban bekas dan meminta dinas bina marga segera mengerahkan alat berat sebelum musim penghujan mencapai puncaknya.`,
    category: 'Infrastruktur & Layanan',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Salah satu titik jalan berlubang yang ditandai warga dengan pohon pisang dan drum bekas.',
    reporterName: 'Dedi Mulyadi (Pengemudi Ekspedisi)',
    whatsappNumber: '081909876543', // NOMOR WA PRIVAT: Admin only
    location: 'Magelang, Jawa Tengah',
    incidentDate: '2026-10-14',
    createdAt: '2026-10-14T01:30:00Z',
    status: 'pending', // READY FOR ADMIN MODERATION IN DEMO
    authorId: 'usr-citizen-1',
    views: 0,
    reactions: { setuju: 0, penting: 0, prihatin: 0, bagikan: 0 },
    comments: [],
  },
  {
    id: 'art-006',
    title: 'Ruang Kelas SD Negeri 3 Ambruk Dini Hari, 48 Siswa Belajar Sementara di Tenda Darurat',
    content: `Atap dua ruang kelas di SDN 3 Kalibening ambruk akibat kerangka atap kayu yang sudah lapuk dimakan rayap. Beruntung peristiwa ini terjadi pada pukul 03.15 WIB dini hari sehingga tidak menimbulkan korban jiwa dari kalangan murid maupun guru.

Untuk memastikan kegiatan belajar mengajar (KBM) tidak terhenti, pihak sekolah bersama Badan Penanggulangan Bencana Daerah (BPBD) mendirikan tenda darurat di lapangan upacara.

Kepala sekolah menyatakan telah mengajukan proposal renovasi sejak setahun lalu, namun belum mendapatkan giliran alokasi DAK. Para orang tua murid mendesak prioritas perbaikan gedung sebelum ujian semester.`,
    category: 'Pendidikan',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Tenda darurat yang disiapkan untuk tempat belajar mengajar sementara para siswa.',
    reporterName: 'Nuraini (Komite Sekolah)',
    whatsappNumber: '087812344321', // NOMOR WA PRIVAT: Admin only
    location: 'Banjarnegara, Jawa Tengah',
    incidentDate: '2026-10-13',
    createdAt: '2026-10-13T22:10:00Z',
    status: 'pending', // READY FOR ADMIN MODERATION IN DEMO
    authorId: 'usr-citizen-1',
    views: 0,
    reactions: { setuju: 0, penting: 0, prihatin: 0, bagikan: 0 },
    comments: [],
  },
  {
    id: 'art-007',
    title: 'Secangkir Kopi Pagi dan Surat yang Tertinggal di Bawah Trembesi',
    content: `Kabut tipis masih mengapung di atas pematang sawah ketika Pak Darmo membuka pintu kedai bambunya. Jam dinding tua berdetak malas, menunjukkan pukul lima lebih seperempat. Di sudut bangku kayu panjang yang menghadap ke jalan desa, sebuah cangkir seng bermotif lurik hijau telah menanti air mendidih.

Pagi itu berbeda dari pagi-pagi biasanya. Di bawah asbak tanah liat, Pak Darmo menemukan selembar kertas bergaris yang dilipat empat. Tulisan tangannya rapi, bertinta biru khas pulpen bocah sekolah:

"Pak Darmo, terima kasih untuk singkong rebus hangat setiap kali saya kehujanan sepulang mengajar di seberang bukit. Hari ini saya pamit ke kota untuk mengurus surat pindah dinas. Jangan lupa siram bunga kamboja di depan kedai, wanginya selalu mengingatkan saya bahwa ketulusan orang desa adalah benteng terakhir harapan bangsa ini."

Pak Darmo terdiam. Tangannya yang kasar menyentuh permukaan kertas itu perlahan. Di luar kedai, angin pegunungan bertiup lembut menggugurkan dedaunan trembesi. Sambil menyeruput kopi hitam pahit tanpa gula buatannya sendiri, lelaki tua itu tersenyum simpul menatap jalan setapak berdebu.

Ada kehangatan yang tak bisa ditakar oleh materi di tanah ini—kehangatan yang mengalir dari hati ke hati, tanpa pernah menuntut balas.`,
    category: 'Cerpen (Cerita Pendek)',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ilustrasi pena, buku catatan, dan secangkir kopi hangat di pagi hari yang tenang.',
    reporterName: 'Agus Pratama (Penulis Sastra Warga)',
    whatsappNumber: '081399887766',
    location: 'Wonosobo, Jawa Tengah',
    incidentDate: '2026-10-14',
    createdAt: '2026-10-14T06:00:00Z',
    status: 'approved',
    reviewedBy: 'Admin Redaksi',
    reviewedAt: '2026-10-14T07:15:00Z',
    authorId: 'usr-citizen-1',
    views: 620,
    reactions: { setuju: 180, penting: 95, prihatin: 12, bagikan: 64 },
    comments: [
      {
        id: 'c-cerpen-1',
        articleId: 'art-007',
        authorName: 'Kartika Sari',
        authorEmail: 'kartika.sari@gmail.com',
        authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Kartika+Sari&backgroundColor=ec4899',
        authorRole: 'citizen',
        content: 'Bahasanya sangat menyentuh dan puitis! Rubrik cerpen ini sangat menyegarkan di sela-sela berita faktual warga. Maju terus sastra Nusantara.',
        createdAt: '2026-10-14T08:30:00Z',
        likes: 14,
        reportsCount: 0,
        isReported: false,
      },
    ],
  },
];
