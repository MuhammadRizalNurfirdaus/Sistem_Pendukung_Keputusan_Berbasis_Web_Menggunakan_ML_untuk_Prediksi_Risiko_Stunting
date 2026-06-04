import { Elysia, t } from "elysia";

const app = new Elysia();

// ============================================================
// Supabase Configuration
// ============================================================
const SUPABASE_URL = "https://lrepbmsdfvfkxeemfkpx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZXBibXNkZnZma3hlZW1ma3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTAyNjQsImV4cCI6MjA5NTg4NjI2NH0.0SGgJm3gnXStNK-xrdpk32l4EqHaqVgwauU657MCTT8";

// Simple Supabase REST helper (zero-dependency)
async function supabaseQuery(table: string, options: {
  method?: string;
  body?: any;
  select?: string;
  filters?: string;
  single?: boolean;
} = {}) {
  const { method = "GET", body, select = "*", filters = "", single = false } = options;
  
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filters) url += `&${filters}`;
  
  const headers: Record<string, string> = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : "return=minimal",
  };
  
  if (single) {
    headers["Accept"] = "application/vnd.pgrst.object+json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errText}`);
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// History is now stored in Supabase 'predictions' table (per-user)

// Manual CORS implementation for simple, zero-dependency reliability
app.onRequest(({ set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
});

app.options("*", ({ set }) => {
  set.headers["Access-Control-Allow-Origin"] = "*";
  set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
  set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  return "";
});

// Hello / Status Check
app.get("/", () => {
  return {
    status: "online",
    message: "Sistem Pendukung Keputusan Stunting Balita API is running smoothly!",
    timestamp: new Date().toISOString()
  };
});

// ============================================================
// AUTH API - Login only (single account, no registration)
// ============================================================

// POST /api/auth/login - Login user (username or email)
app.post("/api/auth/login", async ({ body, set }) => {
  const { username, password } = body;

  if (!username || !password) {
    set.status = 400;
    return { error: "Username/email dan password harus diisi." };
  }

  try {
    // Determine if input is email or username
    const input = username.trim().toLowerCase();
    const isEmail = input.includes("@");
    const filterField = isEmail ? "email" : "username";

    // Find user by username or email
    let user;
    try {
      user = await supabaseQuery("users", {
        filters: `${filterField}=eq.${encodeURIComponent(input)}`,
        single: true,
      });
    } catch {
      set.status = 401;
      return { error: "Username/email atau password salah." };
    }

    if (!user) {
      set.status = 401;
      return { error: "Username/email atau password salah." };
    }

    // Verify password with bcrypt
    const isValid = await Bun.password.verify(password, user.password);
    if (!isValid) {
      set.status = 401;
      return { error: "Username/email atau password salah." };
    }

    console.log(`✅ User logged in: ${user.username} (${user.email})`);

    return {
      success: true,
      message: "Login berhasil!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    set.status = 500;
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}, {
  body: t.Object({
    username: t.String(),
    password: t.String(),
  })
});

// GET /api/education - Educational content and tips
app.get("/api/education", () => {
  return [
    {
      id: "1",
      title: "Mengenal Stunting dan Pencegahannya sejak 1000 HPK",
      category: "Dasar Kesehatan",
      summary: "Stunting adalah gangguan pertumbuhan kronis pada anak. Pencegahan paling efektif harus dimulai sejak 1000 Hari Pertama Kehidupan (HPK).",
      content: "Stunting ditandai dengan tinggi badan anak yang berada di bawah standar pertumbuhan WHO untuk usianya akibat kekurangan gizi kronis, infeksi berulang, dan stimulasi psikososial yang kurang. Pencegahan stunting dimulai dari masa kehamilan ibu (pemenuhan gizi seimbang, asam folat, zat besi), pemberian ASI Eksklusif selama 6 bulan, dilanjutkan dengan MPASI kaya protein hewani berkualitas tinggi, serta imunisasi lengkap dan sanitasi air bersih yang baik.",
      author: "Kementerian Kesehatan RI",
      readTime: "5 menit",
      image: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2",
      title: "Peran Protein Hewani sebagai Booster Tinggi Badan Anak",
      category: "Nutrisi & Gizi",
      summary: "Mengapa telur, susu, dan ikan sangat efektif mencegah stunting? Simak keunggulan asam amino esensial hewani berikut ini.",
      content: "Protein hewani mengandung asam amino esensial lengkap dan rasio kecernaan yang tinggi. Asam amino esensial seperti lisin dan leusin berperan langsung dalam merangsang sekresi hormon pertumbuhan IGF-1 (Insulin-like Growth Factor 1) di lempeng epifisis tulang panjang anak. Memberikan minimal satu butir telur setiap hari, dipadukan dengan ikan lokal seperti kembung atau lele, sangat direkomendasikan secara klinis oleh dokter anak untuk mencegah gagal tumbuh (growth faltering).",
      author: "Persatuan Ahli Gizi Indonesia (PERSAGI)",
      readTime: "4 menit",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      title: "Panduan Standard WHO untuk Pengukuran Tinggi Badan Balita di Rumah",
      category: "Pedoman Pengukuran",
      summary: "Pengukuran tinggi yang salah menyebabkan hasil deteksi bias. Lakukan langkah-langkah medis berikut secara presisi.",
      content: "1. Untuk anak usia di bawah 2 tahun (0-23 bulan), pengukuran dilakukan dengan cara berbaring (menggunakan length board/papan ukur).\n2. Untuk anak usia di atas 2 tahun, pengukuran dilakukan tegak berdiri dengan microtoise.\n3. Sebelum diukur, lepaskan sepatu, kaus kaki tebal, topi, kuncir rambut tebal, atau popok tebal.\n4. Saat posisi berdiri, pastikan lima titik tubuh anak menempel tegak pada tiang/dinding pengukur: bagian belakang kepala, punggung, pantat, betis, dan tumit.\n5. Pandangan mata lurus ke depan, turunkan batas ukur secara perlahan hingga menyentuh puncak kepala anak, lalu catat angka hingga ketelitian 0,1 cm.",
      author: "World Health Organization (WHO)",
      readTime: "6 menit",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"
    }
  ];
});

// GET /api/history - Retrieve saved predictions from Supabase (per-user)
app.get("/api/history", async ({ query, set }) => {
  const userId = query.user_id;
  if (!userId) {
    set.status = 400;
    return { error: "user_id diperlukan" };
  }

  try {
    const predictions = await supabaseQuery("predictions", {
      filters: `user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
    });

    // Map snake_case DB columns to camelCase frontend format
    return (predictions || []).map((p: any) => ({
      id: p.id,
      nama: p.nama,
      umur: p.umur,
      jenisKelamin: p.jenis_kelamin,
      bbAwal: p.bb_awal,
      tbAwal: p.tb_awal,
      bbAkhir: p.bb_akhir,
      tbAkhir: p.tb_akhir,
      lamaPantau: p.lama_pantau,
      kecepatanBB: p.kecepatan_bb,
      kecepatanTB: p.kecepatan_tb,
      rasioBBTBAkhir: p.rasio_bb_tb_akhir,
      lingkarKepala: p.lingkar_kepala,
      lingkarLengan: p.lingkar_lengan,
      zScore: p.z_score,
      medianWHO: p.median_who,
      minus2SD: p.minus_2sd,
      minus3SD: p.minus_3sd,
      stuntingLabel: p.stunting_label,
      severity: p.severity,
      nutritionalStatus: p.nutritional_status,
      nutritionalLabel: p.nutritional_label,
      status: p.status,
      probability: p.probability,
      tipe: p.tipe,
      createdAt: p.created_at,
    }));
  } catch (error: any) {
    console.error("Failed to fetch history:", error);
    set.status = 500;
    return { error: "Gagal mengambil riwayat pemeriksaan." };
  }
});

// DELETE /api/history/:id - Delete a saved prediction from Supabase
app.delete("/api/history/:id", async ({ params, set }) => {
  const { id } = params;
  if (!id) {
    set.status = 400;
    return { error: "ID riwayat harus disertakan" };
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/predictions?id=eq.${encodeURIComponent(id)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase delete error: ${errText}`);
    }

    return { success: true, message: "Riwayat pemeriksaan berhasil dihapus", id };
  } catch (error: any) {
    console.error("Delete history error:", error);
    set.status = 500;
    return { error: "Gagal menghapus riwayat pemeriksaan." };
  }
});


// ============================================================
// WHO Child Growth Standards - Length/Height-for-Age (0-60 months)
// Data Source: WHO Multicentre Growth Reference Study (MGRS)
// https://www.who.int/tools/child-growth-standards/standards
//
// LMS Parameters: L (Box-Cox power), M (Median), S (Coefficient of Variation)
// Z-Score Formula: Z = ((Y/M)^L - 1) / (L × S)
//   where Y = observed height/length
// Stunting: HAZ < -2 SD
// Severe Stunting: HAZ < -3 SD
// ============================================================

// WHO LMS tables: [L, M, S] indexed by age in months (0-60)
// Boys: Length/Height-for-Age (lhfa_boys_p_exp.txt)
const WHO_LMS_BOYS: [number, number, number][] = [
  [1, 49.8842, 0.03795],  // 0 months
  [1, 54.7244, 0.03557],  // 1
  [1, 58.4249, 0.03424],  // 2
  [1, 61.4292, 0.03328],  // 3
  [1, 63.8860, 0.03257],  // 4
  [1, 65.9026, 0.03204],  // 5
  [1, 67.6236, 0.03165],  // 6
  [1, 69.1645, 0.03139],  // 7
  [1, 70.5994, 0.03124],  // 8
  [1, 71.9687, 0.03117],  // 9
  [1, 73.2812, 0.03118],  // 10
  [1, 74.5388, 0.03126],  // 11
  [1, 75.7488, 0.03138],  // 12
  [1, 76.9186, 0.03154],  // 13
  [1, 78.0497, 0.03174],  // 14
  [1, 79.1458, 0.03197],  // 15
  [1, 80.2113, 0.03222],  // 16
  [1, 81.2487, 0.03248],  // 17
  [1, 82.2587, 0.03275],  // 18
  [1, 83.2418, 0.03303],  // 19
  [1, 84.1996, 0.03331],  // 20
  [1, 85.1348, 0.03359],  // 21
  [1, 86.0477, 0.03388],  // 22
  [1, 86.9412, 0.03417],  // 23
  [1, 87.8161, 0.03446],  // 24 (switch recumbent→standing: -0.7cm already in WHO data)
  [1, 88.4721, 0.03468],  // 25
  [1, 89.1309, 0.03490],  // 26
  [1, 89.7932, 0.03513],  // 27
  [1, 90.4590, 0.03536],  // 28
  [1, 91.1282, 0.03559],  // 29
  [1, 91.8013, 0.03582],  // 30
  [1, 92.4781, 0.03606],  // 31
  [1, 93.1587, 0.03630],  // 32
  [1, 93.8429, 0.03654],  // 33
  [1, 94.5304, 0.03679],  // 34
  [1, 95.2212, 0.03704],  // 35
  [1, 95.9156, 0.03729],  // 36
  [1, 96.6132, 0.03754],  // 37
  [1, 97.3140, 0.03779],  // 38
  [1, 98.0177, 0.03805],  // 39
  [1, 98.7245, 0.03831],  // 40
  [1, 99.4343, 0.03856],  // 41
  [1, 100.1472, 0.03882], // 42
  [1, 100.8632, 0.03908], // 43
  [1, 101.5817, 0.03934], // 44
  [1, 102.3028, 0.03960], // 45
  [1, 103.0254, 0.03986], // 46
  [1, 103.7496, 0.04012], // 47
  [1, 104.4752, 0.04038], // 48
  [1, 105.2013, 0.04064], // 49
  [1, 105.9283, 0.04089], // 50
  [1, 106.6551, 0.04115], // 51
  [1, 107.3820, 0.04141], // 52
  [1, 108.1087, 0.04166], // 53
  [1, 108.8340, 0.04191], // 54
  [1, 109.5579, 0.04216], // 55
  [1, 110.2801, 0.04241], // 56
  [1, 110.9993, 0.04265], // 57
  [1, 111.7158, 0.04290], // 58
  [1, 112.4283, 0.04314], // 59
  [1, 113.1380, 0.04338], // 60
];

// Girls: Length/Height-for-Age (lhfa_girls_p_exp.txt)
const WHO_LMS_GIRLS: [number, number, number][] = [
  [1, 49.1477, 0.03790],  // 0 months
  [1, 53.6872, 0.03614],  // 1
  [1, 57.0673, 0.03568],  // 2
  [1, 59.8029, 0.03541],  // 3
  [1, 62.0899, 0.03527],  // 4
  [1, 64.0301, 0.03520],  // 5
  [1, 65.7311, 0.03520],  // 6
  [1, 67.2873, 0.03524],  // 7
  [1, 68.7498, 0.03533],  // 8
  [1, 70.1435, 0.03546],  // 9
  [1, 71.4818, 0.03562],  // 10
  [1, 72.7710, 0.03582],  // 11
  [1, 74.0153, 0.03604],  // 12
  [1, 75.2170, 0.03628],  // 13
  [1, 76.3817, 0.03654],  // 14
  [1, 77.5109, 0.03681],  // 15
  [1, 78.6055, 0.03710],  // 16
  [1, 79.6713, 0.03739],  // 17
  [1, 80.7079, 0.03769],  // 18
  [1, 81.7182, 0.03799],  // 19
  [1, 82.7065, 0.03829],  // 20
  [1, 83.6742, 0.03860],  // 21
  [1, 84.6235, 0.03890],  // 22
  [1, 85.5577, 0.03920],  // 23
  [1, 86.4778, 0.03950],  // 24
  [1, 86.9991, 0.03973],  // 25
  [1, 87.5249, 0.03996],  // 26
  [1, 88.0563, 0.04019],  // 27
  [1, 88.5939, 0.04043],  // 28
  [1, 89.1385, 0.04066],  // 29
  [1, 89.6903, 0.04090],  // 30
  [1, 90.2490, 0.04114],  // 31
  [1, 90.8148, 0.04138],  // 32
  [1, 91.3882, 0.04163],  // 33
  [1, 91.9687, 0.04187],  // 34
  [1, 92.5570, 0.04212],  // 35
  [1, 93.1530, 0.04237],  // 36
  [1, 93.7561, 0.04262],  // 37
  [1, 94.3665, 0.04287],  // 38
  [1, 94.9847, 0.04312],  // 39
  [1, 95.6101, 0.04337],  // 40
  [1, 96.2426, 0.04362],  // 41
  [1, 96.8824, 0.04388],  // 42
  [1, 97.5293, 0.04413],  // 43
  [1, 98.1827, 0.04438],  // 44
  [1, 98.8425, 0.04464],  // 45
  [1, 99.5082, 0.04489],  // 46
  [1, 100.1791, 0.04514], // 47
  [1, 100.8551, 0.04540], // 48
  [1, 101.5349, 0.04565], // 49
  [1, 102.2183, 0.04590], // 50
  [1, 102.9048, 0.04615], // 51
  [1, 103.5933, 0.04640], // 52
  [1, 104.2842, 0.04665], // 53
  [1, 104.9762, 0.04690], // 54
  [1, 105.6688, 0.04714], // 55
  [1, 106.3625, 0.04739], // 56
  [1, 107.0559, 0.04763], // 57
  [1, 107.7488, 0.04787], // 58
  [1, 108.4403, 0.04811], // 59
  [1, 109.1313, 0.04835], // 60
];

/**
 * Calculate WHO Z-Score using the LMS method.
 * Formula: Z = ((Y/M)^L - 1) / (L × S)
 * When L = 1 (as in WHO height-for-age): Z = (Y - M) / (M × S)
 */
function calculateZScore(observed: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return Math.log(observed / M) / S;
  }
  return (Math.pow(observed / M, L) - 1) / (L * S);
}

/**
 * Get LMS parameters for a given age (with linear interpolation for fractional months)
 */
function getLMS(ageMonths: number, sex: "L" | "P"): [number, number, number] {
  const table = sex === "L" ? WHO_LMS_BOYS : WHO_LMS_GIRLS;
  const clampedAge = Math.max(0, Math.min(60, ageMonths));
  const lowerIdx = Math.floor(clampedAge);
  const upperIdx = Math.min(60, lowerIdx + 1);
  const fraction = clampedAge - lowerIdx;

  if (fraction === 0 || lowerIdx === upperIdx) {
    return table[lowerIdx];
  }

  // Linear interpolation between two months
  const [L1, M1, S1] = table[lowerIdx];
  const [L2, M2, S2] = table[upperIdx];
  return [
    L1 + (L2 - L1) * fraction,
    M1 + (M2 - M1) * fraction,
    S1 + (S2 - S1) * fraction,
  ];
}

/**
 * Classify stunting status based on WHO Z-Score thresholds:
 *  - HAZ >= -2 SD  → Normal (0)
 *  - HAZ < -2 SD   → Stunting (1) — "Pendek"
 *  - HAZ < -3 SD   → Severe Stunting (2) — "Sangat Pendek"
 */
function classifyStunting(zScore: number): { status: number; label: string } {
  if (zScore < -3) {
    return { status: 2, label: "Sangat Pendek (Severely Stunted)" };
  } else if (zScore < -2) {
    return { status: 1, label: "Pendek (Stunted)" };
  } else {
    return { status: 0, label: "Normal" };
  }
}

/**
 * Convert Z-Score to an intuitive risk probability (0-1 scale) using a logistic function.
 * Z-score of -2 (stunting threshold) maps to 50% probability.
 * Z-score of -3 (severe stunting) maps to 90% probability.
 * Normal average Z-score (0) maps to ~1.2% probability.
 */
function zScoreToRiskProbability(z: number): number {
  const risk = 1 / (1 + Math.exp(2.2 * (z + 2)));
  return Math.min(0.99, Math.max(0.01, parseFloat(risk.toFixed(3))));
}

/**
 * Classify nutritional status based on BMI (weight-for-height ratio).
 * Corresponds approximately to WHO BMI-for-age parameters.
 */
function classifyNutritionalStatus(weightKg: number, heightCm: number, ageMonths: number): { status: number; label: string } {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { status: 0, label: "Tinggi badan tidak valid" };
  
  const bmi = weightKg / (heightM * heightM);
  
  // Median BMI for children under 5 is around 16.
  // Standard deviation is around 1.2.
  // Let's use standard WHO BMI-for-age cut-offs approximately:
  // - Severe Wasting (Gizi Buruk): BMI < 11.5
  // - Wasting (Gizi Kurang): BMI < 13.0
  // - Normal: BMI 13.0 to 18.0
  // - Overweight (Gizi Lebih): BMI > 18.0
  // - Obese (Obesitas): BMI > 22.0
  
  if (bmi < 11.5) {
    return { status: -2, label: "Gizi Buruk (Severely Wasted)" };
  } else if (bmi < 13.0) {
    return { status: -1, label: "Gizi Kurang (Wasted)" };
  } else if (bmi > 22.0) {
    return { status: 2, label: "Obesitas (Obese)" };
  } else if (bmi > 18.0) {
    return { status: 1, label: "Gizi Lebih (Overweight)" };
  } else {
    return { status: 0, label: "Normal (Gizi Baik)" };
  }
}

// Define ML URL
const ML_URL = "http://127.0.0.1:8000";

// POST /api/predict/single - Single prediction using ML model + Z-Score calculations
app.post("/api/predict/single", async ({ body, set }) => {
  const { nama, umur, jenisKelamin, berat, tinggi, lingkarKepala, lingkarLengan, tipe, user_id } = body;
  
  if (!user_id) {
    set.status = 400;
    return { error: "user_id diperlukan untuk menyimpan data." };
  }

  if (!nama || nama.trim() === "") {
    set.status = 400;
    return { error: "Nama lengkap balita harus diisi" };
  }
  if (umur === undefined || isNaN(Number(umur)) || Number(umur) < 0) {
    set.status = 400;
    return { error: "Umur harus berupa angka positif" };
  }
  if (berat === undefined || isNaN(Number(berat)) || Number(berat) <= 0) {
    set.status = 400;
    return { error: "Berat badan harus berupa angka lebih besar dari 0" };
  }
  if (tinggi === undefined || isNaN(Number(tinggi)) || Number(tinggi) <= 0) {
    set.status = 400;
    return { error: "Tinggi badan harus berupa angka lebih besar dari 0" };
  }

  let mlPrediction = { status_code: 0, status_teks: "NORMAL", pesan: "" };
  try {
    const mlRes = await fetch(`${ML_URL}/api/predict/single`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        umur_bulan: umur,
        jenis_kelamin: jenisKelamin === "L" ? 1 : 0,
        bb_awal: berat,
        tb_awal: tinggi,
        bb_akhir: berat,
        tb_akhir: tinggi,
        lama_pantau_bulan: 0
      })
    });
    if (mlRes.ok) {
      mlPrediction = await mlRes.json();
    } else {
      console.error(`ML API single failed with status ${mlRes.status}`);
    }
  } catch (err) {
    console.error("Failed to connect to ML API:", err);
  }

  const [L, M, S] = getLMS(umur, jenisKelamin);
  const zScore = calculateZScore(tinggi, L, M, S);
  
  const stuntingStatus = mlPrediction.status_code;
  const stuntingLabel = mlPrediction.status_teks === "NORMAL" ? "Normal" : "Berisiko Stunting";
  
  const { status: nutStatus, label: nutLabel } = classifyNutritionalStatus(berat, tinggi, umur);
  const probability = zScoreToRiskProbability(zScore);
  const minus2SD = M * (1 + L * S * (-2));
  const minus3SD = M * (1 + L * S * (-3));

  const rasioBBTB = parseFloat((berat / (tinggi + 0.001)).toFixed(3));
  const lkVal = lingkarKepala !== undefined && lingkarKepala !== null ? parseFloat(Number(lingkarKepala).toFixed(1)) : null;
  const llVal = lingkarLengan !== undefined && lingkarLengan !== null ? parseFloat(Number(lingkarLengan).toFixed(1)) : null;
  const zScoreRounded = parseFloat(zScore.toFixed(2));
  const medianRounded = parseFloat(M.toFixed(1));
  const m2sd = parseFloat(minus2SD.toFixed(1));
  const m3sd = parseFloat(minus3SD.toFixed(1));
  const probRounded = parseFloat(probability.toFixed(3));
  const tipeVal = tipe || 'mandiri';

  try {
    const dbRow = await supabaseQuery("predictions", {
      method: "POST",
      body: {
        user_id,
        nama,
        umur,
        jenis_kelamin: jenisKelamin,
        bb_awal: berat,
        tb_awal: tinggi,
        bb_akhir: berat,
        tb_akhir: tinggi,
        lama_pantau: 0,
        kecepatan_bb: 0,
        kecepatan_tb: 0,
        rasio_bb_tb_akhir: rasioBBTB,
        lingkar_kepala: lkVal,
        lingkar_lengan: llVal,
        z_score: zScoreRounded,
        median_who: medianRounded,
        minus_2sd: m2sd,
        minus_3sd: m3sd,
        stunting_label: stuntingLabel,
        severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
        nutritional_status: nutStatus,
        nutritional_label: nutLabel,
        status: stuntingStatus,
        probability: probRounded,
        tipe: tipeVal,
      },
    });

    const savedId = dbRow?.[0]?.id || crypto.randomUUID();

    return {
      id: savedId,
      nama,
      umur,
      jenisKelamin,
      bbAwal: berat,
      tbAwal: tinggi,
      bbAkhir: berat,
      tbAkhir: tinggi,
      lamaPantau: 0,
      kecepatanBB: 0,
      kecepatanTB: 0,
      rasioBBTBAkhir: rasioBBTB,
      lingkarKepala: lkVal,
      lingkarLengan: llVal,
      zScore: zScoreRounded,
      medianWHO: medianRounded,
      minus2SD: m2sd,
      minus3SD: m3sd,
      stuntingLabel,
      status: stuntingStatus,
      severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
      nutritionalStatus: nutStatus,
      nutritionalLabel: nutLabel,
      probability: probRounded,
      tipe: tipeVal,
      pesan: mlPrediction.pesan || "",
      createdAt: dbRow?.[0]?.created_at || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to save prediction to Supabase:", error);
    set.status = 500;
    return { error: "Gagal menyimpan hasil prediksi ke database." };
  }
}, {
  body: t.Object({
    nama: t.String(),
    umur: t.Numeric(),
    jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
    berat: t.Numeric(),
    tinggi: t.Numeric(),
    lingkarKepala: t.Optional(t.Numeric()),
    lingkarLengan: t.Optional(t.Numeric()),
    tipe: t.Optional(t.String()),
    user_id: t.String(),
  })
});

// POST /api/predict/future - Future projection using ML + simulated WHO Z-Score
app.post("/api/predict/future", async ({ body, set }) => {
  const { nama, umur, jenisKelamin, berat, tinggi, lingkarKepala, lingkarLengan, tipe, user_id, target_bulan_kedepan } = body;
  
  if (!user_id) {
    set.status = 400;
    return { error: "user_id diperlukan untuk menyimpan data." };
  }
  if (!nama || nama.trim() === "") {
    set.status = 400;
    return { error: "Nama lengkap balita harus diisi" };
  }
  if (umur === undefined || isNaN(Number(umur)) || Number(umur) < 0) {
    set.status = 400;
    return { error: "Umur harus berupa angka positif" };
  }
  if (berat === undefined || isNaN(Number(berat)) || Number(berat) <= 0) {
    set.status = 400;
    return { error: "Berat badan harus berupa angka lebih besar dari 0" };
  }
  if (tinggi === undefined || isNaN(Number(tinggi)) || Number(tinggi) <= 0) {
    set.status = 400;
    return { error: "Tinggi badan harus berupa angka lebih besar dari 0" };
  }

  let mlPrediction = { 
    umur_simulasi: umur + target_bulan_kedepan, 
    estimasi_tb_akhir: tinggi, 
    estimasi_bb_akhir: berat, 
    status_masa_depan: "NORMAL", 
    pesan: "" 
  };
  try {
    const mlRes = await fetch(`${ML_URL}/api/predict/future`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        umur_bulan: umur,
        jenis_kelamin: jenisKelamin === "L" ? 1 : 0,
        bb_awal: berat,
        tb_awal: tinggi,
        bb_akhir: berat,
        tb_akhir: tinggi,
        lama_pantau_bulan: 0,
        target_bulan_kedepan: target_bulan_kedepan
      })
    });
    if (mlRes.ok) {
      mlPrediction = await mlRes.json();
    } else {
      console.error(`ML API future failed with status ${mlRes.status}`);
    }
  } catch (err) {
    console.error("Failed to connect to ML API:", err);
  }

  const umurSimulasi = mlPrediction.umur_simulasi;
  const estimasiTb = mlPrediction.estimasi_tb_akhir;
  const estimasiBb = mlPrediction.estimasi_bb_akhir;

  const [L, M, S] = getLMS(umurSimulasi, jenisKelamin);
  const zScore = calculateZScore(estimasiTb, L, M, S);
  
  const stuntingStatus = mlPrediction.status_masa_depan === "NORMAL" ? 0 : 1;
  const stuntingLabel = mlPrediction.status_masa_depan === "NORMAL" ? "Normal" : "Berisiko Stunting";
  
  const { status: nutStatus, label: nutLabel } = classifyNutritionalStatus(estimasiBb, estimasiTb, umurSimulasi);
  const probability = zScoreToRiskProbability(zScore);
  const minus2SD = M * (1 + L * S * (-2));
  const minus3SD = M * (1 + L * S * (-3));

  const rasioBBTB = parseFloat((estimasiBb / (estimasiTb + 0.001)).toFixed(3));
  const lkVal = lingkarKepala !== undefined && lingkarKepala !== null ? parseFloat(Number(lingkarKepala).toFixed(1)) : null;
  const llVal = lingkarLengan !== undefined && lingkarLengan !== null ? parseFloat(Number(lingkarLengan).toFixed(1)) : null;
  const zScoreRounded = parseFloat(zScore.toFixed(2));
  const medianRounded = parseFloat(M.toFixed(1));
  const m2sd = parseFloat(minus2SD.toFixed(1));
  const m3sd = parseFloat(minus3SD.toFixed(1));
  const probRounded = parseFloat(probability.toFixed(3));
  const tipeVal = tipe || 'simulasi';

  try {
    const dbRow = await supabaseQuery("predictions", {
      method: "POST",
      body: {
        user_id,
        nama,
        umur: umurSimulasi,
        jenis_kelamin: jenisKelamin,
        bb_awal: berat,
        tb_awal: tinggi,
        bb_akhir: estimasiBb,
        tb_akhir: estimasiTb,
        lama_pantau: target_bulan_kedepan,
        kecepatan_bb: 0,
        kecepatan_tb: 0,
        rasio_bb_tb_akhir: rasioBBTB,
        lingkar_kepala: lkVal,
        lingkar_lengan: llVal,
        z_score: zScoreRounded,
        median_who: medianRounded,
        minus_2sd: m2sd,
        minus_3sd: m3sd,
        stunting_label: stuntingLabel,
        severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
        nutritional_status: nutStatus,
        nutritional_label: nutLabel,
        status: stuntingStatus,
        probability: probRounded,
        tipe: tipeVal,
      },
    });

    const savedId = dbRow?.[0]?.id || crypto.randomUUID();

    return {
      id: savedId,
      nama,
      umur: umurSimulasi,
      jenisKelamin,
      bbAwal: berat,
      tbAwal: tinggi,
      bbAkhir: estimasiBb,
      tbAkhir: estimasiTb,
      lamaPantau: target_bulan_kedepan,
      kecepatanBB: 0,
      kecepatanTB: 0,
      rasioBBTBAkhir: rasioBBTB,
      lingkarKepala: lkVal,
      lingkarLengan: llVal,
      zScore: zScoreRounded,
      medianWHO: medianRounded,
      minus2SD: m2sd,
      minus3SD: m3sd,
      stuntingLabel,
      status: stuntingStatus,
      severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
      nutritionalStatus: nutStatus,
      nutritionalLabel: nutLabel,
      probability: probRounded,
      tipe: tipeVal,
      pesan: mlPrediction.pesan || "",
      createdAt: dbRow?.[0]?.created_at || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to save prediction to Supabase:", error);
    set.status = 500;
    return { error: "Gagal menyimpan hasil prediksi ke database." };
  }
}, {
  body: t.Object({
    nama: t.String(),
    umur: t.Numeric(),
    jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
    berat: t.Numeric(),
    tinggi: t.Numeric(),
    lingkarKepala: t.Optional(t.Numeric()),
    lingkarLengan: t.Optional(t.Numeric()),
    tipe: t.Optional(t.String()),
    user_id: t.String(),
    target_bulan_kedepan: t.Numeric()
  })
});

