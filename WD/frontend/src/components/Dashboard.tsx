import React from 'react';

interface Prediction {
  id: string;
  nama: string;
  umur: number;
  jenisKelamin: 'L' | 'P';
  bbAwal: number;
  tbAwal: number;
  bbAkhir: number;
  tbAkhir: number;
  lamaPantau: number;
  kecepatanBB: number;
  kecepatanTB: number;
  rasioBBTBAkhir: number;
  lingkarKepala?: number;
  lingkarLengan?: number;
  zScore?: number;
  medianWHO?: number;
  minus2SD?: number;
  minus3SD?: number;
  stuntingLabel?: string;
  severity?: number;
  nutritionalStatus?: number;
  nutritionalLabel?: string;
  status: number;
  probability: number;
  tipe?: string;
  createdAt: string;
}

interface DashboardProps {
  history: Prediction[];
  activeChild: Prediction | null;
  onNavigate: (page: string, data?: any) => void;
  onDeleteHistory: (id: string) => Promise<void>;
}

// WHO LMS tables: [L, M, S] indexed by age in months (0-60)
// Boys: Length/Height-for-Age
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
  [1, 87.8161, 0.03446],  // 24
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

// Girls: Length/Height-for-Age
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

function getLMS(ageMonths: number, sex: "L" | "P"): [number, number, number] {
  const table = sex === "L" ? WHO_LMS_BOYS : WHO_LMS_GIRLS;
  const clampedAge = Math.max(0, Math.min(60, ageMonths));
  const lowerIdx = Math.floor(clampedAge);
  const upperIdx = Math.min(60, lowerIdx + 1);
  const fraction = clampedAge - lowerIdx;

  if (fraction === 0 || lowerIdx === upperIdx) {
    return table[lowerIdx];
  }

  const [L1, M1, S1] = table[lowerIdx];
  const [L2, M2, S2] = table[upperIdx];
  return [
    L1 + (L2 - L1) * fraction,
    M1 + (M2 - M1) * fraction,
    S1 + (S2 - S1) * fraction,
  ];
}

