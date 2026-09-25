import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { fetchOrionPath, isAllowedOrionPath } from "@/lib/orion";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "AUTHENTICATION_REQUIRED" }, { status: 401 });
  }

  const { path } = await params;
  if (!isAllowedOrionPath(path)) {
    return NextResponse.json({ error: "ORION_ROUTE_NOT_ALLOWED" }, { status: 404 });
  }

  try {
    const response = await fetchOrionPath(path);
    const contentType = response.headers.get("content-type") ?? "application/json";

    if (!response.ok) {
      return NextResponse.json({ error: "ORION_REQUEST_FAILED", status: response.status }, { status: response.status });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "ORION_UNAVAILABLE" }, { status: 503 });
  }
}
