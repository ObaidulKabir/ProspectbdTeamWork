import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Module } from "@/types/schema";

export async function GET() {
  return NextResponse.json(serverStore.getModules());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Module;
  const created = serverStore.addModule(body);
  return NextResponse.json(created, { status: 201 });
}
