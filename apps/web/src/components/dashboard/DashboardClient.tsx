'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Plus, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRooms } from '@/hooks/useRooms';
import { RoomCard } from './RoomCard';
import { CreateRoomDialog } from './CreateRoomDialog';
import { Button } from '@/components/ui/button';

interface DashboardClientProps {
  isAuthenticated: boolean;
}

export function DashboardClient({ isAuthenticated }: DashboardClientProps) {
  const { user, isLoading: authLoading } = useUser();
  const { data: rooms, isLoading: roomsLoading } = useRooms();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Landing page for unauthenticated users
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/40">
            <Video className="h-7 w-7 text-primary" />
          </div>
          <span className="text-4xl font-bold tracking-tight">SucMeet</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="max-w-md text-lg text-muted-foreground"
        >
          Simple, secure video conferencing powered by LiveKit. No downloads, no installs —
          just join from your browser.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-3"
        >
          <Button asChild size="lg" className="gap-2">
            <a href="/api/auth/login">
              <LogIn className="h-4 w-4" />
              Sign In to Get Started
            </a>
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {['HD Video & Audio', 'Lobby Waiting Room', 'Screen Sharing', 'Live Chat', 'No Sign-up to Join'].map(
            (feat) => (
              <span
                key={feat}
                className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
              >
                {feat}
              </span>
            )
          )}
        </motion.div>
      </div>
    );
  }

  // Authenticated dashboard
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back, {user.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rooms?.length ?? 0} room{rooms?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateRoomDialog />
      </div>

      {/* Room grid */}
      {roomsLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : rooms && rooms.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.07 } },
            hidden: {},
          }}
        >
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Video className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-lg font-medium">No rooms yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first room to start a video conference.
          </p>
          <div className="mt-6">
            <CreateRoomDialog />
          </div>
        </div>
      )}
    </div>
  );
}
