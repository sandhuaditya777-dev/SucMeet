'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Settings, Loader2, Trash2, Users, Mail, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRoom, useUpdateRoom, useDeleteRoom, useRoomMembers, useSendInvitation } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { getRoomUrl, copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

const updateSchema = z.object({
  name: z.string().min(1).max(500).trim(),
  accessLevel: z.enum(['public', 'trusted', 'restricted']),
});

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['member', 'admin']).default('member'),
});

type UpdateForm = z.infer<typeof updateSchema>;
type InviteForm = z.infer<typeof inviteSchema>;

interface Props { slug: string }

export function RoomSettingsClient({ slug }: Props) {
  const router = useRouter();
  const { data: room, isLoading } = useRoom(slug);
  const updateRoom = useUpdateRoom(room?.id ?? '');
  const deleteRoom = useDeleteRoom();
  const sendInvite = useSendInvitation();
  const { data: members } = useRoomMembers(room?.id ?? '');
  const [copied, setCopied] = useState(false);

  const {
    register: registerUpdate,
    handleSubmit: handleUpdate,
    setValue: setUpdateValue,
    formState: { errors: updateErrors },
  } = useForm<UpdateForm>({
    resolver: zodResolver(updateSchema),
    values: room ? { name: room.name, accessLevel: room.accessLevel as UpdateForm['accessLevel'] } : undefined,
  });

  const {
    register: registerInvite,
    handleSubmit: handleInvite,
    setValue: setInviteValue,
    reset: resetInvite,
    formState: { errors: inviteErrors },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  const handleCopyLink = async () => {
    if (!room) return;
    await copyToClipboard(getRoomUrl(room.slug));
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onUpdateSubmit = async (data: UpdateForm) => {
    await updateRoom.mutateAsync(data);
  };

  const onInviteSubmit = async (data: InviteForm) => {
    if (!room) return;
    await sendInvite.mutateAsync({ roomId: room.id, email: data.email, role: data.role });
    resetInvite();
  };

  const handleDelete = async () => {
    if (!room) return;
    if (!confirm(`Permanently delete "${room.name}"? This cannot be undone.`)) return;
    await deleteRoom.mutateAsync(room.id);
    router.push('/');
  };

  if (isLoading || !room) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/rooms/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">{room.name}</h1>
              <p className="text-xs text-muted-foreground">Room Settings</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
        {/* Room link */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Share Room
          </h2>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
            <code className="flex-1 truncate text-sm">{getRoomUrl(room.slug)}</code>
            <Button variant="ghost" size="icon" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </motion.section>

        <Separator />

        {/* General settings */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </h2>
          <form onSubmit={handleUpdate(onUpdateSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Room name</Label>
              <Input {...registerUpdate('name')} />
              {updateErrors.name && <p className="text-xs text-destructive">{updateErrors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Access level</Label>
              <Select
                defaultValue={room.accessLevel}
                onValueChange={(v) => setUpdateValue('accessLevel', v as UpdateForm['accessLevel'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌐 Public — anyone with the link</SelectItem>
                  <SelectItem value="trusted">🛡️ Trusted — authenticated users only</SelectItem>
                  <SelectItem value="restricted">🔒 Restricted — invitation required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={updateRoom.isPending} className="gap-2">
              {updateRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </motion.section>

        <Separator />

        {/* Invite by email */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Invite by Email
          </h2>
          <form onSubmit={handleInvite(onInviteSubmit)} className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input placeholder="colleague@example.com" {...registerInvite('email')} />
                {inviteErrors.email && <p className="text-xs text-destructive">{inviteErrors.email.message}</p>}
              </div>
              <Select defaultValue="member" onValueChange={(v) => setInviteValue('role', v as InviteForm['role'])}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="outline" disabled={sendInvite.isPending} className="gap-2">
              {sendInvite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Invitation
            </Button>
          </form>
        </motion.section>

        <Separator />

        {/* Members list */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="h-4 w-4" />
            Members ({members?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {members?.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {(m.user?.displayName ?? 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{m.user?.displayName}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        <Separator />

        {/* Danger zone */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-destructive">
            Danger Zone
          </h2>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Deleting this room will permanently remove all settings and access records. This cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteRoom.isPending} className="gap-2">
              {deleteRoom.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Room
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
