import { getSession } from '@auth0/nextjs-auth0';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Navbar } from '@/components/layout/Navbar';

export const metadata = {
  title: 'Dashboard',
  description: 'Your SucMeet rooms and meetings',
};

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-background">
      {session && <Navbar />}
      <DashboardClient isAuthenticated={!!session} />
    </main>
  );
}
