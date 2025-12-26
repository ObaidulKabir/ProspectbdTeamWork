import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { UserStory } from "@/types/schema";

export async function GET() {
  return NextResponse.json(serverStore.getStories());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as UserStory;
  const created = serverStore.addStory(body);
  return NextResponse.json(created, { status: 201 });
}
