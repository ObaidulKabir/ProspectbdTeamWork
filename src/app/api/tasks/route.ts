import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Task } from "@/types/schema";

export async function GET() {
  return NextResponse.json(serverStore.getTasks());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Task;
  const created = serverStore.addTask(body);
  return NextResponse.json(created, { status: 201 });
}
