'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Dashboard } from '@/components/dashboard/dashboard';
import { WelcomeSplash } from '@/components/dashboard/welcome-splash';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Check session storage to see if we should show the welcome screen
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true') {
      setShowWelcome(true);
      // Clear the flag so it doesn't show again on subsequent navigations
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };

  if (isUserLoading || (!user && !showWelcome)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  if (showWelcome && user) {
    return <WelcomeSplash onAnimationComplete={handleAnimationComplete} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
