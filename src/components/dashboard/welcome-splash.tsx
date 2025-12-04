'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface WelcomeSplashProps {
  onAnimationComplete: () => void;
}

export function WelcomeSplash({ onAnimationComplete }: WelcomeSplashProps) {
  const { user } = useUser();
  const [animationState, setAnimationState] = useState<'initial' | 'fading-in' | 'animating-out' | 'done'>('initial');

  useEffect(() => {
    const sequence = async () => {
      // 1. Start fade-in
      setAnimationState('fading-in');
      await new Promise(resolve => setTimeout(resolve, 500)); 

      // 2. Start fade-out and animation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnimationState('animating-out');

      // 3. Wait for animation to finish and call callback
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      onAnimationComplete();
      setAnimationState('done');
    };

    if(user) {
      sequence();
    }
  }, [user, onAnimationComplete]);

  const username = user?.email?.split('@')[0] || 'User';
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500",
        animationState === 'initial' && 'opacity-0',
        animationState !== 'initial' && 'opacity-100',
      )}
    >
      <div 
        className={cn(
          "flex flex-col items-center gap-4 text-foreground transition-all duration-1000 ease-in-out",
          animationState === 'fading-in' && 'opacity-100 scale-100',
          animationState === 'initial' && 'opacity-0 scale-90',
          animationState === 'animating-out' && 'opacity-0 scale-50 translate-x-[45vw] -translate-y-[45vh]',
        )}
      >
        <ShieldCheck className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold">Welcome, {capitalizedUsername}!</h1>
        <p className="text-muted-foreground">Preparing your dashboard...</p>
      </div>
    </div>
  );
}
