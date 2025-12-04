'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  type AuthError
} from 'firebase/auth';
import { doc } from 'firebase/firestore';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});


type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;


export function AuthForm() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (!isUserLoading && user) {
      sessionStorage.setItem('justLoggedIn', 'true');
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const onLogin: SubmitHandler<LoginValues> = async (data) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Login successful!' });
      // The useEffect will handle the redirection and setting the session flag
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: authError.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister: SubmitHandler<RegisterValues> = async (data) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;

      // Create a user document in Firestore
      const userDocRef = doc(firestore, "users", newUser.uid);
      setDocumentNonBlocking(userDocRef, {
        id: newUser.uid,
        username: data.username,
        email: data.email,
        registrationDate: new Date().toISOString(),
      }, { merge: false });

      toast({ title: 'Registration successful!', description: 'You can now log in.' });
      toggleView(); // Switch to login view after successful registration
    } catch (error) {
      const authError = error as AuthError;
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: authError.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    resetLogin();
    resetRegister();
  };

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md h-[540px] overflow-hidden">
      {/* Login Form */}
      <div
        className={cn(
          'absolute inset-0 transition-transform duration-500 ease-in-out',
          isLoginView ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Input {...registerLogin('email')} placeholder="Email" disabled={isLoading} />
                {loginErrors.email && <p className="text-xs text-destructive">{loginErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Input {...registerLogin('password')} type="password" placeholder="Password" disabled={isLoading} />
                {loginErrors.password && <p className="text-xs text-destructive">{loginErrors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" onClick={toggleView} className="p-0 h-auto">
                Register
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Form */}
      <div
        className={cn(
          'absolute inset-0 transition-transform duration-500 ease-in-out',
          isLoginView ? 'translate-x-full' : 'translate-x-0'
        )}
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Fill out the form below to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
               <div className="space-y-2">
                <Input {...registerRegister('username')} placeholder="Username" disabled={isLoading} />
                {registerErrors.username && <p className="text-xs text-destructive">{registerErrors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Input {...registerRegister('email')} placeholder="Email" disabled={isLoading} />
                {registerErrors.email && <p className="text-xs text-destructive">{registerErrors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Input {...registerRegister('password')} type="password" placeholder="Password" disabled={isLoading} />
                {registerErrors.password && <p className="text-xs text-destructive">{registerErrors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Input {...registerRegister('confirmPassword')} type="password" placeholder="Confirm Password" disabled={isLoading} />
                {registerErrors.confirmPassword && <p className="text-xs text-destructive">{registerErrors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Register'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" onClick={toggleView} className="p-0 h-auto">
                Login
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
