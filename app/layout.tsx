import type { Metadata, Viewport } from 'next';
import { TopNav } from '@/components/Navigation/TopNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'KINETIC CORE — Combat Training & Strength Performance Operating System',
  description:
    'A high-performance training console, authoritative combat timer, and strength analytics operating system designed for zero-friction combat and strength athletes.',
  keywords: [
    'boxing timer',
    'combat training',
    'martial arts timer',
    '1rm calculator',
    'strength operating system',
    'progressive overload',
    'offline training'
  ],
  authors: [{ name: 'DeepMind Advanced Agentic Systems' }],
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#07080a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased bg-[#07080a]">
      <body className="min-h-full flex flex-col bg-[#07080a] text-neutral-100 selection:bg-[#00ff87] selection:text-black">
        <TopNav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
