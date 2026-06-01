import { Elysia, t } from "elysia";
import { join } from "path";

const app = new Elysia();

// File path for saving prediction history
const HISTORY_FILE_PATH = join(__dirname, "../history.json");

// Load history from JSON file
async function loadHistory() {
  try {
    const file = Bun.file(HISTORY_FILE_PATH);
    if (await file.exists()) {
      return await file.json();
    }
  } catch (error) {
    console.error("Failed to load history:", error);
  }
  return [];
}

// Save history to JSON file
async function saveHistory(history: any[]) {
  try {
    await Bun.write(HISTORY_FILE_PATH, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

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

// GET /api/history - Retrieve saved predictions
app.get("/api/history", async () => {
  return await loadHistory();
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

// POST /api/predict - Submit baby measurements and calculate stunting using WHO Z-Score
app.post("/api/predict", async ({ body, set }) => {
  const { nama, umur, jenisKelamin, berat, tinggi, lingkarKepala, lingkarLengan } = body;
  
  // Validation: Check for positive numbers, but allow free inputs (e.g. 900 kg weight, 40 cm height)
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
  if (lingkarKepala !== undefined && lingkarKepala !== null && (isNaN(Number(lingkarKepala)) || Number(lingkarKepala) <= 0)) {
    set.status = 400;
    return { error: "Lingkar kepala harus berupa angka positif jika diisi" };
  }
  if (lingkarLengan !== undefined && lingkarLengan !== null && (isNaN(Number(lingkarLengan)) || Number(lingkarLengan) <= 0)) {
    set.status = 400;
    return { error: "Lingkar lengan harus berupa angka positif jika diisi" };
  }

  // Get WHO LMS parameters for this age and sex
  const [L, M, S] = getLMS(umur, jenisKelamin);
  
  // Calculate Height-for-Age Z-Score (HAZ) using WHO LMS method
  const zScore = calculateZScore(tinggi, L, M, S);
  
  // Classify stunting status
  const { status: stuntingStatus, label: stuntingLabel } = classifyStunting(zScore);
  
  // Classify nutritional status based on BMI/weight-for-height
  const { status: nutStatus, label: nutLabel } = classifyNutritionalStatus(berat, tinggi, umur);
  
  // Convert Z-Score to risk probability
  const probability = zScoreToRiskProbability(zScore);
  
  // Calculate -2SD and -3SD thresholds for reference
  const minus2SD = M * (1 + L * S * (-2));  // When L=1: M + M*S*(-2) = M*(1 - 2S)
  const minus3SD = M * (1 + L * S * (-3));  // When L=1: M*(1 - 3S)
  
  const predictionResult = {
    id: crypto.randomUUID(),
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
    rasioBBTBAkhir: parseFloat((berat / (tinggi + 0.001)).toFixed(3)),
    lingkarKepala: lingkarKepala !== undefined && lingkarKepala !== null ? parseFloat(Number(lingkarKepala).toFixed(1)) : null,
    lingkarLengan: lingkarLengan !== undefined && lingkarLengan !== null ? parseFloat(Number(lingkarLengan).toFixed(1)) : null,
    // WHO Z-Score data
    zScore: parseFloat(zScore.toFixed(2)),
    medianWHO: parseFloat(M.toFixed(1)),
    minus2SD: parseFloat(minus2SD.toFixed(1)),
    minus3SD: parseFloat(minus3SD.toFixed(1)),
    stuntingLabel,
    status: stuntingStatus >= 1 ? 1 : 0, // 0 = Normal, 1 = Stunting/Severe Stunting
    severity: stuntingStatus, // 0 = Normal, 1 = Stunted, 2 = Severely Stunted
    nutritionalStatus: nutStatus,
    nutritionalLabel: nutLabel,
    probability: parseFloat(probability.toFixed(3)),
    createdAt: new Date().toISOString()
  };
  
  // Save to local history file
  const history = await loadHistory();
  history.unshift(predictionResult);
  await saveHistory(history);
  
  return predictionResult;
}, {
  body: t.Object({
    nama: t.String(),
    umur: t.Numeric(),
    jenisKelamin: t.Union([t.Literal("L"), t.Literal("P")]),
    berat: t.Numeric(),
    tinggi: t.Numeric(),
    lingkarKepala: t.Optional(t.Numeric()),
    lingkarLengan: t.Optional(t.Numeric())
  })
});

// Start listening on port 3010
const port = 3010;
app.listen(port);

console.log(
  `🦊 Elysia is running at http://localhost:${port}`
);
