export const formatTimestamp = (isoString) => {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatPercent = (val) => `${parseFloat(val).toFixed(1)}%`;

export const getSeverityClass = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH': return 'badge-high';
    case 'MODERATE': return 'badge-moderate';
    default: return 'badge-low';
  }
};
