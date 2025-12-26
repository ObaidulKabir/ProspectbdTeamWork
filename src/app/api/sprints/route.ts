import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Sprint } from "@/types/schema";

export async function GET() {
  return NextResponse.json(serverStore.getSprints());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Sprint;
  const created = serverStore.addSprint(body);
  return NextResponse.json(created, { status: 201 });
}
