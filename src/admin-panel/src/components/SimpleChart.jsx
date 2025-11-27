import React from 'react';

/* Very lightweight chart using SVG path with hard-coded points for demo */
export default function SimpleChart({ color = '#6bb6ff' }) {
  // simple sparkline path
  const path = "M0,40 L40,20 L80,30 L120,15 L160,25 L200,10 L240,30";
  return (
    <svg viewBox="0 0 240 40" className="simple-chart" preserveAspectRatio="none" >
      <polyline points="0,40 40,20 80,30 120,15 160,25 200,10 240,30" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${path} L240,40 L0,40 Z`} fill={color} opacity="0.08" />
    </svg>
  );
}