export const Dashboard: React.FC<DashboardProps> = ({ history, activeChild, onNavigate, onDeleteHistory }) => {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = React.useState<string | null>(null);
  const [selectedNameToDelete, setSelectedNameToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // State to track currently hovered cylinder for interactive analysis
  const [hoveredCyl, setHoveredCyl] = React.useState<{
    type: 'who' | 'child' | 'proj';
    val: number;
    age: number;
    whoMedian: number;
  } | null>(null);

  // Helper to render 3D-like cylinder
  const renderCylinder = (
    x: number, 
    y: number, 
    w: number, 
    yBase: number, 
    fillGradientId: string, 
    topColor: string, 
    isProj = false,
    onHover?: () => void,
    isHovered = false
  ) => {
    const ry = 3; // Ellipse vertical radius
    const h = yBase - y;
    if (h <= 0) return null;
    
    return (
      <g 
        style={{ 
          opacity: hoveredCyl ? (isHovered ? 1 : 0.45) : (isProj ? 0.75 : 1),
          cursor: 'pointer',
          transition: 'all 0.15s ease-in-out'
        }}
        onMouseEnter={onHover}
        onMouseLeave={() => setHoveredCyl(null)}
      >
        {/* Cylinder Body */}
        <path
          d={`M ${x} ${y} 
              L ${x} ${yBase} 
              A ${w/2} ${ry} 0 0 0 ${x + w} ${yBase} 
              L ${x + w} ${y} 
              A ${w/2} ${ry} 0 0 0 ${x} ${y}`}
          fill={`url(#${fillGradientId})`}
          stroke={isHovered ? "#ffffff" : (isProj ? "var(--accent-coral)" : "none")}
          strokeWidth={isHovered ? "1.5" : (isProj ? "1" : "0")}
          strokeDasharray={isProj && !isHovered ? "3,2" : "none"}
        />
        {/* Top Cap */}
        <ellipse
          cx={x + w/2}
          cy={y}
          rx={w/2}
          ry={ry}
          fill={topColor}
          stroke={isHovered ? "#ffffff" : (isProj ? "var(--accent-coral)" : "rgba(255,255,255,0.2)")}
          strokeWidth={isHovered ? "1.5" : "0.5"}
        />
      </g>
    );
  };

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Use activeChild if available, otherwise fallback to latest in history or a default template
  const defaultLeo: Prediction = {
    id: 'default-leo',
    nama: 'Leo Kurniawan',
    umur: 24,
    jenisKelamin: 'L',
    bbAwal: 9.0,
    tbAwal: 80.0,
    bbAkhir: 9.6,
    tbAkhir: 84.5,
    lamaPantau: 5,
    kecepatanBB: 0.15,
    kecepatanTB: 1.125,
    rasioBBTBAkhir: 0.114,
    status: 0, // Normal
    probability: 0.12,
    createdAt: new Date().toISOString()
  };

  const child = activeChild || (history.length > 0 ? history[0] : defaultLeo);
  const isStunting = child.status === 1;

  // Render Growth Chart SVG dynamically using WHO LMS data and ML projection metadata
  const isSimulated = child.tipe === 'simulasi' || child.tipe === 'simulasi_kolektif';
  const ageEnd = child.umur;
  const duration = child.lamaPantau || 0;
  const ageStart = duration > 0 ? child.umur - duration : 0;

  // Generate clean ages to avoid duplicate math rounded labels
  let ages: number[] = [];
  if (duration > 0 && Number.isInteger(duration)) {
    for (let m = ageStart; m <= ageEnd; m++) {
      ages.push(m);
    }
  } else {
    const dataPointsCount = 5;
    for (let i = 0; i < dataPointsCount; i++) {
      ages.push(ageStart + (ageEnd - ageStart) * (i / (dataPointsCount - 1)));
    }
  }

  const dataPoints: { age: number; childHeight: number; whoMedian: number; whoMinus2SD: number; whoMinus3SD: number }[] = [];
  const hBirth = child.jenisKelamin === 'L' ? 49.9 : 49.1;
  const tbStart = duration > 0 ? child.tbAwal : hBirth;

  ages.forEach((age, idx) => {
    const fraction = ages.length > 1 ? idx / (ages.length - 1) : 0;
    const childHeight = tbStart + (child.tbAkhir - tbStart) * fraction;
    const [L, M, S] = getLMS(age, child.jenisKelamin);
    const whoMedian = M;
    const whoMinus2SD = M * (1 + L * S * (-2));
    const whoMinus3SD = M * (1 + L * S * (-3));
    
    dataPoints.push({
      age,
      childHeight,
      whoMedian,
      whoMinus2SD,
      whoMinus3SD
    });
  });

  const allHeights = dataPoints.flatMap(pt => [pt.childHeight, pt.whoMedian, pt.whoMinus2SD, pt.whoMinus3SD]);
  const minH = Math.min(...allHeights) - 5; // Expand margin to 5 for breathing room
  const maxH = Math.max(...allHeights) + 5; // Expand margin to 5 for breathing room

  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;
  const chartW = 400 - padLeft - padRight;
  const chartH = 200 - padTop - padBottom;

  const scaleX = (idx: number) => padLeft + (ages.length > 1 ? idx / (ages.length - 1) : 0.5) * chartW;
  const scaleY = (h: number) => padTop + (1 - (h - minH) / (maxH - minH)) * chartH;

  // Generate SVG paths
  const medianPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMedian)}`).join(' L ');
  const minus2SDPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus2SD)}`).join(' L ');
  const minus3SDPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus3SD)}`).join(' L ');

  // Zones for rendering shaded bands
  const normalZonePoints = [
    ...dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMedian)}`),
    ...dataPoints.slice().reverse().map((pt, i) => `${scaleX(dataPoints.length - 1 - i)},${scaleY(pt.whoMinus2SD)}`)
  ].join(' ');

  const stuntedZonePoints = [
    ...dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus2SD)}`),
    ...dataPoints.slice().reverse().map((pt, i) => `${scaleX(dataPoints.length - 1 - i)},${scaleY(pt.whoMinus3SD)}`)
  ].join(' ');

  const severeZonePoints = [
    ...dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus3SD)}`),
    `${scaleX(dataPoints.length - 1)},${padTop + chartH}`,
    `${scaleX(0)},${padTop + chartH}`
  ].join(' ');

  // Paths for child height (unused)

  // Generate Y ticks values
  const yTicks = 4;
  const yTickValues: number[] = [];
  for (let i = 0; i < yTicks; i++) {
    yTickValues.push(maxH - (i / (yTicks - 1)) * (maxH - minH));
  }


  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            {getGreeting()}, Kader! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Berikut adalah rangkuman tumbuh kembang si kecil secara dinamis.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('input')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Periksa Balita Baru
        </button>
      </div>

      {/* Grid Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Child Info Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: child.jenisKelamin === 'L' ? 'rgba(91, 164, 230, 0.15)' : 'rgba(231, 111, 81, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: child.jenisKelamin === 'L' ? 'var(--accent-blue)' : 'var(--accent-coral)'
          }}>
            {child.nama ? child.nama.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.15rem' }}>{child.nama}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
              <span>{child.umur} Bulan</span>
              <span>•</span>
              <span>{child.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </p>
          </div>
        </div>

        {/* Height Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tinggi Badan</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{child.tbAkhir}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>cm</span>
          </div>
        </div>

        {/* Weight Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Berat Badan</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{child.bbAkhir}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>kg</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `5px solid ${isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}`
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kondisi Nutrisi</span>
          <div style={{ margin: '0.5rem 0' }}>
            <span style={{
              display: 'inline-flex',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1rem',
              fontWeight: 800,
              background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
              color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'
            }}>
              {isStunting ? 'RISIKO STUNTING' : 'NORMAL (SEHAT)'}
            </span>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Probabilitas: {(child.probability * 100).toFixed(0)}%
          </span>
        </div>

      </div>

      {/* Main Analytics Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Interactive Curve Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Grafik Perkembangan Balita (Tipe Tabung)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Membandingkan tinggi badan anak ({child.nama}) dengan standar tinggi normal WHO.
              </p>
            </div>
            {/* Clean Legend outside of SVG */}
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem', fontWeight: 700, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-green)', display: 'inline-block', borderRadius: '2px' }}></span> Area Normal (WHO)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px', height: '10px', background: 'url(#greenCyl)', display: 'inline-block', borderRadius: '2px' }}></span> Tabung Standar WHO
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px', height: '10px', background: 'url(#blueCyl)', display: 'inline-block', borderRadius: '2px' }}></span> Tabung Tinggi Anak
              </span>
              {isSimulated && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-coral)' }}>
                  <span style={{ width: '10px', height: '10px', background: 'url(#orangeCyl)', display: 'inline-block', borderRadius: '2px' }}></span> Tabung Proyeksi ML
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Status Notice Banner */}
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: isStunting ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
            border: `1px solid ${isStunting ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.25rem' }}>{isStunting ? '⚠️' : '✅'}</span>
            <div>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                {isStunting ? 'Hasil Analisis: Risiko Stunting Terdeteksi' : 'Hasil Analisis: Pertumbuhan Normal'}
              </h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {isStunting 
                  ? `Tinggi badan ${child.nama} berada di zona merah/kuning (di bawah standar normal WHO). Diperlukan intervensi gizi tambahan protein hewani segera.`
                  : `Tinggi badan ${child.nama} berada di zona hijau (sesuai standar normal WHO). Terus pertahankan pola makan sehat.`
                }
              </p>
            </div>
          </div>

          {/* Dynamic Cylinder Analysis Notice */}
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minHeight: '62px',
            transition: 'all var(--transition-fast)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {!hoveredCyl ? '📊' : hoveredCyl.type === 'who' ? '🟢' : hoveredCyl.type === 'child' ? '🔵' : '🟠'}
            </span>
            <div style={{ flex: 1 }}>
              {!hoveredCyl ? (
                <>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Informasi Interaktif Grafik
                  </h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Sentuh atau arahkan kursor pada tabung grafik di bawah untuk melihat analisis detail pertumbuhan balita pada bulan tertentu.
                  </p>
                </>
              ) : (
                (() => {
                  const roundedAge = Math.round(hoveredCyl.age);
                  if (hoveredCyl.type === 'who') {
                    return (
                      <>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                          Tabung Standar WHO — Umur {roundedAge} Bulan
                        </h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          Tinggi badan acuan ideal menurut standar pertumbuhan WHO pada usia {roundedAge} bulan adalah <strong>{hoveredCyl.val.toFixed(1)} cm</strong>.
                        </p>
                      </>
                    );
                  } else if (hoveredCyl.type === 'child') {
                    const diff = hoveredCyl.val - hoveredCyl.whoMedian;
                    const diffText = diff >= 0 ? `lebih tinggi +${diff.toFixed(1)} cm` : `lebih rendah ${diff.toFixed(1)} cm`;
                    const isBelow = diff < -2;
                    return (
                      <>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                          Tabung Tinggi Aktual {child.nama} — Umur {roundedAge} Bulan
                        </h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          Tinggi aktual anak saat penimbangan adalah <strong>{hoveredCyl.val.toFixed(1)} cm</strong>. Tinggi ini <strong>{diffText}</strong> dibanding acuan standar WHO ({hoveredCyl.whoMedian.toFixed(1)} cm). Status: {isBelow ? '⚠️ Perlu Perhatian' : '✅ Baik'}.
                        </p>
                      </>
                    );
                  } else {
                    const diff = hoveredCyl.val - hoveredCyl.whoMedian;
                    const diffText = diff >= 0 ? `lebih tinggi +${diff.toFixed(1)} cm` : `lebih rendah ${diff.toFixed(1)} cm`;
                    return (
                      <>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-coral)' }}>
                          Tabung Proyeksi Machine Learning — Target Usia {roundedAge} Bulan
                        </h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          Berdasarkan tren pertumbuhan awal, model ML memprediksi tinggi badan anak di masa depan akan mencapai <strong>{hoveredCyl.val.toFixed(1)} cm</strong>. Tinggi proyeksi ini <strong>{diffText}</strong> dibanding standar WHO ({hoveredCyl.whoMedian.toFixed(1)} cm).
                        </p>
                      </>
                    );
                  }
                })()
              )}
            </div>
          </div>

          {/* SVG Custom Premium Chart */}
          <div style={{ position: 'relative', width: '100%', height: '240px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              
              {/* Gradients Definitions */}
              <defs>
                <linearGradient id="blueCyl" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1a5bb8" />
                  <stop offset="30%" stopColor="#70a6ff" />
                  <stop offset="70%" stopColor="#2c7be5" />
                  <stop offset="100%" stopColor="#1a5bb8" />
                </linearGradient>
                <linearGradient id="greenCyl" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#008d71" />
                  <stop offset="30%" stopColor="#55efc4" />
                  <stop offset="70%" stopColor="#00b894" />
                  <stop offset="100%" stopColor="#008d71" />
                </linearGradient>
                <linearGradient id="orangeCyl" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b23b2b" />
                  <stop offset="30%" stopColor="#ff7675" />
                  <stop offset="70%" stopColor="#e17055" />
                  <stop offset="100%" stopColor="#b23b2b" />
                </linearGradient>
              </defs>

              {/* Dynamic Y Axis Tick Grid Lines & Labels */}
              {yTickValues.map((val, idx) => {
                const yPos = scaleY(val);
                return (
                  <g key={idx}>
                    <line 
                      x1={padLeft} 
                      y1={yPos} 
                      x2={400 - padRight} 
                      y2={yPos} 
                      stroke="var(--border-color)" 
                      strokeWidth="0.8" 
                      strokeDasharray="4,4" 
                      opacity="0.7"
                    />
                    <text
                      x={padLeft - 6}
                      y={yPos + 3}
                      fontSize="8"
                      fontWeight="700"
                      fill="var(--text-muted)"
                      textAnchor="end"
                    >
                      {Math.round(val)} cm
                    </text>
                  </g>
                );
              })}

              {/* WHO Colored Reference Zones */}
              <polygon points={severeZonePoints} fill="rgba(239, 68, 68, 0.04)" />
              <polygon points={stuntedZonePoints} fill="rgba(245, 158, 11, 0.06)" />
              <polygon points={normalZonePoints} fill="rgba(16, 185, 129, 0.08)" />

              {/* WHO Standard Lines (Dashed behind cylinders as helper guidelines) */}
              <path d={`M ${medianPoints}`} fill="none" stroke="var(--accent-green)" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5" />
              <path d={`M ${minus2SDPoints}`} fill="none" stroke="var(--accent-coral)" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.8" />
              <path d={`M ${minus3SDPoints}`} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.8" />

              {/* Cylinders Drawing */}
              {dataPoints.map((pt, i) => {
                const isLast = i === dataPoints.length - 1;
                const isProjectedNode = isLast && isSimulated;
                const cx = scaleX(i);
                
                const yBase = padTop + chartH;
                const yWho = scaleY(pt.whoMedian);
                const yChild = scaleY(pt.childHeight);
                
                let label = `${Math.round(pt.age)} Bln`;
                if (isProjectedNode) {
                  label = `${Math.round(pt.age)} Bln (ML)`;
                }

                // Cylinder parameters: x, y, width, yBase, gradientId, capColor, isProjected
                const w = 12;

                return (
                  <g key={i}>
                    {/* Vertical grid line */}
                    <line
                      x1={cx}
                      y1={padTop}
                      x2={cx}
                      y2={padTop + chartH}
                      stroke="var(--border-color)"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                      opacity="0.3"
                    />

                    {/* Standard WHO Cylinder (Green) */}
                    {renderCylinder(
                      cx - 13, 
                      yWho, 
                      w, 
                      yBase, 
                      'greenCyl', 
                      '#55efc4', 
                      false,
                      () => setHoveredCyl({ type: 'who', val: pt.whoMedian, age: pt.age, whoMedian: pt.whoMedian }),
                      hoveredCyl?.type === 'who' && hoveredCyl?.age === pt.age
                    )}
                    {/* Child Height Cylinder (Blue or Orange for ML Projection) */}
                    {isProjectedNode 
                      ? renderCylinder(
                          cx + 1, 
                          yChild, 
                          w, 
                          yBase, 
                          'orangeCyl', 
                          '#ff7675', 
                          true,
                          () => setHoveredCyl({ type: 'proj', val: pt.childHeight, age: pt.age, whoMedian: pt.whoMedian }),
                          hoveredCyl?.type === 'proj' && hoveredCyl?.age === pt.age
                        )
                      : renderCylinder(
                          cx + 1, 
                          yChild, 
                          w, 
                          yBase, 
                          'blueCyl', 
                          '#70a6ff', 
                          false,
                          () => setHoveredCyl({ type: 'child', val: pt.childHeight, age: pt.age, whoMedian: pt.whoMedian }),
                          hoveredCyl?.type === 'child' && hoveredCyl?.age === pt.age
                        )
                    }

                    {/* WHO Standard height text label above its cylinder */}
                    <text
                      x={cx - 7}
                      y={yWho - 8}
                      fontSize="8"
                      fontWeight="700"
                      textAnchor="middle"
                      fill="var(--bg-primary)"
                      stroke="var(--bg-primary)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }}
                    >
                      {Math.round(pt.whoMedian)}
                    </text>
                    <text
                      x={cx - 7}
                      y={yWho - 8}
                      fontSize="8"
                      fontWeight="700"
                      textAnchor="middle"
                      fill="var(--accent-green)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {Math.round(pt.whoMedian)}
                    </text>

                    {/* Child height text label above its cylinder */}
                    <text
                      x={cx + 7}
                      y={yChild - 8}
                      fontSize="8"
                      fontWeight="800"
                      textAnchor="middle"
                      fill="var(--bg-primary)"
                      stroke="var(--bg-primary)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }}
                    >
                      {pt.childHeight.toFixed(1)}
                    </text>
                    <text
                      x={cx + 7}
                      y={yChild - 8}
                      fontSize="8"
                      fontWeight="800"
                      textAnchor="middle"
                      fill={isProjectedNode ? "var(--accent-coral)" : "var(--accent-blue)"}
                      style={{ pointerEvents: 'none' }}
                    >
                      {pt.childHeight.toFixed(1)}
                    </text>

                    {/* X Axis Text label */}
                    <text
                      x={cx}
                      y={padTop + chartH + 15}
                      fontSize="8.5"
                      fontWeight={isProjectedNode ? "800" : "600"}
                      fill={isProjectedNode ? "var(--accent-coral)" : "var(--text-secondary)"}
                      textAnchor="middle"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Growth Velocity & Warning Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Panduan Membaca Grafik Tabung untuk Kader */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.01)',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📢 Panduan Kader: Membaca Grafik Tabung
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <p>
                <strong>🟢 Tabung Hijau</strong>: Tinggi rata-rata anak normal seusianya (WHO).
              </p>
              <p>
                <strong>🔵 Tabung Biru</strong>: Tinggi anak aktual yang diukur di posyandu saat ini.
              </p>
              {isSimulated && (
                <p>
                  <strong>🟠 Tabung Oranye (ML)</strong>: Hasil simulasi perkiraan tinggi anak di masa depan.
                </p>
              )}
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Evaluasi Status:</strong> Bandingkan tinggi Tabung Biru/Oranye dengan Tabung Hijau. Batas garis merah putus-putus <strong>(-2 SD)</strong> adalah ambang batas stunting. Jika tinggi tabung anak di bawah garis tersebut, balita berisiko stunting.
              </p>
            </div>
          </div>

          {/* Action / Warning Box */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
            borderColor: isStunting ? 'rgba(231, 111, 81, 0.15)' : 'rgba(118, 200, 147, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isStunting ? (
                  <>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </>
                ) : (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </>
                )}
              </svg>
              {isStunting ? 'Peringatan Dini Gagal Tumbuh' : 'Tumbuh Kembang Optimal'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
              {isStunting ? (
                'Tinggi badan anak terindikasi tertinggal di bawah kurva standar normal WHO. Segera lakukan pencegahan dengan meningkatkan asupan zat gizi protein hewani tinggi dan konsultasikan ke posyandu terdekat.'
              ) : (
                'Hebat! Tumbuh kembang anak berada di kurva hijau standard WHO. Pertahankan pola pemberian makan gizi seimbang dan penuhi asupan protein hewani harian.'
              )}
            </p>
            <button 
              onClick={() => onNavigate('education')}
              className="btn btn-outline" 
              style={{
                alignSelf: 'flex-start',
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderColor: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)',
                color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'
              }}
            >
              Baca Tips Nutrisi
            </button>
          </div>

        </div>

      </div>

      {/* History table / Recent checks list */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Riwayat Pemeriksaan Terakhir</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Belum ada riwayat pemeriksaan. Silakan tambahkan data balita baru.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nama Balita</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Umur</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tinggi Badan</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Deteksi</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Probabilitas</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h) => (
                  <tr 
                    key={h.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)', cursor: 'pointer' }} 
                    className="history-row"
                    onClick={() => {
                      onNavigate('dashboard', h);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <td style={{ padding: '14px 8px', fontWeight: 600 }}>{h.nama}</td>
                    <td style={{ padding: '14px 8px' }}>{h.umur} Bulan</td>
                    <td style={{ padding: '14px 8px' }}>{h.tbAkhir} cm</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: h.status === 1 ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                        color: h.status === 1 ? 'var(--accent-coral)' : 'var(--accent-green)'
                      }}>
                        {h.status === 1 ? 'Risiko Stunting' : 'Normal'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>{(h.probability * 100).toFixed(0)}%</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent duplicate trigger from row onClick
                          onNavigate('dashboard', h);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        Detail
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row selection trigger when deleting
                          setSelectedIdToDelete(h.id);
                          setSelectedNameToDelete(h.nama);
                          setShowConfirmModal(true);
                        }}
                        className="btn" 
                        style={{ 
                          padding: '6px 14px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          background: 'var(--accent-coral-bg)',
                          color: 'var(--accent-coral)',
                          border: '1px solid rgba(231, 111, 81, 0.15)',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent-coral)';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = 'var(--accent-coral)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-coral-bg)';
                          e.currentTarget.style.color = 'var(--accent-coral)';
                          e.currentTarget.style.borderColor = 'rgba(231, 111, 81, 0.15)';
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 12, 19, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn var(--transition-fast)'
        }}>
          <div 
            className="glass-panel" 
            style={{
              width: '90%',
              maxWidth: '420px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'scaleIn var(--transition-fast)'
            }}
          >
            {/* Modal Icon & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-coral-bg)',
                color: 'var(--accent-coral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Hapus Riwayat?
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tindakan ini tidak dapat dibatalkan</span>
              </div>
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Apakah Anda yakin ingin menghapus data riwayat pemeriksaan untuk <strong>{selectedNameToDelete}</strong>? Data ini akan terhapus secara permanen dari sistem.
            </p>

            {/* Modal Footer / Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedIdToDelete(null);
                  setSelectedNameToDelete(null);
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  if (selectedIdToDelete) {
                    setIsDeleting(true);
                    try {
                      await onDeleteHistory(selectedIdToDelete);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsDeleting(false);
                      setShowConfirmModal(false);
                      setSelectedIdToDelete(null);
                      setSelectedNameToDelete(null);
                    }
                  }
                }}
                className="btn"
                style={{ 
                  padding: '10px 18px', 
                  fontSize: '0.9rem',
                  background: 'var(--accent-coral)',
                  color: '#ffffff',
                  fontWeight: 700,
                  transition: 'all var(--transition-fast)'
                }}
                disabled={isDeleting}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-coral-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-coral)';
                }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
