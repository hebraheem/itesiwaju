import { MembersList } from '@/components/members/members-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Members | Itesiwaju',
};

export default function MembersPage() {
  return <MembersList />;
}