// POST /api/predict/bulk - Excel bulk predictions
app.post("/api/predict/bulk", async ({ body, set }) => {
  const { file, user_id } = body;
  
  if (!file) {
    set.status = 400;
    return { error: "Berkas Excel (.xlsx atau .xls) harus disertakan." };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const mlRes = await fetch(`${ML_URL}/api/predict/bulk`, {
      method: "POST",
      body: formData
    });

    if (!mlRes.ok) {
      const errText = await mlRes.text();
      set.status = mlRes.status;
      return { error: `Gagal memproses file di ML server: ${errText}` };
    }

    const mlData = await mlRes.json();
    const childrenList = mlData.data || [];
    const savedResults = [];

    for (const child of childrenList) {
      const { nama, umur_bulan, jenis_kelamin, bb_awal, tb_awal, bb_akhir, tb_akhir, lama_pantau_bulan, hasil_prediksi } = child;
      
      const [L, M, S] = getLMS(umur_bulan, jenis_kelamin);
      const zScore = calculateZScore(tb_akhir, L, M, S);
      const stuntingStatus = hasil_prediksi === "NORMAL" ? 0 : 1;
      const stuntingLabel = hasil_prediksi === "NORMAL" ? "Normal" : "Berisiko Stunting";
      const { status: nutStatus, label: nutLabel } = classifyNutritionalStatus(bb_akhir, tb_akhir, umur_bulan);
      const probability = zScoreToRiskProbability(zScore);
      const minus2SD = M * (1 + L * S * (-2));
      const minus3SD = M * (1 + L * S * (-3));
      const rasioBBTB = parseFloat((bb_akhir / (tb_akhir + 0.001)).toFixed(3));

      const dbRow = await supabaseQuery("predictions", {
        method: "POST",
        body: {
          user_id,
          nama,
          umur: umur_bulan,
          jenis_kelamin: jenis_kelamin,
          bb_awal,
          tb_awal,
          bb_akhir,
          tb_akhir,
          lama_pantau: lama_pantau_bulan,
          kecepatan_bb: (bb_akhir - bb_awal) / (lama_pantau_bulan || 1),
          kecepatan_tb: (tb_akhir - tb_awal) / (lama_pantau_bulan || 1),
          rasio_bb_tb_akhir: rasioBBTB,
          lingkar_kepala: null,
          lingkar_lengan: null,
          z_score: parseFloat(zScore.toFixed(2)),
          median_who: parseFloat(M.toFixed(1)),
          minus_2sd: parseFloat(minus2SD.toFixed(1)),
          minus_3sd: parseFloat(minus3SD.toFixed(1)),
          stunting_label: stuntingLabel,
          severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
          nutritional_status: nutStatus,
          nutritional_label: nutLabel,
          status: stuntingStatus,
          probability: parseFloat(probability.toFixed(3)),
          tipe: "kolektif",
        }
      });

      const savedId = dbRow?.[0]?.id || crypto.randomUUID();

      savedResults.push({
        id: savedId,
        nama,
        umur: umur_bulan,
        jenisKelamin: jenis_kelamin,
        bbAwal: bb_awal,
        tbAwal: tb_awal,
        bbAkhir: bb_akhir,
        tbAkhir: tb_akhir,
        lamaPantau: lama_pantau_bulan,
        kecepatanBB: (bb_akhir - bb_awal) / (lama_pantau_bulan || 1),
        kecepatanTB: (tb_akhir - tb_awal) / (lama_pantau_bulan || 1),
        rasioBBTBAkhir: rasioBBTB,
        zScore: parseFloat(zScore.toFixed(2)),
        medianWHO: parseFloat(M.toFixed(1)),
        minus2SD: parseFloat(minus2SD.toFixed(1)),
        minus3SD: parseFloat(minus3SD.toFixed(1)),
        stuntingLabel,
        status: stuntingStatus,
        severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
        nutritionalStatus: nutStatus,
        nutritionalLabel: nutLabel,
        probability: parseFloat(probability.toFixed(3)),
        tipe: "kolektif",
        createdAt: dbRow?.[0]?.created_at || new Date().toISOString()
      });
    }

    return {
      pesan: mlData.pesan,
      data: savedResults
    };
  } catch (err: any) {
    console.error("Bulk predict error:", err);
    set.status = 500;
    return { error: `Gagal memproses data bulk: ${err.message}` };
  }
}, {
  body: t.Object({
    file: t.Any(),
    user_id: t.String()
  })
});

