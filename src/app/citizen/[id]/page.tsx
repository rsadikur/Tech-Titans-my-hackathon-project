import { redirect } from 'next/navigation';

export default async function CitizenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/citizen/${id}/solved-issues`);
}
