'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Video, CheckCircle, XCircle } from 'lucide-react';
import { apiClient, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface InvitePageClientProps {
  token: string;
}

export function InvitePageClient({ token }: InvitePageClientProps) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      const res = await api.get(`/invitations/${token}`);
      return res.data.data;
    },
  });

  const accept = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/invitations/${token}/accept`, {});
      return res.data.data;
    },
    onSuccess: (d) => {
      toast.success('Joined room!');
      router.push(`/rooms/${d.room.slug}`);
    },
    onError: () => toast.error('Could not accept the invitation'),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Invalid invitation</h1>
          <p className="text-sm text-muted-foreground">
            This invitation link is expired, invalid, or has already been used.
          </p>
          <Button asChild variant="outline">
            <a href="/">Back to home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex max-w-sm flex-col items-center gap-6 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <Video className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">You&apos;re invited!</h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">
              {data?.invitedBy?.displayName ?? 'Someone'}
            </span>{' '}
            invited you to join
          </p>
          <p className="mt-1 text-xl font-semibold">{data?.roomId?.name}</p>
        </div>
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => accept.mutate()}
          disabled={accept.isPending}
        >
          {accept.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Accept & Join Room
        </Button>
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Decline
        </a>
      </motion.div>
    </div>
  );
}
