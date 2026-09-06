'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, ArrowRight, Loader2 } from 'lucide-react';
import { RoomWithToken } from '@sucmeet/shared';
import { useUserChoicesStore } from '@/stores/userChoicesStore';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PreJoinScreenProps {
  room: RoomWithToken;
  onJoin: () => void;
}

export function PreJoinScreen({ room, onJoin }: PreJoinScreenProps) {
  const { user } = useUser();
  const {
    micEnabled, camEnabled, displayName,
    setMic, setCam, setDisplayName,
  } = useUserChoicesStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [name, setName] = useState(displayName || user?.name || '');
  const [joining, setJoining] = useState(false);

  // Start camera preview
  useEffect(() => {
    if (!camEnabled) {
      stream?.getTracks().forEach((t) => t.stop());
      setStream(null);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((s) => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setCam(false));

    return () => stream?.getTracks().forEach((t) => t.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camEnabled]);

  const handleJoin = () => {
    setDisplayName(name.trim() || 'Guest');
    stream?.getTracks().forEach((t) => t.stop());
    setJoining(true);
    onJoin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        <h1 className="mb-1 text-center text-2xl font-bold">{room.name}</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Set up your audio and video before joining.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Camera preview */}
          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-muted">
            {camEnabled && stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full scale-x-[-1] object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <VideoOff className="h-8 w-8" />
                <span className="text-sm">Camera off</span>
              </div>
            )}

            {/* Cam / Mic toggles overlay */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              <button
                onClick={() => setMic(!micEnabled)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition',
                  micEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-destructive/80 text-white hover:bg-destructive'
                )}
              >
                {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setCam(!camEnabled)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full transition',
                  camEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-destructive/80 text-white hover:bg-destructive'
                )}
              >
                {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Join form */}
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your name</Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
            </div>

            <Button
              onClick={handleJoin}
              disabled={joining || !name.trim()}
              size="lg"
              className="w-full gap-2"
            >
              {joining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {joining ? 'Joining…' : 'Join Room'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              You are joining{' '}
              <span className="font-medium text-foreground">{room.name}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
