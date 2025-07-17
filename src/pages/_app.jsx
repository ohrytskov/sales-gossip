'use client';

import '@/styles/globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { GlobalProvider } from '@/hooks/useGlobal';

export default function App({ Component, pageProps }) {

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <AuthProvider>
        <GlobalProvider>
            {getLayout(<Component {...pageProps} />)}
        </GlobalProvider>
      </AuthProvider>
    </>
  );
}
