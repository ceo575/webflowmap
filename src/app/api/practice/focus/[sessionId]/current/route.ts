import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSessionSnapshot } from "@/lib/practice-focus";

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const snapshot = await getSessionSnapshot((session.user as any).id, sessionId);

  if (!snapshot) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
