'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Video, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { user } = useUser();

  return (
    <nav
      className={cn(
        'flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm',
        className
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
          <Video className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm">SucMeet</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-xs font-bold text-primary ring-2 ring-primary/20 transition hover:ring-primary/40">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt={user.name ?? ''} className="h-full w-full object-cover" />
                ) : (
                  (user.name ?? 'U')[0].toUpperCase()
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/auth/logout" className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm">
            <a href="/api/auth/login">Sign In</a>
          </Button>
        )}
      </div>
    </nav>
  );
}
