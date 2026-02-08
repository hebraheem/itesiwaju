"use client";

import { Profile } from '@/components/profile/profile';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session } = useSession();
  
  // Force remount when session email changes
  return <Profile key={session?.user?.email || 'no-user'} />;
}
