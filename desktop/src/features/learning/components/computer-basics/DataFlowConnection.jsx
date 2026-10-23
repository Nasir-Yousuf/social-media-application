import React from 'react';

/**
 * DataFlowConnection
 * High-precision SVG connection between computer architecture components.
 * Supports:
 * - Solid Information Flow lines (Data & Results)
 * - Segmented / Dashed Control Signal lines (Control Unit supervisory pulses)
 * - Directed arrows with proper marker orientation
 * - Animated traveling data packets with distinct payload tags
 * - Pulse glow halos when active
 * - Reduced motion fallbacks (accessible static indicator)
 */
export const DataFlowConnection = ({
  id,
  from,
  to,
  type = 'info', // 'info' (solid blue) or 'control' (dashed amber)
  isActive = false,
  bidirectional = false,
  payload = null,
  reducedMotion = false,
  label = '',
  speed = 1,
}) => {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  let pathD = '';
  if (from.pathPoints) {
    pathD = from.pathPoints;
  } else if (from.curve || to.curve) {
    const midX = (x1 + x2) / 2 + (from.curveOffsetX || 0);
    const midY = (y1 + y2) / 2 + (from.curveOffsetY || 0);
    pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  } else {
    pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const isControl = type === 'control';

  // Base colors conforming to technical visualization standards
  const strokeColor = isControl
    ? isActive
      ? '#f59e0b' // Bright amber
      : '#d97706' // Technical bronze-amber
    : isActive
    ? '#38bdf8' // Vibrant sky cyan
    : '#0284c7'; // Deep technical blue

  const strokeWidth = isActive ? (isControl ? 3.5 : 4) : isControl ? 2 : 2.5;

  // Duration scales inversely with playback speed
  const animDur = (isControl ? 1.4 : 1.6) / (speed || 1);

  return (
    <g className="data-flow-connection" id={`conn-${id}`}>
      {/* Background ambient glow halo when active */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={isControl ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.4)'}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 pointer-events-none"
        />
      )}

      {/* Main Connection Path */}
      <path
        d={pathD}
        id={`path-${id}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isControl ? '7 5' : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
        markerEnd={`url(#${isControl ? (isActive ? 'arrow-control-active' : 'arrow-control') : isActive ? 'arrow-info-active' : 'arrow-info'})`}
        markerStart={
          bidirectional
            ? `url(#${isActive ? 'arrow-info-active-start' : 'arrow-info-start'})`
            : undefined
        }
      />

      {/* Moving Signal Packet on Active Paths */}
      {isActive && !reducedMotion && (
        <g className="pointer-events-none">
          {/* Outer glow aura for packet */}
          <circle
            r={isControl ? 8 : 10}
            fill={isControl ? 'rgba(245, 158, 11, 0.4)' : 'rgba(56, 189, 248, 0.45)'}
          >
            <animateMotion
              dur={`${animDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>

          {/* Core particle packet */}
          <circle
            r={isControl ? 4.5 : 6}
            fill={isControl ? '#fbbf24' : '#ffffff'}
            stroke={isControl ? '#d97706' : '#0284c7'}
            strokeWidth="1.5"
          >
            <animateMotion
              dur={`${animDur}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>

          {/* Floating Data Payload Tag (Values such as "10", "20", "ADD", "30") */}
          {payload && (
            <g>
              <animateMotion
                dur={`${animDur}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#path-${id}`} />
              </animateMotion>
              <rect
                x="-26"
                y="-26"
                width="52"
                height="19"
                rx="6"
                fill="#090d16"
                stroke={isControl ? '#f59e0b' : '#38bdf8'}
                strokeWidth="1.5"
                className="filter drop-shadow-md"
              />
              <text
                x="0"
                y="-13"
                textAnchor="middle"
                fill={isControl ? '#fde68a' : '#e0f2fe'}
                fontSize="9.5"
                fontWeight="800"
                fontFamily="ui-monospace, monospace"
                letterSpacing="0.05em"
              >
                {payload}
              </text>
            </g>
          )}
        </g>
      )}

      {/* Reduced-Motion Static Indicator */}
      {isActive && reducedMotion && payload && (
        <g className="pointer-events-none">
          <rect
            x={(x1 + x2) / 2 - 28}
            y={(y1 + y2) / 2 - 12}
            width="56"
            height="20"
            rx="6"
            fill="#090d16"
            stroke={isControl ? '#f59e0b' : '#38bdf8'}
            strokeWidth="1.5"
          />
          <text
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2 + 2}
            textAnchor="middle"
            fill={isControl ? '#fde68a' : '#e0f2fe'}
            fontSize="9"
            fontWeight="bold"
            fontFamily="ui-monospace, monospace"
          >
            {payload}
          </text>
        </g>
      )}

      {/* Optional mid-connection functional label */}
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fill={isControl ? '#b45309' : '#0369a1'}
          fontSize="9.5"
          fontWeight="bold"
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default DataFlowConnection;
