import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Project } from "@/types/schema";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agg = serverStore.getProjectAggregate(id);
  return NextResponse.json(agg);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = (await req.json()) as Partial<Project>;
  const updated = serverStore.updateProject(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  serverStore.deleteProject(id);
  return NextResponse.json({ ok: true });
}
