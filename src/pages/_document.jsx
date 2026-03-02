import { Html, Head, Main, NextScript } from 'next/document';

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Inter:wght@400;500;600&display=swap';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href={GOOGLE_FONTS_HREF} />
        <link
          href={GOOGLE_FONTS_HREF}
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
