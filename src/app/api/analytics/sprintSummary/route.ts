import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || "";
  const summary = serverStore.sprintSummaryByProject(projectId);
  return NextResponse.json(summary);
}
