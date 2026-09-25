export const convertGeoToPixelPercent = (lat, lng, bounds = { minLat: 37.70, maxLat: 37.82, minLng: -122.52, maxLng: -122.38 }) => {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.max(10, Math.min(90, x)),
    y: Math.max(10, Math.min(90, y))
  };
};
