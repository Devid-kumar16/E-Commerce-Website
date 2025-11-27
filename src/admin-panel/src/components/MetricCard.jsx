import React from 'react';

export default function MetricCard({ title, value, delta, color }) {
  return (
    <div className="metric-card">
      <div className="metric-left">
        <div className={`metric-icon ${color}`} />
      </div>
      <div className="metric-right">
        <div className="metric-title">{title}</div>
        <div className="metric-value">{value} <span className="metric-delta">{delta}</span></div>
      </div>
    </div>
  );
}

