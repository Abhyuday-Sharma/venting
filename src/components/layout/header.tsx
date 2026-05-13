
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, PenSquare, MessageSquare, Settings, ChevronDown, Smile } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { NotificationsDropdown } from './notifications-dropdown';
import { ModeToggle } from './mode-toggle';

const Logo = () => (
  <Image
    src="/ventinglogoo.png"
    alt="Venting Logo"
    width={170}
    height={65}
    priority
    className="dark:invert hover:scale-105 transition-transform duration-300 drop-shadow-md"
  />
);


export function AppHeader() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/40 backdrop-blur-xl border-white/10 dark:border-white/5 supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-14 items-center">
        <div className="flex items-center">
          <Link href="/feed" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            {user && (
                <>
                    <Link
                        href="/dashboard"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/feed"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Public Feed
                    </Link>
                    <Link
                        href="/moments"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Moments
                    </Link>
                    <Link
                        href="/vent"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Vent
                    </Link>
                </>
            )}
        </nav>
        <div className="flex items-center justify-end">
          {loading ? (
            <Skeleton className="h-8 w-24 rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-1">
              <ModeToggle />
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-8 focus-visible:ring-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.username ?? 'User'} />
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline-block">{user.username}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => router.push('/feed')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Public Feed</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/moments')}>
                    <Smile className="mr-2 h-4 w-4" />
                    <span>Happy Moments</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/vent')}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    <span>Vent</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <ModeToggle />
                <Button onClick={() => router.push('/login')}>
                Sign In
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
