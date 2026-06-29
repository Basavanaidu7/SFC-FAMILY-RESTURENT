const ACTIVE_ROLE_KEY = "hungryhub-active-role";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function readActiveRole() {
  return getStorage()?.getItem(ACTIVE_ROLE_KEY) || "";
}

export function saveActiveRole(role) {
  getStorage()?.setItem(ACTIVE_ROLE_KEY, role);
}

export function clearActiveRole() {
  getStorage()?.removeItem(ACTIVE_ROLE_KEY);
}
