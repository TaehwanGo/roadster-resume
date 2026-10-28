import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans_KR, Saira_Condensed } from 'next/font/google';
import './globals.css';

const body = IBM_Plex_Sans_KR({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  preload: false,
  variable: '--font-body',
  fallback: ['Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'sans-serif'],
});
const mono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-mono',
  fallback: ['Menlo', 'monospace'],
});
const display = Saira_Condensed({
  weight: ['600', '800'],
  subsets: ['latin'],
  variable: '--font-display',
  fallback: ['Arial Narrow', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Roadster Résumé Run',
  description: 'Tesla Roadster 컨셉 차로 달리며 보는 고태환의 경력과 프로젝트',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0e1017',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${body.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
