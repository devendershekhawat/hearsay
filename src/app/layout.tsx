import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { createClient } from '@/utils/supabase/server';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'hearsay',
  description: 'A social media platform for the modern age.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const isAuthenticated = data?.user !== null && error === null;

  let profile = null;
  if (isAuthenticated) {
    const { data: profileData, error: profileError } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (!profileError) {
      profile = profileData;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {isAuthenticated ? (
            <SidebarProvider>
              {profile && <AppSidebar profile={profile} />}
              <main className="w-full">{children}</main>
            </SidebarProvider>
          ) : (
            children
          )}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
