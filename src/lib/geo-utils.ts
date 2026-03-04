// iMoD Office Location (Chiang Mai)
export const IMOD_OFFICE = {
  name: "Mod Media Co., Ltd. (Chiang Mai)",
  lat: 18.8285821,
  lng: 99.01505,
  address: "Chiang Mai, Thailand",
  radiusKm: 1, // 1km radius for check-in
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Check if user is within office radius
 */
export function isWithinOfficeRadius(
  userLat: number,
  userLng: number,
  radiusKm: number = IMOD_OFFICE.radiusKm
): { isWithin: boolean; distance: number } {
  const distance = calculateDistance(
    userLat,
    userLng,
    IMOD_OFFICE.lat,
    IMOD_OFFICE.lng
  );
  
  return {
    isWithin: distance <= radiusKm,
    distance,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

/**
 * Get location verification status
 */
export type LocationStatus = 
  | "verified" // Within office radius
  | "remote" // Outside office but valid WFH/Field
  | "suspicious" // Office work type but outside radius
  | "unavailable"; // Location not provided

export function getLocationStatus(
  workType: string,
  userLat?: number,
  userLng?: number
): { status: LocationStatus; distance?: number; message: string } {
  // Location not provided
  if (userLat === undefined || userLng === undefined) {
    return {
      status: "unavailable",
      message: "ไม่สามารถระบุตำแหน่งได้",
    };
  }

  const { isWithin, distance } = isWithinOfficeRadius(userLat, userLng);

  // Office work
  if (workType === "office") {
    if (isWithin) {
      return {
        status: "verified",
        distance,
        message: `ตรวจสอบแล้ว: อยู่ในรัศมี Office (${formatDistance(distance)})`,
      };
    } else {
      return {
        status: "suspicious",
        distance,
        message: `⚠️ ระบุว่าทำงาน Office แต่อยู่ห่าง ${formatDistance(distance)}`,
      };
    }
  }

  // WFH or Field work
  return {
    status: "remote",
    distance,
    message: workType === "wfh" 
      ? "Work from Home" 
      : `Field Work (${formatDistance(distance)} จาก Office)`,
  };
}
