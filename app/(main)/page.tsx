import { redirect } from 'next/navigation';

export default function HomePage() {
  // The main page is the feed. Auth is handled there.
  redirect('/feed');
}
