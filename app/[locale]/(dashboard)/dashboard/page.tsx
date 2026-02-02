import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Itesiwaju',
  description: 'Itesiwaju Community Club Dashboard',
};

export default function DashboardPage() {
  return <DashboardHome />;
}
