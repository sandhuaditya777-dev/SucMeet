import Link from 'next/link';
import { Video } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Video className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <p className="mt-2 text-lg font-medium">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
