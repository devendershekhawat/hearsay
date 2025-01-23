'use client';

import { FaGoogle } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { signInWithGithub, signInWithGoogle } from '@/app/login/login.actions';
import { useTheme } from 'next-themes';
import React from 'react';

export function LoginCard() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Add useEffect to handle mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSignInWithGithub = async () => {
    await signInWithGithub();
  };

  return (
    <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-1/2 slide-in-from-bottom-1/2 duration-500">
      <CardHeader>
        <CardTitle>Sign in/Sign up</CardTitle>
        <CardDescription>Use one of the following methods to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-2 grid-cols-1">
          <Button className="w-full" onClick={handleSignInWithGoogle}>
            <FaGoogle />
            Sign in with Google
          </Button>
          <Button className="w-full" onClick={handleSignInWithGithub}>
            <FaGithub />
            Sign in with Github
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-2">
          {mounted && (
            <>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
              <Label className="tinos-regular text-md" htmlFor="theme-switch">
                {theme === 'dark' ? 'Eyes saved' : 'Save eyes'}
              </Label>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
