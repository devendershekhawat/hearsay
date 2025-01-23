'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from './button';
import { FaHome, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { signOut } from '@/app/login/login.actions';
import { Label } from './label';
import { Switch } from './switch';
import { useTheme } from 'next-themes';
import { Separator } from './separator';
import Link from 'next/link';
import { BsEmojiSunglassesFill } from 'react-icons/bs';
import { useState, useEffect } from 'react';
import { Database } from '@/database.types';
import { usePathname } from 'next/navigation';

export function AppSidebar({ profile }: { profile: Database['public']['Tables']['Profile']['Row'] }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering theme switch until client-side
  const renderThemeSwitch = () => {
    if (!mounted) return null;

    return (
      <div className="flex items-center justify-center w-full gap-2">
        <Switch
          id="theme-switch"
          checked={theme === 'dark'}
          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <Label className="tinos-regular text-md" htmlFor="theme-switch">
          {theme === 'dark' ? 'Eyes saved' : 'Save eyes'}
        </Label>
      </div>
    );
  };

  console.log('pathname', pathname);

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="tinos-bold-italic text-4xl text-center">hearsay</h1>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === '/'} asChild>
                <Link href="/">
                  <FaHome />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === '/people'} asChild>
                <Link href="/people?type=following">
                  <FaUsers />
                  People
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname.startsWith('/profile')} asChild>
                <Link href={`/profile/${profile.username}`}>
                  <BsEmojiSunglassesFill />
                  Your Profile
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut}>
                <FaSignOutAlt />
                Sign out
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        {renderThemeSwitch()}
      </SidebarFooter>
    </Sidebar>
  );
}