// POST /api/predict/bulk-future - Excel bulk predictions + future projection
app.post("/api/predict/bulk-future", async ({ body, set }) => {
  const { file, target_bulan_kedepan, user_id } = body;
  
  if (!file) {
    set.status = 400;
    return { error: "Berkas Excel (.xlsx atau .xls) harus disertakan." };
  }

  const targetBulanNum = Number(target_bulan_kedepan);
  if (isNaN(targetBulanNum) || targetBulanNum < 0) {
    set.status = 400;
    return { error: "Target bulan ke depan harus berupa angka positif." };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_bulan_kedepan", targetBulanNum.toString());

    const mlRes = await fetch(`${ML_URL}/api/predict/bulk-future`, {
      method: "POST",
      body: formData
    });

    if (!mlRes.ok) {
      const errText = await mlRes.text();
      set.status = mlRes.status;
      return { error: `Gagal memproses simulasi file di ML server: ${errText}` };
    }

    const mlData = await mlRes.json();
    const childrenList = mlData.data || [];
    const savedResults = [];

    for (const child of childrenList) {
      const { nama, umur_simulasi_bulan, jenis_kelamin, bb_awal, tb_awal, bb_akhir, tb_akhir, lama_pantau_bulan, umur_bulan, estimasi_tb, estimasi_bb, hasil_prediksi_masa_depan } = child;
      
      const [L, M, S] = getLMS(umur_simulasi_bulan, jenis_kelamin);
      const zScore = calculateZScore(estimasi_tb, L, M, S);
      const stuntingStatus = hasil_prediksi_masa_depan === "NORMAL" ? 0 : 1;
      const stuntingLabel = hasil_prediksi_masa_depan === "NORMAL" ? "Normal" : "Berisiko Stunting";
      const { status: nutStatus, label: nutLabel } = classifyNutritionalStatus(estimasi_bb, estimasi_tb, umur_simulasi_bulan);
      const probability = zScoreToRiskProbability(zScore);
      const minus2SD = M * (1 + L * S * (-2));
      const minus3SD = M * (1 + L * S * (-3));
      const rasioBBTB = parseFloat((estimasi_bb / (estimasi_tb + 0.001)).toFixed(3));

      const dbRow = await supabaseQuery("predictions", {
        method: "POST",
        body: {
          user_id,
          nama,
          umur: umur_simulasi_bulan,
          jenis_kelamin: jenis_kelamin,
          bb_awal,
          tb_awal,
          bb_akhir: estimasi_bb,
          tb_akhir: estimasi_tb,
          lama_pantau: targetBulanNum,
          kecepatan_bb: (estimasi_bb - bb_akhir) / (targetBulanNum || 1),
          kecepatan_tb: (estimasi_tb - tb_akhir) / (targetBulanNum || 1),
          rasio_bb_tb_akhir: rasioBBTB,
          lingkar_kepala: null,
          lingkar_lengan: null,
          z_score: parseFloat(zScore.toFixed(2)),
          median_who: parseFloat(M.toFixed(1)),
          minus_2sd: parseFloat(minus2SD.toFixed(1)),
          minus_3sd: parseFloat(minus3SD.toFixed(1)),
          stunting_label: stuntingLabel,
          severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
          nutritional_status: nutStatus,
          nutritional_label: nutLabel,
          status: stuntingStatus,
          probability: parseFloat(probability.toFixed(3)),
          tipe: "simulasi_kolektif",
        }
      });

      const savedId = dbRow?.[0]?.id || crypto.randomUUID();

      savedResults.push({
        id: savedId,
        nama,
        umur: umur_simulasi_bulan,
        jenisKelamin: jenis_kelamin,
        bbAwal: bb_akhir,
        tbAwal: tb_akhir,
        bbAkhir: estimasi_bb,
        tbAkhir: estimasi_tb,
        lamaPantau: targetBulanNum,
        kecepatanBB: (estimasi_bb - bb_akhir) / (targetBulanNum || 1),
        kecepatanTB: (estimasi_tb - tb_akhir) / (targetBulanNum || 1),
        rasioBBTBAkhir: rasioBBTB,
        zScore: parseFloat(zScore.toFixed(2)),
        medianWHO: parseFloat(M.toFixed(1)),
        minus2SD: parseFloat(minus2SD.toFixed(1)),
        minus3SD: parseFloat(minus3SD.toFixed(1)),
        stuntingLabel,
        status: stuntingStatus,
        severity: zScore < -3 ? 2 : (zScore < -2 ? 1 : 0),
        nutritionalStatus: nutStatus,
        nutritionalLabel: nutLabel,
        probability: parseFloat(probability.toFixed(3)),
        tipe: "simulasi_kolektif",
        createdAt: dbRow?.[0]?.created_at || new Date().toISOString()
      });
    }

    return {
      pesan: mlData.pesan,
      data: savedResults
    };
  } catch (err: any) {
    console.error("Bulk future predict error:", err);
    set.status = 500;
    return { error: `Gagal memproses simulasi bulk: ${err.message}` };
  }
}, {
  body: t.Object({
    file: t.Any(),
    target_bulan_kedepan: t.Numeric(),
    user_id: t.String()
  })
});

// POST /api/predict - Submit baby measurements (delegate to /api/predict/single for compatibility)
app.post("/api/predict", async ({ body, set }) => {
  try {
    const res = await fetch("http://localhost:3010/api/predict/single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err: any) {
    set.status = 500;
    return { error: `Failed to delegate request: ${err.message}` };
  }
}, {
  body: t.Object({
    nama: t.String(),
    umur: t.Numeric(),
    jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
    berat: t.Numeric(),
    tinggi: t.Numeric(),
    lingkarKepala: t.Optional(t.Numeric()),
    lingkarLengan: t.Optional(t.Numeric()),
    tipe: t.Optional(t.String()),
    user_id: t.String(),
  })
});

// Start listening on port 3010
const port = 3010;
app.listen(port);

console.log(
  `🦊 Elysia is running at http://localhost:${port}`
);
