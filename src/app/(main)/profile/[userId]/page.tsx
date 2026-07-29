import { Metadata } from 'next';
import { UserProfileByIdClient } from './profile-client';

export const metadata: Metadata = {
  title: 'Profile',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function UserProfilePage() {
  return <UserProfileByIdClient />;
}
