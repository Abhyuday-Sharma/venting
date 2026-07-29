import { Metadata } from 'next';
import { UserProfileByUsernameClient } from './username-client';

export const metadata: Metadata = {
  title: 'User Profile',
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
  return <UserProfileByUsernameClient />;
}
