'use client';

import { motion } from 'framer-motion';
import { Users, Lock, Globe, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Room, RoomAccessLevel } from '@sucmeet/shared';
import { useDeleteRoom } from '@/hooks/useRooms';
import { timeAgo, truncate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Settings, Trash2 } from 'lucide-react';

const accessIcons: Record<RoomAccessLevel, typeof Globe> = {
  public: Globe,
  trusted: Shield,
  restricted: Lock,
};

const accessColors: Record<RoomAccessLevel, string> = {
  public: 'text-emerald-400',
  trusted: 'text-amber-400',
  restricted: 'text-red-400',
};

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const deleteRoom = useDeleteRoom();
  const AccessIcon = accessIcons[room.accessLevel as RoomAccessLevel];
  const accessColor = accessColors[room.accessLevel as RoomAccessLevel];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-semibold">{room.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(room.createdAt)}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/rooms/${room.slug}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (confirm(`Delete "${room.name}"? This cannot be undone.`)) {
                  deleteRoom.mutate(room.id);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Access level badge */}
      <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${accessColor}`}>
        <AccessIcon className="h-3.5 w-3.5" />
        <span className="capitalize">{room.accessLevel}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: Join button */}
      <div className="mt-4">
        <Button asChild className="w-full gap-2" size="sm">
          <Link href={`/rooms/${room.slug}`}>
            Join Room
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
