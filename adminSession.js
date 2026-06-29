import { clearActiveRole, readActiveRole, saveActiveRole } from "./roleSession.js";

const ADMIN_SESSION_KEY = "hungryhub-admin-session";
const DEFAULT_ADMIN_EMAILS = ["basavagudivaka8@gmail.com"];

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getAllowedAdminEmails() {
  return [
    ...DEFAULT_ADMIN_EMAILS,
    ...(import.meta.env.VITE_ADMIN_EMAILS || "").split(","),
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email) {
  if (!email) {
    return false;
  }
  const allowedEmails = getAllowedAdminEmails();
  return allowedEmails.includes(email.trim().toLowerCase());
}

export function readAdminSession() {
  try {
    const rawSession = getStorage()?.getItem(ADMIN_SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(email) {
  const session = { email, signedInAt: new Date().toISOString() };
  getStorage()?.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  saveActiveRole("admin");
  return session;
}

export function clearAdminSession() {
  getStorage()?.removeItem(ADMIN_SESSION_KEY);
  if (readActiveRole() === "admin") {
    clearActiveRole();
  }
}
