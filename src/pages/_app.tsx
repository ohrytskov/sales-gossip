'use client';

import '@/styles/globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { GlobalProvider, useGlobal } from '@/hooks/useGlobal';
import Toast from '@/components/Toast';
import FeedbackFloatingButton from '@/components/FeedbackFloatingButton'

function AppWithToast({ Component, pageProps }) {
  const { toast, showToast } = useGlobal()

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Toast 
        message={toast?.message} 
        show={!!toast} 
        onClose={() => showToast(null)}
        type={toast?.type}
      />
      {getLayout(<Component {...pageProps} />)}
      <FeedbackFloatingButton />
    </>
  );
}

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <AuthProvider>
        <GlobalProvider>
          <AppWithToast Component={Component} pageProps={pageProps} />
        </GlobalProvider>
      </AuthProvider>
    </>
  );
}
