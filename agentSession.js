import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "./firebase.js";
import { clearActiveRole, readActiveRole, saveActiveRole } from "./roleSession.js";

const AGENT_SESSION_KEY = "hungryhub-delivery-agent-session";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function getAllowedAgentEmails() {
  return (import.meta.env.VITE_DELIVERY_AGENT_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAgentEmail(email) {
  const allowedEmails = getAllowedAgentEmails();
  return allowedEmails.includes(email.trim().toLowerCase());
}

export async function findActiveAgentByEmail(email) {
  const emailLower = email.trim().toLowerCase();
  if (!emailLower) {
    return null;
  }
  const snapshot = await getDocs(query(collection(db, "deliveryAgents"), where("emailLower", "==", emailLower), limit(1)));
  if (snapshot.empty) {
    return null;
  }
  const agentDoc = snapshot.docs[0];
  const agent = { id: agentDoc.id, ...agentDoc.data() };
  return agent.status === "active" ? agent : null;
}

export async function isAllowedAgentAccount(email) {
  try {
    const activeAgent = await findActiveAgentByEmail(email);
    if (activeAgent) {
      return activeAgent;
    }
  } catch {
    // Fall back to the environment allowlist when Firestore is unavailable.
  }
  return isAllowedAgentEmail(email) ? { email, emailLower: email.trim().toLowerCase(), status: "active", source: "env" } : null;
}

export function readAgentSession() {
  try {
    const rawSession = getStorage()?.getItem(AGENT_SESSION_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
}

export function saveAgentSession(email, agent = null) {
  const session = { email, agentId: agent?.id ?? null, signedInAt: new Date().toISOString() };
  getStorage()?.setItem(AGENT_SESSION_KEY, JSON.stringify(session));
  saveActiveRole("delivery");
  return session;
}

export function clearAgentSession() {
  getStorage()?.removeItem(AGENT_SESSION_KEY);
  if (readActiveRole() === "delivery") {
    clearActiveRole();
  }
}
