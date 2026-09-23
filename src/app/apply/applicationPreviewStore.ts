// Browser-only UI preview storage. Never use this as proof of a real payment.
const key = "achievers-application-previews-v1";
export function getPreviewSnapshot() {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
export function subscribeToPreviews(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("application-preview-change", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("application-preview-change", listener); };
}
function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("application-preview-change"));
}
type Details = Record<string, string>;
type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

function records(storage: Storage): Details[] {
  const raw = storage.getItem(key);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Invalid preview storage");
  return parsed.filter((item): item is Details => item && typeof item === "object" && typeof item.applicationId === "string" && Object.values(item).every((value) => typeof value === "string"));
}

export function getPreviewApplications(samples: Details[] = [], storage: Storage = window.localStorage): Details[] {
  const merged = new Map(samples.map((person) => [person.applicationId, person]));
  for (const person of records(storage)) merged.set(person.applicationId, person);
  return [...merged.values()];
}

export function savePreviewApplication(details: Details, storage: Storage = window.localStorage): Details {
  const existing = records(storage);
  const previous = existing.find((person) => person.applicationId === details.applicationId);
  const clean = Object.fromEntries(Object.entries(details).filter(([name]) => !name.startsWith("classIX")));
  const randomSuffix = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
  const saved: Details = {
    ...clean,
    applicationId: details.applicationId || `AJC-2026-${randomSuffix}`,
    paymentStatus: previous?.paymentStatus || "pending",
    paymentReference: previous?.paymentReference || "",
    paidAt: previous?.paidAt || "",
    savedAt: new Date().toISOString(),
    previewOnly: "true",
  };
  storage.setItem(key, JSON.stringify([...existing.filter((person) => person.applicationId !== saved.applicationId), saved]));
  notify();
  return saved;
}

export function markPreviewPaid(details: Details, storage: Storage = window.localStorage): Details {
  const saved = savePreviewApplication(details, storage);
  if (saved.paymentStatus === "paid_demo") return saved;
  const paid: Details = { ...saved, paymentStatus: "paid_demo", paymentReference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, paidAt: new Date().toISOString() };
  storage.setItem(key, JSON.stringify(records(storage).map((person) => person.applicationId === saved.applicationId ? paid : person)));
  notify();
  return paid;
}
