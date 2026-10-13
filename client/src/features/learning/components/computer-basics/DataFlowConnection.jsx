import React from 'react';

/**
 * DataFlowConnection
 * Renders SVG lines between computer architecture nodes.
 * Supports solid information flow lines and dashed control signal lines.
 * Renders animated traveling packets when active.
 */
export const DataFlowConnection = ({
  id,
  from,
  to,
  type = 'info', // 'info' (solid) or 'control' (dashed)
  isActive = false,
  bidirectional = false,
  payload = null,
  reducedMotion = false,
  label = '',
}) => {
  // Coordinates are defined in viewBox coordinates (e.g. 1000 x 650)
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;

  // Compute intermediate control points for pleasant curved or elbow paths if specified
  const isCurved = from.curve || to.curve;
  let pathD = '';

  if (from.pathPoints) {
    pathD = from.pathPoints;
  } else if (isCurved) {
    const midX = (x1 + x2) / 2 + (from.curveOffsetX || 0);
    const midY = (y1 + y2) / 2 + (from.curveOffsetY || 0);
    pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  } else {
    pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  const isControl = type === 'control';
  const strokeColor = isControl
    ? isActive
      ? '#f59e0b' // Amber glow
      : '#d97706' // Darker amber
    : isActive
    ? '#0284c7' // Bright sky blue
    : '#38bdf8'; // Sky blue

  const strokeWidth = isActive ? (isControl ? 3 : 4) : isControl ? 2 : 2.5;

  return (
    <g className="data-flow-connection" id={`conn-${id}`}>
      {/* Background halo for active connection */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          stroke={isControl ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.3)'}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
        />
      )}

      {/* Main Path */}
      <path
        d={pathD}
        id={`path-${id}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isControl ? '6 5' : 'none'}
        strokeLinecap="round"
        className={isActive && !reducedMotion ? (isControl ? 'animate-pulse' : '') : ''}
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

      {/* Animated Traveling Packet when active and motion allowed */}
      {isActive && !reducedMotion && (
        <g>
          {/* Animated circle traveling along path */}
          <circle r={isControl ? 4.5 : 6} fill={isControl ? '#fbbf24' : '#38bdf8'}>
            <animateMotion
              dur={isControl ? '1.4s' : '1.8s'}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>

          {/* Pulse glow around the traveling packet */}
          <circle
            r={isControl ? 8 : 11}
            fill={isControl ? 'rgba(251, 191, 36, 0.4)' : 'rgba(56, 189, 248, 0.45)'}
          >
            <animateMotion
              dur={isControl ? '1.4s' : '1.8s'}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#path-${id}`} />
            </animateMotion>
          </circle>

          {/* Payload tag badge if payload is provided */}
          {payload && (
            <g>
              <animateMotion
                dur={isControl ? '1.4s' : '1.8s'}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#path-${id}`} />
              </animateMotion>
              <rect
                x="-22"
                y="-24"
                width="44"
                height="18"
                rx="5"
                fill="#0f172a"
                stroke={isControl ? '#f59e0b' : '#38bdf8'}
                strokeWidth="1.5"
                className="shadow-sm"
              />
              <text
                x="0"
                y="-12"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {payload}
              </text>
            </g>
          )}
        </g>
      )}

      {/* Optional Mid-path connection label */}
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          textAnchor="middle"
          fill={isControl ? '#d97706' : '#0284c7'}
          fontSize="9"
          fontWeight="bold"
          className="select-none pointer-events-none bg-white"
        >
          {label}
        </text>
      )}
    </g>
  );
};

export default DataFlowConnection;
