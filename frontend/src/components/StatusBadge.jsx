// src/admin/components/StatusBadge.jsx
import React from "react";

export default function StatusBadge({ status }) {
  const norm = status.toLowerCase();

  let cls = "status-badge ";
  if (norm === "delivered") cls += "delivered";
  else if (norm === "pending") cls += "pending";
  else if (norm === "canceled" || norm === "cancelled") cls += "canceled";

  return <span className={cls}>{status}</span>;
}
