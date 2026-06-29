export const DELIVERY_RATE_PER_SEGMENT = 50;
export const DELIVERY_SEGMENT_KM = 7;
export const MAX_DELIVERY_DISTANCE_KM = 100;

export const storeLocation = {
  latitude: Number(import.meta.env.VITE_STORE_LATITUDE || 17.385),
  longitude: Number(import.meta.env.VITE_STORE_LONGITUDE || 78.4867),
};

export function parseLocationLabel(locationLabel) {
  if (!locationLabel) {
    return null;
  }
  const [latitudeRaw, longitudeRaw] = locationLabel.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(latitudeRaw) || !Number.isFinite(longitudeRaw)) {
    return null;
  }
  return { latitude: latitudeRaw, longitude: longitudeRaw };
}

export function getDistanceKm(fromLocation, toLocation) {
  if (!fromLocation || !toLocation) {
    return null;
  }
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(toLocation.latitude - fromLocation.latitude);
  const dLng = toRadians(toLocation.longitude - fromLocation.longitude);
  const lat1 = toRadians(fromLocation.latitude);
  const lat2 = toRadians(toLocation.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getDeliveryFee(distanceKm) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return DELIVERY_RATE_PER_SEGMENT;
  }
  return Math.ceil(distanceKm / DELIVERY_SEGMENT_KM) * DELIVERY_RATE_PER_SEGMENT;
}

export function getDeliveryQuote(customerLocation) {
  const distanceKm = getDistanceKm(storeLocation, customerLocation);
  if (distanceKm === null) {
    return {
      available: false,
      distanceKm: null,
      fee: 0,
      message: "Allow location access so SFC Family Restaurant can check delivery availability.",
    };
  }
  const roundedDistanceKm = Math.round(distanceKm * 10) / 10;
  if (roundedDistanceKm > MAX_DELIVERY_DISTANCE_KM) {
    return {
      available: false,
      distanceKm: roundedDistanceKm,
      fee: 0,
      message: `Delivery is available only within ${MAX_DELIVERY_DISTANCE_KM} km.`,
    };
  }
  return {
    available: true,
    distanceKm: roundedDistanceKm,
    fee: getDeliveryFee(roundedDistanceKm),
    message: `Delivery available within ${roundedDistanceKm} km. Charge is Rs ${DELIVERY_RATE_PER_SEGMENT} per ${DELIVERY_SEGMENT_KM} km.`,
  };
}
