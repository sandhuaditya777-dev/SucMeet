'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateRoom } from '@/hooks/useRooms';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const schema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  accessLevel: z.enum(['public', 'trusted', 'restricted']).default('public'),
});

type FormData = z.infer<typeof schema>;

export function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createRoom = useCreateRoom();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const room = await createRoom.mutateAsync(data);
    setOpen(false);
    reset();
    router.push(`/rooms/${room.slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Room
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
          <DialogDescription>
            Give your room a name and choose who can join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Room name</Label>
            <Input
              id="name"
              placeholder="e.g. Team Standup"
              {...register('name')}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accessLevel">Access level</Label>
            <Select
              defaultValue="public"
              onValueChange={(val) =>
                setValue('accessLevel', val as FormData['accessLevel'])
              }
            >
              <SelectTrigger id="accessLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  🌐 Public — anyone with the link can join
                </SelectItem>
                <SelectItem value="trusted">
                  🛡️ Trusted — authenticated users only
                </SelectItem>
                <SelectItem value="restricted">
                  🔒 Restricted — invitation required
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setOpen(false); reset(); }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoom.isPending} className="gap-2">
              {createRoom.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
