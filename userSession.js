import { clearActiveRole, readActiveRole, saveActiveRole } from "./roleSession.js";

const USER_SESSION_KEY = "hungryhub-user-session";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function readUserSession() {
  try {
    const rawSession = getStorage()?.getItem(USER_SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function saveUserSession(emailOrPhone) {
  const session = { emailOrPhone, signedInAt: new Date().toISOString() };
  getStorage()?.setItem(USER_SESSION_KEY, JSON.stringify(session));
  saveActiveRole("user");
  return session;
}

export function clearUserSession() {
  getStorage()?.removeItem(USER_SESSION_KEY);
  if (readActiveRole() === "user") {
    clearActiveRole();
  }
}
