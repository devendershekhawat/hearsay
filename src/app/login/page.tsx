'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { signInWithGithub, signInWithGoogle } from './login.actions';

export default function Login() {
  const { theme, setTheme } = useTheme();

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen px-4 gap-8">
      <h1 className="tinos-bold-italic text-4xl text-gradient animate-in fade-in-0 slide-in-from-bottom-1/2 slide-in-from-bottom-1/2 duration-500">
        hearsay
      </h1>
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
            <Button className="w-full" onClick={signInWithGithub}>
              <FaGithub />
              Sign in with Github
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2">
            <Switch
              id="theme-switch"
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <Label className="tinos-regular text-md" htmlFor="theme-switch">
              {theme === 'dark' ? 'Eyes saved' : 'Save eyes'}
            </Label>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
