import { auth } from "@/auth";
import { startOrResumeFocusSession } from "@/lib/practice-focus";
import { redirect } from "next/navigation";
import PracticeFocusClient from "./practice-focus-client";

export default async function PracticeFocusPage({ params }: { params: Promise<{ topicId: string }> }) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const { topicId } = await params;
  const snapshot = await startOrResumeFocusSession((session.user as any).id, topicId);

  return <PracticeFocusClient initialSnapshot={snapshot} />;
}
