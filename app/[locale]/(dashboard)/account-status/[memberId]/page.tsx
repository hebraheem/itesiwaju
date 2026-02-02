import { AccountStatusDetail } from '@/components/account-status/account-status-detail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Account | Itesiwaju',
};

export default async function AccountStatusDetailPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  return <AccountStatusDetail memberId={memberId} />;
}
