import { Metadata } from 'next';
import UpdatesClient from './updates-client';

export const metadata: Metadata = {
  title: 'Update Log & AI Transparency | Venting',
  description: 'Track all new features, improvements, and discover how & where AI runs securely to support your emotional well-being on Venting.',
};

export default function UpdatesPage() {
  return <UpdatesClient />;
}
