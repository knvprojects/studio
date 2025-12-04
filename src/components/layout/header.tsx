'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, LogOut, Moon, Sun, Check, Edit } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { useTheme } from '@/components/theme-provider';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';


interface UserProfile {
  username: string;
  email: string;
}

export function Header() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = getAuth();
  const { setTheme } = useTheme();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [newUsername, setNewUsername] = useState(userProfile?.username || '');

  useEffect(() => {
    if (userProfile?.username) {
      setNewUsername(userProfile.username);
    }
  }, [userProfile?.username]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // You can add a toast notification here if you want
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!user || !userDocRef) return;
    if (newUsername.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Username',
        description: 'Username must be at least 3 characters long.',
      });
      return;
    }

    try {
      await updateDoc(userDocRef, { username: newUsername.trim() });
      toast({
        title: 'Success!',
        description: 'Your username has been updated.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your username. Please try again.',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUsernameUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewUsername(userProfile?.username || '');
    }
  };

  const username = userProfile?.username || user?.email?.split('@')[0] || '';
  const avatarFallback = username ? username.charAt(0).toUpperCase() : '';

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <nav className="flex w-full flex-row items-center justify-between gap-5 text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-headline sr-only sm:not-sr-only">DeepFake Defender</span>
        </Link>
        <div className="flex items-center gap-4">
          {isUserLoading || isProfileLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu onOpenChange={(open) => !open && setIsEditing(false)}>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                   <Avatar className="h-8 w-8">
                     <AvatarFallback>{avatarFallback}</AvatarFallback>
                   </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-8"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUsernameUpdate}>
                          <Check className="h-4 w-4"/>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                        <p className="text-sm font-bold leading-none">{username}</p>
                        <Edit className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="ml-2">Toggle theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                          System
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
