import { Html, Head, Main, NextScript } from 'next/document';
//import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;900&family=Inter:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/corporategossip-logo.svg" type="image/svg+xml" />

      </Head>
      <body>
        <Main />
        <NextScript />

      </body>
    </Html>
  );
}
