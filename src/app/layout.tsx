import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wildcard Artifact Portal Design',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

