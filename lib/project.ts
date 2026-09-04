import { Doc, KIND_ORDER, Kind } from "./tokens";

/* A project file is the Doc as JSON, nothing more. Reading one back only checks
 * the shape the editor relies on; the same migrations that run on a saved
 * document then bring an older file up to date. */

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const KINDS = new Set<string>(KIND_ORDER);

const validTabs = (tabs: unknown) => tabs === undefined || (Array.isArray(tabs) && tabs.every((tab) => isRecord(tab) && typeof tab.label === "string" && typeof tab.icon === "string"));

const validItem = (item: unknown) =>
  isRecord(item) &&
  typeof item.id === "string" &&
  typeof item.kind === "string" &&
  KINDS.has(item.kind as Kind) &&
  typeof item.label === "string" &&
  (typeof item.icon === "string" || item.icon === null) &&
  typeof item.variant === "string" &&
  (item.supporting === undefined || typeof item.supporting === "string") &&
  (item.note === undefined || typeof item.note === "string") &&
  validTabs(item.tabs);

const validGroup = (group: unknown) =>
  isRecord(group) &&
  typeof group.id === "string" &&
  Number.isFinite(group.x) &&
  Number.isFinite(group.y) &&
  (group.axis === "x" || group.axis === "y") &&
  Array.isArray(group.items) &&
  group.items.length > 0 &&
  group.items.every(validItem);

const validFrame = (frame: unknown) =>
  isRecord(frame) && typeof frame.id === "string" && typeof frame.name === "string" && Number.isFinite(frame.x) && Number.isFinite(frame.y) && (frame.note === undefined || typeof frame.note === "string");

/** whether a parsed file has the shape of a document the editor can open */
export const isProject = (value: unknown): value is Doc => isRecord(value) && Array.isArray(value.groups) && Array.isArray(value.frames) && value.groups.every(validGroup) && value.frames.every(validFrame);

/** the file name a project is saved under: the app's title, or a fallback */
export const projectFileName = (doc: Doc) => {
  const base = doc.title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${base || "m3e-canvas"}.json`;
};

/** hands the document to the browser as a JSON download */
export function saveProject(doc: Doc) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = projectFileName(doc);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** reads a chosen file back into a document, or null when it is not one */
export async function readProject(file: File): Promise<Doc | null> {
  try {
    const next: unknown = JSON.parse(await file.text());
    return isProject(next) ? next : null;
  } catch {
    return null;
  }
}
