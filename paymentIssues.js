import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.js";

const PAYMENT_ISSUES_KEY = "hungryhub-payment-issues";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

export function readLocalPaymentIssues() {
  try {
    const storage = getStorage();
    const rawIssues = storage?.getItem(PAYMENT_ISSUES_KEY);
    if (!rawIssues) {
      return [];
    }
    const parsedIssues = JSON.parse(rawIssues);
    return Array.isArray(parsedIssues) ? parsedIssues : [];
  } catch {
    return [];
  }
}

export function saveLocalPaymentIssue(issue) {
  const storage = getStorage();
  const localIssue = {
    id: issue.id ?? `issue-${Date.now().toString(36)}`,
    source: "local",
    status: "open",
    createdAt: new Date().toISOString(),
    ...issue,
  };
  if (!storage) {
    return localIssue;
  }
  const nextIssues = [localIssue, ...readLocalPaymentIssues()].slice(0, 50);
  storage.setItem(PAYMENT_ISSUES_KEY, JSON.stringify(nextIssues));
  return localIssue;
}

export function updateLocalPaymentIssue(issueId, updates) {
  const storage = getStorage();
  if (!storage) {
    return [];
  }
  const nextIssues = readLocalPaymentIssues().map((issue) => (issue.id === issueId ? { ...issue, ...updates } : issue));
  storage.setItem(PAYMENT_ISSUES_KEY, JSON.stringify(nextIssues));
  return nextIssues;
}

export async function recordPaymentIssue(issue) {
  const localIssue = saveLocalPaymentIssue(issue);
  try {
    await addDoc(collection(db, "paymentIssues"), {
      ...issue,
      localId: localIssue.id,
      source: "firestore",
      status: "open",
      userId: auth.currentUser?.uid ?? null,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Keep the local copy. This path is important when Firestore rules or network access caused the issue.
  }
  return localIssue;
}
