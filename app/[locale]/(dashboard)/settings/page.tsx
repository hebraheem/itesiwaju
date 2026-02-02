import { Settings } from '@/components/settings/settings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Itesiwaju',
};

export default function SettingsPage() {
  return <Settings />;
}
