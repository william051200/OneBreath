import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Custom <html> document for the static web build.
 * Injects PWA manifest, iOS "Add to Home Screen" meta tags, and theme color
 * so OneBreath installs cleanly from Safari.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <meta name="description" content="Hold your breath. Track your limit. Beat it." />

        {/* Open Graph (Facebook, LinkedIn, Threads, Discord, iMessage, etc.) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OneBreath" />
        <meta property="og:title" content="OneBreath — Train your breath. Find your calm." />
        <meta
          property="og:description"
          content="A privacy-first breathing app. Time your breath holds, practice box breathing. No account, no tracking — everything stays on your device."
        />
        <meta property="og:url" content="https://onebreath-app.vercel.app/" />
        <meta property="og:image" content="https://onebreath-app.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="OneBreath — Train your breath. Find your calm." />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="OneBreath — Train your breath. Find your calm." />
        <meta
          name="twitter:description"
          content="A privacy-first breathing app. Time your breath holds, practice box breathing. No account, no tracking."
        />
        <meta name="twitter:image" content="https://onebreath-app.vercel.app/og-image.png" />

        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0B1A2E" />
        <meta name="color-scheme" content="dark" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OneBreath" />
        <meta name="mobile-web-app-capable" content="yes" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
        <script src="/service-worker-register.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}

const pageStyles = `
  html, body { background-color: #0B1A2E; }
  body { overscroll-behavior-y: none; }
`;
