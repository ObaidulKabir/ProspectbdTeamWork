import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Project } from "@/types/schema";

export async function GET() {
  return NextResponse.json(serverStore.getProjects());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Project;
  const created = serverStore.addProject(body);
  return NextResponse.json(created, { status: 201 });
}
