import { NextRequest, NextResponse } from "next/server";
import { serverStore } from "@/lib/serverStore";
import { Project } from "@/types/schema";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const agg = serverStore.getProjectAggregate(params.id);
  return NextResponse.json(agg);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const updates = (await req.json()) as Partial<Project>;
  const updated = serverStore.updateProject(params.id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  serverStore.deleteProject(params.id);
  return NextResponse.json({ ok: true });
}
