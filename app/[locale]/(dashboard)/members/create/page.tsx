import { MemberForm } from '@/components/members/member-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Member | Itesiwaju',
};

export default function CreateMemberPage() {
  return <MemberForm />;
}
