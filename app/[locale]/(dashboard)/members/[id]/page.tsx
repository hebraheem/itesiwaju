import { MemberDetail } from '@/components/members/member-detail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Details | Itesiwaju',
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MemberDetail memberId={id} />;
}
