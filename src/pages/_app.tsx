'use client';

import '@/styles/globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { GlobalProvider, useGlobal } from '@/hooks/useGlobal';
import Toast from '@/components/Toast';
import FeedbackFloatingButton from '@/components/FeedbackFloatingButton'

import type { AppProps } from 'next/app'
import type { NextPage } from 'next'
import type { ReactElement, ReactNode } from 'react'

type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

type AppWithToastProps = {
  Component: NextPageWithLayout
  pageProps: any
}

function AppWithToast({ Component, pageProps }: AppWithToastProps) {
  const { toast, hideToast } = useGlobal()

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Toast
        message={toast?.message}
        show={!!toast}
        onClose={hideToast}
        type={toast?.type}
      />
      {getLayout(<Component {...pageProps} />)}
      <FeedbackFloatingButton />
    </>
  );
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
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
