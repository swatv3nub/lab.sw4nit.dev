import "server-only";

const ORION_TIMEOUT_MS = 2_500;

export type OrionHealth = {
  state: "online" | "unavailable" | "unconfigured";
  label: string;
  detail: string;
};

function upstreamBaseUrl() {
  const value = process.env.ORION_UPSTREAM?.trim();
  if (!value) return null;
  const parsed = new URL(value);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("Invalid ORION upstream protocol");
  return new URL(parsed.toString().endsWith("/") ? parsed.toString() : `${parsed.toString()}/`);
}

function upstreamHeaders() {
  const headers = new Headers({ Accept: "application/json" });
  const authorization = process.env.ORION_AUTHORIZATION?.trim();
  if (authorization) headers.set("Authorization", authorization);
  return headers;
}

export async function fetchOrionPath(path: string[]) {
  const baseUrl = upstreamBaseUrl();
  if (!baseUrl) throw new Error("ORION upstream is not configured");
  return fetch(new URL(path.join("/"), baseUrl), {
    headers: upstreamHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(ORION_TIMEOUT_MS)
  });
}

export function isAllowedOrionPath(path: string[]) {
  if (path.length === 2 && path[0] === "v1" && (path[1] === "health" || path[1] === "investigations")) return true;
  if (path.length === 3 && path[0] === "v1" && path[1] === "investigations") return /^[A-Za-z0-9_-]+$/.test(path[2]);
  return path.length === 4 && path[0] === "v1" && path[1] === "investigations" && /^[A-Za-z0-9_-]+$/.test(path[2]) && path[3] === "report";
}

export async function getOrionHealth(): Promise<OrionHealth> {
  if (!process.env.ORION_UPSTREAM) {
    return { state: "unconfigured", label: "ORION not configured", detail: "Set ORION_UPSTREAM on the server to enable service checks." };
  }

  try {
    const response = await fetchOrionPath(["v1", "health"]);
    if (!response.ok) {
      return { state: "unavailable", label: "ORION unavailable", detail: "The investigation service returned an unavailable response." };
    }
    return { state: "online", label: "ORION reachable", detail: "The server-side health check completed. Investigation records remain contract-driven." };
  } catch {
    return { state: "unavailable", label: "ORION unavailable", detail: "The lab could not reach the private investigation service." };
  }
}
