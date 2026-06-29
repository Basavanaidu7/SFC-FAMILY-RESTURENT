const USER_PROFILE_KEY = "sfc family-user-profile";
const LAST_ORDER_KEY = "sfc family-last-order";
export const emptyUserProfile = {
  fullName: "",
  gmail: "",
  mobile: "",
  photoDataUrl: "",
  alternateMobile: "",
  addressLine: "",
  area: "",
  city: "",
  pincode: "",
  locationLabel: "",
  locationLatitude: null,
  locationLongitude: null,
};
export function normalizeDigits(value) {
  return value.replace(/\D/g, "");
}
export function readUserProfile() {
  try {
    const rawProfile = window.localStorage.getItem(USER_PROFILE_KEY);
    if (!rawProfile) {
      return emptyUserProfile;
    }
    const parsedProfile = JSON.parse(rawProfile);
    return { ...emptyUserProfile, ...parsedProfile };
  } catch {
    return emptyUserProfile;
  }
}
export function saveUserProfile(profile) {
  const nextProfile = { ...readUserProfile(), ...profile };
  window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
}
export function readLastOrder() {
  try {
    const rawOrder = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!rawOrder) {
      return null;
    }
    return JSON.parse(rawOrder);
  } catch {
    return null;
  }
}
export function saveLastOrder(order) {
  window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
}
export function getIndianPhoneNumber(value) {
  const digits = normalizeDigits(value);
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (value.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  return "";
}
export function getProfileMobileNumber(value) {
  const digits = normalizeDigits(value);
  if (digits.length <= 10) {
    return digits;
  }
  if (digits.startsWith("91") && digits.length === 12) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}
