import { redirect } from "next/navigation";

export default async function LegacyPracticeTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/practice/focus/${id}`);
}
