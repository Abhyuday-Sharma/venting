import { redirect } from 'next/navigation';

export default function HomePage() {
  // The main page is the login page.
  redirect('/login');
}
