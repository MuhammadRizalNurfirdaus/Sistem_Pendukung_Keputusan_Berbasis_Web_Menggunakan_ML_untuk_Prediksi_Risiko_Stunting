import React from 'react';

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

interface ChartChildData {
  nama: string;
  umur: number;
  jenisKelamin: 'L' | 'P';
  tbAwal: number;
  tbAkhir: number;
  lamaPantau: number;
}

interface GrowthBarChartProps {
  child: ChartChildData;
  isStunting: boolean;
  isSimulated: boolean;
}

export const GrowthBarChart: React.FC<GrowthBarChartProps> = React.memo(({ child, isStunting, isSimulated }) => {
  const [hoveredBar, setHoveredBar] = React.useState<{
    type: 'who' | 'child' | 'proj';
    val: number;
    age: number;
    whoMedian: number;
  } | null>(null);

  const clearHover = React.useCallback(() => setHoveredBar(null), []);

  // Unique ID prefix for SVG gradients to avoid conflicts across instances
  const uid = React.useId().replace(/:/g, '');
  const gradBlue = `blueBar_${uid}`;
  const gradGreen = `greenBar_${uid}`;
  const gradOrange = `orangeBar_${uid}`;

  // Responsive container width measurement
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(600);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setContainerWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const renderBar = (
    x: number, y: number, w: number, yBase: number, fillGradientId: string, isProj = false, onHover?: () => void, isHovered = false
  ) => {
    const h = yBase - y;
    if (h <= 0) return null;

    return (
      <g
        style={{
          opacity: hoveredBar ? (isHovered ? 1 : 0.45) : (isProj ? 0.85 : 1),
          cursor: 'pointer',
          transition: 'opacity 0.15s ease-in-out',
          willChange: 'opacity' /* FIXED: Hardware acceleration khusus opacity */
        }}
        onMouseEnter={onHover}
        onMouseLeave={clearHover}
      >
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} fill="transparent" />
        <rect
          x={x} y={y} width={w} height={h} rx={0} ry={0}
          fill={`url(#${fillGradientId})`}
          /* FIXED: Stroke tidak diubah saat hover untuk mencegah render SVG patah/glitch */
          stroke={isProj ? "var(--accent-coral)" : "none"}
          strokeWidth={isProj ? "1.5" : "0"}
          strokeDasharray={isProj ? "3,2" : "none"}
        />
      </g>
    );
  };

  const ageEnd = child.umur;
  const duration = child.lamaPantau || 0;
  const ageStart = duration > 0 ? child.umur - duration : 0;

  let ages: number[] = [];
  if (duration === 0) {
    ages = [ageEnd];
  } else if (duration > 0 && Number.isInteger(duration)) {
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
  const tbStart = duration > 0 ? child.tbAwal : child.tbAkhir;

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
  const minH = Math.min(...allHeights) - 5;
  const maxH = Math.max(...allHeights) + 5;

  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;
  // Use measured container width for the SVG viewBox so that it renders at 1:1 pixel ratio — no stretching
  const svgW = Math.max(280, containerWidth - 32); // account for 1rem padding on each side
  const svgH = 220;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  const scaleX = (idx: number) => padLeft + (ages.length > 1 ? idx / (ages.length - 1) : 0.5) * chartW;
  const scaleY = (h: number) => padTop + (1 - (h - minH) / (maxH - minH)) * chartH;

  const medianPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMedian)}`).join(' L ');
  const minus2SDPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus2SD)}`).join(' L ');
  const minus3SDPoints = dataPoints.map((pt, i) => `${scaleX(i)},${scaleY(pt.whoMinus3SD)}`).join(' L ');

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

  const yTicks = 4;
  const yTickValues: number[] = [];
  for (let i = 0; i < yTicks; i++) {
    yTickValues.push(maxH - (i / (yTicks - 1)) * (maxH - minH));
  }

  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', isolation: 'isolate' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Grafik Perkembangan Balita (Tipe Batang)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Membandingkan tinggi badan anak ({child.nama}) dengan standar tinggi normal WHO.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem', fontWeight: 700, padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-green)', display: 'inline-block', borderRadius: '2px' }}></span> Area Normal (WHO)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', background: 'linear-gradient(to bottom, var(--accent-green), rgba(118, 200, 147, 0.7))', display: 'inline-block', borderRadius: '2px' }}></span> Batang Standar WHO
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span style={{ width: '10px', height: '10px', background: 'linear-gradient(to bottom, var(--accent-blue), rgba(91, 164, 230, 0.7))', display: 'inline-block', borderRadius: '2px' }}></span> Batang Tinggi Anak
          </span>
          {isSimulated && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-coral)' }}>
              <span style={{ width: '10px', height: '10px', background: 'linear-gradient(to bottom, var(--accent-coral), rgba(231, 111, 81, 0.7))', display: 'inline-block', borderRadius: '2px' }}></span> Batang Proyeksi ML
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
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)',
          flexShrink: 0
        }}>
          {isStunting ? '!' : '✓'}
        </div>
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

      {/* Dynamic Bar Analysis Notice — driven by LOCAL hoveredBar state */}
      <div style={{
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minHeight: '90px', /* FIXED: Menjaga tinggi agar grafik tidak kedorong turun */
        transition: 'all var(--transition-fast)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}>
        {/* FIXED: Mengganti emoji dinamis dengan bentuk lingkaran warna CSS murni agar tidak memicu bug GPU browser */}
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {!hoveredBar ? (
            <div style={{ width: '12px', height: '12px', border: '2px solid var(--text-secondary)', borderRadius: '2px' }} />
          ) : (
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: hoveredBar.type === 'who' ? 'var(--accent-green)' : hoveredBar.type === 'child' ? 'var(--accent-blue)' : 'var(--accent-coral)'
            }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          {!hoveredBar ? (
            <>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Informasi Interaktif Grafik
              </h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Sentuh atau arahkan kursor pada batang grafik di bawah untuk melihat analisis detail pertumbuhan balita pada bulan tertentu.
              </p>
            </>
          ) : (
            (() => {
              const roundedAge = Math.round(hoveredBar.age);
              if (hoveredBar.type === 'who') {
                return (
                  <>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-green)' }}>
                      Batang Standar WHO — Umur {roundedAge} Bulan
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      Tinggi badan acuan ideal menurut standar pertumbuhan WHO pada usia {roundedAge} bulan adalah <strong>{hoveredBar.val.toFixed(1)} cm</strong>.
                    </p>
                  </>
                );
              } else if (hoveredBar.type === 'child') {
                const diff = hoveredBar.val - hoveredBar.whoMedian;
                const diffText = diff >= 0 ? `lebih tinggi +${diff.toFixed(1)} cm` : `lebih rendah ${diff.toFixed(1)} cm`;
                const isBelow = diff < -2;
                return (
                  <>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                      Batang Tinggi Aktual {child.nama} — Umur {roundedAge} Bulan
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      Tinggi aktual anak saat penimbangan adalah <strong>{hoveredBar.val.toFixed(1)} cm</strong>. Tinggi ini <strong>{diffText}</strong> dibanding acuan standar WHO ({hoveredBar.whoMedian.toFixed(1)} cm). Status: <span style={{ color: isBelow ? 'var(--accent-coral)' : 'var(--accent-green)', fontWeight: 700 }}>{isBelow ? 'Perlu Perhatian' : 'Baik'}</span>
                    </p>
                  </>
                );
              } else {
                const diff = hoveredBar.val - hoveredBar.whoMedian;
                const diffText = diff >= 0 ? `lebih tinggi +${diff.toFixed(1)} cm` : `lebih rendah ${diff.toFixed(1)} cm`;
                return (
                  <>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-coral)' }}>
                      Batang Proyeksi Machine Learning — Target Usia {roundedAge} Bulan
                    </h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                      Berdasarkan tren pertumbuhan awal, model ML memprediksi tinggi badan anak di masa depan akan mencapai <strong>{hoveredBar.val.toFixed(1)} cm</strong>. Tinggi proyeksi ini <strong>{diffText}</strong> dibanding standar WHO ({hoveredBar.whoMedian.toFixed(1)} cm).
                    </p>
                  </>
                );
              }
            })()
          )}
        </div>
      </div>

      {/* SVG Custom Premium Chart — uses dynamic viewBox for 1:1 pixel rendering (no stretch) */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block', overflow: 'visible' }}>

          {/* Gradients Definitions — unique IDs per component instance */}
          <defs>
            <linearGradient id={gradBlue} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-blue)" />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id={gradGreen} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-green)" />
              <stop offset="100%" stopColor="var(--accent-green)" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id={gradOrange} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-coral)" />
              <stop offset="100%" stopColor="var(--accent-coral)" stopOpacity={0.7} />
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
                  x2={svgW - padRight}
                  y2={yPos}
                  stroke="var(--border-color)"
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                <text
                  x={padLeft - 6}
                  y={yPos + 3}
                  fontSize="10"
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

          {/* WHO Standard Lines */}
          <path d={`M ${medianPoints}`} fill="none" stroke="var(--accent-green)" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5" />
          <path d={`M ${minus2SDPoints}`} fill="none" stroke="var(--accent-coral)" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.8" />
          <path d={`M ${minus3SDPoints}`} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.8" />

          {/* Bars Drawing */}
          {dataPoints.map((pt, i) => {
            const isLast = i === dataPoints.length - 1;
            const isProjectedNode = isLast && isSimulated;
            const cx = scaleX(i);
            // Dynamic bar width based on chart area and data density
            const barW = Math.max(8, Math.min(18, chartW / ages.length * 0.25));

            const yBase = padTop + chartH;
            const yWho = scaleY(pt.whoMedian);
            const yChild = scaleY(pt.childHeight);

            let label = `${Math.round(pt.age)} Bln`;
            if (isProjectedNode) {
              label = `${Math.round(pt.age)} Bln (ML)`;
            }

            const w = barW;

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

                {/* Standard WHO Bar (Green) */}
                {renderBar(
                  cx - w - 1,
                  yWho,
                  w,
                  yBase,
                  gradGreen,
                  false,
                  () => setHoveredBar({ type: 'who', val: pt.whoMedian, age: pt.age, whoMedian: pt.whoMedian }),
                  hoveredBar?.type === 'who' && hoveredBar?.age === pt.age
                )}
                {/* Child Height Bar (Blue or Orange for ML Projection) */}
                {isProjectedNode
                  ? renderBar(
                    cx + 1,
                    yChild,
                    w,
                    yBase,
                    gradOrange,
                    true,
                    () => setHoveredBar({ type: 'proj', val: pt.childHeight, age: pt.age, whoMedian: pt.whoMedian }),
                    hoveredBar?.type === 'proj' && hoveredBar?.age === pt.age
                  )
                  : renderBar(
                    cx + 1,
                    yChild,
                    w,
                    yBase,
                    gradBlue,
                    false,
                    () => setHoveredBar({ type: 'child', val: pt.childHeight, age: pt.age, whoMedian: pt.whoMedian }),
                    hoveredBar?.type === 'child' && hoveredBar?.age === pt.age
                  )
                }

                {/* WHO Standard height text label */}
                <text
                  x={cx - w / 2 - 1}
                  y={yWho - 10}
                  fontSize="10"
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
                  x={cx - w / 2 - 1}
                  y={yWho - 10}
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                  fill="var(--accent-green)"
                  style={{ pointerEvents: 'none' }}
                >
                  {Math.round(pt.whoMedian)}
                </text>

                {/* Child height text label */}
                <text
                  x={cx + w / 2 + 1}
                  y={yChild - 10}
                  fontSize="10"
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
                  x={cx + w / 2 + 1}
                  y={yChild - 10}
                  fontSize="10"
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
                  y={padTop + chartH + 18}
                  fontSize="11"
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
  );
});

GrowthBarChart.displayName = 'GrowthBarChart';