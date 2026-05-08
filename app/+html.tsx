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
      </head>
      <body>{children}</body>
    </html>
  );
}

const pageStyles = `
  html, body { background-color: #0B1A2E; }
  body { overscroll-behavior-y: none; }
`;
