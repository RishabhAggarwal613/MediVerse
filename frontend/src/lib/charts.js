// src/lib/charts.js
import React from 'react';
import dayjs from 'dayjs';

// Theme palette for black + green UI
export const chartTheme = {
  bg: '#0B0F10',
  grid: '#1A1F1D',
  text: '#9CA3AF',
  tick: '#6B7280',
  primary: '#22C55E',
  primaryDark: '#16A34A',
  series: ['#22C55E', '#86EFAC', '#34D399', '#10B981', '#059669'],
};

// Common Recharts props for quick responsive charts
export const responsive = {
  width: '100%',
  height: 300,
};

// Formatters
export const fmt = {
  number: (v) =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(v)
      : v,
  compact: (v) =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
      : v,
  percent: (v) =>
    typeof v === 'number'
      ? new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 1 }).format(v)
      : v,
  date: (iso) => (iso ? dayjs(iso).format('DD MMM, YYYY') : ''),
  time: (iso) => (iso ? dayjs(iso).format('HH:mm') : ''),
  shortDate: (iso) => (iso ? dayjs(iso).format('DD MMM') : ''),
};

// Axis/Tick styles
export const axisStyle = {
  stroke: chartTheme.grid,
};
export const tickStyle = {
  fill: chartTheme.tick,
  fontSize: 12,
};

// Create a unique gradient id (for <defs>)
export function makeGradientId(name) {
  return `mv-grad-${name}-${Math.random().toString(36).slice(2, 7)}`;
}

// Area gradient helper without JSX (safe in .js files)
// Usage inside a chart component:
//   const gid = makeGradientId('primary');
//   <defs><AreaGradient id={gid} /></defs>
//   <Area dataKey="value" fill={`url(#${gid})`} stroke={chartTheme.primary} />
export function AreaGradient({ id, from = chartTheme.primary, to = 'rgba(34,197,94,0)' }) {
  return React.createElement(
    'linearGradient',
    { id, x1: '0', y1: '0', x2: '0', y2: '1' },
    React.createElement('stop', { offset: '0%', stopColor: from, stopOpacity: '0.4' }),
    React.createElement('stop', { offset: '100%', stopColor: to, stopOpacity: '0' }),
  );
}
