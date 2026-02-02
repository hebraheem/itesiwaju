import { AccountStatusList } from '@/components/account-status/account-status-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Status | Itesiwaju',
};

export default function AccountStatusPage() {
  return <AccountStatusList />;
}
