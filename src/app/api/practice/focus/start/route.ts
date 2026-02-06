import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { startOrResumeFocusSession } from "@/lib/practice-focus";
import { z } from "zod";

const payloadSchema = z.object({
  topicId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = payloadSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const snapshot = await startOrResumeFocusSession((session.user as any).id, body.data.topicId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json({ error: "Cannot start practice session" }, { status: 500 });
  }
}
