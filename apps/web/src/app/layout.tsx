import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'SucMeet — Video Conferencing',
    template: '%s | SucMeet',
  },
  description:
    'Simple, secure video conferencing powered by LiveKit. No downloads required.',
  keywords: ['video conferencing', 'meetings', 'livekit', 'open source'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'bg-card text-card-foreground border border-border shadow-lg',
                duration: 4000,
              }}
            />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
