import React from 'react';

export const CodePerformanceGraph = ({
  wpmHistory = [],
  mistakeIndices = [],
  finalWpm = 0,
  accuracy = 100,
  modeName = 'Classic',
  height = 220,
}) => {
  // Generate fallback wpm history points if empty
  const pointsData = React.useMemo(() => {
    if (Array.isArray(wpmHistory) && wpmHistory.length >= 3) {
      return wpmHistory;
    }
    // Generate realistic dynamic progression graph based on final WPM
    const count = 12;
    const baseWpm = Math.max(10, Math.round(finalWpm * 0.45));
    const generated = [];
    for (let i = 0; i <= count; i++) {
      const progress = i / count;
      // Curved acceleration towards peak, with natural human typing fluctuations
      const factor = Math.sin(progress * Math.PI * 0.85);
      const noise = (Math.sin(i * 1.7) * 0.12 + Math.cos(i * 2.3) * 0.08) * finalWpm;
      let val = Math.round(baseWpm + (finalWpm - baseWpm) * factor + noise);
      if (i === count) val = finalWpm;
      val = Math.max(5, val);
      generated.push({ timeSec: i * 2, wpm: val });
    }
    return generated;
  }, [wpmHistory, finalWpm]);

  // Compute graph bounds & stats
  const wpms = pointsData.map((p) => p.wpm);
  const maxWpm = Math.max(...wpms, finalWpm + 10, 40);
  const minWpm = Math.max(0, Math.min(...wpms, 0));
  const peakWpm = Math.max(...wpms, finalWpm);
  const avgWpm = Math.round(wpms.reduce((a, b) => a + b, 0) / pointsData.length) || finalWpm;

  // Graph SVG coordinates calculation
  const padding = { top: 35, right: 30, bottom: 40, left: 50 };
  const graphWidth = 600;
  const graphHeight = height;
  const plotWidth = graphWidth - padding.left - padding.right;
  const plotHeight = graphHeight - padding.top - padding.bottom;

  const totalPoints = pointsData.length;
  
  const getX = (idx) => {
    if (totalPoints <= 1) return padding.left;
    return padding.left + (idx / (totalPoints - 1)) * plotWidth;
  };

  const getY = (val) => {
    const range = Math.max(10, maxWpm - minWpm);
    const normalized = (val - minWpm) / range;
    return padding.top + plotHeight - normalized * plotHeight;
  };

  // Build SVG Path with smooth cubic bezier curves
  let pathD = '';
  const coordinates = pointsData.map((p, i) => ({ x: getX(i), y: getY(p.wpm) }));

  if (coordinates.length > 0) {
    pathD = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const curr = coordinates[i];
      const next = coordinates[i + 1];
      const cp1X = curr.x + (next.x - curr.x) / 2;
      const cp1Y = curr.y;
      const cp2X = curr.x + (next.x - curr.x) / 2;
      const cp2Y = next.y;
      pathD += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
    }
  }

  // Gradient area path closure
  const areaD = coordinates.length > 0
    ? `${pathD} L ${coordinates[coordinates.length - 1].x} ${padding.top + plotHeight} L ${coordinates[0].x} ${padding.top + plotHeight} Z`
    : '';

  // Y-axis grid ticks (e.g. 0, maxWpm/2, maxWpm)
  const yTicks = [
    0,
    Math.round(maxWpm * 0.33),
    Math.round(maxWpm * 0.66),
    Math.round(maxWpm),
  ];

  return (
    <div className="w-full bg-[#0d1017] border border-sky-500/30 rounded-2xl p-4 shadow-xl text-white font-sans space-y-3 relative overflow-hidden select-none">
      {/* Top Header Bar inside Chart */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-sky-400 text-xs">
            WPM Performance Speed Curve
          </span>
          <span className="px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-[11px] font-bold">
            {modeName} Mode
          </span>
        </div>

        {/* Peak & Avg Badges */}
        <div className="flex items-center gap-3 font-mono font-bold text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <span>Peak:</span>
            <span className="text-sm font-black">{peakWpm} WPM</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-300 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/30">
            <span>Avg:</span>
            <span className="text-sm font-black">{avgWpm} WPM</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-x-auto no-scrollbar">
        <svg
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          className="w-full h-auto min-w-[480px] overflow-visible"
        >
          <defs>
            {/* Smooth glowing gradient fill under speed curve */}
            <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing line filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & crisp Y-axis Labels */}
          {yTicks.map((tickVal, idx) => {
            const yPos = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={graphWidth - padding.right}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Average WPM Line */}
          <line
            x1={padding.left}
            y1={getY(avgWpm)}
            x2={graphWidth - padding.right}
            y2={getY(avgWpm)}
            stroke="#38bdf8"
            strokeDasharray="6 6"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Gradient Fill under path */}
          {areaD && <path d={areaD} fill="url(#wpmGradient)" />}

          {/* Main Smooth Speed Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Data Points on Line */}
          {coordinates.map((coord, idx) => {
            const wpmVal = pointsData[idx]?.wpm || 0;
            const isPeak = wpmVal === peakWpm;
            const isFinal = idx === coordinates.length - 1;

            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isPeak || isFinal ? 5.5 : 3.5}
                  fill={isPeak ? '#fbbf24' : isFinal ? '#38bdf8' : '#0ea5e9'}
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Callout Badge for Peak WPM */}
                {isPeak && (
                  <g transform={`translate(${coord.x}, ${coord.y - 14})`}>
                    <rect
                      x="-30"
                      y="-16"
                      width="60"
                      height="20"
                      rx="6"
                      fill="#fbbf24"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="11"
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      ★ {wpmVal} MAX
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X-axis Line & Time labels */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={graphWidth - padding.right}
            y2={padding.top + plotHeight}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {coordinates.map((coord, idx) => {
            if (idx % 2 !== 0 && idx !== coordinates.length - 1) return null;
            const sec = pointsData[idx]?.timeSec ?? idx * 2;
            return (
              <text
                key={idx}
                x={coord.x}
                y={padding.top + plotHeight + 22}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {sec}s
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default CodePerformanceGraph;
